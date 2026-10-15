"use client";

import { useEffect, useRef } from "react";

export function PointerGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const glow = glowRef.current;
    if (!glow) return;

    let animationFrame = 0;
    const followPointer = (event: PointerEvent) => {
      const x = event.clientX;
      const y = event.clientY;
      cancelAnimationFrame(animationFrame);
      animationFrame = requestAnimationFrame(() => {
        glow.style.setProperty("--pointer-x", `${x}px`);
        glow.style.setProperty("--pointer-y", `${y}px`);
        glow.dataset.active = "true";
      });
    };

    window.addEventListener("pointermove", followPointer, { passive: true });
    return () => {
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("pointermove", followPointer);
    };
  }, []);

  return <div ref={glowRef} className="site-glow" aria-hidden="true" />;
}
