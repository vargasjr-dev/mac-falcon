import { redirect } from "next/navigation";
import { cookies } from "next/headers";

async function login(formData: FormData) {
  "use server";
  const password = formData.get("password") as string;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) throw new Error("ADMIN_PASSWORD not set");

  if (password === adminPassword) {
    const jar = await cookies();
    jar.set("admin_session", password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });
    redirect("/admin/dashboard");
  }
}

interface Props {
  searchParams: Promise<{ next?: string; error?: string }>;
}

export default async function AdminLoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-[#05070d] flex items-center justify-center px-4">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-yellow-400/[0.03] rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 w-full max-w-sm">
        {/* Wordmark */}
        <div className="text-center mb-10">
          <span className="text-yellow-400 text-3xl">🦅</span>
          <p className="text-yellow-400 font-black text-xs tracking-[0.3em] uppercase mt-2 falcon-text-glow">
            Mac Falcon
          </p>
          <p className="text-slate-600 text-xs tracking-widest uppercase mt-1">
            Mission Control
          </p>
        </div>

        <form action={login} className="space-y-4">
          <div>
            <label className="block text-xs text-slate-500 tracking-widest uppercase mb-2">
              Access Code
            </label>
            <input
              type="password"
              name="password"
              required
              autoFocus
              placeholder="••••••••••••••••"
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-700 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/20 transition-all"
            />
          </div>

          {error && (
            <p className="text-red-400 text-xs text-center">
              Invalid access code
            </p>
          )}

          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-500 text-slate-900 font-black rounded-xl hover:from-yellow-300 hover:to-yellow-400 transition-all falcon-glow tracking-widest uppercase text-sm"
          >
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}
