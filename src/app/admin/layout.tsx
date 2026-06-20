import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import "~/app/globals.css";

async function logout() {
  "use server";
  const jar = await cookies();
  jar.delete("admin_session");
  redirect("/admin");
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jar = await cookies();
  const isAuthenticated = !!jar.get("admin_session")?.value;

  return (
    <div className="min-h-screen bg-[#05070d]">
      {isAuthenticated && (
        <nav className="border-b border-slate-800/60 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link
              href="/"
              className="flex items-center gap-2 text-yellow-400 font-black text-xs tracking-[0.2em] uppercase hover:text-yellow-300 transition-colors falcon-text-glow"
            >
              <span>🦅</span>
              <span>Mac Falcon</span>
            </Link>
            <span className="text-slate-700 text-xs">Mission Control</span>
          </div>
          <div className="flex items-center gap-5 text-xs text-slate-500">
            <Link
              href="/admin/dashboard"
              className="hover:text-slate-200 transition-colors tracking-wide"
            >
              Orders
            </Link>
            <Link
              href="/admin/procurement"
              className="hover:text-slate-200 transition-colors tracking-wide"
            >
              Procurement
            </Link>
            <Link
              href="/admin/supplies"
              className="hover:text-slate-200 transition-colors tracking-wide"
            >
              Supplies
            </Link>
            <Link
              href="/admin/api-keys"
              className="hover:text-slate-200 transition-colors tracking-wide"
            >
              API Keys
            </Link>
            <form action={logout}>
              <button
                type="submit"
                className="hover:text-red-400 transition-colors tracking-wide"
              >
                Log out
              </button>
            </form>
          </div>
        </nav>
      )}
      <main className="max-w-5xl mx-auto px-6 py-10">{children}</main>
    </div>
  );
}
