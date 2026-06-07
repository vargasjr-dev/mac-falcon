import { db } from "../../../../data/db";
import { product } from "../../../../data/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import type { BomItem } from "../../../../data/types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

// ─── Technical line-art icons — LEGO instruction manual style ──────────────
function PartIcon({ part }: { part: string }) {
  const name = part.toLowerCase();
  const s = {
    viewBox: "0 0 100 100",
    className: "w-full h-full",
    fill: "none" as const,
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  // iRobot Create 3 — top-down circular base with wheels + top-ring bolt holes
  if (name.includes("irobot") || name.includes("create")) {
    return (
      <svg {...s}>
        <circle cx="50" cy="52" r="36" strokeWidth="2" />
        <rect x="8" y="42" width="8" height="20" rx="2" strokeWidth="1.5" />
        <rect x="84" y="42" width="8" height="20" rx="2" strokeWidth="1.5" />
        <circle cx="50" cy="52" r="24" strokeWidth="1" strokeDasharray="3 3" opacity={0.45} />
        <path d="M 33 22 Q 50 14 67 22" strokeWidth="1.5" />
        <circle cx="50" cy="27" r="2.5" strokeWidth="1.5" />
        <circle cx="32" cy="38" r="2.5" strokeWidth="1.5" />
        <circle cx="68" cy="38" r="2.5" strokeWidth="1.5" />
        <circle cx="50" cy="56" r="9" strokeWidth="1.5" />
        <circle cx="50" cy="56" r="3" strokeWidth="1.5" />
      </svg>
    );
  }

  // Anker power bank — front view with LED indicators
  if (
    name.includes("anker") ||
    name.includes("powercore") ||
    name.includes("power bank") ||
    name.includes("battery")
  ) {
    return (
      <svg {...s}>
        <rect x="12" y="26" width="68" height="42" rx="6" strokeWidth="2" />
        <rect x="80" y="36" width="6" height="22" rx="2" strokeWidth="1.5" />
        <circle cx="30" cy="47" r="3.5" fill="currentColor" stroke="none" opacity={0.9} />
        <circle cx="42" cy="47" r="3.5" fill="currentColor" stroke="none" opacity={0.9} />
        <circle cx="54" cy="47" r="3.5" fill="currentColor" stroke="none" opacity={0.9} />
        <circle cx="66" cy="47" r="3.5" fill="currentColor" stroke="none" opacity={0.2} />
        <rect x="36" y="14" width="28" height="12" rx="5" strokeWidth="1.5" />
        <line x1="24" y1="60" x2="72" y2="60" strokeWidth="1" opacity={0.35} />
      </svg>
    );
  }

  // Lego Technic — cross-beams with axle holes
  if (
    name.includes("lego") ||
    name.includes("technic") ||
    name.includes("superstructure")
  ) {
    return (
      <svg {...s}>
        <rect x="8" y="40" width="84" height="18" rx="3" strokeWidth="2" />
        <circle cx="22" cy="49" r="4.5" strokeWidth="1.5" />
        <circle cx="34" cy="49" r="4.5" strokeWidth="1.5" />
        <circle cx="46" cy="49" r="4.5" strokeWidth="1.5" />
        <circle cx="58" cy="49" r="4.5" strokeWidth="1.5" />
        <circle cx="70" cy="49" r="4.5" strokeWidth="1.5" />
        <circle cx="82" cy="49" r="4.5" strokeWidth="1.5" />
        <rect x="43" y="14" width="14" height="72" rx="3" strokeWidth="2" />
        <circle cx="50" cy="26" r="4.5" strokeWidth="1.5" />
        <circle cx="50" cy="38" r="4.5" strokeWidth="1.5" />
        <circle cx="50" cy="62" r="4.5" strokeWidth="1.5" />
        <circle cx="50" cy="74" r="4.5" strokeWidth="1.5" />
        <circle cx="50" cy="49" r="6" strokeWidth="2.5" />
        <circle cx="50" cy="49" r="2" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  // 3D printed cradle — bracket / shelf side view
  if (
    name.includes("cradle") ||
    name.includes("3d") ||
    name.includes("printed") ||
    name.includes("pla")
  ) {
    return (
      <svg {...s}>
        <rect x="26" y="28" width="48" height="46" rx="4" strokeWidth="2" />
        <path d="M 16 74 L 16 42 Q 16 28 26 28" strokeWidth="2" />
        <path d="M 84 74 L 84 42 Q 84 28 74 28" strokeWidth="2" />
        <rect x="10" y="74" width="80" height="10" rx="2" strokeWidth="2" />
        <line x1="32" y1="28" x2="68" y2="28" strokeWidth="2.5" opacity={0.4} />
        <circle cx="20" cy="81" r="2" strokeWidth="1.5" />
        <circle cx="80" cy="81" r="2" strokeWidth="1.5" />
        <line x1="34" y1="46" x2="66" y2="46" strokeWidth="1" opacity={0.4} />
        <line x1="34" y1="54" x2="66" y2="54" strokeWidth="1" opacity={0.4} />
        <line x1="34" y1="62" x2="66" y2="62" strokeWidth="1" opacity={0.4} />
      </svg>
    );
  }

  // Mounting hardware — bolts + grommet + adhesive strip
  if (
    name.includes("hardware") ||
    name.includes("mounting") ||
    name.includes("bolt") ||
    name.includes("grommet") ||
    name.includes("screw")
  ) {
    return (
      <svg {...s}>
        <circle cx="28" cy="27" r="9" strokeWidth="2" />
        <line x1="22" y1="21" x2="34" y2="33" strokeWidth="1.5" opacity={0.55} />
        <line x1="34" y1="21" x2="22" y2="33" strokeWidth="1.5" opacity={0.55} />
        <rect x="25" y="36" width="6" height="22" rx="1" strokeWidth="1.5" />
        <circle cx="72" cy="29" r="10" strokeWidth="2" />
        <line x1="65" y1="23" x2="79" y2="35" strokeWidth="1.5" opacity={0.55} />
        <line x1="79" y1="23" x2="65" y2="35" strokeWidth="1.5" opacity={0.55} />
        <rect x="69" y="39" width="7" height="26" rx="1" strokeWidth="1.5" />
        <circle cx="30" cy="75" r="9" strokeWidth="2" />
        <circle cx="30" cy="75" r="4.5" strokeWidth="1.5" />
        <rect x="55" y="69" width="32" height="12" rx="2" strokeWidth="1.5" />
        <line x1="62" y1="69" x2="62" y2="81" strokeWidth="1" opacity={0.4} />
        <line x1="69" y1="69" x2="69" y2="81" strokeWidth="1" opacity={0.4} />
        <line x1="76" y1="69" x2="76" y2="81" strokeWidth="1" opacity={0.4} />
        <line x1="83" y1="69" x2="83" y2="81" strokeWidth="1" opacity={0.4} />
      </svg>
    );
  }

  // USB-C cable — connectors + braided curve
  if (
    name.includes("cable") ||
    name.includes("usb") ||
    name.includes("braided") ||
    name.includes("cord")
  ) {
    return (
      <svg {...s}>
        <rect x="6" y="41" width="16" height="18" rx="5" strokeWidth="2" />
        <rect x="8" y="45" width="12" height="10" rx="3" strokeWidth="1" />
        <rect x="78" y="41" width="16" height="18" rx="5" strokeWidth="2" />
        <rect x="80" y="45" width="12" height="10" rx="3" strokeWidth="1" />
        <path d="M 22 50 C 38 50 38 24 50 24 C 62 24 62 50 78 50" strokeWidth="2.5" />
        <circle cx="36" cy="41" r="1.5" fill="currentColor" stroke="none" opacity={0.65} />
        <circle cx="43" cy="33" r="1.5" fill="currentColor" stroke="none" opacity={0.65} />
        <circle cx="50" cy="28" r="1.5" fill="currentColor" stroke="none" opacity={0.65} />
        <circle cx="57" cy="33" r="1.5" fill="currentColor" stroke="none" opacity={0.65} />
        <circle cx="64" cy="41" r="1.5" fill="currentColor" stroke="none" opacity={0.65} />
      </svg>
    );
  }

  // Digital / guide / software / BrickLink
  if (
    name.includes("guide") ||
    name.includes("software") ||
    name.includes("bricklink") ||
    name.includes("digital") ||
    name.includes("file")
  ) {
    return (
      <svg {...s}>
        <rect x="22" y="12" width="56" height="72" rx="4" strokeWidth="2" />
        <path d="M 22 24 L 34 12" strokeWidth="2" />
        <path d="M 34 12 L 34 24 L 22 24" strokeWidth="1.5" opacity={0.55} />
        <line x1="34" y1="36" x2="66" y2="36" strokeWidth="1.5" />
        <line x1="34" y1="46" x2="66" y2="46" strokeWidth="1.5" />
        <line x1="34" y1="56" x2="58" y2="56" strokeWidth="1.5" />
        <line x1="34" y1="66" x2="52" y2="66" strokeWidth="1.5" />
      </svg>
    );
  }

  // Generic fallback
  return (
    <svg {...s}>
      <rect x="22" y="26" width="56" height="54" rx="4" strokeWidth="2" />
      <path d="M 22 44 L 78 44" strokeWidth="1.5" />
      <path d="M 50 26 L 50 44" strokeWidth="1.5" />
      <circle cx="50" cy="60" r="7" strokeWidth="1.5" />
    </svg>
  );
}

// ─── Build steps ────────────────────────────────────────────────────────────
const BUILD_STEPS = [
  {
    number: "01",
    title: "Assemble the Technic frame",
    body: "Follow the BrickLink Studio file included with your kit. The Technic superstructure mounts to the top ring of the Create 3 using the included M3 bolts and rubber grommets.",
    duration: "~45 min",
  },
  {
    number: "02",
    title: "Seat the power bank",
    body: "The Anker 737 slides into the lower shelf of the Technic frame. Route the USB-C data cable (Mac Mini → Create 3) through the cable guide channel on the left rail.",
    duration: "~10 min",
  },
  {
    number: "03",
    title: "Mount your Mac Mini",
    body: "Lower your Mac Mini 2024 into the printed PLA+ cradle. It clicks into the upper shelf — no tools needed. Connect the 140W USB-C power cable from the Anker to the Mac Mini's back port.",
    duration: "~5 min",
  },
  {
    number: "04",
    title: "Install the control software",
    body: "Clone the open-source mac-falcon repo on your Mac Mini and run the setup script. It installs the ROS 2 bridge and lets you drive the Create 3 from your terminal — or from anywhere on your WiFi network.",
    duration: "~20 min",
  },
];

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const [p] = await db
    .select()
    .from(product)
    .where(eq(product.slug, slug))
    .limit(1);

  if (!p) notFound();

  const bom: BomItem[] = p.bom ?? [];
  const totalPieces = bom.reduce((t, b) => t + b.qty, 0);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">

      {/* Back */}
      <Link
        href={`/shop/${p.slug}`}
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-12"
      >
        ← Back to kit
      </Link>

      {/* Header */}
      <div className="mb-14">
        <div className="text-xs font-bold text-slate-600 tracking-[0.3em] uppercase mb-3">
          Build Guide
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-slate-100 tracking-tight mb-4 leading-tight">
          {p.name}
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed max-w-xl">
          A complete walkthrough — what&apos;s in the box, how to put it
          together, and how to get your Mac Mini rolling.
        </p>
      </div>

      {/* Hero image */}
      {p.imageUrl && (
        <div className="mb-16 rounded-2xl overflow-hidden border border-slate-800 relative">
          <span className="absolute top-3 left-3 w-4 h-4 border-t-2 border-l-2 border-yellow-500/30 rounded-tl-sm z-10" />
          <span className="absolute top-3 right-3 w-4 h-4 border-t-2 border-r-2 border-yellow-500/30 rounded-tr-sm z-10" />
          <span className="absolute bottom-3 left-3 w-4 h-4 border-b-2 border-l-2 border-yellow-500/30 rounded-bl-sm z-10" />
          <span className="absolute bottom-3 right-3 w-4 h-4 border-b-2 border-r-2 border-yellow-500/30 rounded-br-sm z-10" />
          <Image
            src={p.imageUrl}
            alt={p.name}
            width={1200}
            height={800}
            className="w-full object-cover"
          />
        </div>
      )}

      {/* ── What's in the box — LEGO / IKEA parts grid ── */}
      <section className="mb-16">
        <h2 className="text-2xl font-black text-slate-100 tracking-tight mb-1">
          What&apos;s in the box
        </h2>
        <p className="text-slate-500 text-sm mb-8">
          {bom.length} component{bom.length !== 1 ? "s" : ""} &middot;{" "}
          {totalPieces} piece{totalPieces !== 1 ? "s" : ""} total
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {bom.map((item, i) => (
            <div
              key={i}
              className="relative border border-slate-800 rounded-xl overflow-hidden group"
            >
              {/* Technical illustration */}
              <div className="aspect-square bg-slate-950/70 flex items-center justify-center p-8 text-yellow-400/40 group-hover:text-yellow-400/65 transition-colors duration-200">
                <PartIcon part={item.part} />
              </div>

              {/* Qty badge — top-right, LEGO style */}
              <div className="absolute top-2.5 right-2.5 bg-yellow-400 text-slate-900 text-[11px] font-black rounded-full px-1.5 py-[3px] leading-none tabular-nums z-10">
                ×{item.qty}
              </div>

              {/* Corner accent bracket */}
              <span className="absolute top-2 left-2 w-3 h-3 border-t border-l border-yellow-500/20 rounded-tl pointer-events-none" />

              {/* Label */}
              <div className="p-3 border-t border-slate-800/80 bg-slate-900/25">
                <div className="text-slate-200 text-xs font-bold leading-snug tracking-tight line-clamp-2">
                  {item.part}
                </div>
                <div className="text-slate-600 text-[10px] mt-0.5 font-medium uppercase tracking-wider">
                  {item.procure === "digital" ? "Digital" : item.source}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Build steps */}
      <section className="mb-16">
        <h2 className="text-2xl font-black text-slate-100 tracking-tight mb-2">
          Build steps
        </h2>
        <p className="text-slate-500 text-sm mb-8">
          Total time: about 80 minutes the first time.
        </p>

        <div className="space-y-6">
          {BUILD_STEPS.map((step) => (
            <div key={step.number} className="flex gap-6">
              {/* Step number + line */}
              <div className="flex flex-col items-center shrink-0">
                <div className="w-10 h-10 rounded-full border border-yellow-500/30 bg-yellow-500/5 flex items-center justify-center text-yellow-400 font-black text-xs">
                  {step.number}
                </div>
                <div className="w-px flex-1 bg-slate-800 mt-2" />
              </div>
              {/* Content */}
              <div className="pb-8 flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-black text-slate-100">{step.title}</h3>
                  <span className="text-xs text-slate-600 font-medium">{step.duration}</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{step.body}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Download CTA */}
      <section className="border border-slate-800 rounded-2xl p-8 text-center mb-16 bg-slate-900/20">
        <div className="text-3xl mb-4">📄</div>
        <h3 className="text-lg font-black text-slate-100 mb-2">
          Download the PDF guide
        </h3>
        <p className="text-slate-500 text-sm mb-6 max-w-sm mx-auto">
          The full build guide with photos, part numbers, and wiring diagrams.
          Sent to your email with your order confirmation.
        </p>
        <span className="inline-flex items-center gap-2 px-6 py-3 border border-slate-700 rounded-xl text-slate-400 text-sm font-semibold cursor-not-allowed">
          📦 Included with purchase
        </span>
      </section>

      {/* CTA */}
      <div className="border-t border-slate-800 pt-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div>
          <div className="text-yellow-400 font-black text-3xl">
            {formatPrice(p.priceUsd)}
          </div>
          <div className="text-slate-500 text-sm">Free shipping · Mac Mini not included</div>
        </div>
        <Link
          href={`/shop/${p.slug}`}
          className="px-8 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 font-black rounded-xl hover:from-yellow-300 hover:to-yellow-400 transition-all falcon-glow text-sm tracking-wide"
        >
          Order the M4-D2 →
        </Link>
      </div>
    </div>
  );
}
