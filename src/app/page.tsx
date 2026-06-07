import Link from "next/link";

const SPECS_STRIP = [
  { label: "Robot base", value: "iRobot Create 3" },
  { label: "Payload", value: "9 kg" },
  { label: "Runtime", value: "4–6 hrs" },
  { label: "Software", value: "Open-source" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#05070d] flex flex-col overflow-hidden">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-yellow-400/4 rounded-full blur-[160px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-500/4 rounded-full blur-[140px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <span className="text-yellow-400 text-xl">🦅</span>
          <span className="text-yellow-400 font-black text-sm tracking-widest uppercase falcon-text-glow">
            Mac Falcon
          </span>
        </div>
        <Link
          href="/shop"
          className="text-sm text-slate-400 hover:text-slate-100 transition-colors"
        >
          Shop
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-12 pb-8">
        {/* Model badge */}
        <div className="inline-flex items-center gap-2 border border-yellow-500/30 rounded-full px-4 py-1.5 text-xs font-bold text-yellow-400 tracking-widest uppercase mb-8 bg-yellow-500/5">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          Now available — M4-D2 v1
        </div>

        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-6 max-w-4xl">
          <span className="text-slate-100">Give your AI</span>
          <br />
          <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent falcon-text-glow">
            a body.
          </span>
        </h1>

        <p className="text-slate-400 text-lg sm:text-xl leading-relaxed max-w-xl mb-4">
          The M4-D2 Mobility Kit puts your Mac Mini on wheels.
          Robot base, power, structure, and software —
          <span className="text-slate-200 font-semibold"> all in one box.</span>
        </p>

        <p className="text-slate-500 text-sm mb-10">
          From{" "}
          <span className="text-yellow-400 font-black text-base">$749</span>
          {" "}· Free shipping · Mac Mini not included
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link
            href="/shop"
            className="px-10 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 font-black text-base rounded-xl hover:from-yellow-300 hover:to-yellow-400 transition-all falcon-glow tracking-wide"
          >
            Shop kits →
          </Link>
          <Link
            href="/shop/m4d2-mobility-kit"
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors underline underline-offset-4 decoration-slate-700"
          >
            See what&apos;s in the kit
          </Link>
        </div>
      </section>

      {/* Product showcase card */}
      <section className="relative z-10 px-6 pb-16 max-w-5xl mx-auto w-full">
        <Link
          href="/shop/m4d2-mobility-kit"
          className="group block border border-slate-800 rounded-3xl overflow-hidden hover:border-yellow-500/40 transition-all duration-300 hover:falcon-glow"
        >
          {/* Product render area */}
          <div className="w-full bg-gradient-to-b from-slate-900 to-[#05070d] flex flex-col items-center justify-center py-20 px-8 relative overflow-hidden">
            {/* Concentric ring decoration */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[500px] h-[500px] rounded-full border border-yellow-400/5" />
              <div className="absolute w-[350px] h-[350px] rounded-full border border-yellow-400/8" />
              <div className="absolute w-[200px] h-[200px] rounded-full border border-yellow-400/10" />
            </div>

            {/* Product identity */}
            <div className="relative text-center">
              <div className="text-7xl mb-6 group-hover:scale-105 transition-transform duration-500">🦅</div>
              <div className="text-xs font-bold tracking-[0.4em] text-yellow-400/60 uppercase mb-2">
                Mac Falcon
              </div>
              <div className="text-5xl sm:text-6xl font-black text-slate-100 tracking-tight mb-1">
                M4-D2
              </div>
              <div className="text-slate-500 text-sm font-medium tracking-widest uppercase">
                Mobility Kit · v1
              </div>
            </div>
          </div>

          {/* Specs strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-800 border-t border-slate-800">
            {SPECS_STRIP.map((s) => (
              <div key={s.label} className="px-6 py-5 flex flex-col gap-1">
                <span className="text-xs text-slate-600 uppercase tracking-widest font-medium">
                  {s.label}
                </span>
                <span className="text-slate-200 font-bold text-sm">{s.value}</span>
              </div>
            ))}
          </div>

          {/* CTA bar */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-900/40">
            <span className="text-yellow-400 font-black text-xl">$749</span>
            <span className="text-sm text-yellow-400 font-semibold group-hover:translate-x-1 transition-transform">
              See the full kit →
            </span>
          </div>
        </Link>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-slate-700 text-xs">
        © {new Date().getFullYear()} Mac Falcon · Built for the bold
      </footer>
    </main>
  );
}
