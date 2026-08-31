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
        window.setTimeout(onDone, 620);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  // overlay chrome clears out before the camera locks onto the 3D panel, so the
  // last frames of the intro are the hero replica alone
  const chrome = 1 - Math.min(1, Math.max(0, (count / 100 - 0.42) / 0.28));

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-background"
      style={{
        opacity: leaving ? 0 : 1,
        transition: "opacity 0.6s linear",
      }}
    >
      <IntroScene progress={count} />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          opacity: chrome,
          background:
            "radial-gradient(90% 60% at 50% 55%, transparent 20%, color-mix(in oklab, var(--background) 85%, transparent) 100%)",
        }}
      />

      <div
        className="relative flex h-full flex-col justify-between px-6 py-8 md:px-12"
        style={{ perspective: "1000px", opacity: chrome, pointerEvents: "none" }}
      >
        <div className="flex items-start justify-between">
          <span className="label-mono">aevill — portfolio</span>
          <span className="label-mono">{String(count).padStart(3, "0")}</span>
        </div>

        <div />


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
