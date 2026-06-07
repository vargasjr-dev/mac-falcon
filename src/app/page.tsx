import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#05070d] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Starfield ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-yellow-400/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 text-center max-w-3xl">
        {/* Wordmark */}
        <div className="mb-3 flex justify-center items-center gap-3">
          <span className="text-yellow-400 text-4xl">🦅</span>
          <span className="text-yellow-400 font-black text-2xl tracking-widest uppercase falcon-text-glow">
            Mac Falcon
          </span>
        </div>

        <h1 className="text-5xl sm:text-6xl font-black tracking-tight mb-5 leading-tight">
          <span className="text-slate-100">Give your AI</span>
          <br />
          <span className="bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent falcon-text-glow">
            a body.
          </span>
        </h1>

        <p className="text-slate-400 text-lg mb-10 leading-relaxed max-w-xl mx-auto">
          Robotics kits that put your Mac Mini on wheels. Untethered, mobile,
          and ready for cameras and arms. Built for makers who want their AI
          to move.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/shop"
            className="px-8 py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 font-bold rounded-xl hover:from-yellow-300 hover:to-yellow-400 transition-all falcon-glow"
          >
            Shop kits
          </Link>
          <Link
            href="#how-it-works"
            className="px-8 py-3 border border-slate-700 text-slate-300 font-semibold rounded-xl hover:border-yellow-500/50 hover:text-slate-100 transition-all"
          >
            How it works
          </Link>
        </div>
      </div>

      {/* How it works */}
      <section
        id="how-it-works"
        className="relative z-10 mt-32 max-w-4xl w-full px-4"
      >
        <h2 className="text-2xl font-bold text-center text-slate-200 mb-12">
          How it works
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {[
            {
              step: "01",
              title: "Pick your kit",
              body: "Choose the mobility kit for your Mac Mini model. Each kit ships with all the parts, hardware, and build instructions.",
            },
            {
              step: "02",
              title: "Build it",
              body: "Assemble the Lego Technic superstructure, bolt the robot base underneath, and seat your Mac Mini on top.",
            },
            {
              step: "03",
              title: "Deploy",
              body: "Flash the control software, connect over WiFi, and your AI is untethered. Add cameras and arms when you're ready.",
            },
          ].map((item) => (
            <div key={item.step} className="flex flex-col gap-3">
              <span className="text-yellow-400/40 font-black text-5xl leading-none">
                {item.step}
              </span>
              <h3 className="text-slate-100 font-bold text-lg">{item.title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{item.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 mt-32 mb-8 text-slate-600 text-sm text-center">
        © {new Date().getFullYear()} Mac Falcon. Built for the bold.
      </footer>
    </main>
  );
}
