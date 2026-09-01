import { useEffect, type ReactNode } from "react";

/**
 * Tracks scroll velocity and exposes it as CSS variables on <html>:
 *  --sv       signed, roughly -1..1
 *  --sv-skew  degrees of skew for velocity distortion
 * Children get a subtle skew/scale so the page reacts to fast scrolling.
 */
export default function ScrollVelocity({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    let lastY = window.scrollY;
    let v = 0;
    let raf = 0;
    let last = performance.now();

    const loop = () => {
      raf = requestAnimationFrame(loop);
      const now = performance.now();
      const dt = Math.max(Math.min((now - last) / 1000, 0.05), 0.001);
      last = now;
      const y = window.scrollY;
      const inst = (y - lastY) / dt / 2600; // normalized
      lastY = y;
      const k = Math.exp(-7 * dt);
      v = inst + (v - inst) * k;
      const c = Math.max(-1, Math.min(1, v));
      root.style.setProperty("--sv", c.toFixed(4));
      root.style.setProperty("--sv-skew", `${(c * 2.6).toFixed(3)}deg`);
      root.style.setProperty("--sv-blur", `${(Math.abs(c) * 1.6).toFixed(2)}px`);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      root.style.removeProperty("--sv");
      root.style.removeProperty("--sv-skew");
      root.style.removeProperty("--sv-blur");
    };
  }, []);

  return (
    <div
      style={{
        transform: "skewY(var(--sv-skew, 0deg)) scaleY(calc(1 + var(--sv, 0) * 0.012))",
        transformOrigin: "50% 50%",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}
