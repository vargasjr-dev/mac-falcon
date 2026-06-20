/**
 * Shared auth helper for Falcon API routes.
 *
 * Accepts: Authorization: Bearer <raw-key>
 * Looks up SHA-256 hash in falcon_api_key table.
 * Returns the key record if active, or null.
 */
import { createHash } from "crypto";
import { db } from "../../data/db";
import { falconApiKey } from "../../data/schema";
import { eq } from "drizzle-orm";
import type { NextRequest } from "next/server";

export interface FalconKey {
  id: string;
  name: string;
  scopes: string[];
}

export async function authenticateFalcon(req: NextRequest): Promise<FalconKey | null> {
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.startsWith("Bearer ")) return null;
  const raw = auth.slice(7).trim();
  if (!raw) return null;

  const hash = createHash("sha256").update(raw).digest("hex");

  const [key] = await db
    .select()
    .from(falconApiKey)
    .where(eq(falconApiKey.keyHash, hash))
    .limit(1);

  if (!key || key.revokedAt !== null) return null;
  return { id: key.id, name: key.name, scopes: key.scopes };
}

export function hasScope(key: FalconKey, scope: string): boolean {
  return key.scopes.includes(scope) || key.scopes.includes("*");
}
