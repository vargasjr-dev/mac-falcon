import { db } from "../../../../../data/db";
import { product } from "../../../../../data/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import BuyButton from "~/components/BuyButton";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [p] = await db
    .select()
    .from(product)
    .where(eq(product.slug, slug))
    .limit(1);

  if (!p) notFound();

  return (
    <div className="max-w-3xl">
      {p.imageUrl ? (
        <img
          src={p.imageUrl}
          alt={p.name}
          className="w-full rounded-2xl mb-8 border border-slate-800"
        />
      ) : (
        <div className="w-full aspect-video rounded-2xl mb-8 bg-slate-900 flex items-center justify-center text-slate-700 text-6xl border border-slate-800">
          🦅
        </div>
      )}

      <h1 className="text-4xl font-black text-slate-100 mb-2">{p.name}</h1>
      <p className="text-yellow-400 font-black text-2xl mb-6">
        ${(p.priceUsd / 100).toFixed(2)}
      </p>
      <p className="text-slate-300 leading-relaxed mb-10">{p.description}</p>

      <BuyButton productId={p.id} inStock={p.inStock} />
    </div>
  );
}
