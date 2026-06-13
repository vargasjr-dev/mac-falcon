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
// M4-D2 Mobility Kit v1 — DIY Open Platform
// ──────────────────────────────────────────────

const m4d2Highlights: string[] = [
  "Fully open source — chassis DXF files, Pico W firmware, and control software all on GitHub",
  "DIY-first — every part is off-the-shelf, no proprietary robot base required",
  "Mac Mini M4 on wheels — your AI gets a body for ~$270 in parts",
  "Differential drive with cliff detection and bump sensing — safe to run in your home",
  "Expandable top deck — camera, arms, and sensor modules mount directly to the shelf plate",
];

const m4d2Specs: ProductSpecs = {
  "Mac Mini compatibility": "M4, M4 Pro, M4 Max (2024)",
  "Drive type": "Differential drive (2× TT DC gearbox motors)",
  "Low-level controller": "Raspberry Pi Pico W (MicroPython)",
  "Motor driver": "DRV8833 dual H-bridge (1.5A per channel)",
  "Estimated max speed": "~0.4 m/s",
  "Footprint": "300 mm diameter",
  "Height with Mac Mini": "~350 mm",
  "Cliff detection": "4× IR sensors (TCRT5000) — stair/drop safe",
  "Bump detection": "4× micro limit switches — obstacle response",
  "Mac Mini power": "Anker 737 PowerCore 24K — 140 W USB-C, 4–6 hr runtime",
  "Base power": "TalentCell 12V LiPo — 3000 mAh (motors + Pico)",
  "Mac Mini ↔ Pico link": "USB serial via USB-A to micro-USB",
  "Chassis material": "1/4\" acrylic, laser cut (SendCutSend DXF on GitHub)",
  "Software": "Open-source — github.com/vargasjr-dev/mac-falcon",
};

const m4d2Bom: BomItem[] = [
  // ── Electronics ────────────────────────────────
  {
    qty: 1,
    part: "Raspberry Pi Pico W",
    source: "Adafruit",
    priceUsd: 600,
    url: "https://www.adafruit.com/product/5526",
    notes:
      "The low-level brain. Reads cliff sensors and bump switches, drives motors via DRV8833, and receives movement commands from the Mac Mini over USB serial. Flash with the Mac Falcon MicroPython firmware (open source on GitHub).",
    procure: "bulk",
    batchSize: 5,
  },
  {
    qty: 2,
    part: "TT DC gearbox motor",
    source: "Adafruit",
    priceUsd: 295,
    url: "https://www.adafruit.com/product/3777",
    notes:
      "Standard TT form factor. One per drive wheel. Mounting tabs bolt directly into the base plate motor slots (pattern in DXF file). 3–6V operating range — run at 5V from the TalentCell for solid torque without heat.",
    procure: "bulk",
    batchSize: 10,
  },
  {
    qty: 1,
    part: "DRV8833 dual motor driver breakout",
    source: "Adafruit",
    priceUsd: 595,
    url: "https://www.adafruit.com/product/3297",
    notes:
      "Controls both TT motors from two Pico W PWM pin pairs. 1.5A continuous per channel — plenty for TT motors. Wires: VM → TalentCell 12V, GND → common ground, AIN1/AIN2/BIN1/BIN2 → Pico W GP2–GP5, AOUT1/2 → left motor, BOUT1/2 → right motor.",
    procure: "bulk",
    batchSize: 5,
  },
  {
    qty: 4,
    part: "TCRT5000 IR cliff sensor module",
    source: "Amazon",
    priceUsd: 250,
    url: "https://www.amazon.com/dp/B07XLZN2PD",
    notes:
      "Reflective IR sensor — detects when there's no floor below (stairs, ledge drops). Mount flush to the underside of the base plate at 12, 3, 6, and 9 o'clock positions. Wire: VCC → 3.3V, GND → GND, DO → Pico W GP10–GP13. Adjust trim pot until LED flickers at 5–10mm above floor.",
    procure: "bulk",
    batchSize: 10,
  },
  {
    qty: 4,
    part: "Micro limit switch (bump sensor)",
    source: "Amazon",
    priceUsd: 75,
    url: "https://www.amazon.com/dp/B073TYWX86",
    notes:
      "Physical bump detection. Mount around the perimeter of the base plate — one per quadrant, actuator arm pointing outward. Wire NO terminal → Pico W GP6–GP9 with pull-up resistor. Robot halts + backs up on trigger.",
    procure: "bulk",
    batchSize: 20,
  },

  // ── Power ───────────────────────────────────────
  {
    qty: 1,
    part: "TalentCell 12V 3000mAh LiPo battery",
    source: "Amazon",
    priceUsd: 2699,
    url: "https://www.amazon.com/dp/B01M7Z9Z1N",
    notes:
      "Powers the motors and Pico W. Built-in BMS — no separate protection circuit needed. DC barrel jack → DRV8833 VM pin. USB-A port → Pico W VBUS. Charges via included DC adapter. Mount to underside of base plate with adhesive velcro.",
    procure: "bulk",
    batchSize: 3,
  },
  {
    qty: 1,
    part: "Anker 737 PowerCore 24K",
    source: "Anker / Amazon",
    priceUsd: 13000,
    url: "https://www.amazon.com/dp/B09VPHVT2Z",
    notes:
      "140W USB-C output — enough to run a Mac Mini M4 at full load. 24,000mAh = 4–6 hours untethered. Mounts on the lower deck shelf between the base plate and the Mac Mini shelf. USB-C port faces outward for easy charging access.",
    procure: "bulk",
    batchSize: 3,
  },

  // ── Mechanical ─────────────────────────────────
  {
    qty: 2,
    part: "65mm rubber wheel (TT motor fit)",
    source: "Adafruit",
    priceUsd: 195,
    url: "https://www.adafruit.com/product/3948",
    notes:
      "Press-fit onto TT motor output shaft. Rubber tread grips hardwood and carpet. One per drive motor — left and right.",
    procure: "bulk",
    batchSize: 10,
  },
  {
    qty: 1,
    part: "Ball caster (3/8\" steel ball)",
    source: "Pololu",
    priceUsd: 275,
    url: "https://www.pololu.com/product/953",
    notes:
      "Third contact point at the rear of the chassis. Keeps the platform level without restricting rotation. Bolts through the base plate from underneath.",
    procure: "bulk",
    batchSize: 5,
  },
  {
    qty: 1,
    part: "12\" round acrylic base plate (laser cut)",
    source: "SendCutSend",
    priceUsd: 1800,
    url: "https://sendcutsend.com",
    notes:
      "300mm diameter, 1/4\" clear acrylic. Upload the Mac Falcon base plate DXF from GitHub (mac-falcon/hardware/base-plate.dxf). Cutouts include: 2× TT motor slots, 4× cliff sensor holes, 4× bump switch mount holes, 6× standoff holes (M3), 1× ball caster hole. ~$12–18 depending on material choice.",
    procure: "per_order",
  },
  {
    qty: 1,
    part: "Mac Mini shelf plate (laser cut)",
    source: "SendCutSend",
    priceUsd: 1500,
    url: "https://sendcutsend.com",
    notes:
      "300mm diameter, 1/4\" clear acrylic. Upload mac-falcon/hardware/shelf-plate.dxf. Cutouts: 6× standoff holes (aligned to base plate), Mac Mini footprint outline for positioning, rear cutout for cable routing. Sits 80mm above base plate on M3 standoffs.",
    procure: "per_order",
  },
  {
    qty: 1,
    part: "M3 brass standoff + screw kit",
    source: "Amazon",
    priceUsd: 899,
    url: "https://www.amazon.com/dp/B07B9X1KY6",
    notes:
      "6× 80mm M3 standoffs hold the shelf plate above the base plate. 6× 10mm M3 standoffs for mounting the DRV8833 and Pico W to the base plate. Includes M3 screws and nuts for all connections. Brass preferred over zinc — lighter and won't rust.",
    procure: "bulk",
    batchSize: 5,
  },
  {
    qty: 1,
    part: "Mac Mini 2024 cradle (3D printed)",
    source: "Mac Falcon",
    priceUsd: 300,
    notes:
      "PLA+ cradle precision-fit to Mac Mini 2024 (197×197×35mm footprint). Print file at mac-falcon/hardware/mac-mini-cradle.stl. ~$3 in filament at 20% infill. Holds Mac Mini secure under acceleration without blocking any ports — open rear for power and USB, open sides for vents.",
    procure: "in_house",
    batchSize: 5,
  },

  // ── Wiring & misc ──────────────────────────────
  {
    qty: 1,
    part: "Half-size breadboard + jumper wire kit",
    source: "Amazon",
    priceUsd: 899,
    url: "https://www.amazon.com/dp/B01ERP6WL4",
    notes:
      "Breadboard mounts to the base plate for the prototype build — no soldering required. Use jumpers to connect Pico W → DRV8833 → sensors. 40× M-M, 40× M-F, 40× F-F wires included. Graduate to a custom PCB once the wiring is proven.",
    procure: "bulk",
    batchSize: 3,
  },
  {
    qty: 2,
    part: "USB-C braided cable 1.8m",
    source: "Anker / Amazon",
    priceUsd: 799,
    url: "https://www.amazon.com/dp/B07QC69HLL",
    notes:
      "One cable: Anker 737 → Mac Mini (140W power). Second cable: spare / future Pico W USB-C variant. Route cables through the rear shelf cutout and secure with adhesive cable clips.",
    procure: "bulk",
    batchSize: 5,
  },
  {
    qty: 1,
    part: "USB-A to micro-USB cable 0.5m",
    source: "Amazon",
    priceUsd: 499,
    url: "https://www.amazon.com/dp/B01FSYBQ9Q",
    notes:
      "Mac Mini USB-A → Pico W micro-USB. Powers the Pico W and provides the serial data link for movement commands. Short cable keeps the routing tidy inside the chassis.",
    procure: "bulk",
    batchSize: 5,
  },
  {
    qty: 1,
    part: "DC barrel jack adapter cables",
    source: "Amazon",
    priceUsd: 599,
    url: "https://www.amazon.com/dp/B07C61434H",
    notes:
      "TalentCell barrel jack → breadboard-friendly pigtail. Used to route 12V from battery to the DRV8833 VM pin and common ground rail. Get the 5.5mm/2.1mm size to match the TalentCell output.",
    procure: "bulk",
    batchSize: 5,
  },

  // ── Digital ────────────────────────────────────
  {
    qty: 1,
    part: "Mac Falcon firmware (Pico W)",
    source: "Mac Falcon (GitHub)",
    priceUsd: 0,
    url: "https://github.com/vargasjr-dev/mac-falcon",
    notes:
      "MicroPython firmware for the Raspberry Pi Pico W. Handles motor control (PWM via DRV8833), cliff sensor polling, bump switch interrupts, and USB serial command parsing. Flash via Thonny or mpremote.",
    procure: "digital",
  },
  {
    qty: 1,
    part: "Mac Falcon control software (Mac Mini)",
    source: "Mac Falcon (GitHub)",
    priceUsd: 0,
    url: "https://github.com/vargasjr-dev/mac-falcon",
    notes:
      "Node.js bridge that runs on the Mac Mini. Sends drive commands to the Pico W over USB serial, reads telemetry (battery, sensor states), and exposes a local HTTP API so your AI can control movement. Open source — fork it, extend it, make it yours.",
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
      tagline: "Give your Mac Mini a body. Open source, DIY, under $300.",
      description:
        "The M4-D2 Mobility Kit puts your Mac Mini on wheels. Every part is off-the-shelf, every file is open source, and the whole thing costs under $300 in components. Differential drive, cliff detection, bump sensing, and a clean two-deck chassis — your AI has legs. Build it in an afternoon, extend it forever.",
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
        tagline: "Give your Mac Mini a body. Open source, DIY, under $300.",
        description:
          "The M4-D2 Mobility Kit puts your Mac Mini on wheels. Every part is off-the-shelf, every file is open source, and the whole thing costs under $300 in components. Differential drive, cliff detection, bump sensing, and a clean two-deck chassis — your AI has legs. Build it in an afternoon, extend it forever.",
        highlights: m4d2Highlights,
        specs: m4d2Specs,
        bom: m4d2Bom,
        priceUsd: 74900,
        updatedAt: new Date(),
      },
    });

  console.log("✅ M4-D2 Mobility Kit seeded (DIY open platform BOM)");
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
