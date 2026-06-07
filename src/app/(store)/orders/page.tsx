import { db } from "../../../../data/db";
import { order } from "../../../../data/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const orders = await db
    .select()
    .from(order)
    .orderBy(desc(order.createdAt))
    .limit(50);

  return (
    <div>
      <h1 className="text-3xl font-black text-slate-100 mb-8">Orders</h1>
      {orders.length === 0 ? (
        <p className="text-slate-400">No orders yet.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((o) => (
            <div
              key={o.id}
              className="border border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div>
                <p className="text-slate-100 font-medium">{o.email}</p>
                <p className="text-slate-500 text-sm">
                  {new Date(o.createdAt).toLocaleDateString()}
                  {o.shippingAddress && ` · ${o.shippingAddress}`}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-yellow-400 font-bold">
                  ${(o.totalUsd / 100).toFixed(2)}
                </span>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded-full ${
                    o.status === "paid"
                      ? "bg-green-900/40 text-green-400"
                      : o.status === "shipped"
                        ? "bg-blue-900/40 text-blue-400"
                        : o.status === "cancelled"
                          ? "bg-red-900/40 text-red-400"
                          : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {o.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
