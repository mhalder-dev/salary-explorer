"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Stat-Led hero figure: counts from 0 to `value` over ~500ms on mount.
 * Respects prefers-reduced-motion (renders the final value immediately).
 * Server-renders the final value so SEO/no-JS always sees the real number.
 */
export default function StatFigure({
  value,
  prefix = "",
  className = "",
}: {
  value: number;
  prefix?: string;
  className?: string;
}) {
  const [display, setDisplay] = useState(value);
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const duration = 500;
    const start = performance.now();
    let raf: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
      setDisplay(Math.round(value * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick); // first tick renders ≈0, then counts up
    return () => cancelAnimationFrame(raf);
  }, [value]);

  return (
    <span className={`tnum ${className}`}>
      {prefix}
      {display.toLocaleString("en-US")}
    </span>
  );
}
