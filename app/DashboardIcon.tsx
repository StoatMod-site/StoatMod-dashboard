import type { CSSProperties } from "react";

export function DashboardIcon({ name, style }: { name: string; style?: CSSProperties }) {
  const paths: Record<string, string> = {
    servers: "M3 3h18v7H3ZM3 14h18v7H3ZM6 6.5h.01M6 17.5h.01M10 6.5h8M10 17.5h8",
    privacy: "M5 11h14v10H5ZM8 11V7a4 4 0 0 1 8 0v4M12 15v2",
    ban: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M6 6l12 12",
    overview: "m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z",
    cases: "M9 4h6l2 3h4v13H3V7h4l2-3ZM3 11h18M9 11v3h6v-3",
    appeals: "M4 4h16v12H9l-5 4V4Zm4 4h8M8 12h5",
    members: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 4a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.87M13 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
    applications: "M4 4h16v16H4ZM4 5l8 7 8-7",
    activity: "M3 12h4l3-8 4 16 3-8h4",
    settings: "M4 7h16M4 17h16M8 4v6M16 14v6",
    automations: "m13 2-9 12h7l-1 8 10-12h-8Z",
    "reaction-roles": "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0M8 9h.01M16 9h.01M8 14s1 3 4 3 4-3 4-3",
    polls: "M4 20V10h4v10M10 20V4h4v16M16 20v-7h4v7",
    leaderboards: "M8 3h8v6a4 4 0 0 1-8 0ZM8 5H4v2a4 4 0 0 0 4 4M16 5h4v2a4 4 0 0 1-4 4M12 13v5M8 21h8M9 18h6",
    discovery: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0m-6-3-2 4-4 2 2-4 4-2Z",
    support: "M12 3 3 7v5c0 5 9 9 9 9s9-4 9-9V7ZM12 8v6M12 17h.01",
    search: "M21 21l-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
  };
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.65" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}><path d={paths[name] || paths.cases}/></svg>;
}
