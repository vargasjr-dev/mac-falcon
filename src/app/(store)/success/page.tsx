import Link from "next/link";

export default function SuccessPage() {
  return (
    <div className="flex flex-col items-center justify-center py-32 text-center">
      <span className="text-6xl mb-6">🦅</span>
      <h1 className="text-4xl font-black text-slate-100 mb-3">
        Order confirmed.
      </h1>
      <p className="text-slate-400 text-lg mb-10 max-w-md">
        You&apos;re one step closer to an untethered AI. We&apos;ll send tracking info to
        your email once your kit ships.
      </p>
      <Link
        href="/shop"
        className="px-8 py-3 border border-slate-700 text-slate-300 font-semibold rounded-xl hover:border-yellow-500/50 hover:text-slate-100 transition-all"
      >
        Back to shop
      </Link>
    </div>
  );
}
