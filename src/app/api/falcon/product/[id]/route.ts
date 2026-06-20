/**
 * GET   /api/falcon/product/[id]   — read product (scope: product:read)
 * PATCH /api/falcon/product/[id]   — update product fields (scope: product:write)
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../../data/db";
import { product } from "../../../../../../data/schema";
import { eq } from "drizzle-orm";
import { authenticateFalcon, hasScope } from "../../../../../lib/falcon-auth";
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

const PATCHABLE = ["name", "tagline", "description", "highlights", "specs", "bom", "priceUsd", "inStock", "imageUrl"] as const;

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const key = await authenticateFalcon(req);
  if (!key) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasScope(key, "product:read")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const [p] = await db.select().from(product).where(eq(product.id, id)).limit(1);
  if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(p);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const key = await authenticateFalcon(req);
  if (!key) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasScope(key, "product:write")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const body: ProductPatch = await req.json();

  const patch: ProductPatch = {};
  for (const field of PATCHABLE) {
    if (field in body) (patch as Record<string, unknown>)[field] = body[field];
  }

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ error: "No patchable fields provided" }, { status: 400 });
  }

  const [updated] = await db
    .update(product)
    .set({ ...patch, updatedAt: new Date() })
    .where(eq(product.id, id))
    .returning();

  if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(updated);
}
