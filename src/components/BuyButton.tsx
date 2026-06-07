"use client";
import { useState } from "react";

interface Props {
  productId: string;
  inStock: boolean;
}

export default function BuyButton({ productId, inStock }: Props) {
  const [loading, setLoading] = useState(false);

  async function handleBuy() {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      const { url, error } = await res.json();
      if (error) throw new Error(error);
      window.location.href = url;
    } catch (e) {
      console.error(e);
      setLoading(false);
    }
  }

  if (!inStock) {
    return (
      <button
        disabled
        className="px-8 py-4 rounded-xl font-bold text-slate-500 bg-slate-800 cursor-not-allowed w-full sm:w-auto"
      >
        Out of stock
      </button>
    );
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="px-8 py-4 rounded-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 hover:from-yellow-300 hover:to-yellow-400 transition-all falcon-glow disabled:opacity-60 disabled:cursor-not-allowed w-full sm:w-auto"
    >
      {loading ? "Redirecting…" : "Buy now"}
    </button>
  );
}
