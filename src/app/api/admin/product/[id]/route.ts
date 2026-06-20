import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../../data/db";
import { product } from "../../../../../../data/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import type { BomItem, ProductSpecs } from "../../../../../../data/types";

interface ProductPatch {
  name?: string;
  tagline?: string;
  description?: string;
  highlights?: string[];
  specs?: ProductSpecs;
  bom?: BomItem[];
  priceUsd?: number;
  inStock?: boolean;
  imageUrl?: string;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verify admin session
  const jar = await cookies();
  const token = jar.get("admin_session")?.value;
  if (!token || token !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body: ProductPatch = await req.json();

  const PATCHABLE = ["name", "tagline", "description", "highlights", "specs", "bom", "priceUsd", "inStock", "imageUrl"] as const;
  const patch: ProductPatch = {};
  for (const field of PATCHABLE) {
    if (field in body) {
      (patch as Record<string, unknown>)[field] = body[field];
    }
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No patchable fields provided" }, { status: 400 });
  }

  const [updated] = await db
    .update(product)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(product.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, product: updated });
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Verify admin session
  const jar = await cookies();
  const token = jar.get("admin_session")?.value;
  if (!token || token !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const [p] = await db.select().from(product).where(eq(product.id, id)).limit(1);

  if (!p) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json(p);
}
