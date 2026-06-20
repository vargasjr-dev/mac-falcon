/**
 * GET   /api/falcon/order/[id]    — read order + items (scope: order:read)
 * PATCH /api/falcon/order/[id]    — update order status (scope: order:write)
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../../data/db";
import { order, orderItem, product } from "../../../../../../data/schema";
import { eq } from "drizzle-orm";
import { authenticateFalcon, hasScope } from "../../../../../lib/falcon-auth";

const VALID_STATUSES = ["paid", "assembling", "shipped", "cancelled"];

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const key = await authenticateFalcon(req);
  if (!key) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasScope(key, "order:read")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const [o] = await db.select().from(order).where(eq(order.id, id)).limit(1);
  if (!o) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const items = await db
    .select({ item: orderItem, product: product })
    .from(orderItem)
    .innerJoin(product, eq(orderItem.productId, product.id))
    .where(eq(orderItem.orderId, id));

  return NextResponse.json({ ...o, items });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const key = await authenticateFalcon(req);
  if (!key) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasScope(key, "order:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const { status } = await req.json();

  if (!status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const [updated] = await db
    .update(order)
    .set({ status, updatedAt: new Date() })
    .where(eq(order.id, id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}
