import { db } from "../../../../../data/db";
import { product } from "../../../../../data/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import BuyButton from "~/components/BuyButton";
import type { BomItem } from "../../../../../data/types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

function BomRow({ item }: { item: BomItem }) {
  const isFree = item.priceUsd === 0;
  return (
    <div className="border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-start gap-4 hover:border-slate-700 transition-colors">
      {/* Qty badge */}
      <div className="shrink-0 w-9 h-9 rounded-lg bg-slate-800 flex items-center justify-center text-slate-400 text-sm font-black">
        ×{item.qty}
      </div>

      {/* Part info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <span className="font-bold text-slate-100">{item.part}</span>
          {item.url ? (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-xs text-slate-500 hover:text-yellow-400 transition-colors underline underline-offset-2"
            >
              {item.source} ↗
            </a>
          ) : (
            <span className="text-xs text-slate-600">{item.source}</span>
          )}
        </div>
        {item.notes && (
          <p className="text-sm text-slate-500 leading-relaxed">{item.notes}</p>
        )}
      </div>

      {/* Price */}
      <div className="shrink-0 text-right">
        {isFree ? (
          <span className="text-xs font-bold text-yellow-400/70 border border-yellow-500/20 rounded px-2 py-1 tracking-widest uppercase">
            Included
          </span>
        ) : (
          <span className="text-slate-300 font-bold">
            {formatPrice(item.priceUsd * item.qty)}
          </span>
        )}
      </div>
    </div>
  );
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [p] = await db
    .select()
    .from(product)
    .where(eq(product.slug, slug))
    .limit(1);

  if (!p) notFound();

  const bom = p.bom ?? [];
  const specs = p.specs ?? {};
  const highlights = p.highlights ?? [];

  // BOM totals
  const componentTotal = bom.reduce((sum, item) => sum + item.priceUsd * item.qty, 0);
  const kitPrice = p.priceUsd;
  const markup = kitPrice - componentTotal;

  return (
    <div className="max-w-5xl">
      {/* ── Hero ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-16">
        {/* Left: info + buy */}
        <div className="flex flex-col justify-center order-2 lg:order-1">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold text-yellow-400/60 border border-yellow-500/20 rounded px-2 py-1 tracking-widest uppercase">
              v1
            </span>
            <span className="text-xs text-slate-600 font-medium">
              Mac Falcon
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black text-slate-100 tracking-tight mb-3 leading-tight">
            {p.name}
          </h1>

          {p.tagline && (
            <p className="text-slate-400 text-lg mb-6 leading-relaxed">
              {p.tagline}
            </p>
          )}

          {/* Highlights */}
          {highlights.length > 0 && (
            <ul className="space-y-2 mb-8">
              {highlights.map((h, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                  <span className="text-yellow-400 mt-0.5 shrink-0 font-bold">✓</span>
                  {h}
                </li>
              ))}
            </ul>
          )}

          {/* Price + CTA */}
          <div className="border-t border-slate-800 pt-6">
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-yellow-400 font-black text-4xl">
                {formatPrice(kitPrice)}
              </span>
              <span className="text-slate-600 text-sm line-through">
                {formatPrice(componentTotal)} in parts
              </span>
            </div>
            <p className="text-slate-600 text-xs mb-5">
              Free shipping · Mac Mini not included
            </p>
            <BuyButton productId={p.id} inStock={p.inStock} />
          </div>
        </div>

        {/* Right: image or render */}
        <div className="order-1 lg:order-2">
          {p.imageUrl ? (
            <img
              src={p.imageUrl}
              alt={p.name}
              className="w-full rounded-3xl border border-slate-800"
            />
          ) : (
            <div className="w-full aspect-square rounded-3xl bg-gradient-to-b from-slate-900 to-[#05070d] border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
              {/* Rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[420px] h-[420px] rounded-full border border-yellow-400/5" />
                <div className="absolute w-[280px] h-[280px] rounded-full border border-yellow-400/8" />
                <div className="absolute w-[140px] h-[140px] rounded-full border border-yellow-400/12" />
              </div>
              <div className="relative text-center">
                <div className="text-7xl mb-5">🦅</div>
                <div className="text-6xl font-black text-slate-100 tracking-tight mb-1">
                  M4-D2
                </div>
                <div className="text-slate-600 text-xs tracking-[0.4em] uppercase">
                  Mobility Kit · v1
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Specs grid ── */}
      {Object.keys(specs).length > 0 && (
        <section className="mb-16">
          <h2 className="text-xl font-black text-slate-100 mb-6 tracking-tight">
            Specs
          </h2>
          <div className="border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800">
            {Object.entries(specs).map(([key, val]) => (
              <div
                key={key}
                className="grid grid-cols-2 px-5 py-3 hover:bg-slate-900/40 transition-colors"
              >
                <span className="text-slate-500 text-sm">{key}</span>
                <span className="text-slate-200 text-sm font-medium">{val}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── BOM ── */}
      {bom.length > 0 && (
        <section className="mb-16">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-xl font-black text-slate-100 tracking-tight">
                What&apos;s in the kit
              </h2>
              <p className="text-slate-500 text-sm mt-1">
                Every component, sourced and spec&apos;d for the M4-D2.
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {bom.map((item, i) => (
              <BomRow key={i} item={item} />
            ))}
          </div>

          {/* Pricing summary */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <span className="text-slate-400 text-sm">Total component value</span>
              <span className="text-slate-300 font-bold">{formatPrice(componentTotal)}</span>
            </div>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div>
                <span className="text-slate-400 text-sm">Mac Falcon curation + assembly guide + software</span>
              </div>
              <span className="text-slate-300 font-bold">{formatPrice(markup)}</span>
            </div>
            <div className="flex items-center justify-between px-5 py-5 bg-slate-900/40">
              <span className="font-black text-slate-100">M4-D2 Mobility Kit</span>
              <span className="text-yellow-400 font-black text-xl">{formatPrice(kitPrice)}</span>
            </div>
          </div>

          <p className="text-slate-700 text-xs mt-4">
            * Mac Mini not included. Compatible with Mac Mini 2024 (M4, M4 Pro, M4 Max).
          </p>
        </section>
      )}

      {/* ── Description ── */}
      <section className="mb-16 border border-slate-800 rounded-2xl p-6 bg-slate-900/20">
        <p className="text-slate-300 leading-relaxed">{p.description}</p>
      </section>

      {/* ── Bottom CTA ── */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-slate-800 pt-8">
        <div>
          <div className="text-yellow-400 font-black text-3xl">{formatPrice(kitPrice)}</div>
          <div className="text-slate-500 text-sm">Free shipping · Mac Mini not included</div>
        </div>
        <BuyButton productId={p.id} inStock={p.inStock} />
      </div>
    </div>
  );
}
