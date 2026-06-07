import { NextRequest, NextResponse } from "next/server";
import { stripe } from "~/lib/stripe";
import { db } from "../../../../../data/db";
import { product } from "../../../../../data/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  const { productId, quantity = 1 } = await req.json();

  const [p] = await db
    .select()
    .from(product)
    .where(eq(product.id, productId))
    .limit(1);

  if (!p || !p.stripePriceId) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  const origin = req.headers.get("origin") ?? "http://localhost:3000";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [{ price: p.stripePriceId, quantity }],
    success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/shop/${p.slug}`,
    shipping_address_collection: {
      allowed_countries: ["US", "CA", "GB", "AU", "DE", "FR", "JP"],
    },
    metadata: { productId: p.id },
  });

  return NextResponse.json({ url: session.url });
}
