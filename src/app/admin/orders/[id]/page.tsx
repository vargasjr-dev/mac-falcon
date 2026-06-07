import { db } from "../../../../../data/db";
import { order, orderItem, product, supplyPurchase } from "../../../../../data/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import Link from "next/link";
import StatusUpdater from "./StatusUpdater";
import AssemblyChecklist from "./AssemblyChecklist";
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

  // Fetch latest unit cost for each BOM part from actual supply purchases
  const allPurchases = await db
    .select()
    .from(supplyPurchase)
    .orderBy(desc(supplyPurchase.purchasedAt));

  // Build map: partName → most recent unit cost in cents
  const latestUnitCost: Record<string, number> = {};
  for (const p of allPurchases) {
    if (!(p.partName in latestUnitCost) && p.quantity > 0) {
      latestUnitCost[p.partName] = Math.round(p.totalPaidUsd / p.quantity);
    }
  }

  // Match BOM parts to supply purchases (case-insensitive partial match)
  function findUnitCost(partName: string): { cost: number; actual: boolean } {
    // Exact match first
    if (latestUnitCost[partName] !== undefined) {
      return { cost: latestUnitCost[partName], actual: true };
    }
    // Partial match
    const lower = partName.toLowerCase();
    for (const [key, cost] of Object.entries(latestUnitCost)) {
      if (key.toLowerCase().includes(lower) || lower.includes(key.toLowerCase())) {
        return { cost, actual: true };
      }
    }
    return { cost: 0, actual: false };
  }

  const paidComponents = allBom
    .filter((b) => b.bom.procure !== "digital")
    .map((b) => ({
      part: b.bom.part,
      qty: b.qty,
      source: b.bom.source,
      url: b.bom.url,
      notes: b.bom.notes,
    }));

  const includedItems = allBom
    .filter((b) => b.bom.procure === "digital")
    .map((b) => ({
      part: b.bom.part,
      qty: b.qty,
      source: b.bom.source,
      url: b.bom.url,
      notes: b.bom.notes,
    }));

  // COGS summary
  const cogsRows = allBom
    .filter((b) => b.bom.procure !== "digital")
    .map((b) => {
      const { cost, actual } = findUnitCost(b.bom.part);
      return {
        part: b.bom.part,
        qty: b.qty,
        unitCost: cost,
        actual,
        bomEstimate: b.bom.priceUsd,
      };
    });
  const totalActualCogs = cogsRows.reduce((s, r) => s + (r.actual ? r.unitCost * r.qty : 0), 0);
  const totalEstimatedCogs = cogsRows.reduce((s, r) => s + (r.actual ? 0 : r.bomEstimate * r.qty), 0);
  const hasAnyCogs = cogsRows.some((r) => r.actual);

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
            <div className="flex items-center gap-2">
              <span className="font-mono text-slate-400 text-sm">{o.id}</span>
              {o.isTest && (
                <span className="text-[10px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded border border-slate-600 text-slate-500">
                  TEST
                </span>
              )}
            </div>
          </div>
        </div>

        {/* StatusUpdater owns both the pipeline display AND the button */}
        <StatusUpdater
          orderId={o.id}
          currentStatus={o.status}
          statusFlow={[...STATUS_FLOW]}
        />

        {/* Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm mt-6 pt-6 border-t border-slate-800/60">
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

      {/* COGS summary — from actual supply purchases */}
      <section className="border border-slate-800 rounded-2xl p-6 mb-8 bg-slate-900/20">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-slate-100 tracking-tight">Cost of goods</h2>
          <Link href="/admin/supplies" className="text-xs text-slate-500 hover:text-yellow-400 transition-colors">
            Log purchase →
          </Link>
        </div>
        <div className="space-y-2 mb-4">
          {cogsRows.map((row, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-slate-400">×{row.qty} {row.part}</span>
              {row.actual ? (
                <span className="text-slate-200 font-semibold tabular-nums">
                  {formatUsd(row.unitCost * row.qty)}
                </span>
              ) : (
                <span className="text-slate-600 tabular-nums">
                  ~{formatUsd(row.bomEstimate * row.qty)} <span className="text-slate-700 text-xs">est.</span>
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-xs">
              {hasAnyCogs ? "Actual + estimated" : "All estimated from BOM"}
            </span>
          </div>
          <div className="text-right">
            {hasAnyCogs && totalActualCogs > 0 && (
              <div className="text-yellow-400 font-black text-lg">
                {formatUsd(totalActualCogs + totalEstimatedCogs)}
              </div>
            )}
            <div className="text-xs text-slate-600">
              Margin: {hasAnyCogs && o.totalUsd > 0
                ? `${(((o.totalUsd - totalActualCogs - totalEstimatedCogs) / o.totalUsd) * 100).toFixed(0)}%`
                : "—"}
            </div>
          </div>
        </div>
      </section>

      {/* Assembly checklist — interactive client component */}
      <AssemblyChecklist
        paidComponents={paidComponents}
        includedItems={includedItems}
      />

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
