"use client";
import { useState } from "react";
import Link from "next/link";

interface ChecklistRow {
  part: string;
  qty: number;
  source: string;
  url?: string;
  notes?: string;
  unitCost: number; // cents — 0 if no purchase logged
  actual: boolean; // true = pulled from supply purchase log
  bomEstimate: number; // cents — from BOM priceUsd
}

interface IncludedRow {
  part: string;
  qty: number;
  source: string;
  url?: string;
  notes?: string;
}

interface Props {
  checklistRows: ChecklistRow[];
  includedItems: IncludedRow[];
  totalCogs: number; // cents
  orderTotal: number; // cents
  hasActualCogs: boolean;
}

function formatUsd(cents: number) {
  return `$${(cents / 100).toFixed(0)}`;
}

export default function AssemblyChecklist({
  checklistRows,
  includedItems,
  totalCogs,
  orderTotal,
  hasActualCogs,
}: Props) {
  const [checked, setChecked] = useState<Record<number, boolean>>({});

  function toggle(i: number) {
    setChecked((prev) => ({ ...prev, [i]: !prev[i] }));
  }

  const doneCount = Object.values(checked).filter(Boolean).length;

  const margin =
    hasActualCogs && orderTotal > 0
      ? `${(((orderTotal - totalCogs) / orderTotal) * 100).toFixed(0)}%`
      : "—";

  return (
    <section className="border border-slate-800 rounded-2xl p-6 mb-8 bg-slate-900/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-lg font-black text-slate-100 tracking-tight">
          Build checklist
        </h2>
        <Link
          href="/admin/supplies"
          className="text-xs text-slate-500 hover:text-yellow-400 transition-colors"
        >
          Log purchase →
        </Link>
      </div>
      <div className="text-xs text-slate-600 mb-5">
        {doneCount}/{checklistRows.length} sourced
      </div>

      {/* Parts to source / procure */}
      {checklistRows.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs text-slate-600 tracking-widest uppercase font-medium mb-3">
            Parts to source / procure
          </h3>
          <div className="space-y-2">
            {checklistRows.map((row, i) => (
              <div
                key={i}
                onClick={() => toggle(i)}
                className={`flex items-start gap-4 border rounded-xl p-4 cursor-pointer select-none transition-all duration-150 ${
                  checked[i]
                    ? "border-green-500/30 bg-green-500/5 opacity-70"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Checkbox */}
                <div
                  className={`shrink-0 w-5 h-5 mt-0.5 rounded border flex items-center justify-center transition-all duration-150 ${
                    checked[i]
                      ? "border-green-500 bg-green-500"
                      : "border-slate-700 bg-slate-900"
                  }`}
                >
                  {checked[i] && (
                    <svg
                      className="w-3 h-3 text-slate-900"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M2 6l3 3 5-5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>

                {/* Part info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`font-semibold text-sm transition-colors ${
                        checked[i]
                          ? "text-slate-500 line-through"
                          : "text-slate-200"
                      }`}
                    >
                      ×{row.qty} {row.part}
                    </span>
                    {row.url ? (
                      <a
                        href={row.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-slate-500 hover:text-yellow-400 transition-colors underline underline-offset-2"
                      >
                        {row.source} ↗
                      </a>
                    ) : (
                      <span className="text-xs text-slate-600">
                        {row.source}
                      </span>
                    )}
                  </div>
                  {row.notes && (
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {row.notes}
                    </p>
                  )}
                </div>

                {/* Cost */}
                <div className="shrink-0 tabular-nums text-sm text-right">
                  {row.actual ? (
                    <span className="text-slate-300 font-semibold">
                      {formatUsd(row.unitCost * row.qty)}
                    </span>
                  ) : (
                    <span className="text-slate-600">
                      ~{formatUsd(row.bomEstimate * row.qty)}{" "}
                      <span className="text-slate-700 text-xs">est.</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Digital / included */}
      {includedItems.length > 0 && (
        <div className="mb-5">
          <h3 className="text-xs text-slate-600 tracking-widest uppercase font-medium mb-3">
            Digital / included
          </h3>
          <div className="space-y-2">
            {includedItems.map((b, i) => (
              <div
                key={i}
                className="flex items-center gap-4 border border-slate-800/40 rounded-xl p-4"
              >
                <div className="shrink-0 w-5 h-5 rounded border border-slate-800 bg-slate-900 flex items-center justify-center">
                  <span className="text-yellow-400 text-[10px]">✓</span>
                </div>
                <div className="flex-1">
                  <span className="text-slate-500 text-sm">{b.part}</span>
                  {b.url && (
                    <a
                      href={b.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-2 text-xs text-slate-600 hover:text-yellow-400 transition-colors underline underline-offset-2"
                    >
                      {b.source} ↗
                    </a>
                  )}
                </div>
                <span className="text-xs font-bold text-yellow-400/60 border border-yellow-500/20 rounded px-2 py-1">
                  Included
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer: margin */}
      <div className="border-t border-slate-800 pt-3 flex items-center justify-between">
        <span className="text-slate-500 text-xs">
          {hasActualCogs ? "Actual + estimated" : "All estimated from BOM"}
        </span>
        <div className="text-right">
          {hasActualCogs && totalCogs > 0 && (
            <div className="text-yellow-400 font-black text-lg">
              {formatUsd(totalCogs)}
            </div>
          )}
          <div className="text-xs text-slate-600">Margin: {margin}</div>
        </div>
      </div>
    </section>
  );
}
