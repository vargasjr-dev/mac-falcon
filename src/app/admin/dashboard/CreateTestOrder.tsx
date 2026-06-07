"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function CreateTestOrder() {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "error">("idle");

  async function handleCreate() {
    setState("loading");
    try {
      const res = await fetch("/api/admin/create-test-order", {
        method: "POST",
      });
      if (!res.ok) throw new Error("Failed");
      router.refresh();
      setState("idle");
    } catch {
      setState("error");
      setTimeout(() => setState("idle"), 3000);
    }
  }

  return (
    <button
      onClick={handleCreate}
      disabled={state === "loading"}
      className={`
        inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold tracking-wide transition-all border
        ${state === "error"
          ? "border-red-500/40 text-red-400 bg-red-500/10"
          : "border-slate-700 text-slate-400 hover:border-yellow-500/40 hover:text-yellow-400 hover:bg-yellow-500/5"
        }
        disabled:opacity-50 disabled:cursor-not-allowed
      `}
    >
      {state === "loading" ? (
        <>
          <span className="w-3 h-3 rounded-full border border-current border-t-transparent animate-spin" />
          Creating…
        </>
      ) : state === "error" ? (
        <>✕ Failed</>
      ) : (
        <>＋ Test order</>
      )}
    </button>
  );
}
