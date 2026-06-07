import { db } from "../../../../../data/db";
import { order, orderItem, product } from "../../../../../data/schema";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import StatusUpdater from "./StatusUpdater";
import type { BomItem } from "../../../../../data/types";

export const dynamic = "force-dynamic";

interface Props {
  params: Promise<{ id: string }>;
}

const STATUS_FLOW = ["paid", "assembling", "shipped"] as const;

function formatUsd(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;

  const [o] = await db.select().from(order).where(eq(order.id, id)).limit(1);
  if (!o) notFound();

  const items = await db
    .select({ item: orderItem, product: product })
    .from(orderItem)
    .innerJoin(product, eq(orderItem.productId, product.id))
    .where(eq(orderItem.orderId, id));

  // Aggregate BOM across all products in this order
  const allBom: Array<{ bom: BomItem; productName: string; qty: number }> = [];
  for (const { item, product: p } of items) {
    const bom = p.bom ?? [];
    for (const b of bom) {
      allBom.push({ bom: b, productName: p.name, qty: item.quantity * b.qty });
    }
  }

  const paidComponents = allBom.filter((b) => b.bom.priceUsd > 0);
  const includedItems = allBom.filter((b) => b.bom.priceUsd === 0);
  const totalComponentCost = allBom.reduce(
    (s, b) => s + b.bom.priceUsd * b.qty,
    0
  );

  const currentStatusIndex = STATUS_FLOW.indexOf(o.status as typeof STATUS_FLOW[number]);

  return (
    <div className="max-w-3xl">
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-8"
      >
        ← All orders
      </Link>

      {/* Order header */}
      <div className="border border-slate-800 rounded-2xl p-6 mb-8 bg-slate-900/20">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-5">
          <div>
            <div className="text-xs text-slate-600 tracking-widest uppercase mb-1">
              Order
            </div>
            <div className="font-mono text-slate-400 text-sm">{o.id.slice(0, 8)}…</div>
          </div>
          <StatusUpdater orderId={o.id} currentStatus={o.status} statusFlow={[...STATUS_FLOW]} />
        </div>

        {/* Status pipeline */}
        <div className="flex items-center gap-2 mb-6">
          {STATUS_FLOW.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
                  i < currentStatusIndex
                    ? "bg-green-500/15 text-green-400"
                    : i === currentStatusIndex
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-slate-800/60 text-slate-600"
                }`}
              >
                {i < currentStatusIndex ? "✓" : i === currentStatusIndex ? "●" : "○"}{" "}
                {s}
              </div>
              {i < STATUS_FLOW.length - 1 && (
                <div className="w-6 h-px bg-slate-800" />
              )}
            </div>
          ))}
        </div>

        {/* Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-slate-600 text-xs uppercase tracking-widest block mb-1">
              Customer
            </span>
            <span className="text-slate-200">{o.shippingName ?? o.email}</span>
            {o.shippingName && (
              <div className="text-slate-500 text-xs">{o.email}</div>
            )}
          </div>
          <div>
            <span className="text-slate-600 text-xs uppercase tracking-widest block mb-1">
              Ship to
            </span>
            <span className="text-slate-300">
              {o.shippingAddress ?? "No address captured"}
            </span>
          </div>
          <div>
            <span className="text-slate-600 text-xs uppercase tracking-widest block mb-1">
              Order total
            </span>
            <span className="text-yellow-400 font-black text-lg">
              {formatUsd(o.totalUsd)}
            </span>
          </div>
          <div>
            <span className="text-slate-600 text-xs uppercase tracking-widest block mb-1">
              Payment
            </span>
            <span className="text-slate-400 font-mono text-xs">
              {o.stripePaymentIntentId ?? o.stripeSessionId?.slice(0, 20) + "…"}
            </span>
          </div>
        </div>
      </div>

      {/* Assembly checklist */}
      <section className="mb-8">
        <div className="mb-5">
          <h2 className="text-lg font-black text-slate-100 tracking-tight">
            Assembly checklist
          </h2>
          <p className="text-slate-500 text-sm mt-1">
            Everything needed to build and ship this order.
            Component cost:{" "}
            <span className="text-slate-300 font-semibold">
              {formatUsd(totalComponentCost)}
            </span>
          </p>
        </div>

        {/* Parts to source */}
        {paidComponents.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xs text-slate-600 tracking-widest uppercase font-medium mb-3">
              Parts to source / procure
            </h3>
            <div className="space-y-2">
              {paidComponents.map((b, i) => (
                <div
                  key={i}
                  className="flex items-start gap-4 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors"
                >
                  {/* Checkbox */}
                  <div className="shrink-0 w-5 h-5 mt-0.5 rounded border border-slate-700 bg-slate-900" />

                  {/* Part details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-slate-200 text-sm">
                        ×{b.qty} {b.bom.part}
                      </span>
                      {b.bom.url ? (
                        <a
                          href={b.bom.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-slate-500 hover:text-yellow-400 transition-colors underline underline-offset-2"
                        >
                          {b.bom.source} ↗
                        </a>
                      ) : (
                        <span className="text-xs text-slate-600">
                          {b.bom.source}
                        </span>
                      )}
                    </div>
                    {b.bom.notes && (
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {b.bom.notes}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 text-slate-400 font-bold text-sm">
                    {formatUsd(b.bom.priceUsd * b.qty)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Digital items */}
        {includedItems.length > 0 && (
          <div>
            <h3 className="text-xs text-slate-600 tracking-widest uppercase font-medium mb-3">
              Digital / included
            </h3>
            <div className="space-y-2">
              {includedItems.map((b, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 border border-slate-800/40 rounded-xl p-4"
                >
                  <div className="shrink-0 w-5 h-5 rounded border border-slate-800 bg-slate-900 flex items-center justify-center">
                    <span className="text-yellow-400 text-[10px]">✓</span>
                  </div>
                  <div className="flex-1">
                    <span className="text-slate-500 text-sm">{b.bom.part}</span>
                    {b.bom.url && (
                      <a
                        href={b.bom.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ml-2 text-xs text-slate-600 hover:text-yellow-400 transition-colors underline underline-offset-2"
                      >
                        {b.bom.source} ↗
                      </a>
                    )}
                  </div>
                  <span className="text-xs font-bold text-yellow-400/60 border border-yellow-500/20 rounded px-2 py-1">
                    Included
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Items ordered */}
      <section>
        <h2 className="text-lg font-black text-slate-100 tracking-tight mb-4">
          Items
        </h2>
        <div className="border border-slate-800 rounded-2xl divide-y divide-slate-800">
          {items.map(({ item, product: p }) => (
            <div key={item.id} className="flex items-center justify-between px-5 py-4">
              <div>
                <div className="text-slate-200 font-semibold text-sm">
                  {p.name}
                </div>
                <div className="text-slate-600 text-xs">Qty: {item.quantity}</div>
              </div>
              <div className="text-slate-300 font-bold text-sm">
                {formatUsd(item.unitPriceUsd * item.quantity)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
