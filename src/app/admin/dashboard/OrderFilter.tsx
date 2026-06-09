"use client";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

type Filter = "all" | "live" | "test";

const OPTIONS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "test", label: "Test" },
];

export default function OrderFilter({ current }: { current: Filter }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function select(f: Filter) {
    const params = new URLSearchParams(searchParams.toString());
    if (f === "all") {
      params.delete("filter");
    } else {
      params.set("filter", f);
    }
    router.replace(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1">
      {OPTIONS.map((o) => (
        <button
          key={o.id}
          onClick={() => select(o.id)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all ${
            current === o.id
              ? "bg-slate-700 text-slate-100"
              : "text-slate-500 hover:text-slate-300"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
