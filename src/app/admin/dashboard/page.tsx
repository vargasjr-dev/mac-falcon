import { db } from "../../../../data/db";
import { order, orderItem, product } from "../../../../data/schema";
import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { Suspense } from "react";
import CreateTestOrder from "./CreateTestOrder";
import OrderFilter from "./OrderFilter";

export const dynamic = "force-dynamic";

type Filter = "all" | "live" | "test";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-slate-800 text-slate-400",
  paid: "bg-yellow-500/20 text-yellow-400",
  assembling: "bg-blue-500/20 text-blue-400",
  shipped: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
};

function formatUsd(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

function formatDate(d: Date) {
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Props {
  searchParams: Promise<{ filter?: string }>;
}

export default async function AdminDashboardPage({ searchParams }: Props) {
  const { filter: rawFilter } = await searchParams;
  const filter: Filter =
    rawFilter === "live" || rawFilter === "test" ? rawFilter : "all";

  const allOrders = await db
    .select({
      id: order.id,
      email: order.email,
      status: order.status,
      isTest: order.isTest,
      totalUsd: order.totalUsd,
      shippingName: order.shippingName,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
    })
    .from(order)
    .orderBy(desc(order.createdAt));

  // Stats always from live orders only
  const liveOrders = allOrders.filter((o) => !o.isTest);
  const totalRevenue = liveOrders.reduce((s, o) => s + o.totalUsd, 0);
  const paid = liveOrders.filter((o) => o.status === "paid").length;
  const assembling = liveOrders.filter((o) => o.status === "assembling").length;
  const shipped = liveOrders.filter((o) => o.status === "shipped").length;

  // Filtered list for the table
  const visibleOrders =
    filter === "live"
      ? allOrders.filter((o) => !o.isTest)
      : filter === "test"
      ? allOrders.filter((o) => o.isTest)
      : allOrders;

  // Product names
  const orderProducts: Record<string, string> = {};
  for (const o of visibleOrders) {
    const [item] = await db
      .select({ productName: product.name })
      .from(orderItem)
      .innerJoin(product, eq(orderItem.productId, product.id))
      .where(eq(orderItem.orderId, o.id))
      .limit(1);
    if (item) orderProducts[o.id] = item.productName;
  }

  return (
    <div>
      <div className="mb-10 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-100 tracking-tight mb-1">
            Mission Control
          </h1>
          <p className="text-slate-500 text-sm">Orders + assembly queue</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/api-keys"
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors border border-slate-800 rounded-lg px-3 py-2"
          >
            API keys
          </Link>
          <Suspense>
            <OrderFilter current={filter} />
          </Suspense>
          <CreateTestOrder />
        </div>
      </div>

      {/* Stats — always live orders only */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: "Live orders", value: liveOrders.length, color: "text-slate-100" },
          { label: "Revenue", value: formatUsd(totalRevenue), color: "text-yellow-400" },
          { label: "Needs assembly", value: paid + assembling, color: "text-blue-400" },
          { label: "Shipped", value: shipped, color: "text-green-400" },
        ].map((s) => (
          <div
            key={s.label}
            className="border border-slate-800 rounded-2xl p-5 bg-slate-900/20"
          >
            <div className={`text-3xl font-black mb-1 ${s.color}`}>{s.value}</div>
            <div className="text-slate-600 text-xs tracking-widest uppercase">
              {s.label}
            </div>
          </div>
        ))}
      </div>

      {/* Orders table */}
      {visibleOrders.length === 0 ? (
        <div className="border border-slate-800 rounded-2xl p-16 text-center">
          <div className="text-4xl mb-4">
            {filter === "test" ? "🧪" : "📭"}
          </div>
          <p className="text-slate-500">
            {filter === "test"
              ? "No test orders. Use the + Test order button to create one."
              : filter === "live"
              ? "No live orders yet. Share the site!"
              : "No orders yet. Share the site!"}
          </p>
        </div>
      ) : (
        <div className="border border-slate-800 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-[1fr_auto_auto_auto] px-5 py-3 border-b border-slate-800 text-xs text-slate-600 tracking-widest uppercase font-medium">
            <span>Customer</span>
            <span className="text-right pr-6">Kit</span>
            <span className="text-right pr-6">Total</span>
            <span className="text-right">Status</span>
          </div>
          {visibleOrders.map((o) => (
            <Link
              key={o.id}
              href={`/admin/orders/${o.id}`}
              className="grid grid-cols-[1fr_auto_auto_auto] px-5 py-4 border-b border-slate-800/60 last:border-0 hover:bg-slate-900/40 transition-colors items-center"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-200 text-sm font-medium">
                    {o.shippingName ?? o.email}
                  </span>
                  {o.isTest && (
                    <span className="text-[10px] font-black tracking-widest uppercase px-1.5 py-0.5 rounded border border-slate-600 text-slate-500">
                      TEST
                    </span>
                  )}
                </div>
                <div className="text-slate-600 text-xs mt-0.5">
                  {o.shippingAddress ?? o.email} · {formatDate(o.createdAt)}
                </div>
              </div>
              <div className="text-slate-400 text-sm pr-6">
                {orderProducts[o.id] ?? "—"}
              </div>
              <div className="text-slate-200 font-bold text-sm pr-6">
                {formatUsd(o.totalUsd)}
              </div>
              <div>
                <span
                  className={`text-xs font-bold rounded-full px-2.5 py-1 tracking-wide ${
                    STATUS_STYLES[o.status] ?? "bg-slate-800 text-slate-400"
                  }`}
                >
                  {o.status}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
