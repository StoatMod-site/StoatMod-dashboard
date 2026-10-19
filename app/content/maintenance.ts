// Planned maintenance shown on the status page. A notice disappears once `ends` has passed.
// `services` uses the status page service IDs (bot, local_ai, api, dashboard, database, email).
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
    starts: "2026-10-21T00:00:00Z",
    ends: "2026-10-22T00:00:00Z",
    when: "21 October 2026 · start time and length not yet known",
    summary: "The provider that hosts our AI server has scheduled maintenance on 21 October 2026. They have not said when it starts or how long it will last, so it could happen at any time that day.",
    impact: "While it runs, AI checks of messages and images may pause. Commands, link protection, join protection and the dashboard keep working, and AI checks restart on their own when the server is back. You don't need to do anything.",
  },
];
