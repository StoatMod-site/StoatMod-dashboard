"use client";

import { useLayoutEffect, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import { getThemeSnapshot, restoreTheme, setTheme, subscribeTheme } from "./lib/theme";

const getServerSnapshot = () => null;

export function ThemeToggle() {
  const pathname = usePathname();
  const theme = useSyncExternalStore(subscribeTheme, getThemeSnapshot, getServerSnapshot);
  useLayoutEffect(restoreTheme, [pathname]);

  function toggle() {
    setTheme(theme === "dark" ? "light" : "dark");
  }

  if (!theme || pathname === "/") return null;
  return <button className="theme-toggle" type="button" onClick={toggle} aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}><span aria-hidden="true">{theme === "dark" ? "☀" : "◐"}</span><b>{theme === "dark" ? "Light" : "Dark"}</b></button>;
}
