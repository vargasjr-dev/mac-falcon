import { db } from "../../../../../data/db";
import { product } from "../../../../../data/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import BuyButton from "~/components/BuyButton";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ slug: string }>;
}

function formatPrice(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [p] = await db
    .select()
    .from(product)
    .where(eq(product.slug, slug))
    .limit(1);

  if (!p) notFound();

  const highlights = p.highlights ?? [];

  return (
    <div className="max-w-5xl">

      {/* Back */}
      <Link
        href="/shop"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-10"
      >
        ← All kits
      </Link>

      {/* ── Hero ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">

        {/* Left: info + buy */}
        <div className="flex flex-col justify-center order-2 lg:order-1">
          <div className="text-xs font-bold text-slate-600 tracking-[0.3em] uppercase mb-4">
            Mac Falcon
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
            <ul className="space-y-2.5 mb-8">
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
                {formatPrice(p.priceUsd)}
              </span>
            </div>
            <p className="text-slate-600 text-xs mb-5">
              Free shipping · Mac Mini not included
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <BuyButton productId={p.id} inStock={p.inStock} />
              <Link
                href={`/guides/${p.slug}`}
                className="px-6 py-4 rounded-xl border border-slate-700 text-slate-300 font-semibold text-sm hover:border-yellow-500/40 hover:text-slate-100 transition-all text-center"
              >
                Build guide →
              </Link>
            </div>
          </div>
        </div>

        {/* Right: product image */}
        <div className="order-1 lg:order-2">
          {p.imageUrl ? (
            <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-slate-950">
              {/* HUD corners */}
              <span className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-yellow-500/25 rounded-tl-sm z-10" />
              <span className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-yellow-500/25 rounded-tr-sm z-10" />
              <span className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-yellow-500/25 rounded-bl-sm z-10" />
              <span className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-yellow-500/25 rounded-br-sm z-10" />
              <Image
                src={p.imageUrl}
                alt={p.name}
                width={800}
                height={800}
                className="w-full object-cover"
                priority
              />
            </div>
          ) : (
            <div className="w-full aspect-square rounded-3xl bg-gradient-to-b from-slate-900 to-[#05070d] border border-slate-800 flex flex-col items-center justify-center relative overflow-hidden">
              <span className="absolute top-4 left-4 w-5 h-5 border-t-2 border-l-2 border-yellow-500/25 rounded-tl-sm" />
              <span className="absolute top-4 right-4 w-5 h-5 border-t-2 border-r-2 border-yellow-500/25 rounded-tr-sm" />
              <span className="absolute bottom-4 left-4 w-5 h-5 border-b-2 border-l-2 border-yellow-500/25 rounded-bl-sm" />
              <span className="absolute bottom-4 right-4 w-5 h-5 border-b-2 border-r-2 border-yellow-500/25 rounded-br-sm" />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[380px] h-[380px] rounded-full border border-yellow-400/[0.05]" />
                <div className="absolute w-[250px] h-[250px] rounded-full border border-yellow-400/[0.07]" />
                <div className="absolute w-[120px] h-[120px] rounded-full border border-yellow-400/[0.1]" />
              </div>
              <div className="relative text-center">
                <div className="text-7xl mb-5">🦅</div>
                <div className="text-6xl font-black text-slate-100 tracking-tight mb-1">M4-D2</div>
                <div className="text-slate-600 text-[10px] tracking-[0.4em] uppercase">Mobility Kit</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Description ── */}
      <section className="mb-20 max-w-2xl">
        <p className="text-slate-400 leading-relaxed text-lg">{p.description}</p>
      </section>

      {/* ── Reviews ── */}
      <section className="border-t border-slate-800 pt-12">
        <h2 className="text-xl font-black text-slate-100 tracking-tight mb-2">
          Reviews
        </h2>
        <p className="text-slate-600 text-sm mb-10">
          Be the first to build one.
        </p>

        <div className="flex flex-col items-center justify-center py-16 border border-slate-800 rounded-2xl text-center gap-3">
          <div className="text-4xl">🦅</div>
          <p className="text-slate-500 text-sm max-w-xs leading-relaxed">
            No reviews yet. Order yours, build it, and we&apos;ll reach out for
            feedback.
          </p>
          <BuyButton productId={p.id} inStock={p.inStock} />
        </div>
      </section>
    </div>
  );
}
