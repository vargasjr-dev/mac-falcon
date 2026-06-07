import { db } from "../../../../data/db";
import { product } from "../../../../data/schema";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await db.select().from(product).orderBy(product.createdAt);

  return (
    <div>
      <div className="mb-12">
        <h1 className="text-4xl font-black text-slate-100 mb-3 tracking-tight">
          Mobility Kits
        </h1>
        <p className="text-slate-400 text-lg max-w-xl">
          Everything you need to put your Mac Mini on wheels. Robot base,
          power, structure, and software — nothing else to buy.
        </p>
      </div>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-slate-800 rounded-3xl">
          <span className="text-5xl mb-4">🚧</span>
          <p className="text-slate-400 text-lg">
            First kits dropping soon. Check back shortly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/shop/${p.slug}`}
              className="group border border-slate-800 rounded-3xl overflow-hidden hover:border-yellow-500/40 transition-all duration-300 hover:falcon-glow flex flex-col"
            >
              {/* Image or render */}
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-full aspect-[4/3] object-cover group-hover:opacity-90 transition-opacity"
                />
              ) : (
                <div className="w-full aspect-[4/3] bg-gradient-to-b from-slate-900 to-[#05070d] flex flex-col items-center justify-center relative overflow-hidden">
                  {/* Rings */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-[340px] h-[340px] rounded-full border border-yellow-400/5" />
                    <div className="absolute w-[220px] h-[220px] rounded-full border border-yellow-400/8" />
                    <div className="absolute w-[110px] h-[110px] rounded-full border border-yellow-400/10" />
                  </div>
                  <div className="relative text-center">
                    <div className="text-5xl mb-3 group-hover:scale-105 transition-transform duration-500">🦅</div>
                    <div className="text-3xl font-black text-slate-100 tracking-tight">
                      {p.name.split(" ")[0]}
                    </div>
                    <div className="text-slate-600 text-xs tracking-widest uppercase mt-1">
                      Mobility Kit
                    </div>
                  </div>
                </div>
              )}

              {/* Card body */}
              <div className="p-6 flex flex-col gap-4 flex-1">
                {/* Name + tagline */}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="font-black text-slate-100 text-xl tracking-tight">
                      {p.name}
                    </h2>
                    <span className="text-xs font-bold text-yellow-400/60 border border-yellow-500/20 rounded px-1.5 py-0.5 tracking-widest uppercase">
                      v1
                    </span>
                  </div>
                  {p.tagline && (
                    <p className="text-slate-400 text-sm">{p.tagline}</p>
                  )}
                </div>

                {/* Highlights preview */}
                {p.highlights && p.highlights.length > 0 && (
                  <ul className="space-y-1.5">
                    {p.highlights.slice(0, 3).map((h, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                        <span className="text-yellow-400 mt-0.5 shrink-0">✓</span>
                        {h}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-800">
                  <div>
                    <span className="text-yellow-400 font-black text-2xl">
                      ${(p.priceUsd / 100).toFixed(0)}
                    </span>
                    {!p.inStock && (
                      <span className="ml-3 text-xs text-red-400 font-medium">
                        Out of stock
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-slate-400 font-semibold group-hover:text-yellow-400 group-hover:translate-x-1 transition-all">
                    See the kit →
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
