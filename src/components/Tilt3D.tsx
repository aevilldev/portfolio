import { useEffect, useRef, type ReactNode } from "react";

/**
 * Wraps children in a perspective container that tilts in 3D toward the pointer.
 * Purely decorative; disabled for reduced motion and touch/small screens.
 */
export default function Tilt3D({
  children,
  className,
  strength = 10,
  depth = 40,
}: {
  children: ReactNode;
  className?: string;
  /** max rotation in degrees */
  strength?: number;
  /** translateZ push in px */
  depth?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    let rx = 0;
    let ry = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;
    let last = performance.now();

    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      tx = Math.max(-1, Math.min(1, (e.clientX - cx) / (window.innerWidth / 2)));
      ty = Math.max(-1, Math.min(1, (e.clientY - cy) / (window.innerHeight / 2)));
    };

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const k = Math.exp(-6 * dt);
      ry = tx * strength + (ry - tx * strength) * k;
      rx = -ty * strength + (rx - -ty * strength) * k;
      el.style.transform = `rotateX(${rx.toFixed(3)}deg) rotateY(${ry.toFixed(3)}deg) translateZ(${depth}px)`;
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    loop();
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [strength, depth]);

  return (
    <div className={className} style={{ perspective: "900px", perspectiveOrigin: "50% 50%" }}>
      <div ref={ref} style={{ transformStyle: "preserve-3d", willChange: "transform" }}>
        {children}
      </div>
    </div>
  );
}
