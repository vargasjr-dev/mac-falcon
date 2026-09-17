"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

interface Props {
  src: string;
}

/**
 * Mobile-friendly exploded-view viewer.
 * Orbit with one finger, pinch to zoom, drag the slider to explode/collapse.
 * Tap a part to identify it.
 */
export default function ExplodeViewer({ src }: Props) {
  const mountRef = useRef<HTMLDivElement>(null);
  const explodeRef = useRef<((t: number) => void) | null>(null);
  const [explode, setExplode] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x05070d);

    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      1,
      4000,
    );
    camera.position.set(420, -420, 320);
    camera.up.set(0, 0, 1);
    camera.lookAt(0, 0, 60);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.AmbientLight(0xffffff, 1.1));
    const key = new THREE.DirectionalLight(0xffffff, 1.6);
    key.position.set(400, -300, 600);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0x88aaff, 0.5);
    fill.position.set(-400, 300, -200);
    scene.add(fill);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.target.set(0, 0, 60);

    // Tapped part → highlight + label
    const raycaster = new THREE.Raycaster();
    const pointer: THREE.Vector2[] = [];
    function onTap(event: PointerEvent) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.length = 0;
      pointer.push(
        new THREE.Vector2(
          ((event.clientX - rect.left) / rect.width) * 2 - 1,
          -((event.clientY - rect.top) / rect.height) * 2 + 1,
        ),
      );
      raycaster.setFromCamera(pointer[0], camera);
      const hits = raycaster.intersectObjects(scene.children, true);
      const mesh = hits.find((h) => h.object.userData.partName)?.object;
      setSelected(mesh ? (mesh.userData.partName as string) : null);
    }
    let downAt = 0;
    function onDown() {
      downAt = Date.now();
    }
    function onUp(event: PointerEvent) {
      if (Date.now() - downAt < 250) onTap(event);
    }
    renderer.domElement.addEventListener("pointerdown", onDown);
    renderer.domElement.addEventListener("pointerup", onUp);

    let explodeFn: ((t: number) => void) | null = null;
    const loader = new GLTFLoader();
    loader.load(
      src,
      (gltf) => {
        const group = gltf.scene;
        scene.add(group);

        const center = new THREE.Vector3(0, 0, 60);
        const parts: Array<{
          mesh: THREE.Mesh;
          dir: THREE.Vector3;
          home: THREE.Vector3;
        }> = [];
        group.traverse((obj) => {
          if (!(obj instanceof THREE.Mesh)) return;
          const name = obj.name || obj.parent?.name || "";
          obj.userData.partName = name;
          const box = new THREE.Box3().setFromObject(obj);
          const c = box.getCenter(new THREE.Vector3());
          const dir = c.clone().sub(center);
          dir.z *= 1.6;
          if (dir.lengthSq() < 1e-6) dir.set(0, 0, 1);
          dir.normalize();
          parts.push({ mesh: obj, dir, home: obj.position.clone() });
        });

        explodeFn = (t: number) => {
          for (const p of parts) {
            p.mesh.position.copy(p.home).addScaledVector(p.dir, t * 140);
          }
        };

        setReady(true);
      },
      undefined,
      (err) => console.error("GLB load failed", err),
    );

    explodeRef.current = (t) => explodeFn?.(t);

    let raf = 0;
    function tick() {
      controls.update();
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    }
    tick();

    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      renderer.domElement.removeEventListener("pointerdown", onDown);
      renderer.domElement.removeEventListener("pointerup", onUp);
      controls.dispose();
      renderer.dispose();
      mount.removeChild(renderer.domElement);
    };
  }, [src]);

  return (
    <div className="relative w-full" style={{ height: "70vh", minHeight: 420 }}>
      <div ref={mountRef} className="absolute inset-0 touch-none" />

      {!ready && (
        <div className="absolute inset-0 flex items-center justify-center text-slate-500 text-sm">
          Loading model…
        </div>
      )}

      {selected && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/90 border border-slate-700 rounded-full px-4 py-1.5 text-xs text-yellow-400 font-bold tracking-wide">
          {selected}
        </div>
      )}

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-[85%] max-w-sm bg-slate-900/90 border border-slate-700 rounded-2xl px-5 py-3">
        <div className="flex items-center gap-3">
          <span className="text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">
            Assembled
          </span>
          <input
            type="range"
            min={0}
            max={100}
            value={explode}
            onChange={(e) => {
              const t = Number(e.target.value);
              setExplode(t);
              explodeRef.current?.(t / 100);
            }}
            className="flex-1 accent-yellow-400"
          />
          <span className="text-[10px] text-slate-500 uppercase tracking-widest whitespace-nowrap">
            Exploded
          </span>
        </div>
      </div>
    </div>
  );
}
