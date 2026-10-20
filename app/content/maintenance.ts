// Planned maintenance shown on the status page. A notice disappears once `ends` has passed.
// `services` uses the status page service IDs (bot, local_ai, api, dashboard, database, email).
// The server dashboard shows a banner from the start of the UTC day of `starts` until `ends`.
export type PlannedMaintenance = {
  id: string;
  title: string;
  services: string[];
  starts: string;
  ends: string;
  when: string;
  summary: string;
  impact: string;
};

export const plannedMaintenance: PlannedMaintenance[] = [
  {
    id: "ai-host-2026-10-21",
    title: "AI server maintenance",
    services: ["local_ai"],
    starts: "2026-10-21T18:00:00Z",
    ends: "2026-10-21T22:00:00Z",
    when: "21 October 2026 · 18:00–22:00 UTC (about 4 hours)",
    summary: "The provider that hosts our AI server will take it offline for scheduled maintenance on 21 October 2026 from 18:00 UTC for about 4 hours.",
    impact: "While it runs, AI checks of messages and images are paused. Commands, link protection, join protection and the dashboard keep working, and AI checks restart on their own when the server is back. You don't need to do anything.",
  },
];

/** Start of the UTC day on which a maintenance window begins. */
export function maintenanceDayStart(item: PlannedMaintenance): number {
  const start = new Date(item.starts);
  return Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), start.getUTCDate());
}
