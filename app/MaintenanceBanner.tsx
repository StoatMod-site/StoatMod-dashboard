"use client";

import { useEffect, useState } from "react";
import { plannedMaintenance } from "./content/maintenance";

/** Shows planned maintenance in the server dashboard while its window is running (on the day), linking to the status page. */
export function MaintenanceBanner() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const initial = window.setTimeout(tick, 0);
    const timer = window.setInterval(tick, 60_000);
    return () => { window.clearTimeout(initial); window.clearInterval(timer); };
  }, []);
  if (now === null) return null;
  const active = plannedMaintenance.filter((item) => now >= Date.parse(item.starts) && now < Date.parse(item.ends));
  return <>{active.map((item) => <aside className="dashboard-global-announcement dashboard-maintenance" role="status" aria-label="Planned maintenance" key={item.id}><div><span aria-hidden="true">!</span><div><p className="eyebrow">Planned maintenance today</p><h2>{item.title}</h2><p>{item.impact}</p><a href="/status">See live status →</a></div></div></aside>)}</>;
}
