#!/usr/bin/env bun
export {};
/**
 * falcon — Mac Falcon admin CLI
 *
 * Usage:
 *   falcon product get <id>
 *   falcon product bom patch <id> --bom '<json>'
 *   falcon order get <id>
 *   falcon order status patch <id> --status <status>
 *   falcon migration run --code '<js>'
 *
 * Auth: set FALCON_API_KEY env var (or --key flag)
 *
 * Base URL: set FALCON_BASE_URL (default: https://mac-falcon.vercel.app)
 */

const BASE_URL = process.env.FALCON_BASE_URL ?? "https://mac-falcon.vercel.app";

function apiKey(): string {
  const k = process.env.FALCON_API_KEY;
  if (!k) {
    console.error("❌ FALCON_API_KEY env var is not set.");
    process.exit(1);
  }
  return k;
}

function parseArgs(argv: string[]): Record<string, string | boolean> {
  const out: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a?.startsWith("--")) continue;
    const key = a.slice(2);
    const next = argv[i + 1];
    if (next === undefined || next.startsWith("--")) {
      out[key] = true;
    } else {
      out[key] = next;
      i++;
    }
  }
  return out;
}

async function api(method: string, path: string, body?: unknown): Promise<unknown> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${apiKey()}`,
      "Content-Type": "application/json",
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data: unknown;
  try { data = JSON.parse(text); } catch { data = text; }
  if (!res.ok) {
    console.error(`❌ ${method} ${path} → ${res.status}:`, data);
    process.exit(1);
  }
  return data;
}

// ── Commands ─────────────────────────────────────────────────────────────────

async function productGet(id: string) {
  const data = await api("GET", `/api/falcon/product/${id}`);
  console.log(JSON.stringify(data, null, 2));
}

async function productBomPatch(id: string, bomJson: string) {
  const bom = JSON.parse(bomJson);
  const data = await api("PATCH", `/api/falcon/product/${id}`, { bom });
  console.log("✅ Updated product BOM.");
  console.log(JSON.stringify(data, null, 2));
}

async function orderGet(id: string) {
  const data = await api("GET", `/api/falcon/order/${id}`);
  console.log(JSON.stringify(data, null, 2));
}

async function orderStatusPatch(id: string, status: string) {
  const data = await api("PATCH", `/api/falcon/order/${id}`, { status });
  console.log(`✅ Order ${id} → ${status}`);
  console.log(JSON.stringify(data, null, 2));
}

async function migrationRun(code: string) {
  const data = await api("POST", `/api/falcon/migration`, { code });
  console.log("✅ Migration ran.");
  console.log(JSON.stringify(data, null, 2));
}

// ── Dispatch ──────────────────────────────────────────────────────────────────

const argv = process.argv.slice(2);
const [subject, ...rest] = argv;

if (subject === "product") {
  const [verb, ...pRest] = rest;
  if (verb === "get") {
    const [id] = pRest;
    if (!id) { console.error("Usage: falcon product get <id>"); process.exit(1); }
    await productGet(id);
  } else if (verb === "bom" && pRest[0] === "patch") {
    const [, id, ...flags] = pRest;
    const args = parseArgs(flags);
    if (!id || !args.bom) { console.error("Usage: falcon product bom patch <id> --bom '<json>'"); process.exit(1); }
    await productBomPatch(id, args.bom as string);
  } else {
    console.error("Unknown product command. Available: get, bom patch");
    process.exit(1);
  }
} else if (subject === "order") {
  const [verb, ...oRest] = rest;
  if (verb === "get") {
    const [id] = oRest;
    if (!id) { console.error("Usage: falcon order get <id>"); process.exit(1); }
    await orderGet(id);
  } else if (verb === "status" && oRest[0] === "patch") {
    const [, id, ...flags] = oRest;
    const args = parseArgs(flags);
    if (!id || !args.status) { console.error("Usage: falcon order status patch <id> --status <status>"); process.exit(1); }
    await orderStatusPatch(id, args.status as string);
  } else {
    console.error("Unknown order command. Available: get, status patch");
    process.exit(1);
  }
} else if (subject === "migration") {
  const [verb, ...mRest] = rest;
  if (verb === "run") {
    const args = parseArgs(mRest);
    if (!args.code) { console.error("Usage: falcon migration run --code '<js>'"); process.exit(1); }
    await migrationRun(args.code as string);
  } else {
    console.error("Unknown migration command. Available: run");
    process.exit(1);
  }
} else {
  console.log(`falcon — Mac Falcon admin CLI

Commands:
  falcon product get <id>
  falcon product bom patch <id> --bom '<json>'
  falcon order get <id>
  falcon order status patch <id> --status <status>
  falcon migration run --code '<js>'

Env:
  FALCON_API_KEY   required — from admin dashboard API keys page
  FALCON_BASE_URL  optional — default: https://mac-falcon.vercel.app
`);
}
