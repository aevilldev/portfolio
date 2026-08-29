import { useEffect, useRef } from "react";
import * as THREE from "three";

/** Warp-speed star tunnel with planets, drawn behind the loading overlay. */
export default function IntroScene({ progress }: { progress: number }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const progRef = useRef(0);
  progRef.current = progress;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    } catch {
      return;
    }
    const w = () => window.innerWidth;
    const h = () => window.innerHeight;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w(), h());
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x05060a, 0.012);
    const camera = new THREE.PerspectiveCamera(70, w() / h(), 0.1, 400);
    camera.position.set(0, 0, 0);

    scene.add(new THREE.AmbientLight(0x88bbff, 0.7));
    const key = new THREE.PointLight(0xaee3ff, 900, 400);
    key.position.set(30, 20, -40);
    scene.add(key);

    // warp streaks
    const N = 1400;
    const pos = new Float32Array(N * 3);
    const speeds = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 90;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 2] = -Math.random() * 260;
      speeds[i] = 20 + Math.random() * 70;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const m = new THREE.PointsMaterial({
      color: 0xdff3ff,
      size: 0.5,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const stars = new THREE.Points(g, m);
    scene.add(stars);

    // planets
    const planets: { grp: THREE.Group; spin: number; drift: number }[] = [];
    const defs = [
      { r: 9, c: 0x2f6d9a, x: -26, y: -6, z: -80, ring: true },
      { r: 5.5, c: 0x8f5bd8, x: 24, y: 10, z: -110, ring: false },
      { r: 14, c: 0x1d3a55, x: 8, y: -22, z: -170, ring: true },
    ];
    for (const d of defs) {
      const grp = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.SphereGeometry(d.r, 48, 48),
        new THREE.MeshStandardMaterial({
          color: d.c,
          roughness: 0.85,
          metalness: 0.1,
          emissive: new THREE.Color(d.c).multiplyScalar(0.15),
        }),
      );
      grp.add(body);
      const wire = new THREE.Mesh(
        new THREE.SphereGeometry(d.r * 1.01, 24, 18),
        new THREE.MeshBasicMaterial({ color: 0x7fd3ff, wireframe: true, transparent: true, opacity: 0.18 }),
      );
      grp.add(wire);
      if (d.ring) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(d.r * 1.7, d.r * 0.05, 8, 120),
          new THREE.MeshBasicMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0.4 }),
        );
        ring.rotation.x = Math.PI / 2.4;
        ring.rotation.y = 0.3;
        grp.add(ring);
      }
      grp.position.set(d.x, d.y, d.z);
      scene.add(grp);
      planets.push({ grp, spin: 0.06 + Math.random() * 0.12, drift: Math.random() * Math.PI * 2 });
    }

    const onResize = () => {
      camera.aspect = w() / h();
      camera.updateProjectionMatrix();
      renderer.setSize(w(), h());
    };
    window.addEventListener("resize", onResize);

    let raf = 0;
    let last = performance.now();
    let t = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt;
      const boost = 0.4 + progRef.current / 100;

      const arr = g.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < N; i++) {
        let z = arr.getZ(i) + speeds[i]! * dt * boost * 1.6;
        if (z > 8) z = -260;
        arr.setZ(i, z);
      }
      arr.needsUpdate = true;

      for (const p of planets) {
        p.grp.rotation.y += p.spin * dt;
        p.grp.position.z += 6 * dt * boost;
        p.grp.position.y += Math.sin(t * 0.3 + p.drift) * dt * 1.2;
        if (p.grp.position.z > 30) p.grp.position.z = -220;
      }

      camera.rotation.z = Math.sin(t * 0.15) * 0.06;
      camera.position.x = Math.sin(t * 0.22) * 1.6;
      camera.position.y = Math.cos(t * 0.18) * 1.2;
      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      g.dispose();
      m.dispose();
      scene.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry.dispose();
          (mesh.material as THREE.Material).dispose();
        }
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={hostRef} aria-hidden="true" className="absolute inset-0 [&>canvas]:h-full [&>canvas]:w-full" />;
}
