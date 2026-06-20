/**
 * DELETE /api/admin/api-keys/[id]  — revoke a key
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../../data/db";
import { falconApiKey } from "../../../../../../data/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const jar = await cookies();
  const token = jar.get("admin_session")?.value;
  if (!token || token !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [updated] = await db
    .update(falconApiKey)
    .set({ revokedAt: new Date() })
    .where(eq(falconApiKey.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Key not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, revokedAt: updated.revokedAt });
}
