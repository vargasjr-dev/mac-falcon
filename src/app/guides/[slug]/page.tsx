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
  const paidParts = bom.filter((b) => b.priceUsd > 0);
  const includedDigital = bom.filter((b) => b.priceUsd === 0);

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

      {/* What's in the box */}
      <section className="mb-16">
        <h2 className="text-2xl font-black text-slate-100 tracking-tight mb-2">
          What&apos;s in the box
        </h2>
        <p className="text-slate-500 text-sm mb-8">
          Every component included in the {p.name}.
        </p>

        <div className="space-y-3 mb-8">
          {paidParts.map((item, i) => (
            <div
              key={i}
              className="flex items-start gap-4 border border-slate-800 rounded-xl p-4"
            >
              <div className="shrink-0 w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 text-sm font-black">
                ×{item.qty}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <span className="font-semibold text-slate-200 text-sm">{item.part}</span>
                  {item.url ? (
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-500 hover:text-yellow-400 transition-colors underline underline-offset-2"
                    >
                      {item.source} ↗
                    </a>
                  ) : (
                    <span className="text-xs text-slate-600">{item.source}</span>
                  )}
                </div>
                {item.notes && (
                  <p className="text-xs text-slate-500 leading-relaxed">{item.notes}</p>
                )}
              </div>
              <div className="shrink-0 text-slate-500 text-sm font-medium">
                {formatPrice(item.priceUsd * item.qty)}
              </div>
            </div>
          ))}
        </div>

        {/* Digital items */}
        {includedDigital.length > 0 && (
          <div className="border border-slate-800/50 rounded-xl divide-y divide-slate-800/50">
            {includedDigital.map((item, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <span className="text-yellow-400 text-sm shrink-0">✓</span>
                <span className="text-slate-500 text-sm flex-1">{item.part}</span>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-600 hover:text-yellow-400 transition-colors underline underline-offset-2 shrink-0"
                  >
                    View ↗
                  </a>
                )}
                <span className="text-xs font-bold text-yellow-400/60 border border-yellow-500/20 rounded px-2 py-0.5">
                  Free
                </span>
              </div>
            ))}
          </div>
        )}
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
