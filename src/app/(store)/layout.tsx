import Link from "next/link";
import StarField from "~/components/StarField";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#05070d] relative">
      {/* Starfield */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <StarField count={160} />
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(250,204,21,1) 1px, transparent 1px), linear-gradient(90deg, rgba(250,204,21,1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-yellow-400/[0.03] rounded-full blur-[160px]" />
      </div>

      {/* Nav */}
      <nav className="relative z-10 border-b border-slate-800/60 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-yellow-400 font-black tracking-[0.2em] text-sm uppercase hover:text-yellow-300 transition-colors falcon-text-glow"
        >
          <span>🦅</span>
          <span>Mac Falcon</span>
        </Link>
        <div className="flex items-center gap-6 text-sm text-slate-500">
          <Link href="/shop" className="hover:text-slate-200 transition-colors">
            Shop
          </Link>
          <Link href="/orders" className="hover:text-slate-200 transition-colors">
            Orders
          </Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        {children}
      </main>
    </div>
  );
}
