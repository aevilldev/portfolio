import { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = {
  /** 0..1 extra energy, e.g. while hovering a project row */
  onReady?: () => void;
};

const PALETTE = [new THREE.Color("#dff3ff"), new THREE.Color("#7fd3ff"), new THREE.Color("#4a6b8a")];

export default function ParticleField({ onReady }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isSmall = window.innerWidth < 768;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "low-power" });
    } catch {
      host.dataset["fallback"] = "true";
      onReady?.();
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isSmall ? 1.5 : 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0);
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0a0b0f, 0.055);

    const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.set(0, 0, 26);

    // ---- point field -------------------------------------------------
    const COUNT = isSmall ? 1400 : 3600;
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);
    const seeds = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      // clustered shell — denser near the middle band
      const r = 6 + Math.pow(Math.random(), 0.65) * 26;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 34;
      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * r - 10;

      const c = PALETTE[Math.floor(Math.random() * PALETTE.length)]!;
      const shade = 0.5 + Math.random() * 0.5;
      colors[i * 3] = c.r * shade;
      colors[i * 3 + 1] = c.g * shade;
      colors[i * 3 + 2] = c.b * shade;

      sizes[i] = Math.random() < 0.06 ? 0.28 : 0.05 + Math.random() * 0.1;
      seeds[i] = Math.random() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    const mat = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: renderer.getPixelRatio() } },
      vertexShader: /* glsl */ `
        attribute float aSize;
        attribute float aSeed;
        uniform float uTime;
        uniform float uPixelRatio;
        varying vec3 vColor;
        varying float vFade;
        void main() {
          vColor = color;
          vec3 p = position;
          p.y += sin(uTime * 0.25 + aSeed) * 0.8;
          p.x += cos(uTime * 0.18 + aSeed * 1.7) * 0.6;
          vec4 mv = modelViewMatrix * vec4(p, 1.0);
          float dist = -mv.z;
          vFade = smoothstep(70.0, 8.0, dist) * (0.55 + 0.45 * sin(uTime * 0.9 + aSeed));
          gl_PointSize = aSize * 300.0 * uPixelRatio / max(dist, 0.001);
          gl_Position = projectionMatrix * mv;
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vColor;
        varying float vFade;
        void main() {
          vec2 uv = gl_PointCoord - 0.5;
          float d = length(uv);
          float alpha = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(vColor, alpha * clamp(vFade, 0.0, 1.0));
        }
      `,
      vertexColors: true,
    });

    const points = new THREE.Points(geo, mat);
    scene.add(points);

    // ---- faint wire horizon ------------------------------------------
    const ringGroup = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const ringGeo = new THREE.TorusGeometry(14 + i * 7, 0.015, 6, 160);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x7fd3ff,
        transparent: true,
        opacity: 0.1 - i * 0.025,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2.2;
      ring.position.z = -6 - i * 4;
      ringGroup.add(ring);
    }
    scene.add(ringGroup);

    // ---- interaction ---------------------------------------------------
    const pointer = { x: 0, y: 0 };
    const target = { x: 0, y: 0 };
    let scrollN = 0;
    let scrollTarget = 0;

    const onPointerMove = (e: PointerEvent) => {
      target.x = (e.clientX / window.innerWidth) * 2 - 1;
      target.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const onScroll = () => {
      const max = Math.max(document.body.scrollHeight - window.innerHeight, 1);
      scrollTarget = Math.min(window.scrollY / max, 1);
    };
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    if (!reduced && !isSmall) window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    onScroll();

    // ---- loop ------------------------------------------------------------
    const clock = new THREE.Clock();
    let raf = 0;
    let visible = true;
    const onVisibility = () => {
      visible = !document.hidden;
    };
    document.addEventListener("visibilitychange", onVisibility);

    const damp = (current: number, goal: number, lambda: number, dt: number) =>
      goal + (current - goal) * Math.exp(-lambda * dt);

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (!visible) return;
      const dt = Math.min(clock.getDelta(), 0.05);
      const t = clock.elapsedTime;

      pointer.x = damp(pointer.x, target.x, 2.2, dt);
      pointer.y = damp(pointer.y, target.y, 2.2, dt);
      scrollN = damp(scrollN, scrollTarget, 3, dt);

      points.rotation.y += dt * (reduced ? 0.005 : 0.018);
      points.rotation.x = damp(points.rotation.x, -pointer.y * 0.16, 2, dt);
      ringGroup.rotation.z += dt * 0.03;
      ringGroup.rotation.y = pointer.x * 0.1;

      camera.position.x = damp(camera.position.x, pointer.x * 3.2, 2, dt);
      camera.position.y = damp(camera.position.y, -pointer.y * 2.2 + Math.sin(t * 0.2) * 0.4, 2, dt);
      camera.position.z = damp(camera.position.z, 26 - scrollN * 22, 2.4, dt);
      camera.lookAt(0, 0, -8);

      mat.uniforms["uTime"]!.value = t;
      renderer.render(scene, camera);
    };
    tick();
    onReady?.();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
      geo.dispose();
      mat.dispose();
      ringGroup.children.forEach((c) => {
        const m = c as THREE.Mesh;
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, [onReady]);

  return (
    <div
      ref={hostRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 [&>canvas]:h-full [&>canvas]:w-full"
    />
  );
}
