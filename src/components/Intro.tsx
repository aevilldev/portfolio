import { useEffect, useState } from "react";

const NAME = "aevill".split("");

export default function Intro({ onDone }: { onDone: () => void }) {
  const [count, setCount] = useState(0);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const DURATION = 1900;

    const step = (now: number) => {
      const p = Math.min((now - start) / DURATION, 1);
      // ease-out with a couple of natural stalls
      const eased = 1 - Math.pow(1 - p, 3);
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

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-between bg-background px-6 py-8 md:px-12"
      style={{
        transform: leaving ? "translateY(-100%)" : "none",
        transition: "transform 0.9s var(--ease-in-out-quart)",
      }}
    >
      <div className="flex items-start justify-between">
        <span className="label-mono">aevill — portfolio</span>
        <span className="label-mono">{String(count).padStart(3, "0")}</span>
      </div>

      <div className="flex items-end justify-center overflow-hidden">
        <h1 className="text-display flex text-[18vw] leading-none md:text-[13vw]">
          {NAME.map((ch, i) => (
            <span
              key={i}
              className="inline-block"
              style={{
                transform: count > (i + 1) * 14 ? "translateY(0)" : "translateY(110%)",
                opacity: count > (i + 1) * 14 ? 1 : 0,
                transition: "transform 0.8s var(--ease-out-quint), opacity 0.6s linear",
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
          <span className="label-mono">loading the field</span>
          <span className="label-mono">webgl</span>
        </div>
      </div>
    </div>
  );
}
