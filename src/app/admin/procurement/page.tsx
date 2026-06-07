import { db } from "../../../../data/db";
import { order, orderItem, product } from "../../../../data/schema";
import { inArray, eq } from "drizzle-orm";
import type { BomItem } from "../../../../data/types";

export const dynamic = "force-dynamic";

const PROCURE_LABEL: Record<string, string> = {
  bulk: "Bulk buy",
  per_order: "Per order",
  in_house: "In-house",
  digital: "Digital",
};

const PROCURE_COLOR: Record<string, string> = {
  bulk: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  per_order: "bg-yellow-500/15 text-yellow-400 border-yellow-500/20",
  in_house: "bg-purple-500/15 text-purple-400 border-purple-500/20",
  digital: "bg-slate-800 text-slate-500 border-slate-700",
};

function formatUsd(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

interface AggregatedPart {
  part: string;
  source: string;
  url?: string;
  procure: BomItem["procure"];
  batchSize?: number;
  priceUsd: number;
  unitsNeeded: number;  // total across all active orders
  batchToBuy: number;   // rounded up to batchSize (or unitsNeeded if per_order)
  totalCost: number;
}

export default async function ProcurementPage() {
  // Get all paid/assembling orders (i.e. "open" — need physical parts)
  const openOrders = await db
    .select({ id: order.id, status: order.status })
    .from(order)
    .where(inArray(order.status, ["paid", "assembling"]));

  const openOrderIds = openOrders.map((o) => o.id);

  // Get all items in those orders
  const items =
    openOrderIds.length > 0
      ? await db
          .select({ item: orderItem, product: product })
          .from(orderItem)
          .innerJoin(product, eq(orderItem.productId, product.id))
          .where(inArray(orderItem.orderId, openOrderIds))
      : [];

  // Aggregate BOM across all open orders
  const partMap = new Map<string, AggregatedPart>();

  for (const { item, product: p } of items) {
    const bom: BomItem[] = p.bom ?? [];
    for (const b of bom) {
      if (b.procure === "digital") continue;
      const key = b.part;
      const unitsThisItem = b.qty * item.quantity;
      if (partMap.has(key)) {
        partMap.get(key)!.unitsNeeded += unitsThisItem;
      } else {
        partMap.set(key, {
          part: b.part,
          source: b.source,
          url: b.url,
          procure: b.procure,
          batchSize: b.batchSize,
          priceUsd: b.priceUsd,
          unitsNeeded: unitsThisItem,
          batchToBuy: 0,
          totalCost: 0,
        });
      }
    }
  }

  // Compute batch quantities and costs
  const parts = Array.from(partMap.values()).map((p) => {
    let batchToBuy = p.unitsNeeded;
    if (p.procure === "bulk" && p.batchSize) {
      batchToBuy = Math.ceil(p.unitsNeeded / p.batchSize) * p.batchSize;
    }
    return {
      ...p,
      batchToBuy,
      totalCost: p.priceUsd * batchToBuy,
    };
  });

  // Sort: per_order first (most urgent), then bulk, then in_house
  const ORDER_PRIORITY = { per_order: 0, bulk: 1, in_house: 2, digital: 3 };
  parts.sort((a, b) => ORDER_PRIORITY[a.procure] - ORDER_PRIORITY[b.procure]);

  const grandTotal = parts.reduce((s, p) => s + p.totalCost, 0);
  const bulkTotal = parts.filter(p => p.procure === "bulk").reduce((s, p) => s + p.totalCost, 0);
  const perOrderTotal = parts.filter(p => p.procure === "per_order").reduce((s, p) => s + p.totalCost, 0);

  return (
    <div>
      <div className="mb-10">
        <h1 className="text-3xl font-black text-slate-100 tracking-tight mb-1">
          Procurement
        </h1>
        <p className="text-slate-500 text-sm">
          Parts needed to fulfill all open orders.{" "}
          <span className="text-slate-400 font-medium">{openOrders.length} open order{openOrders.length !== 1 ? "s" : ""}.</span>
        </p>
      </div>

      {openOrders.length === 0 ? (
        <div className="border border-slate-800 rounded-2xl p-16 text-center">
          <div className="text-4xl mb-4">✅</div>
          <p className="text-slate-500">No open orders. Nothing to procure.</p>
        </div>
      ) : (
        <>
          {/* Cost summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {[
              { label: "Per-order parts", value: formatUsd(perOrderTotal), sub: "source individually", color: "text-yellow-400" },
              { label: "Bulk parts", value: formatUsd(bulkTotal), sub: "buy in batches", color: "text-blue-400" },
              { label: "Total to spend", value: formatUsd(grandTotal), sub: `across ${openOrders.length} order${openOrders.length !== 1 ? "s" : ""}`, color: "text-slate-100" },
            ].map((s) => (
              <div key={s.label} className="border border-slate-800 rounded-2xl p-5 bg-slate-900/20">
                <div className={`text-3xl font-black mb-1 ${s.color}`}>{s.value}</div>
                <div className="text-slate-100 text-sm font-medium">{s.label}</div>
                <div className="text-slate-600 text-xs">{s.sub}</div>
              </div>
            ))}
          </div>

          {/* Parts table */}
          <div className="border border-slate-800 rounded-2xl overflow-hidden">
            <div className="grid grid-cols-[1fr_auto_auto_auto_auto] px-5 py-3 border-b border-slate-800 text-xs text-slate-600 tracking-widest uppercase font-medium gap-4">
              <span>Part</span>
              <span className="text-right">Strategy</span>
              <span className="text-right">Need</span>
              <span className="text-right">Buy</span>
              <span className="text-right">Cost</span>
            </div>

            {parts.map((p, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_auto_auto_auto_auto] px-5 py-4 border-b border-slate-800/60 last:border-0 items-center gap-4 hover:bg-slate-900/30 transition-colors"
              >
                {/* Part name + source */}
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-200 text-sm font-semibold">{p.part}</span>
                    {p.url ? (
                      <a
                        href={p.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-slate-500 hover:text-yellow-400 transition-colors underline underline-offset-2"
                      >
                        {p.source} ↗
                      </a>
                    ) : (
                      <span className="text-xs text-slate-600">{p.source}</span>
                    )}
                  </div>
                  {p.procure === "bulk" && p.batchSize && (
                    <div className="text-xs text-slate-600 mt-0.5">
                      Batch size: {p.batchSize} units
                    </div>
                  )}
                  {p.procure === "in_house" && (
                    <div className="text-xs text-slate-600 mt-0.5">
                      Print/make in batches of {p.batchSize}
                    </div>
                  )}
                </div>

                {/* Strategy badge */}
                <div>
                  <span className={`text-xs font-bold border rounded px-2 py-0.5 ${PROCURE_COLOR[p.procure]}`}>
                    {PROCURE_LABEL[p.procure]}
                  </span>
                </div>

                {/* Units needed */}
                <div className="text-slate-400 text-sm text-right font-mono">
                  ×{p.unitsNeeded}
                </div>

                {/* Batch to buy */}
                <div className="text-right">
                  <span className={`text-sm font-black ${p.batchToBuy > p.unitsNeeded ? "text-blue-400" : "text-slate-200"}`}>
                    ×{p.batchToBuy}
                  </span>
                  {p.batchToBuy > p.unitsNeeded && (
                    <div className="text-xs text-slate-600">
                      +{p.batchToBuy - p.unitsNeeded} ahead
                    </div>
                  )}
                </div>

                {/* Total cost */}
                <div className="text-slate-200 font-bold text-sm text-right">
                  {formatUsd(p.totalCost)}
                </div>
              </div>
            ))}
          </div>

          <p className="text-slate-700 text-xs mt-4">
            * Costs are component estimates based on BOM prices. Digital items excluded.
            In-house items cost only materials (not shown).
          </p>
        </>
      )}
    </div>
  );
}
