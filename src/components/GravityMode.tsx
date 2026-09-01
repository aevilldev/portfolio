import { useEffect } from "react";

type Body = {
  el: HTMLElement;
  x: number;
  y: number;
  w: number;
  h: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  rest: number;
};

/**
 * Easter egg: rips every visible chunk of the page out of layout and drops it
 * with real physics — falling, bouncing, tumbling and piling up on the floor.
 */
export default function GravityMode({ onExit }: { onExit: () => void }) {
  useEffect(() => {
    const SELECTOR =
      "h1,h2,h3,h4,p,li,span.label-mono,a.label-mono,dt,dd,button,img,.gravity-chunk";
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(SELECTOR)).filter((el) => {
      if (el.closest("[data-no-gravity]")) return false;
      if (el.querySelector(SELECTOR)) return false; // leaf-ish only
      const r = el.getBoundingClientRect();
      return (
        r.width > 4 &&
        r.height > 4 &&
        r.bottom > -200 &&
        r.top < window.innerHeight + 400
      );
    });

    const scrollY = window.scrollY;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const layer = document.createElement("div");
    layer.style.cssText =
      "position:fixed;inset:0;z-index:60;pointer-events:none;overflow:hidden";
    document.body.appendChild(layer);

    const bodies: Body[] = nodes.map((el) => {
      const r = el.getBoundingClientRect();
      const clone = el.cloneNode(true) as HTMLElement;
      const cs = getComputedStyle(el);
      clone.style.cssText += `;position:absolute;margin:0;left:0;top:0;width:${r.width}px;height:${r.height}px;color:${cs.color};font:${cs.font};letter-spacing:${cs.letterSpacing};text-transform:${cs.textTransform};will-change:transform;`;
      layer.appendChild(clone);
      el.style.visibility = "hidden";
      return {
        el: clone,
        x: r.left,
        y: r.top,
        w: r.width,
        h: r.height,
        vx: (Math.random() - 0.5) * 90,
        vy: -Math.random() * 80,
        rot: 0,
        vr: (Math.random() - 0.5) * 120,
        rest: 0.42 + Math.random() * 0.22,
      };
    });

    let raf = 0;
    let last = performance.now();
    const G = 1700;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.033);
      last = now;
      const floor = window.innerHeight;

      for (const b of bodies) {
        b.vy += G * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        b.rot += b.vr * dt;

        if (b.y + b.h > floor) {
          b.y = floor - b.h;
          b.vy = -b.vy * b.rest;
          b.vx *= 0.82;
          b.vr *= 0.6;
          if (Math.abs(b.vy) < 40) {
            b.vy = 0;
            b.vr *= 0.4;
            b.rot *= 0.86;
          }
        }
        if (b.x < 0) {
          b.x = 0;
          b.vx = -b.vx * 0.5;
        }
        if (b.x + b.w > window.innerWidth) {
          b.x = window.innerWidth - b.w;
          b.vx = -b.vx * 0.5;
        }
        b.el.style.transform = `translate3d(${b.x.toFixed(1)}px, ${b.y.toFixed(1)}px, 0) rotate(${b.rot.toFixed(2)}deg)`;
      }
    };
    tick();

    const kick = (e: PointerEvent) => {
      for (const b of bodies) {
        const dx = b.x + b.w / 2 - e.clientX;
        const dy = b.y + b.h / 2 - e.clientY;
        const d2 = dx * dx + dy * dy;
        if (d2 < 240 * 240) {
          const f = 26000 / (d2 + 900);
          b.vx += dx * f * 0.06;
          b.vy += dy * f * 0.06 - 60;
          b.vr += (Math.random() - 0.5) * 400;
        }
      }
    };
    window.addEventListener("pointerdown", kick);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onExit();
    };
    window.addEventListener("keydown", onKey);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointerdown", kick);
      window.removeEventListener("keydown", onKey);
      layer.remove();
      for (const el of nodes) el.style.visibility = "";
      document.body.style.overflow = prevOverflow;
      window.scrollTo(0, scrollY);
    };
  }, [onExit]);

  return (
    <div
      data-no-gravity
      className="fixed bottom-6 left-1/2 z-[61] -translate-x-1/2 rounded-sm border border-primary/60 bg-background/70 px-4 py-2 backdrop-blur"
    >
      <button
        type="button"
        onClick={onExit}
        className="label-mono text-primary"
        data-no-gravity
      >
        gravity on — click to shove, press esc to restore
      </button>
    </div>
  );
}
