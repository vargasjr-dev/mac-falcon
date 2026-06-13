/**
 * Migration: 001-seed-diy-bom
 *
 * Replaces the iRobot Create 3-based BOM with the fully DIY open-source
 * chassis design. All parts are off-the-shelf. No proprietary robot base.
 *
 * Run via: GitHub Actions `run-migration` label on the PR
 * After running: close the PR without merging.
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { product } from "../../data/schema";
import type { BomItem, ProductSpecs } from "../../data/types";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

const highlights: string[] = [
  "Fully open source — chassis DXF files, Pico W firmware, and control software all on GitHub",
  "DIY-first — every part is off-the-shelf, no proprietary robot base required",
  "Mac Mini M4 on wheels — your AI gets a body for ~$270 in parts",
  "Differential drive with cliff detection and bump sensing — safe to run in your home",
  "Expandable top deck — camera, arms, and sensor modules mount directly to the shelf plate",
];

const specs: ProductSpecs = {
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

const bom: BomItem[] = [
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
    part: "TT DC gearbox motor with encoder",
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
      "Controls both TT motors from two Pico W PWM pin pairs. 1.5A continuous per channel. Wiring: VM → TalentCell 12V, GND → common ground, AIN1/AIN2/BIN1/BIN2 → Pico W GP2–GP5, AOUT1/2 → left motor, BOUT1/2 → right motor.",
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
      "Reflective IR — detects when there's no floor below (stairs, ledge drops). Mount flush to underside of base plate at 12, 3, 6, and 9 o'clock. Wire: VCC → 3.3V, GND → GND, DO → Pico W GP10–GP13. Adjust trim pot until LED flickers at 5–10mm above floor.",
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
      "Physical bump detection. Mount around the perimeter, one per quadrant, actuator arm pointing outward. Wire NO terminal → Pico W GP6–GP9 with pull-up resistor. Robot halts and backs up on trigger.",
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
      "Powers motors and Pico W. Built-in BMS — no separate protection circuit needed. DC barrel jack → DRV8833 VM. USB-A port → Pico W VBUS. Mounts to underside of base plate with adhesive velcro.",
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
      "140W USB-C output — runs a Mac Mini M4 at full load. 24,000mAh = 4–6 hours untethered. Mounts on the lower deck shelf. USB-C port faces outward for easy charging access.",
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
      "Press-fit onto TT motor output shaft. Rubber tread grips hardwood and carpet. One per drive motor.",
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
      "300mm diameter, 1/4\" clear acrylic. Upload mac-falcon/hardware/base-plate.dxf from GitHub. Cutouts: 2× TT motor slots, 4× cliff sensor holes, 4× bump switch mounts, 6× M3 standoff holes, 1× ball caster hole.",
    procure: "per_order",
  },
  {
    qty: 1,
    part: "Mac Mini shelf plate (laser cut)",
    source: "SendCutSend",
    priceUsd: 1500,
    url: "https://sendcutsend.com",
    notes:
      "300mm diameter, 1/4\" clear acrylic. Upload mac-falcon/hardware/shelf-plate.dxf. Sits 80mm above base plate on M3 standoffs. Cutouts: 6× standoff holes, Mac Mini footprint outline, rear cable routing slot.",
    procure: "per_order",
  },
  {
    qty: 1,
    part: "M3 brass standoff + screw kit",
    source: "Amazon",
    priceUsd: 899,
    url: "https://www.amazon.com/dp/B07B9X1KY6",
    notes:
      "6× 80mm M3 standoffs for shelf plate. 6× 10mm M3 standoffs for DRV8833 and Pico W. Includes M3 screws and nuts. Brass preferred — lighter and won't rust.",
    procure: "bulk",
    batchSize: 5,
  },
  {
    qty: 1,
    part: "Mac Mini 2024 cradle (3D printed)",
    source: "Mac Falcon",
    priceUsd: 300,
    notes:
      "PLA+ cradle precision-fit to Mac Mini 2024 (197×197×35mm footprint). Print file at mac-falcon/hardware/mac-mini-cradle.stl. ~$3 in filament at 20% infill. Open rear for power/USB, open sides for vents.",
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
      "Prototype wiring — no soldering required. Mounts to base plate. Graduate to a custom PCB once wiring is proven. Kit includes 40× M-M, 40× M-F, 40× F-F jumpers.",
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
      "One: Anker 737 → Mac Mini (140W power). Second: spare. Route through rear shelf cutout, secure with adhesive cable clips.",
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
      "Mac Mini USB-A → Pico W micro-USB. Powers the Pico W and carries the serial command link for movement. Short cable keeps routing tidy.",
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
      "TalentCell barrel jack → breadboard-friendly pigtail. Routes 12V from battery to DRV8833 VM pin and common ground rail. 5.5mm/2.1mm to match TalentCell output.",
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
      "MicroPython firmware for the Pico W. Handles motor PWM via DRV8833, cliff sensor polling, bump switch interrupts, and USB serial command parsing. Flash via Thonny or mpremote.",
    procure: "digital",
  },
  {
    qty: 1,
    part: "Mac Falcon control software (Mac Mini)",
    source: "Mac Falcon (GitHub)",
    priceUsd: 0,
    url: "https://github.com/vargasjr-dev/mac-falcon",
    notes:
      "Node.js bridge running on the Mac Mini. Sends drive commands to the Pico W over USB serial, reads telemetry (battery, sensor states), and exposes a local HTTP API so your AI can control movement. Open source — fork it, extend it.",
    procure: "digital",
  },
];

async function run() {
  console.log("▶ 001-seed-diy-bom: updating M4-D2 Mobility Kit BOM...");

  await db
    .insert(product)
    .values({
      id: "m4d2-v1",
      name: "M4-D2 Mobility Kit",
      slug: "m4d2-mobility-kit",
      tagline: "Give your Mac Mini a body. Open source, DIY, under $300.",
      description:
        "The M4-D2 Mobility Kit puts your Mac Mini on wheels. Every part is off-the-shelf, every file is open source, and the whole thing costs under $300 in components. Differential drive, cliff detection, bump sensing, and a clean two-deck chassis — your AI has legs. Build it in an afternoon, extend it forever.",
      highlights,
      specs,
      bom,
      priceUsd: 74900,
      inStock: true,
      imageUrl: null,
    })
    .onConflictDoUpdate({
      target: product.id,
      set: {
        tagline: "Give your Mac Mini a body. Open source, DIY, under $300.",
        description:
          "The M4-D2 Mobility Kit puts your Mac Mini on wheels. Every part is off-the-shelf, every file is open source, and the whole thing costs under $300 in components. Differential drive, cliff detection, bump sensing, and a clean two-deck chassis — your AI has legs. Build it in an afternoon, extend it forever.",
        highlights,
        specs,
        bom,
        updatedAt: new Date(),
      },
    });

  console.log("✅ Done — M4-D2 BOM updated to DIY open platform.");
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
