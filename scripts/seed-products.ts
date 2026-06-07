/**
 * Seed script — run once to populate the Mac Falcon product catalog.
 * Usage: DATABASE_URL=<unpooled_url> bun run scripts/seed-products.ts
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { product } from "../data/schema";
import type { BomItem, ProductSpecs } from "../data/types";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// ──────────────────────────────────────────────
// M4-D2 Mobility Kit v1
// ──────────────────────────────────────────────

const m4d2Highlights: string[] = [
  "Complete kit — robot base, power, structure, and mount included",
  "9 kg payload — your Mac Mini rides comfortably",
  "Auto-docking — returns to its charging ring automatically",
  "ROS 2 native — control it with Python, Node.js, or our open-source bridge",
  "Expandable — camera and arm mounts built into the superstructure",
];

const m4d2Specs: ProductSpecs = {
  "Mac Mini compatibility": "M4, M4 Pro, M4 Max (2024)",
  "Robot base": "iRobot Create 3",
  "Drive type": "Differential drive",
  "Max speed": "0.5 m/s",
  "Payload capacity": "9 kg",
  "Power supply": "Anker 737 PowerCore 24K — 140 W output",
  "Estimated runtime": "4–6 hours",
  "Connectivity": "WiFi 6 (Mac), Bluetooth 5.3, USB-C 3.2",
  "Robot connectivity": "USB-C to Create 3 adapter, WiFi",
  "Footprint": "338 × 338 mm",
  "Height (with Mac Mini)": "~380 mm",
  "Kit weight (no Mac Mini)": "~3.2 kg",
  "Software": "Open-source — github.com/vargasjr-dev/mac-falcon",
};

const m4d2Bom: BomItem[] = [
  {
    qty: 1,
    part: "iRobot Create 3",
    source: "iRobot",
    priceUsd: 39900,
    url: "https://edu.irobot.com/create3",
    notes:
      "The robot base — differential drive, 9 kg payload, autonomous docking, ROS 2 native. The foundation everything else builds on.",
    procure: "per_order",
  },
  {
    qty: 1,
    part: "Anker 737 PowerCore 24K",
    source: "Anker / Amazon",
    priceUsd: 13000,
    url: "https://www.amazon.com/dp/B09VPHVT2Z",
    notes:
      "140 W output — enough to run a Mac Mini M4 at full throttle. 24,000 mAh gets you 4–6 hours of untethered operation.",
    procure: "bulk",
    batchSize: 5,
  },
  {
    qty: 1,
    part: "Lego Technic superstructure pack",
    source: "Mac Falcon",
    priceUsd: 8500,
    notes:
      "Curated Technic pieces — pre-kitted for the M4-D2 frame. Mounts to the Create 3 top ring, creates a stable shelf for the power bank and Mac Mini. BrickLink Studio file included.",
    procure: "bulk",
    batchSize: 10,
  },
  {
    qty: 1,
    part: "Mac Mini 2024 cradle",
    source: "Mac Falcon",
    priceUsd: 2500,
    notes:
      "Custom 3D-printed PLA+ cradle — precision fit for Mac Mini 2024. Holds the Mac Mini securely without blocking any ports.",
    procure: "in_house",
    batchSize: 10,
  },
  {
    qty: 1,
    part: "Mounting hardware kit",
    source: "Mac Falcon",
    priceUsd: 1000,
    notes:
      "M3 and M4 bolts, rubber grommets, and adhesive strips for attaching the Technic frame to the Create 3.",
    procure: "bulk",
    batchSize: 50,
  },
  {
    qty: 2,
    part: "USB-C braided cable 1.8m",
    source: "Anker",
    priceUsd: 1200,
    notes:
      "One for power (power bank → Mac Mini), one for data (Mac Mini → Create 3 USB-C adapter). Braided for tangle resistance.",
    procure: "bulk",
    batchSize: 10,
  },
  {
    qty: 1,
    part: "Assembly guide (digital)",
    source: "Mac Falcon",
    priceUsd: 0,
    notes:
      "Step-by-step build instructions with photos. BrickLink Studio file for the Technic superstructure. PDF delivered by email.",
    procure: "digital",
  },
  {
    qty: 1,
    part: "Control software",
    source: "Mac Falcon (GitHub)",
    priceUsd: 0,
    url: "https://github.com/vargasjr-dev/mac-falcon",
    notes:
      "Open-source ROS 2 bridge — runs on your Mac Mini and lets you drive the Create 3, read sensors, and send it home.",
    procure: "digital",
  },
];

async function seed() {
  console.log("🌱 Seeding Mac Falcon products...");

  await db
    .insert(product)
    .values({
      id: "m4d2-v1",
      name: "M4-D2 Mobility Kit",
      slug: "m4d2-mobility-kit",
      tagline: "Your Mac Mini, untethered. Everything included.",
      description:
        "The M4-D2 Mobility Kit puts your Mac Mini on wheels. Robot base, power supply, Lego Technic superstructure, Mac Mini cradle, mounting hardware, and open-source control software — all in one box. Plug it in, build it out, and your AI is mobile.",
      highlights: m4d2Highlights,
      specs: m4d2Specs,
      bom: m4d2Bom,
      priceUsd: 74900, // $749.00
      inStock: true,
      imageUrl: null,
    })
    .onConflictDoUpdate({
      target: product.id,
      set: {
        name: "M4-D2 Mobility Kit",
        slug: "m4d2-mobility-kit",
        tagline: "Your Mac Mini, untethered. Everything included.",
        description:
          "The M4-D2 Mobility Kit puts your Mac Mini on wheels. Robot base, power supply, Lego Technic superstructure, Mac Mini cradle, mounting hardware, and open-source control software — all in one box. Plug it in, build it out, and your AI is mobile.",
        highlights: m4d2Highlights,
        specs: m4d2Specs,
        bom: m4d2Bom,
        priceUsd: 74900,
        updatedAt: new Date(),
      },
    });

  console.log("✅ M4-D2 Mobility Kit seeded");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
