import { db } from "../../../../data/db";
import { falconApiKey } from "../../../../data/schema";
import { desc } from "drizzle-orm";
import Link from "next/link";
import ApiKeysClient from "./ApiKeysClient";

export const dynamic = "force-dynamic";

export default async function ApiKeysPage() {
  const keys = await db
    .select({
      id: falconApiKey.id,
      name: falconApiKey.name,
      scopes: falconApiKey.scopes,
      createdAt: falconApiKey.createdAt,
      revokedAt: falconApiKey.revokedAt,
    })
    .from(falconApiKey)
    .orderBy(desc(falconApiKey.createdAt));

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/dashboard"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-8"
      >
        ← Dashboard
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-black text-slate-100 tracking-tight">Falcon API Keys</h1>
        <p className="text-slate-500 text-sm mt-1">
          Create keys for the <code className="text-slate-400">falcon</code> CLI. Keys are hashed on creation — plaintext shown once.
        </p>
      </div>

      <ApiKeysClient
        initialKeys={keys.map((k) => ({
          ...k,
          createdAt: k.createdAt.toISOString(),
          revokedAt: k.revokedAt?.toISOString() ?? null,
        }))}
      />
    </div>
  );
}
