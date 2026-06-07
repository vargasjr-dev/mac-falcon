"use client";
import { useState } from "react";

interface Props {
  orderId: string;
  currentStatus: string;
  statusFlow: string[];
}

export default function StatusUpdater({ orderId, currentStatus, statusFlow }: Props) {
  const [status, setStatus] = useState(currentStatus);
  const [loading, setLoading] = useState(false);

  const currentIndex = statusFlow.indexOf(status);
  const nextStatus = statusFlow[currentIndex + 1];

  async function advance() {
    if (!nextStatus) return;
    setLoading(true);
    try {
      const res = await fetch("/api/admin/order-status", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: nextStatus }),
      });
      if (res.ok) setStatus(nextStatus);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Action button */}
      <div className="flex items-center gap-3 justify-end">
        {nextStatus && (
          <button
            onClick={advance}
            disabled={loading}
            className="px-4 py-2 text-xs font-black rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 hover:from-yellow-300 hover:to-yellow-400 transition-all falcon-glow disabled:opacity-50 tracking-widest uppercase"
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full border border-slate-900 border-t-transparent animate-spin" />
                Updating…
              </span>
            ) : (
              `Mark as ${nextStatus}`
            )}
          </button>
        )}
        {status === "shipped" && (
          <span className="text-xs text-green-400 font-bold tracking-widest uppercase">
            ✓ Shipped
          </span>
        )}
      </div>

      {/* Pipeline — updates optimistically */}
      <div className="flex items-center gap-2">
        {statusFlow.map((s, i) => {
          const idx = statusFlow.indexOf(status);
          const isPast = i < idx;
          const isCurrent = i === idx;
          return (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full transition-all duration-300 ${
                  isPast
                    ? "bg-green-500/15 text-green-400"
                    : isCurrent
                    ? "bg-yellow-500/20 text-yellow-400"
                    : "bg-slate-800/60 text-slate-600"
                }`}
              >
                {isPast ? "✓" : isCurrent ? "●" : "○"} {s}
              </div>
              {i < statusFlow.length - 1 && (
                <div className="w-6 h-px bg-slate-800" />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
