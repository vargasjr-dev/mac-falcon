import { db } from "../../../../data/db";
import { supplyPurchase, product } from "../../../../data/schema";
import { desc } from "drizzle-orm";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import type { BomItem } from "../../../../data/types";

export const dynamic = "force-dynamic";

function formatUsd(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

async function logPurchase(formData: FormData) {
  "use server";
  const partName = formData.get("partName") as string;
  const supplier = formData.get("supplier") as string;
  const qty = parseInt(formData.get("quantity") as string, 10);
  const totalDollars = parseFloat(formData.get("totalPaid") as string);
  const url = formData.get("url") as string;
  const notes = formData.get("notes") as string;
  const purchasedAt = formData.get("purchasedAt") as string;

  if (!partName || !qty || isNaN(totalDollars)) return;

  await db.insert(supplyPurchase).values({
    id: randomUUID(),
    partName: partName.trim(),
    supplier: supplier || null,
    quantity: qty,
    totalPaidUsd: Math.round(totalDollars * 100),
    url: url || null,
    notes: notes || null,
    purchasedAt: purchasedAt ? new Date(purchasedAt) : new Date(),
  });

  revalidatePath("/admin/supplies");
}

export default async function SuppliesPage() {
  const [purchases, products] = await Promise.all([
    db.select().from(supplyPurchase).orderBy(desc(supplyPurchase.purchasedAt)),
    db.select({ bom: product.bom }).from(product),
  ]);

  // Collect all BOM part names for the dropdown
  const bomParts: string[] = [];
  for (const p of products) {
    for (const item of (p.bom ?? []) as BomItem[]) {
      if (!bomParts.includes(item.part)) bomParts.push(item.part);
    }
  }
  bomParts.sort();

  // Running unit costs per part
  const unitCosts: Record<string, number> = {};
  for (const p of [...purchases].reverse()) {
    if (p.quantity > 0) {
      unitCosts[p.partName] = Math.round(p.totalPaidUsd / p.quantity);
    }
  }

  const totalSpent = purchases.reduce((s, p) => s + p.totalPaidUsd, 0);

  return (
    <div className="max-w-3xl">
      <div className="mb-10">
        <div className="text-xs font-bold text-slate-600 tracking-[0.3em] uppercase mb-2">Admin</div>
        <h1 className="text-3xl font-black text-slate-100 tracking-tight mb-1">Supply Purchases</h1>
        <p className="text-slate-500 text-sm">
          Log every component order here — actual prices feed the COGS calculation on each order.
        </p>
      </div>

      {/* Log new purchase */}
      <section className="border border-slate-800 rounded-2xl p-6 mb-10 bg-slate-900/20">
        <h2 className="text-base font-black text-slate-100 mb-5">Log a purchase</h2>
        <form action={logPurchase} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Part name */}
            <div className="sm:col-span-2">
              <label className="block text-xs text-slate-500 tracking-widest uppercase mb-1.5">
                Part *
              </label>
              <input
                list="bom-parts"
                name="partName"
                required
                placeholder="iRobot Create 3"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-700 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 transition-all text-sm"
              />
              <datalist id="bom-parts">
                {bomParts.map((p) => (
                  <option key={p} value={p} />
                ))}
              </datalist>
            </div>

            {/* Supplier */}
            <div>
              <label className="block text-xs text-slate-500 tracking-widest uppercase mb-1.5">
                Supplier
              </label>
              <input
                name="supplier"
                placeholder="Amazon, iRobot, etc."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-700 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 transition-all text-sm"
              />
            </div>

            {/* Date */}
            <div>
              <label className="block text-xs text-slate-500 tracking-widest uppercase mb-1.5">
                Purchase date
              </label>
              <input
                type="date"
                name="purchasedAt"
                defaultValue={new Date().toISOString().slice(0, 10)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-700 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 transition-all text-sm"
              />
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-xs text-slate-500 tracking-widest uppercase mb-1.5">
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                min="1"
                required
                placeholder="1"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-700 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 transition-all text-sm"
              />
            </div>

            {/* Total paid */}
            <div>
              <label className="block text-xs text-slate-500 tracking-widest uppercase mb-1.5">
                Total paid (USD) *
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">$</span>
                <input
                  type="number"
                  name="totalPaid"
                  min="0"
                  step="0.01"
                  required
                  placeholder="399.00"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-slate-100 placeholder-slate-700 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 transition-all text-sm"
                />
              </div>
            </div>

            {/* Order URL */}
            <div className="sm:col-span-2">
              <label className="block text-xs text-slate-500 tracking-widest uppercase mb-1.5">
                Order URL (optional)
              </label>
              <input
                name="url"
                type="url"
                placeholder="https://amazon.com/orders/…"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-700 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 transition-all text-sm"
              />
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="block text-xs text-slate-500 tracking-widest uppercase mb-1.5">
                Notes (optional)
              </label>
              <input
                name="notes"
                placeholder="Bulk buy for 5 kits, arrived dented, etc."
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-slate-100 placeholder-slate-700 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 transition-all text-sm"
              />
            </div>
          </div>

          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 font-black rounded-xl hover:from-yellow-300 hover:to-yellow-400 transition-all falcon-glow tracking-wide text-sm"
          >
            Log purchase
          </button>
        </form>
      </section>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="border border-slate-800 rounded-2xl p-4 bg-slate-900/20">
          <div className="text-2xl font-black text-slate-100 mb-0.5">{purchases.length}</div>
          <div className="text-slate-600 text-xs tracking-widest uppercase">Purchases logged</div>
        </div>
        <div className="border border-slate-800 rounded-2xl p-4 bg-slate-900/20">
          <div className="text-2xl font-black text-yellow-400 mb-0.5">{formatUsd(totalSpent)}</div>
          <div className="text-slate-600 text-xs tracking-widest uppercase">Total spent</div>
        </div>
        <div className="border border-slate-800 rounded-2xl p-4 bg-slate-900/20">
          <div className="text-2xl font-black text-slate-100 mb-0.5">{Object.keys(unitCosts).length}</div>
          <div className="text-slate-600 text-xs tracking-widest uppercase">Parts tracked</div>
        </div>
      </div>

      {/* Purchase log */}
      {purchases.length === 0 ? (
        <div className="border border-slate-800 rounded-2xl p-16 text-center">
          <div className="text-4xl mb-4">📦</div>
          <p className="text-slate-500 text-sm">No purchases logged yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="border border-slate-800 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto] px-5 py-3 border-b border-slate-800 text-xs text-slate-600 tracking-widest uppercase font-medium">
            <span>Part</span>
            <span className="text-right pr-6">Qty</span>
            <span className="text-right pr-6">Unit cost</span>
            <span className="text-right">Total paid</span>
          </div>
          {purchases.map((p) => (
            <div key={p.id} className="grid grid-cols-[1fr_auto_auto_auto] px-5 py-4 border-b border-slate-800/60 last:border-0 items-center">
              <div>
                <div className="text-slate-200 text-sm font-semibold">{p.partName}</div>
                <div className="text-slate-600 text-xs mt-0.5">
                  {p.supplier && <span>{p.supplier} · </span>}
                  {formatDate(p.purchasedAt)}
                  {p.url && (
                    <a href={p.url} target="_blank" rel="noopener noreferrer"
                      className="ml-2 text-slate-600 hover:text-yellow-400 transition-colors underline underline-offset-2">
                      receipt ↗
                    </a>
                  )}
                </div>
                {p.notes && <div className="text-slate-600 text-xs mt-0.5 italic">{p.notes}</div>}
              </div>
              <div className="text-slate-400 text-sm pr-6 tabular-nums">{p.quantity}</div>
              <div className="text-slate-300 text-sm pr-6 tabular-nums font-semibold">
                {formatUsd(Math.round(p.totalPaidUsd / p.quantity))}
              </div>
              <div className="text-slate-200 font-bold text-sm tabular-nums">
                {formatUsd(p.totalPaidUsd)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
