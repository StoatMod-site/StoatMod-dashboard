"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./FeaturePages.module.css";

export function FeatureCommand({ command, description }: { command: string; description?: string }) {
  const [state, setState] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);
  async function copy() {
    if (timer.current) clearTimeout(timer.current);
    try { await navigator.clipboard.writeText(command); setState("copied"); }
    catch { setState("failed"); }
    timer.current = setTimeout(() => setState("idle"), 3000);
  }
  return <div className={styles.command}>
    <div><code>{command}</code><button type="button" onClick={() => void copy()} aria-label={`Copy command: ${command}`}>{state === "copied" ? "Copied ✓" : "Copy"}</button></div>
    {description && <p>{description}</p>}
    <span className={state === "failed" ? styles.copyError : styles.srOnly} role="status">{state === "failed" ? "Copy unavailable. Select the command text to copy it manually." : state === "copied" ? "Command copied to clipboard." : ""}</span>
  </div>;
}
