import Link from "next/link";
import RotatingText from "~/components/RotatingText";
import StarField from "~/components/StarField";

const SPECS_STRIP = [
  { label: "Robot base", value: "iRobot Create 3" },
  { label: "Payload", value: "9 kg" },
  { label: "Runtime", value: "4–6 hrs" },
  { label: "Software", value: "Open-source" },
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#05070d] flex flex-col overflow-hidden">

      {/* ── Deep space background ── */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Starfield */}
        <StarField count={220} />

        {/* Subtle grid overlay — like a targeting computer */}
        <div
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(250,204,21,1) 1px, transparent 1px), linear-gradient(90deg, rgba(250,204,21,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        {/* Deep amber nebula glow */}
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-yellow-400/[0.04] rounded-full blur-[180px]" />
        <div className="absolute bottom-0 right-[-10%] w-[600px] h-[600px] bg-blue-700/[0.04] rounded-full blur-[160px]" />
      </div>

      {/* ── Nav ── */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-6xl mx-auto w-full">
        <div className="flex items-center gap-2.5">
          <span className="text-yellow-400 text-xl">🦅</span>
          <span className="text-yellow-400 font-black text-sm tracking-[0.25em] uppercase falcon-text-glow">
            Mac Falcon
          </span>
        </div>
        <Link
          href="/shop"
          className="text-sm text-slate-500 hover:text-slate-200 transition-colors tracking-wide"
        >
          Shop
        </Link>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-6 pt-8 pb-8">

        {/* Status beacon */}
        <div className="inline-flex items-center gap-2.5 border border-yellow-500/25 rounded-full px-4 py-1.5 text-xs font-bold text-yellow-400/80 tracking-[0.2em] uppercase mb-10 bg-yellow-500/[0.05]">
          <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
          Now deploying — M4-D2
        </div>

        <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tight leading-[0.88] mb-3 max-w-4xl">
          <span className="text-slate-100">Give your</span>
          <br />
          {/* Rotating agent name */}
          <RotatingText />
        </h1>

        {/* "a body." on its own line, slightly smaller */}
        <p className="text-5xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-300 mb-8 leading-tight">
          a body.
        </p>

        <p className="text-slate-500 text-base sm:text-lg leading-relaxed max-w-lg mb-3">
          Robotics kits that put your Mac Mini on wheels — robot base, power,
          structure, and software{" "}
          <span className="text-slate-300 font-semibold">all in one box.</span>
        </p>

        <p className="text-slate-600 text-sm mb-10">
          From{" "}
          <span className="text-yellow-400 font-black text-base">$749</span>
          {" "}· Free shipping · Mac Mini not included
        </p>

        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <Link
            href="/shop"
            className="px-10 py-4 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 font-black text-sm rounded-xl hover:from-yellow-300 hover:to-yellow-400 transition-all falcon-glow tracking-[0.1em] uppercase"
          >
            Shop kits →
          </Link>
          <Link
            href="/shop/m4d2-mobility-kit"
            className="text-sm text-slate-500 hover:text-slate-300 transition-colors underline underline-offset-4 decoration-slate-700"
          >
            See what&apos;s in the kit
          </Link>
        </div>
      </section>

      {/* ── Product showcase card ── */}
      <section className="relative z-10 px-6 pb-20 max-w-5xl mx-auto w-full">
        <Link
          href="/shop/m4d2-mobility-kit"
          className="group block border border-slate-800 rounded-3xl overflow-hidden hover:border-yellow-500/35 transition-all duration-500 hover:falcon-glow relative"
        >
          {/* HUD corner brackets */}
          <span className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2 border-yellow-500/30 rounded-tl-sm group-hover:border-yellow-400/60 transition-colors z-10" />
          <span className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2 border-yellow-500/30 rounded-tr-sm group-hover:border-yellow-400/60 transition-colors z-10" />
          <span className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2 border-yellow-500/30 rounded-bl-sm group-hover:border-yellow-400/60 transition-colors z-10" />
          <span className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2 border-yellow-500/30 rounded-br-sm group-hover:border-yellow-400/60 transition-colors z-10" />

          {/* Product render */}
          <div className="w-full bg-gradient-to-b from-slate-900/80 to-[#05070d] flex flex-col items-center justify-center py-20 px-8 relative overflow-hidden">
            {/* Targeting rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-[520px] h-[520px] rounded-full border border-yellow-400/[0.04]" />
              <div className="absolute w-[360px] h-[360px] rounded-full border border-yellow-400/[0.06]" />
              <div className="absolute w-[200px] h-[200px] rounded-full border border-yellow-400/[0.09]" />
              {/* Cross-hairs */}
              <div className="absolute w-[520px] h-[1px] bg-yellow-400/[0.03]" />
              <div className="absolute w-[1px] h-[520px] bg-yellow-400/[0.03]" />
            </div>

            {/* Identity */}
            <div className="relative text-center">
              <div className="text-7xl mb-5 group-hover:scale-105 transition-transform duration-700 ease-out drop-shadow-[0_0_30px_rgba(250,204,21,0.3)]">
                🦅
              </div>
              <div className="text-[10px] font-bold tracking-[0.5em] text-yellow-400/40 uppercase mb-2">
                Mac Falcon
              </div>
              <div className="text-5xl sm:text-6xl font-black text-slate-100 tracking-tight mb-1">
                M4-D2
              </div>
              <div className="text-slate-600 text-xs font-medium tracking-[0.35em] uppercase">
                Mobility Kit
              </div>
            </div>
          </div>

          {/* Specs strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-slate-800/60 border-t border-slate-800/60">
            {SPECS_STRIP.map((s) => (
              <div key={s.label} className="px-6 py-5 flex flex-col gap-1 bg-slate-950/30">
                <span className="text-[10px] text-slate-600 uppercase tracking-[0.2em] font-medium">
                  {s.label}
                </span>
                <span className="text-slate-300 font-bold text-sm">{s.value}</span>
              </div>
            ))}
          </div>

          {/* CTA bar */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/60 bg-slate-950/50">
            <span className="text-yellow-400 font-black text-xl">$749</span>
            <span className="text-sm text-slate-500 font-semibold group-hover:text-yellow-400 group-hover:translate-x-1 transition-all duration-300">
              See the full kit →
            </span>
          </div>
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 py-6 text-center text-slate-700 text-xs tracking-widest">
        © {new Date().getFullYear()} MAC FALCON · BUILT FOR THE BOLD
      </footer>
    </main>
  );
}
