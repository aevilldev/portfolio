import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * Cinematic flythrough: the camera travels through a deep-space corridor of
 * stars, nebulae, asteroids and planets, then locks onto a floating holographic
 * panel (the "website") and flies straight into it.
 */
export default function IntroScene({ progress }: { progress: number }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const progRef = useRef(0);
  progRef.current = progress;

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
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
    scene.fog = new THREE.FogExp2(0x04060c, 0.0055);
    const camera = new THREE.PerspectiveCamera(72, w() / h(), 0.1, 1200);

    scene.add(new THREE.AmbientLight(0x88bbff, 0.55));
    const key = new THREE.PointLight(0xaee3ff, 2200, 900);
    key.position.set(60, 40, -180);
    scene.add(key);
    const rim = new THREE.PointLight(0xb98bff, 1600, 800);
    rim.position.set(-80, -30, -420);
    scene.add(rim);

    const disposables: { dispose(): void }[] = [];
    const START_Z = 40;
    const PANEL_Z = -560;

    /* ---------------- soft radial sprite texture ---------------- */
    const makeGlow = (inner: string, outer: string) => {
      const c = document.createElement("canvas");
      c.width = c.height = 128;
      const ctx = c.getContext("2d")!;
      const grd = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
      grd.addColorStop(0, inner);
      grd.addColorStop(0.4, outer);
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, 128, 128);
      const tex = new THREE.CanvasTexture(c);
      tex.colorSpace = THREE.SRGBColorSpace;
      disposables.push(tex);
      return tex;
    };
    const starTex = makeGlow("rgba(255,255,255,1)", "rgba(160,210,255,0.45)");
    const nebTex = makeGlow("rgba(150,190,255,0.55)", "rgba(120,80,220,0.25)");

    /* ---------------- star field along the corridor ---------------- */
    const N = 3200;
    const spos = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 14 + Math.pow(Math.random(), 0.6) * 170;
      spos[i * 3] = Math.cos(a) * r;
      spos[i * 3 + 1] = Math.sin(a) * r * 0.75;
      spos[i * 3 + 2] = START_Z - Math.random() * 900;
    }
    const sg = new THREE.BufferGeometry();
    sg.setAttribute("position", new THREE.BufferAttribute(spos, 3));
    const sm = new THREE.PointsMaterial({
      map: starTex,
      color: 0xdff3ff,
      size: 2.2,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.Points(sg, sm));
    disposables.push(sg, sm);

    /* ---------------- nebula clouds ---------------- */
    const nebulaGroup = new THREE.Group();
    const nebColors = [0x5a7cff, 0x9b5bff, 0x2ec5d3, 0xff6bb5];
    for (let i = 0; i < 46; i++) {
      const mat = new THREE.SpriteMaterial({
        map: nebTex,
        color: nebColors[i % nebColors.length]!,
        transparent: true,
        opacity: 0.16 + Math.random() * 0.18,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      });
      disposables.push(mat);
      const sp = new THREE.Sprite(mat);
      const a = Math.random() * Math.PI * 2;
      const r = 40 + Math.random() * 150;
      sp.position.set(Math.cos(a) * r, Math.sin(a) * r * 0.7, START_Z - 60 - Math.random() * 780);
      const s = 90 + Math.random() * 220;
      sp.scale.set(s, s, 1);
      nebulaGroup.add(sp);
    }
    scene.add(nebulaGroup);

    /* ---------------- asteroids ---------------- */
    const rockGeos = [
      new THREE.IcosahedronGeometry(1, 0),
      new THREE.DodecahedronGeometry(1, 0),
      new THREE.OctahedronGeometry(1, 0),
    ];
    rockGeos.forEach((geo) => {
      const p = geo.getAttribute("position") as THREE.BufferAttribute;
      for (let i = 0; i < p.count; i++) {
        p.setXYZ(
          i,
          p.getX(i) * (0.7 + Math.random() * 0.6),
          p.getY(i) * (0.7 + Math.random() * 0.6),
          p.getZ(i) * (0.7 + Math.random() * 0.6),
        );
      }
      geo.computeVertexNormals();
      disposables.push(geo);
    });
    const rockMat = new THREE.MeshStandardMaterial({ color: 0x5b6577, roughness: 0.95, metalness: 0.15, flatShading: true });
    const rockEdge = new THREE.MeshBasicMaterial({ color: 0x7fd3ff, wireframe: true, transparent: true, opacity: 0.12 });
    disposables.push(rockMat, rockEdge);
    const rocks: { o: THREE.Object3D; rx: number; ry: number }[] = [];
    for (let i = 0; i < 90; i++) {
      const g = rockGeos[i % rockGeos.length]!;
      const grp = new THREE.Group();
      const mesh = new THREE.Mesh(g, rockMat);
      grp.add(mesh);
      grp.add(new THREE.Mesh(g, rockEdge));
      const a = Math.random() * Math.PI * 2;
      const r = 16 + Math.random() * 90;
      const s = 0.8 + Math.random() * 5;
      grp.scale.setScalar(s);
      grp.position.set(Math.cos(a) * r, Math.sin(a) * r * 0.8, START_Z - 40 - Math.random() * 820);
      scene.add(grp);
      rocks.push({ o: grp, rx: (Math.random() - 0.5) * 0.7, ry: (Math.random() - 0.5) * 0.7 });
    }

    /* ---------------- planets ---------------- */
    const planets: { grp: THREE.Group; spin: number }[] = [];
    const defs = [
      { r: 26, c: 0x2f6d9a, x: -78, y: -14, z: -110, ring: true },
      { r: 14, c: 0x8f5bd8, x: 62, y: 34, z: -230, ring: false },
      { r: 40, c: 0x1d3a55, x: 96, y: -46, z: -360, ring: true },
      { r: 18, c: 0xd08a4a, x: -70, y: 40, z: -470, ring: false },
      { r: 60, c: 0x162a44, x: -150, y: -70, z: -700, ring: true },
    ];
    for (const d of defs) {
      const grp = new THREE.Group();
      const bodyMat = new THREE.MeshStandardMaterial({
        color: d.c,
        roughness: 0.85,
        metalness: 0.12,
        emissive: new THREE.Color(d.c).multiplyScalar(0.18),
        flatShading: true,
      });
      const bodyGeo = new THREE.SphereGeometry(d.r, 64, 48);
      grp.add(new THREE.Mesh(bodyGeo, bodyMat));
      const wireGeo = new THREE.SphereGeometry(d.r * 1.012, 28, 20);
      const wireMat = new THREE.MeshBasicMaterial({ color: 0x7fd3ff, wireframe: true, transparent: true, opacity: 0.16 });
      grp.add(new THREE.Mesh(wireGeo, wireMat));
      const atmGeo = new THREE.SphereGeometry(d.r * 1.12, 32, 24);
      const atmMat = new THREE.MeshBasicMaterial({
        color: 0x8fd0ff,
        transparent: true,
        opacity: 0.07,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      grp.add(new THREE.Mesh(atmGeo, atmMat));
      disposables.push(bodyGeo, bodyMat, wireGeo, wireMat, atmGeo, atmMat);
      if (d.ring) {
        const rg = new THREE.TorusGeometry(d.r * 1.75, d.r * 0.035, 8, 160);
        const rm = new THREE.MeshBasicMaterial({ color: 0x9fd8ff, transparent: true, opacity: 0.35, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(rg, rm);
        ring.rotation.x = Math.PI / 2.3;
        ring.rotation.y = 0.35;
        grp.add(ring);
        disposables.push(rg, rm);
      }
      grp.position.set(d.x, d.y, d.z);
      scene.add(grp);
      planets.push({ grp, spin: 0.05 + Math.random() * 0.1 });
    }

    /* ---------------- the website panel ---------------- */
    const panel = new THREE.Group();
    panel.position.set(18, 6, PANEL_Z);
    const PW = 64;
    const PH = 40;

    const slabGeo = new THREE.BoxGeometry(PW, PH, 1.6);
    const slabMat = new THREE.MeshStandardMaterial({
      color: 0x0a1220,
      roughness: 0.25,
      metalness: 0.6,
      emissive: 0x0b2438,
      transparent: true,
      opacity: 0.92,
    });
    panel.add(new THREE.Mesh(slabGeo, slabMat));
    disposables.push(slabGeo, slabMat);

    const frameGeo = new THREE.BoxGeometry(PW + 1.6, PH + 1.6, 2.2);
    const frameMat = new THREE.MeshBasicMaterial({ color: 0x7fe3ff, wireframe: true, transparent: true, opacity: 0.55 });
    panel.add(new THREE.Mesh(frameGeo, frameMat));
    disposables.push(frameGeo, frameMat);

    const glowGeo = new THREE.PlaneGeometry(PW * 1.9, PH * 2.1);
    const glowMat = new THREE.SpriteMaterial({ map: nebTex, color: 0x6fd6ff, transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending });
    const halo = new THREE.Sprite(glowMat);
    halo.scale.set(PW * 2.4, PH * 2.6, 1);
    halo.position.z = -3;
    panel.add(halo);
    disposables.push(glowGeo, glowMat);

    // fake UI blocks on the panel face
    const uiMat = new THREE.MeshBasicMaterial({ color: 0x9fe8ff, transparent: true, opacity: 0.5 });
    const uiDim = new THREE.MeshBasicMaterial({ color: 0x4c86a8, transparent: true, opacity: 0.35 });
    disposables.push(uiMat, uiDim);
    const addBlock = (x: number, y: number, bw: number, bh: number, bright = false) => {
      const g = new THREE.PlaneGeometry(bw, bh);
      disposables.push(g);
      const mesh = new THREE.Mesh(g, bright ? uiMat : uiDim);
      mesh.position.set(x, y, 0.95);
      panel.add(mesh);
    };
    addBlock(-PW / 2 + 14, PH / 2 - 4, 22, 2.2, true); // nav
    addBlock(PW / 2 - 10, PH / 2 - 4, 14, 1.4);
    addBlock(-PW / 2 + 22, PH / 2 - 13, 38, 6.5, true); // headline
    addBlock(-PW / 2 + 16, PH / 2 - 21, 26, 2.4);
    for (let i = 0; i < 3; i++) addBlock(-PW / 2 + 12 + i * 20, -PH / 2 + 10, 16, 9);
    addBlock(0, -PH / 2 + 2.5, PW - 8, 0.4, true);

    const gridGeo = new THREE.PlaneGeometry(PW - 2, PH - 2, 18, 12);
    const gridMat = new THREE.MeshBasicMaterial({ color: 0x2ec5d3, wireframe: true, transparent: true, opacity: 0.14 });
    const grid = new THREE.Mesh(gridGeo, gridMat);
    grid.position.z = 0.9;
    panel.add(grid);
    disposables.push(gridGeo, gridMat);

    panel.rotation.set(0.22, -0.62, 0.07);
    panel.visible = false;
    scene.add(panel);

    const panelLight = new THREE.PointLight(0x7fe3ff, 3000, 400);
    panelLight.position.set(18, 6, PANEL_Z + 40);
    scene.add(panelLight);

    const onResize = () => {
      camera.aspect = w() / h();
      camera.updateProjectionMatrix();
      renderer.setSize(w(), h());
    };
    window.addEventListener("resize", onResize);

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const clamp01 = (v: number) => Math.min(1, Math.max(0, v));
    const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    let raf = 0;
    let last = performance.now();
    let t = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      t += dt;

      const p = clamp01(progRef.current / 100);

      // camera travels the corridor, decelerating as it locks onto the panel
      const travel = easeInOut(p);
      const camZ = lerp(START_Z, PANEL_Z + 22, travel);

      // alignment phase: 0 while cruising, 1 when locked to the panel
      const align = clamp01((p - 0.55) / 0.45);
      const ae = easeInOut(align);

      const wander = 1 - ae;
      camera.position.set(
        lerp(Math.sin(t * 0.35) * 9 + Math.sin(t * 0.13) * 5, 0, ae) * wander + lerp(0, panel.position.x, ae),
        lerp(Math.cos(t * 0.27) * 6 + Math.sin(t * 0.09) * 4, 0, ae) * wander + lerp(0, panel.position.y, ae),
        camZ,
      );
      camera.rotation.z = Math.sin(t * 0.2) * 0.09 * wander;
      camera.rotation.y = lerp(Math.sin(t * 0.18) * 0.06, 0, ae) * wander;
      camera.rotation.x = lerp(Math.cos(t * 0.15) * 0.05, 0, ae) * wander;
      camera.fov = lerp(86, 62, easeInOut(clamp01(p * 1.15)));
      camera.updateProjectionMatrix();

      // panel appears in the distance, then squares up to the camera
      panel.visible = p > 0.18;
      panel.rotation.x = lerp(0.22, 0, ae);
      panel.rotation.y = lerp(-0.62, 0, ae) + Math.sin(t * 0.5) * 0.02 * wander;
      panel.rotation.z = lerp(0.07, 0, ae) + Math.sin(t * 0.4) * 0.01 * wander;
      panel.position.x = lerp(18, 0, ae * 0.35);
      panel.position.y = lerp(6, 0, ae * 0.35) + Math.sin(t * 0.7) * 0.6 * wander;
      panelLight.position.set(panel.position.x, panel.position.y, PANEL_Z + 60);
      panelLight.intensity = 1200 + 5000 * ae;
      (frameMat as THREE.MeshBasicMaterial).opacity = 0.35 + 0.5 * ae;
      (glowMat as THREE.SpriteMaterial).opacity = 0.2 + 0.45 * ae;

      for (const pl of planets) pl.grp.rotation.y += pl.spin * dt;
      for (const r of rocks) {
        r.o.rotation.x += r.rx * dt;
        r.o.rotation.y += r.ry * dt;
      }
      nebulaGroup.rotation.z += dt * 0.01;

      renderer.render(scene, camera);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      for (const d of disposables) d.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === host) host.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={hostRef} aria-hidden="true" className="absolute inset-0 [&>canvas]:h-full [&>canvas]:w-full" />;
}
