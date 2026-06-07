import { db } from "../../../../data/db";
import { product } from "../../../../data/schema";
import Link from "next/link";

export const revalidate = 60;

export default async function ShopPage() {
  const products = await db.select().from(product).orderBy(product.createdAt);

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-100 mb-2">Kits</h1>
      <p className="text-slate-400 mb-10">
        Everything you need to mobilize your Mac Mini.
      </p>

      {products.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <span className="text-5xl mb-4">🚧</span>
          <p className="text-slate-400 text-lg">
            First kits dropping soon. Check back shortly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/shop/${p.slug}`}
              className="group border border-slate-800 rounded-2xl overflow-hidden hover:border-yellow-500/40 transition-all hover:falcon-glow"
            >
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-full aspect-video object-cover group-hover:opacity-90 transition-opacity"
                />
              ) : (
                <div className="w-full aspect-video bg-slate-900 flex items-center justify-center text-slate-700 text-4xl">
                  🦅
                </div>
              )}
              <div className="p-5">
                <h2 className="font-bold text-slate-100 text-lg mb-1">
                  {p.name}
                </h2>
                <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                  {p.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-yellow-400 font-black text-xl">
                    ${(p.priceUsd / 100).toFixed(2)}
                  </span>
                  {!p.inStock && (
                    <span className="text-xs text-red-400 font-medium">
                      Out of stock
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
