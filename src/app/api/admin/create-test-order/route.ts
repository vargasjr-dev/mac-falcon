import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { db } from "../../../../../data/db";
import { order, orderItem, product } from "../../../../../data/schema";
import { eq } from "drizzle-orm";

export async function POST() {
  // Guard: admin-only
  const jar = await cookies();
  const token = jar.get("admin_session")?.value;
  if (!token || token !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Grab the product (default to first one)
  const [p] = await db.select().from(product).limit(1);
  if (!p) {
    return NextResponse.json({ error: "No product found" }, { status: 404 });
  }

  const orderId = randomUUID();
  const now = new Date();
  const fakeNames = [
    "Alex Rivera",
    "Jamie Okafor",
    "Sam Nakashima",
    "Morgan Patel",
    "Casey Lindqvist",
  ];
  const fakeName = fakeNames[Math.floor(Math.random() * fakeNames.length)];
  const fakeAddresses = [
    "412 Falcon Dr, Austin TX 78701",
    "88 Technic Way, San Francisco CA 94103",
    "7 Maker Lane, Brooklyn NY 11201",
    "555 Robot Blvd, Seattle WA 98101",
  ];
  const fakeAddress = fakeAddresses[Math.floor(Math.random() * fakeAddresses.length)];

  await db.insert(order).values({
    id: orderId,
    email: `test+${orderId.slice(0, 6)}@macfalcon.local`,
    stripeSessionId: `cs_dummy_${Date.now()}_${randomUUID().replace(/-/g, "").slice(0, 8)}`,
    stripePaymentIntentId: null,
    status: "paid",
    isTest: true,
    totalUsd: p.priceUsd,
    shippingName: fakeName,
    shippingAddress: fakeAddress,
    createdAt: now,
    updatedAt: now,
  });

  await db.insert(orderItem).values({
    id: randomUUID(),
    orderId,
    productId: p.id,
    quantity: 1,
    unitPriceUsd: p.priceUsd,
  });

  return NextResponse.json({ id: orderId });
}
