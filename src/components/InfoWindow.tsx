import { useEffect, useRef, type ReactNode } from "react";

/**
 * A floating "3D reactive window" — tilts toward the pointer, glass surface,
 * used for skill detail popovers.
 */
export default function InfoWindow({
  title,
  kicker,
  children,
  onClose,
}: {
  title: string;
  kicker?: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let rx = 0,
      ry = 0,
      tx = 0,
      ty = 0,
      raf = 0,
      last = performance.now();
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth) * 2 - 1;
      ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const k = Math.exp(-7 * dt);
      ry = tx * 12 + (ry - tx * 12) * k;
      rx = -ty * 10 + (rx - -ty * 10) * k;
      el.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateZ(60px)`;
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
      className="fixed inset-0 z-40 flex items-center justify-center px-6"
      style={{ perspective: "1200px" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        aria-hidden="true"
        className="fade-up absolute inset-0"
        style={{ background: "color-mix(in oklab, var(--background) 72%, transparent)", backdropFilter: "blur(6px)" }}
      />
      <div
        ref={cardRef}
        onClick={(e) => e.stopPropagation()}
        className="fade-up relative w-full max-w-lg border border-hairline p-8"
        style={{
          transformStyle: "preserve-3d",
          background: "color-mix(in oklab, var(--card) 78%, transparent)",
          boxShadow: "0 40px 120px -30px color-mix(in oklab, var(--primary) 45%, transparent), var(--accent-glow)",
        }}
      >
        <div className="flex items-start justify-between gap-6">
          <div>
            {kicker && <span className="label-mono">{kicker}</span>}
            <h3 className="text-display mt-3 text-3xl md:text-4xl">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="label-mono link-underline shrink-0 pt-1 hover:text-primary"
          >
            Close
          </button>
        </div>
        <div className="mt-6 leading-relaxed text-muted-foreground">{children}</div>
        <span
          aria-hidden="true"
          className="absolute -top-px left-0 h-px w-1/2 bg-primary"
          style={{ boxShadow: "var(--accent-glow)" }}
        />
      </div>
    </div>
  );
}
