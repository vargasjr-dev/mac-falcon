import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../data/db";
import { order } from "../../../../../data/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

const VALID_STATUSES = ["paid", "assembling", "shipped", "cancelled"];

export async function PATCH(req: NextRequest) {
  // Verify admin session
  const jar = await cookies();
  const token = jar.get("admin_session")?.value;
  if (!token || token !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { orderId, status } = await req.json();

  if (!orderId || !status || !VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await db
    .update(order)
    .set({ status, updatedAt: new Date() })
    .where(eq(order.id, orderId));

  return NextResponse.json({ ok: true });
}
