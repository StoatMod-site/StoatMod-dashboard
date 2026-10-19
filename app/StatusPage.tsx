"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Public links use browser navigation because the production client router fails. */

import { pluralize } from "./lib/plural";
import { useEffect, useState, type ReactNode } from "react";
import { PublicFooter } from "./PublicFooter";
import { SiteNav } from "./SiteNav";
import { api } from "./lib/api";
import { plannedMaintenance } from "./content/maintenance";
import styles from "./StatusPage.module.css";

type Health = "operational" | "degraded" | "outage" | "unknown";
type Service = { id: string; name: string; status: Health; detail: string; updated_at: string | null; model_name?: string };
type Day = { date: string; status: Health; observed_seconds: number; outage_seconds: number; degraded_seconds: number; restart_seconds: number; coverage_percent: number };
type ServiceHistory = { days: Day[]; uptime_percent: number | null; observed_seconds: number; outage_seconds: number };
type Incident = { id: number; service_id: string; service_name: string; status: Health; started_at: string; ended_at: string | null; duration_seconds: number; resolution: string | null; source: string };
type StatusResponse = { overall: Health; checked_at: string; services: Service[]; history?: { available: boolean; window_days: number; monitoring_since: string | null; last_check_at: string | null; services: Record<string, ServiceHistory>; incidents: Incident[]; incident_count: number } };

const serviceNames = [["bot", "Stoatmod bot"], ["local_ai", "Local AI model"], ["api", "Public API"], ["dashboard", "Moderator dashboard"], ["database", "Moderation database"], ["email", "Email service"]];
const labels: Record<Health, string> = { operational: "Operational", degraded: "Degraded", outage: "Disruption", unknown: "No data" };
const placeholders: Service[] = serviceNames.map(([id, name]) => ({ id, name, status: "unknown", detail: "Waiting for a health report…", updated_at: null }));
const colors: Record<Health, string> = { operational: "var(--success)", degraded: "var(--warning)", outage: "var(--danger)", unknown: "var(--status-empty)" };

function dateTime(value: string | null | undefined, short = false) {
  if (!value || !Number.isFinite(Date.parse(value))) return "Not yet recorded";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", ...(short ? {} : { timeStyle: "short" as const }), timeZone: "UTC" }).format(new Date(value));
}
function duration(seconds: number) {
  if (seconds < 1) return "<1 sec";
  if (seconds < 60) return `${Math.round(seconds)} sec`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min${Math.round(seconds % 60) ? ` ${Math.round(seconds % 60)} sec` : ""}`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ${Math.floor(seconds % 3600 / 60)} min`;
  return `${Math.floor(seconds / 86400)} days ${Math.floor(seconds % 86400 / 3600)} hr`;
}
function ServiceIcon({ id }: { id: string }) {
  const paths: Record<string, ReactNode> = {
    bot: <><rect x="4" y="7" width="16" height="13" rx="4"/><path d="M12 3v4M8 13h.01M16 13h.01M9 17h6"/></>,
    local_ai: <><rect x="6" y="6" width="12" height="12" rx="3"/><path d="M9 2v4m6-4v4M9 18v4m6-4v4M2 9h4m-4 6h4m12-6h4m-4 6h4m-12-3h4"/></>,
    api: <path d="m8 6-6 6 6 6m8-12 6 6-6 6m-3-14-2 16"/>,
    dashboard: <><rect x="3" y="4" width="18" height="16" rx="3"/><path d="M3 9h18M9 9v11"/></>,
    database: <><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/></>,
    email: <><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 7 9 6 9-6"/></>,
  };
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[id] || paths.api}</svg>;
}

export function StatusPage() {
  const [data, setData] = useState<StatusResponse | null>(null);
  const [refreshing, setRefreshing] = useState(true);
  const [failed, setFailed] = useState(false);
  const [days, setDays] = useState(30);
  const [revision, setRevision] = useState(0);
  const [filter, setFilter] = useState("all");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    let pending = false;
    let disposed = false;
    let active: AbortController | null = null;
    async function refresh() {
      if (pending) return;
      pending = true;
      active = new AbortController();
      const controller = active;
      setRefreshing(true);
      const timeout = window.setTimeout(() => controller.abort(), 12_000);
      try {
        const result = await api<StatusResponse>(`/api/public/status?days=${days}`, { signal: controller.signal });
        if (!result || !Array.isArray(result.services)) throw new Error("Invalid status response");
        if (!disposed) { setData(result); setFailed(false); }
      } catch {
        if (!disposed) setFailed(true);
      } finally {
        window.clearTimeout(timeout);
        if (!disposed) setRefreshing(false);
        pending = false;
      }
    }
    const initial = window.setTimeout(() => { setNow(Date.now()); void refresh(); }, 0);
    const timer = window.setInterval(() => { setNow(Date.now()); void refresh(); }, 30_000);
    return () => { disposed = true; active?.abort(); window.clearTimeout(initial); window.clearInterval(timer); };
  }, [days, revision]);

  const services = data?.services || placeholders;
  const overall = failed ? "unknown" : data?.overall || "unknown";
  const healthy = services.filter((item) => item.status === "operational").length;
  const history = data?.history;
  const historyFresh = !!history?.last_check_at && !!data && Date.parse(data.checked_at) - Date.parse(history.last_check_at) < 90_000;
  const incidents = history?.incidents || [];
  const filtered = incidents.filter((incident) => (filter === "all" || incident.service_id === filter) && (!selectedDay || (incident.started_at.slice(0, 10) <= selectedDay && (!incident.ended_at || incident.ended_at.slice(0, 10) >= selectedDay))));
  const open = incidents.filter((incident) => !incident.resolution).length;
  // Rendered from the build until the browser knows the time, then hidden once the window has ended.
  const maintenance = plannedMaintenance.filter((item) => now === null || now < Date.parse(item.ends));
  const maintenanceServices = new Set(maintenance.flatMap((item) => item.services));
  const title = failed ? "Status updates unavailable" : !data ? "Checking our systems" : overall === "operational" ? "All systems operational" : "Some systems need attention";

  return <main className={`docs-page ${styles.page}`}>
    <SiteNav active="status" />
    <div className={styles.container}>
      <header className={styles.heading}><div><p className={styles.eyebrow}><span/> STOATMOD / SYSTEM HEALTH</p><h1>Service status<span>.</span></h1><p className={styles.intro}>A clear view of what’s running, and what happened.</p></div><a className={styles.support} href="mailto:admin@modstoat.site?subject=Stoatmod%20service%20issue">Report an issue <span aria-hidden="true">↗</span></a></header>
      <section className={styles.overview} data-state={overall} aria-label="Current service health">
        <div className={styles.overviewTop}><span className={styles.beacon} aria-hidden="true">{overall === "operational" ? "✓" : overall === "unknown" ? "·" : "!"}</span><div className={styles.overviewText} role="status" aria-live="polite"><h2>{title}</h2><p>{failed ? "We couldn’t refresh the status feed. Any history below is the last received report." : !data ? "Connecting to the live status feed…" : overall === "operational" ? "Every monitored service is responding to its latest health check." : "See the service details below for the latest available information."}</p></div><button className={styles.refresh} type="button" disabled={refreshing} onClick={() => setRevision((value) => value + 1)}><span aria-hidden="true">↻</span>{refreshing ? "Checking…" : "Refresh"}</button></div>
        <div className={styles.overviewBottom}><span><i className={styles.liveDot}/>{data && !failed ? `${healthy} of ${services.length} systems operational` : "Waiting for live status"}</span><span>{open ? pluralize(open, "active incident", "active incidents") : "Checks every 30 seconds"}</span><time dateTime={data?.checked_at}>{data ? `Updated ${dateTime(data.checked_at)} UTC` : "Awaiting first check"}</time></div>
      </section>
      {maintenance.length > 0 && <section className={styles.maintenance} aria-labelledby="maintenance-heading">
        <p className={styles.eyebrow} id="maintenance-heading">PLANNED MAINTENANCE</p>
        {maintenance.map((item) => {
          const started = now !== null && now >= Date.parse(item.starts);
          return <article key={item.id} className={styles.maintenanceItem}>
            <div className={styles.maintenanceTitle}><h2>{item.title}</h2><span data-active={started}>{started ? "Maintenance day" : "Scheduled"}</span></div>
            <p className={styles.maintenanceWhen}>{item.when}</p>
            <p>{item.summary}</p>
            <p>{item.impact}</p>
          </article>;
        })}
      </section>}
      <section className={styles.systems} aria-labelledby="systems-heading">
        <header className={styles.sectionHead}><div><p className={styles.eyebrow}>AVAILABILITY</p><h2 id="systems-heading">The systems behind Stoatmod</h2></div><div className={styles.range} aria-label="History window">{[30, 90].map((value) => <button key={value} type="button" aria-pressed={days === value} onClick={() => { setDays(value); setSelectedDay(null); }}>{value} days</button>)}</div></header>
        <div className={styles.ledger}>{services.map((item) => {
          const serviceHistory = history?.services[item.id];
          const state = failed ? "unknown" : item.status;
          const bars = serviceHistory?.days || Array.from({ length: days }, (_, index) => ({ date: `unrecorded-${index}`, status: "unknown" as Health, coverage_percent: 0, observed_seconds: 0, outage_seconds: 0, degraded_seconds: 0, restart_seconds: 0 }));
          return <article className={styles.service} key={item.id}>
            <div className={styles.serviceInfo}><span className={styles.icon}><ServiceIcon id={item.id}/></span><div><div className={styles.serviceTitle}><h3>{item.name}</h3>{maintenanceServices.has(item.id) && <span className={styles.maintenanceTag}>Maintenance planned</span>}</div><p>{item.id === "local_ai" && item.model_name ? `${item.model_name} · ` : ""}{item.detail}</p></div></div>
            <div className={styles.serviceState} data-state={state}><span/><strong>{labels[state]}</strong></div>
            <div className={styles.history}><div className={styles.bars} style={{ gridTemplateColumns: `repeat(${bars.length}, minmax(0, 1fr))` }} aria-label={`${item.name} daily history`}>{bars.map((day) => {
              const recorded = !day.date.startsWith("unrecorded") && (day.observed_seconds > 0 || day.restart_seconds > 0);
              const summary = `${day.date}: ${labels[day.status]}. ${day.observed_seconds ? `${duration(day.observed_seconds)} monitored` : "No monitoring observations"}${day.outage_seconds ? `; ${duration(day.outage_seconds)} downtime` : ""}${day.restart_seconds ? `; ${duration(day.restart_seconds)} service restart` : ""}.`;
              return <button type="button" key={day.date} className={styles.bar} disabled={!recorded} data-state={day.status} data-restart={day.restart_seconds > 0} style={{ background: `linear-gradient(to top, ${colors[day.status]} ${day.coverage_percent}%, var(--status-empty) ${day.coverage_percent}%)` }} aria-label={summary} title={summary} onClick={() => { setFilter(item.id); setSelectedDay(day.date); document.getElementById("incident-heading")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}/>;
            })}</div><div className={styles.historyLabels}><span>{serviceHistory ? dateTime(serviceHistory.days[0]?.date, true) : "No history yet"}</span><span>Today</span></div></div>
            <div className={styles.uptime}><strong>{serviceHistory?.uptime_percent != null ? `${serviceHistory.uptime_percent.toFixed(2)}%` : "—"}</strong><span>measured uptime</span></div>
          </article>;
        })}</div>
        <div className={styles.legend}><div>{(["operational", "degraded", "outage", "unknown"] as Health[]).map((state) => <span key={state}><i style={{ background: colors[state] }}/>{state === "unknown" ? "Unrecorded" : labels[state]}</span>)}</div><p>Select a day to see its incidents. All times UTC.</p></div>
        <p className={styles.coverage}>{history?.monitoring_since ? <>Monitoring began <strong>{dateTime(history.monitoring_since)} UTC</strong>. Uptime covers observed time only; grey areas have no monitoring data.</> : "History is collecting. Earlier days stay grey until there are recorded observations."}{history?.available && !historyFresh && " Monitoring updates are delayed."}</p>
      </section>
      <section className={styles.incidents} aria-labelledby="incident-heading">
        <header className={styles.sectionHead}><div><p className={styles.eyebrow}>INCIDENT LOG</p><h2 id="incident-heading">Recent downtime <span>{history?.incident_count ?? 0}</span></h2></div><label className={styles.filter}>Filter by service<select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="all">All services</option>{serviceNames.map(([id, name]) => <option key={id} value={id}>{name}</option>)}</select></label></header>
        {selectedDay && <div className={styles.dayFilter}>Showing {dateTime(selectedDay, true)} <button type="button" onClick={() => setSelectedDay(null)}>Clear date ×</button></div>}
        {filtered.length ? <ol className={styles.incidentList}>{filtered.map((incident) => <li key={incident.id}><div className={styles.incidentDate}><time dateTime={incident.started_at}>{dateTime(incident.started_at, true)}</time><span>{incident.started_at.slice(11, 16)} UTC</span></div><div className={styles.incidentBody}><div className={styles.incidentTitle}><h3>{incident.service_name} · {incident.source === "service_log" ? "Service restart" : labels[incident.status]}</h3><span data-resolution={incident.resolution || "ongoing"}>{incident.resolution === "recovered" ? "Resolved" : incident.resolution === "monitoring_gap" ? "Monitoring gap" : incident.resolution === "changed" ? "Status changed" : "Ongoing"}</span></div><p>{incident.source === "service_log" ? "Downtime recovered from recorded service stop and start events." : incident.resolution === "monitoring_gap" ? "The service was unavailable or degraded before monitoring was interrupted. Recovery time is unknown." : incident.resolution === "recovered" ? "Health checks confirmed that the service recovered." : "Recorded by the automatic service monitor."}</p><div className={styles.incidentMeta}><span>Duration <strong>{duration(incident.duration_seconds)}</strong></span><span>{incident.ended_at ? `Ended ${dateTime(incident.ended_at)} UTC` : "Awaiting recovery"}</span><span>{incident.source === "service_log" ? "Service logs" : "Health checks"}</span></div></div></li>)}</ol> : <div className={styles.empty}><span aria-hidden="true">◎</span><div><h3>{history?.available ? "No recorded incidents in this view" : "A fresh start for status history"}</h3><p>{history?.available ? "Only observed downtime is listed. Unrecorded time is not counted as uptime." : "New health checks will build the timeline automatically."}</p></div></div>}
        {history && history.incident_count > incidents.length && <p className={styles.coverage}>Showing the latest {incidents.length} of {history.incident_count} recorded incidents in this window.</p>}
      </section>
      <aside className={styles.note}><span aria-hidden="true">i</span><div><h3>How this page is measured</h3><p>Checks run every 30 seconds from our monitoring service. Uptime excludes observed outages; degraded performance is tracked separately. Earlier restarts come from retained service logs and don’t imply continuous monitoring. Local AI is monitored independently from the moderation bot.</p></div><a href="/docs">Read the docs ↗</a></aside>
    </div><PublicFooter description="Live service health and recorded downtime for Stoatmod."/>
  </main>;
}
