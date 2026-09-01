import { useEffect, useRef, useState, type ElementType } from "react";

const CHARS = "!<>-_\\/[]{}—=+*^?#________";

/**
 * Text that briefly scrambles into random characters on hover before resolving
 * back to the original string.
 */
export default function ScrambleText({
  text,
  as: Tag = "span",
  className,
  trigger = "hover",
  speed = 1,
}: {
  text: string;
  as?: ElementType;
  className?: string;
  /** "hover" scrambles on pointer enter, "mount" runs once when visible */
  trigger?: "hover" | "mount";
  speed?: number;
}) {
  const [out, setOut] = useState(text);
  const raf = useRef(0);
  const running = useRef(false);

  useEffect(() => setOut(text), [text]);

  const run = () => {
    if (running.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    running.current = true;
    const chars = text.split("");
    const start = performance.now();
    const total = 260 + chars.length * 26 / speed;

    const step = (now: number) => {
      const p = Math.min((now - start) / total, 1);
      const resolved = Math.floor(p * chars.length * 1.15);
      setOut(
        chars
          .map((c, i) => {
            if (c === " ") return " ";
            if (i < resolved) return c;
            return CHARS[Math.floor(Math.random() * CHARS.length)]!;
          })
          .join(""),
      );
      if (p < 1) {
        raf.current = requestAnimationFrame(step);
      } else {
        setOut(text);
        running.current = false;
      }
    };
    raf.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    if (trigger === "mount") run();
    return () => cancelAnimationFrame(raf.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Tag className={className} onPointerEnter={trigger === "hover" ? run : undefined}>
      {out}
    </Tag>
  );
}
