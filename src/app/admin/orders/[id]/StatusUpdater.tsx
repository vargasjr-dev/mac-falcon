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
    <div className="flex items-center gap-3">
      {nextStatus && (
        <button
          onClick={advance}
          disabled={loading}
          className="px-4 py-2 text-xs font-black rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 hover:from-yellow-300 hover:to-yellow-400 transition-all falcon-glow disabled:opacity-50 tracking-widest uppercase"
        >
          {loading ? "…" : `Mark as ${nextStatus}`}
        </button>
      )}
      {status === "shipped" && (
        <span className="text-xs text-green-400 font-bold tracking-widest uppercase">
          ✓ Shipped
        </span>
      )}
    </div>
  );
}
