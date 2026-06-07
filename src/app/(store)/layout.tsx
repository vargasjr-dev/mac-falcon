import Link from "next/link";

export default function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#05070d]">
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <Link
          href="/"
          className="flex items-center gap-2 text-yellow-400 font-black tracking-widest text-sm uppercase hover:text-yellow-300 transition-colors"
        >
          <span>🦅</span>
          <span>Mac Falcon</span>
        </Link>
        <div className="flex items-center gap-6 text-sm text-slate-400">
          <Link href="/shop" className="hover:text-slate-100 transition-colors">
            Shop
          </Link>
          <Link href="/orders" className="hover:text-slate-100 transition-colors">
            Orders
          </Link>
        </div>
      </nav>
      <main className="max-w-6xl mx-auto px-6 py-12">{children}</main>
    </div>
  );
}
