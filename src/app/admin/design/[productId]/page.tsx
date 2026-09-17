import Link from "next/link";
import ExplodeViewer from "~/components/ExplodeViewer";

export const dynamic = "force-dynamic";

/**
 * Admin design viewer — full 3D exploded assembly for a product.
 * Mobile-first: orbit with one finger, pinch to zoom, slider to explode.
 */
export default async function ProductDesignPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;

  // The viewer asset is generated per product id; M4-D2 is the only product today.
  const modelSrc = productId === "m4d2-v1" ? "/3d/m4d2.glb" : null;

  return (
    <div>
      <div className="mb-6">
        <Link
          href="/admin/dashboard"
          className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          ← Dashboard
        </Link>
        <h1 className="text-2xl font-black text-slate-100 tracking-tight mt-3">
          M4-D2 — Design
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          One finger orbits, pinch zooms, tap a part to identify it. Drag the
          slider to explode the assembly.
        </p>
      </div>

      {modelSrc ? (
        <ExplodeViewer src={modelSrc} />
      ) : (
        <div className="border border-slate-800 rounded-2xl p-16 text-center">
          <p className="text-slate-500">
            No 3D model generated for this product yet.
          </p>
        </div>
      )}

      <p className="text-slate-700 text-xs mt-6 text-center">
        Regenerate the model with{" "}
        <code className="text-slate-500">
          python3 hardware/generate-step.py
        </code>
      </p>
    </div>
  );
}
