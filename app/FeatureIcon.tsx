import type { ReactNode } from "react";

export function FeatureIcon({ name }: { name: string }) {
  const icons: Record<string, ReactNode> = {
    automod: <><path d="m12 3 8 3v5c0 5-4 8-8 10-4-2-8-5-8-10V6z"/><path d="m8 12 3 3 5-6"/></>,
    "spam-protection": <><path d="M5 4h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9l-5 3v-3a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M7 9h10M7 13h6"/></>,
    "link-protection": <><path d="m10 13 4-4m-6 6-2 2a3.5 3.5 0 0 1-5-5l4-4a3.5 3.5 0 0 1 5 0m4 8a3.5 3.5 0 0 0 5 0l4-4a3.5 3.5 0 0 0-5-5l-2 2" transform="translate(0 -1)"/></>,
    "image-moderation": <><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1.5"/><path d="m3 17 5-5 4 4 4-6 5 7"/></>,
    "join-protection": <><path d="M14 21H4V3h10v4M14 17v4m-4-9h12m-4-4 4 4-4 4"/></>,
    "moderation-cases": <><path d="M14 3H5v18h14V8zM14 3v5h5M8 12h8M8 16h5"/></>,
    "automatic-roles": <><circle cx="9" cy="7" r="4"/><path d="M2 21v-3a7 7 0 0 1 12-5m4 0 4 2v3l-4 3-4-3v-3z"/></>,
    "moderation-statistics": <><path d="M3 3v18h18M7 16v-4m5 4V7m5 9V4"/></>,
    appeals: <><path d="M4 4h16v12H9l-5 4zM8 8h8M8 12h5"/></>,
  };
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icons[name] || icons.automod}</svg>;
}
