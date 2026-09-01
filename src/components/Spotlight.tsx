import { useEffect, useRef } from "react";

/** Soft light that follows the cursor and subtly illuminates the page around it. */
export default function Spotlight() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let cx = x;
    let cy = y;
    let raf = 0;
    let last = performance.now();

    const onMove = (e: PointerEvent) => {
      x = e.clientX;
      y = e.clientY;
      el.style.opacity = "1";
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const k = Math.exp(-9 * dt);
      cx = x + (cx - x) * k;
      cy = y + (cy - y) * k;
      el.style.transform = `translate3d(${cx - 320}px, ${cy - 320}px, 0)`;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    loop();
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed top-0 left-0 z-[2] h-[640px] w-[640px] opacity-0 transition-opacity duration-500"
      style={{
        background:
          "radial-gradient(circle, color-mix(in oklab, var(--primary) 16%, transparent) 0%, color-mix(in oklab, var(--primary) 6%, transparent) 35%, transparent 68%)",
        mixBlendMode: "screen",
        willChange: "transform",
      }}
    />
  );
}
