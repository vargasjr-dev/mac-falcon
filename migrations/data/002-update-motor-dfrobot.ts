/**
 * Migration: 002-update-motor-dfrobot
 *
 * Replaces the Adafruit 3777 TT motor (out of stock) with the DFRobot FIT0450.
 * The FIT0450 has a 120:1 gearbox and a quadrature encoder — better torque and
 * odometry resolution than the Adafruit version at a similar price (~$7–8 each).
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

async function run() {
  console.log(
    "▶ 002-update-motor-dfrobot: replacing Adafruit 3777 → DFRobot FIT0450...",
  );

  const [p] = await db
    .select()
    .from(product)
    .where(eq(product.id, "m4d2-v1"))
    .limit(1);
  if (!p)
    throw new Error(
      "Product m4d2-v1 not found — run 001-seed-diy-bom first",
    );

  const bom = (p.bom ?? []) as BomItem[];
  const idx = bom.findIndex((b) =>
    b.url?.includes("adafruit.com/product/3777"),
  );
  if (idx === -1) {
    console.log("⚠️  Adafruit 3777 not found in BOM — already migrated?");
    return;
  }

  bom[idx] = {
    qty: 2,
    part: "DFRobot FIT0450 TT motor with encoder",
    source: "DFRobot",
    priceUsd: 750,
    url: "https://www.dfrobot.com/product-1457.html",
    notes:
      "120:1 gearbox with quadrature encoder — better torque and odometry resolution than the Adafruit 3777 (out of stock). Standard TT form factor. One per drive wheel. 3–6V operating range — run at 5V from the TalentCell for solid torque without heat.",
    procure: "bulk",
    batchSize: 10,
  };

  await db
    .update(product)
    .set({ bom, updatedAt: new Date() })
    .where(eq(product.id, "m4d2-v1"));

  console.log("✅ Done — motor updated to DFRobot FIT0450 (~$7.50/unit).");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
