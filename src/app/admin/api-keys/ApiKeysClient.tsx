"use client";
import { useState } from "react";

interface ApiKey {
  id: string;
  name: string;
  scopes: string[];
  createdAt: string;
  revokedAt: string | null;
}

interface Props {
  initialKeys: ApiKey[];
}

const ALL_SCOPES = ["*", "product:read", "product:write", "order:read", "order:write", "migration:run"];

export default function ApiKeysClient({ initialKeys }: Props) {
  const [keys, setKeys] = useState<ApiKey[]>(initialKeys);
  const [newName, setNewName] = useState("");
  const [newScopes, setNewScopes] = useState<string[]>(["*"]);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleScope(scope: string) {
    setNewScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    );
  }

  async function createKey() {
    if (!newName.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/api-keys", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName.trim(), scopes: newScopes }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setCreatedKey(data.key);
      setKeys((prev) => [
        { id: data.id, name: data.name, scopes: data.scopes, createdAt: new Date().toISOString(), revokedAt: null },
        ...prev,
      ]);
      setNewName("");
      setNewScopes(["*"]);
    } catch (e) {
      setError(String(e));
    } finally {
      setCreating(false);
    }
  }

  async function revokeKey(id: string) {
    if (!confirm("Revoke this key? This cannot be undone.")) return;
    const res = await fetch(`/api/admin/api-keys/${id}`, { method: "DELETE" });
    if (res.ok) {
      setKeys((prev) =>
        prev.map((k) => (k.id === id ? { ...k, revokedAt: new Date().toISOString() } : k))
      );
    }
  }

  const activeKeys = keys.filter((k) => !k.revokedAt);
  const revokedKeys = keys.filter((k) => k.revokedAt);

  return (
    <div className="space-y-8">
      {/* Create new key */}
      <div className="border border-slate-800 rounded-2xl p-6 bg-slate-900/20">
        <h2 className="text-base font-black text-slate-100 tracking-tight mb-4">New API key</h2>

        <div className="space-y-4">
          <div>
            <label className="text-xs text-slate-600 uppercase tracking-widest block mb-1">Name</label>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="e.g. VargasJR prod"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-sm placeholder:text-slate-700 focus:outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-600 uppercase tracking-widest block mb-2">Scopes</label>
            <div className="flex flex-wrap gap-2">
              {ALL_SCOPES.map((scope) => (
                <button
                  key={scope}
                  onClick={() => toggleScope(scope)}
                  className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                    newScopes.includes(scope)
                      ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-400"
                      : "border-slate-700 text-slate-600 hover:border-slate-600"
                  }`}
                >
                  {scope}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <button
            onClick={createKey}
            disabled={creating || !newName.trim()}
            className="px-4 py-2 bg-yellow-400 text-slate-900 font-black text-sm rounded-lg hover:bg-yellow-300 disabled:opacity-40 transition-colors"
          >
            {creating ? "Creating…" : "Create key"}
          </button>
        </div>
      </div>

      {/* Show newly created key — one time only */}
      {createdKey && (
        <div className="border border-green-500/30 bg-green-500/5 rounded-2xl p-6">
          <div className="text-green-400 font-black text-sm mb-2">⚡ Key created — copy it now, it won't be shown again</div>
          <code className="block text-xs text-slate-300 bg-slate-900 rounded-lg px-4 py-3 break-all font-mono select-all">
            {createdKey}
          </code>
          <button
            onClick={() => setCreatedKey(null)}
            className="mt-3 text-xs text-slate-600 hover:text-slate-400"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Active keys */}
      {activeKeys.length > 0 && (
        <div>
          <h3 className="text-xs text-slate-600 uppercase tracking-widest font-medium mb-3">Active ({activeKeys.length})</h3>
          <div className="space-y-2">
            {activeKeys.map((k) => (
              <div key={k.id} className="flex items-center justify-between border border-slate-800 rounded-xl px-5 py-4">
                <div>
                  <div className="text-slate-200 font-semibold text-sm">{k.name}</div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {k.scopes.map((s) => (
                      <span key={s} className="text-[10px] text-yellow-400/70 border border-yellow-500/20 rounded px-1.5 py-0.5">{s}</span>
                    ))}
                  </div>
                  <div className="text-slate-700 text-xs mt-1">
                    Created {new Date(k.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <button
                  onClick={() => revokeKey(k.id)}
                  className="text-xs text-red-500/60 hover:text-red-400 transition-colors ml-4 shrink-0"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Revoked keys */}
      {revokedKeys.length > 0 && (
        <div>
          <h3 className="text-xs text-slate-600 uppercase tracking-widest font-medium mb-3">Revoked ({revokedKeys.length})</h3>
          <div className="space-y-2">
            {revokedKeys.map((k) => (
              <div key={k.id} className="flex items-center justify-between border border-slate-800/40 rounded-xl px-5 py-4 opacity-50">
                <div>
                  <div className="text-slate-500 font-semibold text-sm line-through">{k.name}</div>
                  <div className="text-slate-700 text-xs mt-1">
                    Revoked {new Date(k.revokedAt!).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeKeys.length === 0 && revokedKeys.length === 0 && (
        <p className="text-slate-600 text-sm">No API keys yet.</p>
      )}
    </div>
  );
}
