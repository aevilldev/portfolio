import { useEffect, useRef } from "react";
import * as THREE from "three";

const BG = "#0d0f14";
const FG = "#f2f3f5";
const MUTED = "#9b9ea6";
const PRIMARY = "#5ec7ee";
const CARD = "rgba(20,22,28,0.55)";

/**
 * Draws a 1:1 proportional replica of the site's hero section so the 3D panel
 * the camera flies into shows the real website, not a placeholder.
 */
function drawHero(ctx: CanvasRenderingContext2D, W: number, H: number) {
  const k = W / Math.max(window.innerWidth, 1); // css px -> texture px
  const vw = W / 100;
  const px = (n: number) => n * k;

  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  const padX = px(48);

  // ---- header ----
  ctx.textBaseline = "alphabetic";
  ctx.fillStyle = FG;
  ctx.font = `700 ${px(18)}px "Space Grotesk", sans-serif`;
  ctx.fillText("aevill", padX, px(46));

  ctx.font = `500 ${px(11)}px "JetBrains Mono", monospace`;
  ctx.fillStyle = "rgba(242,243,245,0.8)";
  const nav = ["Skills", "Selling", "History", "Contact"];
  let nx = W - padX;
  for (let i = nav.length - 1; i >= 0; i--) {
    const label = nav[i]!.toUpperCase();
    const wdt = ctx.measureText(label).width;
    nx -= wdt;
    ctx.fillText(label, nx, px(46));
    nx -= px(24);
  }

  // ---- wordmark ----
  const heroSize = 16 * vw;
  ctx.font = `700 ${heroSize}px "Space Grotesk", sans-serif`;
  ctx.fillStyle = FG;
  ctx.shadowColor = "rgba(94,199,238,0.35)";
  ctx.shadowBlur = px(60);
  const wordBaseline = H * 0.62;
  ctx.fillText("aevill", padX, wordBaseline);
  ctx.shadowBlur = 0;

  // ---- intro copy ----
  ctx.font = `400 ${px(20)}px "Inter Tight", sans-serif`;
  ctx.fillStyle = MUTED;
  const copy = [
    "Developer, designer and server operator. I've done pretty",
    "much everything at one point — code, infrastructure,",
    "branding, motion, moderation.",
  ];
  copy.forEach((line, i) => ctx.fillText(line, padX, wordBaseline + px(56) + i * px(26)));

  // ---- "Currently" card ----
  const cardW = px(360);
  const cardH = px(150);
  const cardX = W - padX - cardW;
  const cardY = wordBaseline + px(30);
  ctx.fillStyle = CARD;
  ctx.fillRect(cardX, cardY, cardW, cardH);
  ctx.strokeStyle = "rgba(94,199,238,0.5)";
  ctx.lineWidth = Math.max(1, px(1));
  ctx.strokeRect(cardX, cardY, cardW, cardH);

  ctx.fillStyle = PRIMARY;
  ctx.beginPath();
  ctx.arc(cardX + px(24) + px(3), cardY + px(34), px(3), 0, Math.PI * 2);
  ctx.fill();
  ctx.font = `500 ${px(11)}px "JetBrains Mono", monospace`;
  ctx.fillStyle = MUTED;
  ctx.fillText("CURRENTLY", cardX + px(38), cardY + px(38));

  ctx.font = `700 ${px(34)}px "Space Grotesk", sans-serif`;
  ctx.fillStyle = PRIMARY;
  ctx.fillText("Manager — Synergy FFA", cardX + px(24), cardY + px(90));

  ctx.font = `500 ${px(11)}px "JetBrains Mono", monospace`;
  ctx.fillStyle = MUTED;
  ctx.fillText("ALSO MODERATOR · NOVATIERS", cardX + px(24), cardY + px(122));

  // ---- scroll row ----
  ctx.font = `500 ${px(11)}px "JetBrains Mono", monospace`;
  ctx.fillStyle = MUTED;
  ctx.fillText("SCROLL", padX, H - px(40));
  ctx.fillStyle = PRIMARY;
  ctx.fillRect(padX + px(70), H - px(44), px(64), Math.max(1, px(1)));

  // vignette matching the live page
  const grd = ctx.createRadialGradient(W / 2, 0, 0, W / 2, 0, Math.max(W, H) * 1.1);
  grd.addColorStop(0.35, "rgba(0,0,0,0)");
  grd.addColorStop(1, "rgba(13,15,20,0.78)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);
}

/**
 * Cinematic flythrough: the camera travels through a deep-space corridor of
 * stars, nebulae, asteroids and planets, then locks onto a floating holographic
 * panel showing the real site and flies straight into it, ending perfectly
 * aligned so the panel fills the frame exactly like the live page.
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

    const FOV_END = 62;
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x04060c, 0.0055);
    const camera = new THREE.PerspectiveCamera(FOV_END, w() / h(), 0.1, 1200);

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
    const PH = 40; // panel height in world units (width follows viewport aspect)

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
      grp.add(new THREE.Mesh(g, rockMat));
      grp.add(new THREE.Mesh(g, rockEdge));
      const a = Math.random() * Math.PI * 2;
      const r = 16 + Math.random() * 90;
      grp.scale.setScalar(0.8 + Math.random() * 5);
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

    /* ---------------- the website panel (1:1 hero replica) ---------------- */
    const heroCanvas = document.createElement("canvas");
    const heroCtx = heroCanvas.getContext("2d")!;
    const heroTex = new THREE.CanvasTexture(heroCanvas);
    heroTex.colorSpace = THREE.SRGBColorSpace;
    heroTex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    disposables.push(heroTex);

    const renderHero = () => {
      const dpr = Math.min(window.devicePixelRatio, 2);
      heroCanvas.width = Math.round(w() * dpr);
      heroCanvas.height = Math.round(h() * dpr);
      drawHero(heroCtx, heroCanvas.width, heroCanvas.height);
      heroTex.needsUpdate = true;
    };
    renderHero();
    if (document.fonts?.ready) document.fonts.ready.then(renderHero).catch(() => {});

    const panel = new THREE.Group();
    panel.position.set(18, 6, PANEL_Z);

    const faceGeo = new THREE.PlaneGeometry(1, 1);
    const faceMat = new THREE.MeshBasicMaterial({ map: heroTex, toneMapped: false, transparent: true });
    const face = new THREE.Mesh(faceGeo, faceMat);
    face.position.z = 0.9;
    panel.add(face);
    disposables.push(faceGeo, faceMat);

    const slabGeo = new THREE.BoxGeometry(1, 1, 1);
    const slabMat = new THREE.MeshStandardMaterial({
      color: 0x0a1220,
      roughness: 0.25,
      metalness: 0.6,
      emissive: 0x0b2438,
      transparent: true,
      opacity: 0.92,
    });
    const slab = new THREE.Mesh(slabGeo, slabMat);
    panel.add(slab);
    disposables.push(slabGeo, slabMat);

    const frameGeo = new THREE.BoxGeometry(1, 1, 1);
    const frameMat = new THREE.MeshBasicMaterial({ color: 0x7fe3ff, wireframe: true, transparent: true, opacity: 0.55 });
    const frame = new THREE.Mesh(frameGeo, frameMat);
    panel.add(frame);
    disposables.push(frameGeo, frameMat);

    const glowMat = new THREE.SpriteMaterial({
      map: nebTex,
      color: 0x6fd6ff,
      transparent: true,
      opacity: 0.35,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const halo = new THREE.Sprite(glowMat);
    halo.position.z = -3;
    panel.add(halo);
    disposables.push(glowMat);

    let PW = PH * (w() / h());
    const layoutPanel = () => {
      PW = PH * (w() / h());
      face.scale.set(PW, PH, 1);
      slab.scale.set(PW, PH, 1.6);
      frame.scale.set(PW + 1.6, PH + 1.6, 2.2);
      halo.scale.set(PW * 2.2, PH * 2.6, 1);
    };
    layoutPanel();

    panel.rotation.set(0.22, -0.62, 0.07);
    panel.visible = false;
    scene.add(panel);

    const panelLight = new THREE.PointLight(0x7fe3ff, 3000, 400);
    scene.add(panelLight);

    const onResize = () => {
      camera.aspect = w() / h();
      camera.updateProjectionMatrix();
      renderer.setSize(w(), h());
      layoutPanel();
      renderHero();
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
      const align = clamp01((p - 0.5) / 0.5); // 0 cruising -> 1 locked on
      const ae = easeInOut(align);
      const wander = 1 - ae;

      // panel squares up to the camera
      panel.rotation.x = lerp(0.22, 0, ae);
      panel.rotation.y = lerp(-0.62, 0, ae) + Math.sin(t * 0.5) * 0.02 * wander;
      panel.rotation.z = lerp(0.07, 0, ae) + Math.sin(t * 0.4) * 0.01 * wander;
      panel.position.x = lerp(18, 0, ae) ;
      panel.position.y = lerp(6, 0, ae) + Math.sin(t * 0.7) * 0.6 * wander;
      panel.visible = p > 0.16;

      // fov opens wide for speed, settles at FOV_END so the final frame is exact
      camera.fov = lerp(88, FOV_END, easeInOut(clamp01(p / 0.85)));
      camera.updateProjectionMatrix();

      // distance at which the panel exactly fills the viewport
      const fillDist = PH / 2 / Math.tan(THREE.MathUtils.degToRad(FOV_END) / 2);
      const endZ = PANEL_Z + 0.9 + fillDist;
      const camZ = lerp(START_Z, endZ, easeInOut(p));

      camera.position.set(
        lerp(Math.sin(t * 0.35) * 9 + Math.sin(t * 0.13) * 5, 0, ae) * wander + panel.position.x * ae,
        lerp(Math.cos(t * 0.27) * 6 + Math.sin(t * 0.09) * 4, 0, ae) * wander + panel.position.y * ae,
        camZ,
      );
      camera.rotation.z = Math.sin(t * 0.2) * 0.09 * wander;
      camera.rotation.y = Math.sin(t * 0.18) * 0.06 * wander;
      camera.rotation.x = Math.cos(t * 0.15) * 0.05 * wander;

      // hologram dressing dissolves in the last stretch so only the real UI remains
      const shed = clamp01((p - 0.86) / 0.14);
      frameMat.opacity = (0.35 + 0.5 * ae) * (1 - shed);
      glowMat.opacity = (0.2 + 0.45 * ae) * (1 - shed);
      slabMat.opacity = 0.92 * (1 - shed);
      panelLight.position.set(panel.position.x, panel.position.y, PANEL_Z + 60);
      panelLight.intensity = (1200 + 5000 * ae) * (1 - shed);
      scene.fog!.color.setHex(0x04060c);
      (scene.fog as THREE.FogExp2).density = 0.0055 * (1 - shed);

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
