import { NextRequest, NextResponse } from "next/server";
import { stripe } from "~/lib/stripe";
import { db } from "../../../../../data/db";
import { order, orderItem, product } from "../../../../../data/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const productId = session.metadata?.productId;

    if (!productId) {
      return NextResponse.json({ ok: true });
    }

    const [p] = await db
      .select()
      .from(product)
      .where(eq(product.id, productId))
      .limit(1);

    if (!p) return NextResponse.json({ ok: true });

    const shipping = session.shipping_details;
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
      totalUsd: session.amount_total ?? 0,
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
  }

  return NextResponse.json({ ok: true });
}
