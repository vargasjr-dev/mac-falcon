import Link from "next/link";
import { stripe } from "~/lib/stripe";
import { db } from "../../../../data/db";
import { order, orderItem, product } from "../../../../data/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

interface Props {
  searchParams: Promise<{ session_id?: string }>;
}

async function ensureOrderCreated(sessionId: string) {
  // Idempotent — if webhook already created it, skip
  const existing = await db
    .select({ id: order.id })
    .from(order)
    .where(eq(order.stripeSessionId, sessionId))
    .limit(1);
  if (existing.length > 0) return;

  // Fetch the session from Stripe to get full data
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });
    if (session.payment_status !== "paid") return;

    const productId = session.metadata?.productId;
    if (!productId) return;

    const [p] = await db
      .select()
      .from(product)
      .where(eq(product.id, productId))
      .limit(1);
    if (!p) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const raw = session as any;
    const shipping = raw.shipping_details ?? raw.shipping ?? null;
    const addr = shipping?.address;

    const orderId = randomUUID();
    await db.insert(order).values({
      id: orderId,
      email: session.customer_details?.email ?? "",
      stripeSessionId: session.id,
      stripePaymentIntentId:
        typeof session.payment_intent === "string"
          ? session.payment_intent
          : null,
      status: "paid",
      totalUsd: session.amount_total ?? p.priceUsd,
      shippingName: shipping?.name ?? null,
      shippingAddress: addr
        ? `${addr.line1}, ${addr.city}, ${addr.state} ${addr.postal_code}, ${addr.country}`
        : null,
    });

    await db.insert(orderItem).values({
      id: randomUUID(),
      orderId,
      productId: p.id,
      quantity: 1,
      unitPriceUsd: p.priceUsd,
    });
  } catch {
    // Silently fail — order will still be caught by webhook
  }
}

export default async function SuccessPage({ searchParams }: Props) {
  const { session_id } = await searchParams;
  if (session_id) await ensureOrderCreated(session_id);

  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      {/* HUD rings */}
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full border border-yellow-500/20 flex items-center justify-center">
          <div className="w-16 h-16 rounded-full border border-yellow-500/30 flex items-center justify-center">
            <span className="text-4xl">🦅</span>
          </div>
        </div>
        <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-yellow-500/40 rounded-tl" />
        <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-yellow-500/40 rounded-tr" />
        <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-yellow-500/40 rounded-bl" />
        <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-yellow-500/40 rounded-br" />
      </div>

      <h1 className="text-4xl font-black text-slate-100 mb-3 tracking-tight">
        Order confirmed.
      </h1>
      <p className="text-slate-400 text-lg mb-3 max-w-md leading-relaxed">
        Your M4-D2 Mobility Kit is in the queue. We&apos;ll send tracking info
        to your email once it ships.
      </p>
      <p className="text-slate-600 text-sm mb-10">
        Check your email for a receipt from Stripe.
      </p>

      <div className="flex gap-4">
        <Link
          href="/shop"
          className="px-6 py-3 border border-slate-700 text-slate-300 font-semibold rounded-xl hover:border-yellow-500/50 hover:text-slate-100 transition-all text-sm"
        >
          Back to shop
        </Link>
      </div>
    </div>
  );
}
