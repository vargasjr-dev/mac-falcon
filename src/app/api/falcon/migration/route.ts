/**
 * POST /api/falcon/migration
 *
 * Runs an inline data migration function body passed as JSON.
 * Scope: migration:run
 *
 * Body: { code: string }  — a JS/TS function body that receives `db` and `schema`
 *
 * This is intentionally restricted to the migration:run scope, which should only
 * be granted to trusted keys (e.g. VargasJR). The code runs server-side with
 * full DB access.
 */
import { NextRequest, NextResponse } from "next/server";
import { db } from "../../../../../data/db";
import * as schema from "../../../../../data/schema";
import { authenticateFalcon, hasScope } from "../../../../lib/falcon-auth";

export async function POST(req: NextRequest) {
  const key = await authenticateFalcon(req);
  if (!key) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasScope(key, "migration:run")) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { code } = await req.json();
  if (!code || typeof code !== "string") {
    return NextResponse.json({ error: "code is required" }, { status: 400 });
  }

  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function("db", "schema", code);
    const result = await fn(db, schema);
    return NextResponse.json({ ok: true, result: result ?? null });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
