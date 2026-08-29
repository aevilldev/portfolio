import { useEffect, useRef } from "react";
import * as THREE from "three";

type Props = {
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
      renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true, powerPreference: "high-performance" });
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
    scene.fog = new THREE.FogExp2(0x0a0b0f, 0.032);

    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 260);
    camera.position.set(0, 0, 26);

    const world = new THREE.Group();
    scene.add(world);

    // ---- point field -------------------------------------------------
    const COUNT = isSmall ? 1600 : 4600;
    const positions = new Float32Array(COUNT * 3);
    const colors = new Float32Array(COUNT * 3);
    const sizes = new Float32Array(COUNT);
    const seeds = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      const r = 6 + Math.pow(Math.random(), 0.65) * 30;
      const theta = Math.random() * Math.PI * 2;
      const y = (Math.random() - 0.5) * 40;
      positions[i * 3] = Math.cos(theta) * r;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = Math.sin(theta) * r - 10;

      const c = PALETTE[Math.floor(Math.random() * PALETTE.length)]!;
      const shade = 0.5 + Math.random() * 0.5;
      colors[i * 3] = c.r * shade;
      colors[i * 3 + 1] = c.g * shade;
      colors[i * 3 + 2] = c.b * shade;

      sizes[i] = Math.random() < 0.07 ? 0.5 : 0.12 + Math.random() * 0.16;
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
          vFade = smoothstep(110.0, 4.0, dist) * (0.75 + 0.25 * sin(uTime * 0.9 + aSeed));
          gl_PointSize = aSize * 320.0 * uPixelRatio / max(dist, 0.001);
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
    world.add(points);

    // ---- deep star layer (parallax back plate) --------------------------
    const STARS = isSmall ? 500 : 1200;
    const sp = new Float32Array(STARS * 3);
    for (let i = 0; i < STARS; i++) {
      sp[i * 3] = (Math.random() - 0.5) * 220;
      sp[i * 3 + 1] = (Math.random() - 0.5) * 140;
      sp[i * 3 + 2] = -60 - Math.random() * 120;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute("position", new THREE.BufferAttribute(sp, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x9fd8ff,
      size: 0.35,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      fog: false,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    // ---- infinite wireframe grid floor + ceiling ------------------------
    const grids: THREE.GridHelper[] = [];
    for (let i = 0; i < 2; i++) {
      const grid = new THREE.GridHelper(220, 60, 0x7fd3ff, 0x2b4a63);
      const gm = grid.material as THREE.Material & { opacity: number; transparent: boolean };
      gm.transparent = true;
      gm.opacity = i === 0 ? 0.16 : 0.08;
      grid.position.y = i === 0 ? -18 : 20;
      if (i === 1) grid.rotation.x = Math.PI;
      scene.add(grid);
      grids.push(grid);
    }

    // ---- floating wireframe solids --------------------------------------
    const solids: { mesh: THREE.Mesh; spin: THREE.Vector3; float: number; baseY: number }[] = [];
    const solidGeos: THREE.BufferGeometry[] = [
      new THREE.IcosahedronGeometry(2.2, 1),
      new THREE.OctahedronGeometry(1.8, 0),
      new THREE.TorusKnotGeometry(1.4, 0.32, 90, 12),
      new THREE.DodecahedronGeometry(1.9, 0),
      new THREE.TetrahedronGeometry(2.1, 0),
    ];
    const solidCount = isSmall ? 4 : 9;
    for (let i = 0; i < solidCount; i++) {
      const g = solidGeos[i % solidGeos.length]!;
      const m = new THREE.MeshBasicMaterial({
        color: i % 3 === 0 ? 0xdff3ff : 0x7fd3ff,
        wireframe: true,
        transparent: true,
        opacity: 0.22 + Math.random() * 0.18,
      });
      const mesh = new THREE.Mesh(g, m);
      const a = (i / solidCount) * Math.PI * 2 + Math.random();
      const rad = 12 + Math.random() * 20;
      mesh.position.set(Math.cos(a) * rad, (Math.random() - 0.5) * 26, Math.sin(a) * rad - 14);
      const s = 0.6 + Math.random() * 1.1;
      mesh.scale.setScalar(s);
      solids.push({
        mesh,
        spin: new THREE.Vector3(
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.5,
          (Math.random() - 0.5) * 0.3,
        ),
        float: Math.random() * Math.PI * 2,
        baseY: mesh.position.y,
      });
      world.add(mesh);
    }

    // ---- faint wire horizon rings ---------------------------------------
    const ringGroup = new THREE.Group();
    for (let i = 0; i < 4; i++) {
      const ringGeo = new THREE.TorusGeometry(14 + i * 7, 0.015, 6, 160);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x7fd3ff,
        transparent: true,
        opacity: 0.12 - i * 0.022,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2.2;
      ring.position.z = -6 - i * 4;
      ringGroup.add(ring);
    }
    world.add(ringGroup);

    // ---- planets ---------------------------------------------------------
    scene.add(new THREE.AmbientLight(0x88bbff, 0.6));
    const sun = new THREE.PointLight(0xbfe6ff, 1200, 300);
    sun.position.set(40, 30, 20);
    scene.add(sun);

    const planetGroup = new THREE.Group();
    world.add(planetGroup);
    const planets: { grp: THREE.Group; orbit: number; speed: number; rad: number; spin: number; y: number }[] = [];
    const planetDefs = [
      { r: 6, c: 0x2f6d9a, ring: true },
      { r: 3.4, c: 0x8f5bd8, ring: false },
      { r: 9, c: 0x1d3a55, ring: true },
      { r: 2.2, c: 0xc78b5c, ring: false },
    ];
    const planetCount = isSmall ? 2 : planetDefs.length;
    for (let i = 0; i < planetCount; i++) {
      const d = planetDefs[i]!;
      const grp = new THREE.Group();
      grp.add(
        new THREE.Mesh(
          new THREE.SphereGeometry(d.r, 40, 40),
          new THREE.MeshStandardMaterial({
            color: d.c,
            roughness: 0.9,
            metalness: 0.08,
            emissive: new THREE.Color(d.c).multiplyScalar(0.18),
          }),
        ),
      );
      grp.add(
        new THREE.Mesh(
          new THREE.SphereGeometry(d.r * 1.02, 20, 14),
          new THREE.MeshBasicMaterial({ color: 0x7fd3ff, wireframe: true, transparent: true, opacity: 0.16 }),
        ),
      );
      if (d.ring) {
        const ring = new THREE.Mesh(
          new THREE.TorusGeometry(d.r * 1.8, d.r * 0.045, 8, 120),
          new THREE.MeshBasicMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0.35 }),
        );
        ring.rotation.x = Math.PI / 2.3;
        grp.add(ring);
      }
      const rad = 26 + i * 12 + Math.random() * 6;
      const y = (Math.random() - 0.5) * 22;
      grp.position.set(rad, y, -40 - i * 18);
      planetGroup.add(grp);
      planets.push({
        grp,
        orbit: Math.random() * Math.PI * 2,
        speed: 0.03 + Math.random() * 0.05,
        rad,
        spin: 0.05 + Math.random() * 0.12,
        y,
      });
    }

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
    let last = performance.now();
    let elapsed = 0;
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
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsed += dt;
      const t = elapsed;

      pointer.x = damp(pointer.x, target.x, 2.2, dt);
      pointer.y = damp(pointer.y, target.y, 2.2, dt);
      scrollN = damp(scrollN, scrollTarget, 3, dt);

      points.rotation.y += dt * (reduced ? 0.005 : 0.018);
      points.rotation.x = damp(points.rotation.x, -pointer.y * 0.16, 2, dt);
      ringGroup.rotation.z += dt * 0.03;
      ringGroup.rotation.y = pointer.x * 0.1;

      // whole world tilts with the pointer for real parallax depth
      world.rotation.y = damp(world.rotation.y, pointer.x * 0.22, 2, dt);
      world.rotation.x = damp(world.rotation.x, pointer.y * 0.12, 2, dt);

      stars.rotation.y += dt * 0.004;
      stars.position.z = scrollN * 40;

      for (const pl of planets) {
        pl.orbit += pl.speed * dt;
        pl.grp.rotation.y += pl.spin * dt;
        pl.grp.position.x = Math.cos(pl.orbit) * pl.rad;
        pl.grp.position.z = Math.sin(pl.orbit) * pl.rad - 40;
        pl.grp.position.y = pl.y + Math.sin(t * 0.25 + pl.orbit) * 2.2;
      }
      planetGroup.rotation.y = pointer.x * 0.12;

      for (const s of solids) {
        s.mesh.rotation.x += s.spin.x * dt;
        s.mesh.rotation.y += s.spin.y * dt;
        s.mesh.rotation.z += s.spin.z * dt;
        s.mesh.position.y = s.baseY + Math.sin(t * 0.4 + s.float) * 1.6;
      }

      // grid scrolls toward the viewer, looping seamlessly
      for (let i = 0; i < grids.length; i++) {
        const g = grids[i]!;
        g.position.z = (((t * 3 + scrollN * 60) % 3.6) - 3.6) * (i === 0 ? 1 : -1);
        g.rotation.z = pointer.x * 0.02;
      }

      camera.position.x = damp(camera.position.x, pointer.x * 3.6, 2, dt);
      camera.position.y = damp(camera.position.y, -pointer.y * 2.4 + Math.sin(t * 0.2) * 0.4, 2, dt);
      camera.position.z = damp(camera.position.z, 26 - scrollN * 26, 2.4, dt);
      camera.rotation.z = damp(camera.rotation.z, pointer.x * 0.05, 2, dt);
      camera.lookAt(0, 0, -8);
      camera.rotation.z += pointer.x * 0.05;

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
      starGeo.dispose();
      starMat.dispose();
      grids.forEach((g) => {
        g.geometry.dispose();
        (g.material as THREE.Material).dispose();
      });
      solidGeos.forEach((g) => g.dispose());
      solids.forEach((s) => (s.mesh.material as THREE.Material).dispose());
      ringGroup.children.forEach((c) => {
        const m = c as THREE.Mesh;
        m.geometry.dispose();
        (m.material as THREE.Material).dispose();
      });
      planetGroup.traverse((o) => {
        const mesh = o as THREE.Mesh;
        if (mesh.isMesh) {
          mesh.geometry.dispose();
          (mesh.material as THREE.Material).dispose();
        }
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
