/**
 * GET /api/falcon/orders
 *
 * Lists orders for CLI/admin operations.
 * Scope: order:read
 *
 * Query params:
 *   unfulfilled=true — exclude shipped/cancelled orders
 *   includeTest=true — include test orders (test orders are excluded by default)
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../data/db";
import { order, orderItem, product } from "../../../../../data/schema";
import { and, desc, eq, inArray } from "drizzle-orm";
import { authenticateFalcon, hasScope } from "../../../../lib/falcon-auth";

const UNFULFILLED_STATUSES = ["pending", "paid", "assembling"];

export async function GET(req: NextRequest) {
  const key = await authenticateFalcon(req);
  if (!key)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasScope(key, "order:read")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const unfulfilled = searchParams.get("unfulfilled") === "true";
  const includeTest = searchParams.get("includeTest") === "true";

  const conditions = [];
  if (!includeTest) conditions.push(eq(order.isTest, false));
  if (unfulfilled) conditions.push(inArray(order.status, UNFULFILLED_STATUSES));

  const orders = await db
    .select({
      id: order.id,
      email: order.email,
      status: order.status,
      isTest: order.isTest,
      totalUsd: order.totalUsd,
      shippingName: order.shippingName,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    })
    .from(order)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(order.createdAt));

  if (orders.length === 0) return NextResponse.json([]);

  const items = await db
    .select({
      orderId: orderItem.orderId,
      quantity: orderItem.quantity,
      productId: product.id,
      productName: product.name,
    })
    .from(orderItem)
    .innerJoin(product, eq(orderItem.productId, product.id))
    .where(
      inArray(
        orderItem.orderId,
        orders.map((o) => o.id),
      ),
    );

  const itemsByOrder = new Map<string, typeof items>();
  for (const item of items) {
    const current = itemsByOrder.get(item.orderId) ?? [];
    current.push(item);
    itemsByOrder.set(item.orderId, current);
  }

  return NextResponse.json(
    orders.map((o) => ({ ...o, items: itemsByOrder.get(o.id) ?? [] })),
  );
}
