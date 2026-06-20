/**
 * GET  /api/admin/api-keys        — list all keys (active + revoked)
 * POST /api/admin/api-keys        — create a new key (returns plaintext once)
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../data/db";
import { falconApiKey } from "../../../../../data/schema";
import { desc } from "drizzle-orm";
import { cookies } from "next/headers";
import { createHash, randomBytes } from "crypto";

function adminGuard(token: string | undefined): boolean {
  return !!token && token === process.env.ADMIN_PASSWORD;
}

export async function GET() {
  const jar = await cookies();
  if (!adminGuard(jar.get("admin_session")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const keys = await db
    .select({
      id: falconApiKey.id,
      name: falconApiKey.name,
      scopes: falconApiKey.scopes,
      createdAt: falconApiKey.createdAt,
      revokedAt: falconApiKey.revokedAt,
    })
    .from(falconApiKey)
    .orderBy(desc(falconApiKey.createdAt));

  return NextResponse.json(keys);
}

export async function POST(req: NextRequest) {
  const jar = await cookies();
  if (!adminGuard(jar.get("admin_session")?.value)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, scopes } = await req.json();
  if (!name || typeof name !== "string") {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const rawKey = `fk_${randomBytes(32).toString("hex")}`;
  const keyHash = createHash("sha256").update(rawKey).digest("hex");
  const id = randomBytes(8).toString("hex");

  await db.insert(falconApiKey).values({
    id,
    name: name.trim(),
    keyHash,
    scopes: Array.isArray(scopes) ? scopes : ["*"],
    createdAt: new Date(),
  });

  // Return plaintext key exactly once — not stored anywhere
  return NextResponse.json({ id, name, scopes, key: rawKey }, { status: 201 });
}
