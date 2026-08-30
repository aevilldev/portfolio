import { useEffect, useState } from "react";
import IntroScene from "./IntroScene";

const NAME = "aevill".split("");

export default function Intro({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const DURATION = 5200;

    const step = (now: number) => {
      const p = Math.min((now - start) / DURATION, 1);
      const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
      setCount(Math.round(eased * 100));
      if (p < 1) {
        raf = requestAnimationFrame(step);
      } else {
        setLeaving(true);
        window.setTimeout(onDone, 900);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  // fade the overlay chrome out once the camera locks onto the 3D panel
  const align = Math.min(1, Math.max(0, (count / 100 - 0.55) / 0.35));
  const chrome = 1 - align;

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-background"
      style={{
        opacity: leaving ? 0 : 1,
        transform: leaving ? "scale(1.6)" : "scale(1)",
        filter: leaving ? "blur(10px) brightness(1.6)" : "none",
        transition:
          "transform 0.9s var(--ease-in-out-quart), opacity 0.9s var(--ease-in-out-quart), filter 0.9s linear",
      }}
    >
      <IntroScene progress={count} />


      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(90% 60% at 50% 55%, transparent 20%, color-mix(in oklab, var(--background) 85%, transparent) 100%)",
        }}
      />

      <div
        className="relative flex h-full flex-col justify-between px-6 py-8 md:px-12"
        style={{ perspective: "1000px" }}
      >
        <div className="flex items-start justify-between">
          <span className="label-mono">aevill — portfolio</span>
          <span className="label-mono">{String(count).padStart(3, "0")}</span>
        </div>

        <div className="flex items-end justify-center overflow-hidden" style={{ perspective: "900px" }}>
          <h1
            className="text-display flex text-[18vw] leading-none md:text-[13vw]"
            style={{
              transformStyle: "preserve-3d",
              transform: `rotateX(${(1 - count / 100) * 26}deg) translateZ(${(count / 100) * 60 - 60}px)`,
              transition: "transform 0.4s linear",
              textShadow: "0 0 80px color-mix(in oklab, var(--primary) 45%, transparent)",
            }}
          >
            {NAME.map((ch, i) => (
              <span
                key={i}
                className="inline-block"
                style={{
                  transform:
                    count > (i + 1) * 14
                      ? "translateY(0) rotateY(0deg)"
                      : "translateY(115%) rotateY(70deg)",
                  opacity: count > (i + 1) * 14 ? 1 : 0,
                  transition: "transform 0.9s var(--ease-out-quint), opacity 0.6s linear",
                }}
              >
                {ch}
              </span>
            ))}
          </h1>
        </div>

        <div>
          <div className="h-px w-full bg-hairline">
            <div
              className="h-px bg-primary"
              style={{ width: `${count}%`, boxShadow: "var(--accent-glow)" }}
            />
          </div>
          <div className="mt-3 flex justify-between">
            <span className="label-mono">entering orbit</span>
            <span className="label-mono">webgl</span>
          </div>
        </div>
      </div>
    </div>
  );
}
