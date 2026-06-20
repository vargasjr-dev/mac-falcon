/**
 * Migration: 003-add-manufacturing-cost
 *
 * Adds a "Manufacturing & assembly labor" in_house line to the M4-D2 BOM.
 * This represents Vargas's personal time building each unit, so it shows
 * up in COGS and margin calculations on the admin order page.
 *
 * Default: $75/unit (≈ 3 hrs × $25/hr). Adjust priceUsd as needed — just
 * re-run this migration or edit the product BOM in the admin.
 *
 * Run via: GitHub Actions `run-migration` label on the PR
 * After running: close the PR without merging.
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { product } from "../../data/schema";
import { eq } from "drizzle-orm";
import type { BomItem } from "../../data/types";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// $150.00 = $40/hr industry rate for skilled electronics/robotics assembly × 1.25 markup × 3 hrs build time
const MANUFACTURING_COST_CENTS = 15000;

async function run() {
  console.log("▶ 003-add-manufacturing-cost: adding labor line to M4-D2 BOM...");

  const [p] = await db
    .select()
    .from(product)
    .where(eq(product.id, "m4d2-v1"))
    .limit(1);
  if (!p) throw new Error("Product m4d2-v1 not found — run 001-seed-diy-bom first");

  const bom = (p.bom ?? []) as BomItem[];

  // Idempotency — skip if already present
  const alreadyExists = bom.some((b) => b.part.toLowerCase().includes("manufacturing"));
  if (alreadyExists) {
    console.log("⚠️  Manufacturing cost already in BOM — skipping.");
    return;
  }

  bom.push({
    qty: 1,
    part: "Manufacturing & assembly labor",
    source: "Mac Falcon",
    priceUsd: MANUFACTURING_COST_CENTS,
    notes:
      "Assembly labor: chassis fabrication, wiring, firmware flash, calibration, and QA. Priced at $40/hr (skilled electronics/robotics assembly industry rate) × 1.25 markup × 3 hrs = $150/unit.",
    procure: "in_house",
  });

  await db
    .update(product)
    .set({ bom, updatedAt: new Date() })
    .where(eq(product.id, "m4d2-v1"));

  console.log(`✅ Done — manufacturing cost added ($${(MANUFACTURING_COST_CENTS / 100).toFixed(2)}/unit).`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
