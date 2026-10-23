"use client";

import { useCallback, useEffect, useState, type ChangeEvent } from "react";
import { api, apiBase, formApi } from "./lib/api";
import styles from "./DiscoveryExtras.module.css";

type Edit = { id: number; status: "live" | "held" | "approved" | "rejected" | "reverted" | "withdrawn" | "superseded"; reason: string; created_at: string; changed: string[] };
type DayStats = { day: string; views: number; joins: number; link_visits: number };
type Totals = { views: number; joins: number; link_visits: number };
export type DiscoveryStats = { days: DayStats[]; totals: Totals; week: Totals; previous_week: Totals; sources: Record<"search" | "discovery" | "stoat" | "direct" | "other", number>; join_rate: number | null };
export type DiscoveryExtrasState = {
  profile: { language: string; categories: string[]; links: string[]; verified_tier: string | null; bump_reminders: boolean; weekly_digest: boolean };
  verified: { tier: string; label: string } | null;
  verification_request: { id: number; tier: string; status: "pending" | "approved" | "denied" | "withdrawn"; submitted_at: string; reviewed_at: string | null; review_note: string | null } | null;
  vanity: { slug: string; created_at: string } | null;
  media: { logo_url: string | null; banner_url: string | null };
  stats: DiscoveryStats;
  held_edit: Edit | null;
  edits: Edit[];
  options: { languages: string[]; categories: string[]; verification_tiers: Record<string, string>; information_max: number; max_links: number; max_categories: number };
};

const fieldNames: Record<string, string> = { description: "description", information: "information", invite_url: "invite", tags: "tags", language: "language", categories: "categories", links: "links" };
const sourceNames: Record<keyof DiscoveryStats["sources"], string> = { search: "Search engines", discovery: "Stoatmod Discovery", stoat: "Stoat", direct: "Direct or apps", other: "Other websites" };

function shortDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(value + (value.length === 10 ? "T00:00:00Z" : "")));
}

function mediaSrc(path: string | null) {
  return path ? apiBase() + path.replace(/^https:\/\/modstoat\.site/, "") : "";
}

export function useDiscoveryExtras(enabled: boolean) {
  const [extras, setExtras] = useState<DiscoveryExtrasState | null>(null);
  const reload = useCallback(async () => {
    try { setExtras(await api<DiscoveryExtrasState>("/api/discovery/extras")); } catch { /* the core listing still works */ }
  }, []);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    api<DiscoveryExtrasState>("/api/discovery/extras").then((value) => { if (active) setExtras(value); }).catch(() => undefined);
    return () => { active = false; };
  }, [enabled]);
  return { extras, reload };
}

export function MarkdownHelp() {
  return <details className={styles.markdownHelp}><summary>Formatting help</summary><ul><li><code># Heading</code></li><li><code>**bold**</code> and <code>*italic*</code></li><li><code>- list item</code> or <code>1. step</code></li><li><code>[link text](https://example.org)</code></li><li><code>&gt; quote</code></li></ul></details>;
}

export function HeldEditNotice({ edit, onWithdraw }: { edit: Edit; onWithdraw: () => void }) {
  return (
    <div className={styles.held} role="status">
      <strong>Your latest changes are waiting for a quick review</strong>
      <p>Automatic checks held this edit ({edit.reason}). Your current listing stays live until a Stoatmod reviewer looks at it. Saving again replaces the held edit.</p>
      <button type="button" onClick={onWithdraw}>Discard held changes</button>
    </div>
  );
}

export function RecentEdits({ edits }: { edits: Edit[] }) {
  if (!edits.length) return null;
  const label: Record<Edit["status"], string> = { live: "Live", held: "Held for review", approved: "Approved after review", rejected: "Not published", reverted: "Reverted", withdrawn: "Discarded", superseded: "Replaced" };
  return (
    <details className={styles.edits}>
      <summary>Edit history</summary>
      <ul>{edits.map((edit) => <li key={edit.id}><span>{shortDate(edit.created_at)}</span><b>{label[edit.status]}</b><small>{edit.changed.map((field) => fieldNames[field] || field).join(", ") || "no visible changes"}</small></li>)}</ul>
    </details>
  );
}

export function weekChange(current: number, previous: number) {
  if (!previous) return current ? "new this week" : "no change";
  const delta = Math.round((current - previous) / previous * 100);
  if (!delta) return "same as last week";
  return `${delta > 0 ? "+" : ""}${delta}% on last week`;
}

export function DiscoveryStatsPanel({ stats, showTiles = true }: { stats: DiscoveryStats; showTiles?: boolean }) {
  const max = Math.max(1, ...stats.days.map((day) => day.views));
  const sourceTotal = Object.values(stats.sources).reduce((sum, value) => sum + value, 0);
  const tiles: { key: keyof Totals; label: string }[] = [
    { key: "views", label: "Profile views" },
    { key: "joins", label: "Join clicks" },
    { key: "link_visits", label: "Custom link visits" },
  ];
  return (
    <section className={`panel ${styles.stats}`} aria-labelledby="discovery-stats-title">
      <div className="panel-heading"><div><p className="eyebrow">Listing statistics</p><h2 id="discovery-stats-title">How people find your listing</h2></div><span>Last 30 days</span></div>
      {showTiles && <div className={styles.tiles}>
        {tiles.map((tile) => <div key={tile.key}><span>{tile.label} · 7 days</span><strong>{stats.week[tile.key].toLocaleString()}</strong><small>{weekChange(stats.week[tile.key], stats.previous_week[tile.key])}</small></div>)}
        <div><span>Join rate · 30 days</span><strong>{stats.join_rate === null ? "—" : `${Math.round(stats.join_rate * 100)}%`}</strong><small>join clicks per profile view</small></div>
      </div>}
      <figure className={styles.chart}>
        <figcaption>Daily profile views</figcaption>
        <div className={styles.bars} role="group" aria-label={`Daily profile views over the last 30 days, ${stats.totals.views} in total`}>
          {stats.days.map((day) => (
            <button type="button" className={styles.bar} key={day.day} aria-label={`${shortDate(day.day)}: ${day.views} views, ${day.joins} join clicks`}>
              <span style={{ height: `${Math.max(day.views ? 4 : 0, day.views / max * 100)}%` }} />
              <em role="tooltip"><b>{shortDate(day.day)}</b>{day.views} views · {day.joins} joins{day.link_visits ? ` · ${day.link_visits} link visits` : ""}</em>
            </button>
          ))}
        </div>
        <div className={styles.axis}><span>{shortDate(stats.days[0].day)}</span><span>{max.toLocaleString()} max</span><span>Today</span></div>
      </figure>
      <div className={styles.sources}>
        <h3>Where visitors came from</h3>
        {sourceTotal ? (Object.keys(sourceNames) as (keyof DiscoveryStats["sources"])[]).map((key) => (
          <div key={key}><span>{sourceNames[key]}</span><i><b style={{ width: `${stats.sources[key] / sourceTotal * 100}%` }} /></i><strong>{stats.sources[key].toLocaleString()}</strong></div>
        )) : <p>No visits yet. Share your listing or custom link to start seeing visitors.</p>}
      </div>
      <details className={styles.table}>
        <summary>Show as a table</summary>
        <table><thead><tr><th scope="col">Day</th><th scope="col">Views</th><th scope="col">Join clicks</th><th scope="col">Link visits</th></tr></thead>
          <tbody>{[...stats.days].reverse().map((day) => <tr key={day.day}><td>{shortDate(day.day)}</td><td>{day.views}</td><td>{day.joins}</td><td>{day.link_visits}</td></tr>)}</tbody></table>
      </details>
      <p className={styles.privacy}>Stoatmod counts daily totals only. Visitors are not tracked: no IP addresses, cookies or profiles are stored, and search-engine bots are ignored.</p>
    </section>
  );
}

export function CustomLinkPanel({ extras, approved, onChange }: { extras: DiscoveryExtrasState; approved: boolean; onChange: () => void }) {
  const [slug, setSlug] = useState(extras.vanity?.slug || "");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const current = extras.vanity?.slug;
  async function save(remove = false) {
    setBusy(true); setNotice("");
    try {
      await api("/api/discovery/vanity", remove ? { method: "DELETE" } : { method: "PUT", body: JSON.stringify({ slug }) });
      setNotice(remove ? "Custom link removed. The old link keeps working for 30 days." : "Custom link saved.");
      if (remove) setSlug("");
      onChange();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not save the custom link."); } finally { setBusy(false); }
  }
  return (
    <section className={`panel ${styles.card}`}>
      <p className="eyebrow">Custom link</p>
      <h2>modstoat.site/{current || "your-server"}</h2>
      <p>A short link that always opens your current Stoat invite. Share it anywhere; visits show in your statistics.</p>
      {approved ? <>
        <div className={styles.slugField}><span>modstoat.site/</span><input value={slug} maxLength={32} onChange={(event: ChangeEvent<HTMLInputElement>) => setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="zaboo" aria-label="Custom link" /></div>
        <small>3–32 lowercase letters, numbers and hyphens. Changing it keeps the old link working for 30 days. Brand names are kept for verified servers.</small>
        <div className={styles.actions}>
          <button className="primary-button" type="button" disabled={busy || slug.length < 3 || slug === current} onClick={() => void save()}>{busy ? "Saving…" : current ? "Change link" : "Claim link"}</button>
          {current && <button className="secondary-button" type="button" disabled={busy} onClick={() => void save(true)}>Remove</button>}
          {current && <a className={styles.copyLink} href={`/${current}`} target="_blank" rel="noreferrer">Test link ↗</a>}
        </div>
      </> : <p className={styles.locked}>Available once your listing is approved.</p>}
      {notice && <p className="save-notice" role="status">{notice}</p>}
    </section>
  );
}

export function ListingMediaPanel({ extras, onChange }: { extras: DiscoveryExtrasState; onChange: () => void }) {
  const [busy, setBusy] = useState<"" | "logo" | "banner">("");
  const [notice, setNotice] = useState("");
  async function upload(kind: "logo" | "banner", file: File | undefined) {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { setNotice("Images must be 2 MB or smaller."); return; }
    setBusy(kind); setNotice("");
    try {
      const form = new FormData();
      form.append("file", file, file.name);
      await formApi(`/api/discovery/media/${kind}`, form);
      setNotice(kind === "logo" ? "Logo updated." : "Banner updated.");
      onChange();
    } catch (error) { setNotice(error instanceof Error ? error.message : "The upload failed."); } finally { setBusy(""); }
  }
  async function remove(kind: "logo" | "banner") {
    setBusy(kind); setNotice("");
    try { await api(`/api/discovery/media/${kind}`, { method: "DELETE" }); onChange(); } catch (error) { setNotice(error instanceof Error ? error.message : "Could not remove the image."); } finally { setBusy(""); }
  }
  const slots = [
    { kind: "logo" as const, title: "Logo", help: "Square, at least 128 × 128. Shown instead of your Stoat server icon.", src: extras.media.logo_url },
    { kind: "banner" as const, title: "Banner", help: "Wide, at least 600 × 200 (cropped to 3:1). Shown at the top of your listing.", src: extras.media.banner_url },
  ];
  return (
    <section className={`panel ${styles.card}`}>
      <p className="eyebrow">Listing images</p>
      <h2>Custom logo and banner</h2>
      <p>PNG, JPEG, GIF or WebP up to 2 MB. Every image is scanned by Stoatmod&apos;s AI before it appears; GIFs use their first frame.</p>
      <div className={styles.mediaGrid}>
        {slots.map((slot) => (
          <div key={slot.kind} className={slot.kind === "logo" ? styles.logoSlot : styles.bannerSlot}>
            <div className={styles.mediaPreview}>{slot.src ? <img src={mediaSrc(slot.src)} alt={`Current ${slot.title.toLowerCase()}`} /> : <span>No custom {slot.title.toLowerCase()}</span>}</div>
            <strong>{slot.title}</strong><small>{slot.help}</small>
            <div className={styles.actions}>
              <label className="secondary-button">{busy === slot.kind ? "Checking…" : slot.src ? "Replace" : "Upload"}<input type="file" hidden accept="image/png,image/jpeg,image/gif,image/webp" disabled={Boolean(busy)} onChange={(event) => { void upload(slot.kind, event.target.files?.[0]); event.target.value = ""; }} /></label>
              {slot.src && <button type="button" className={styles.textButton} disabled={Boolean(busy)} onClick={() => void remove(slot.kind)}>Remove</button>}
            </div>
          </div>
        ))}
      </div>
      {notice && <p className="save-notice" role="status">{notice}</p>}
    </section>
  );
}

export function VerificationPanel({ extras, approved, onChange }: { extras: DiscoveryExtrasState; approved: boolean; onChange: () => void }) {
  const tiers = extras.options.verification_tiers;
  const [tier, setTier] = useState(Object.keys(tiers)[0] || "");
  const [reason, setReason] = useState("");
  const [links, setLinks] = useState("");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const request = extras.verification_request;
  async function apply() {
    setBusy(true); setNotice("");
    try {
      await api("/api/discovery/verification", { method: "POST", body: JSON.stringify({ tier, reason, links: links.split(/\s+/).filter(Boolean) }) });
      setNotice("Verification request sent. Stoatmod posts the decision to your log channel.");
      onChange();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Could not send the request."); } finally { setBusy(false); }
  }
  async function withdraw() {
    setBusy(true);
    try { await api("/api/discovery/verification", { method: "DELETE" }); onChange(); } finally { setBusy(false); }
  }
  return (
    <section className={`panel ${styles.card}`}>
      <p className="eyebrow">Verification</p>
      <h2>{extras.verified ? <>Verified <span className={styles.tick} aria-hidden="true">✓</span></> : "Get the verified tick"}</h2>
      {extras.verified ? <>
        <p>Your listing shows the verified tick as <b>{extras.verified.label}</b>.</p>
        <ul className={styles.tickPlaces}><li>Listing cards across Discovery</li><li>Your server&apos;s Discovery page</li><li>Link previews when your listing is shared</li><li>The verified servers page</li></ul>
      </>
        : request?.status === "pending" ? <><p>Your request is waiting for review. We post the decision to your log channel.</p><button type="button" className={styles.textButton} disabled={busy} onClick={() => void withdraw()}>Withdraw request</button></>
        : !approved ? <p className={styles.locked}>Available once your listing is approved.</p>
        : <>
          <p>For verified organisations, communities of high standing and impactful communities. Official Stoatmod servers are verified by the team directly.</p>
          {request?.status === "denied" && <p className={styles.locked}>Your last request was not approved{request.review_note ? `: ${request.review_note}` : "."} You can apply again 30 days after the decision.</p>}
          <label>Kind of verification<select value={tier} onChange={(event) => setTier(event.target.value)}>{Object.entries(tiers).map(([key, label]) => <option value={key} key={key}>{label}</option>)}</select></label>
          <label>Why should this server be verified? <span>{reason.length}/1500</span><textarea value={reason} maxLength={1500} onChange={(event) => setReason(event.target.value)} placeholder="Who runs the server, what it does, how long it has been active, and anything that shows its standing or impact." /></label>
          <label>Proof links (optional)<input value={links} onChange={(event) => setLinks(event.target.value)} placeholder="https://your-site.org https://social.example/you" /></label>
          <button className="primary-button" type="button" disabled={busy || reason.trim().length < 50} onClick={() => void apply()}>{busy ? "Sending…" : "Apply for verification"}</button>
        </>}
      {notice && <p className="save-notice" role="status">{notice}</p>}
    </section>
  );
}

export function DiscoveryNotificationsPanel({ extras, onChange }: { extras: DiscoveryExtrasState; onChange: () => void }) {
  const [busy, setBusy] = useState(false);
  async function save(next: { bump_reminders: boolean; weekly_digest: boolean }) {
    setBusy(true);
    try { await api("/api/discovery/notifications", { method: "PUT", body: JSON.stringify(next) }); onChange(); } finally { setBusy(false); }
  }
  const current = { bump_reminders: extras.profile.bump_reminders, weekly_digest: extras.profile.weekly_digest };
  return (
    <section className={`panel ${styles.card}`}>
      <p className="eyebrow">Log channel messages</p>
      <h2>Reminders and summaries</h2>
      <label className={styles.toggle}><input type="checkbox" checked={current.bump_reminders} disabled={busy} onChange={(event) => void save({ ...current, bump_reminders: event.target.checked })} /><span><strong>Bump reminders</strong><small>Post in your log channel when the listing can be bumped again.</small></span></label>
      <label className={styles.toggle}><input type="checkbox" checked={current.weekly_digest} disabled={busy} onChange={(event) => void save({ ...current, weekly_digest: event.target.checked })} /><span><strong>Weekly summary</strong><small>Every Monday: views, join clicks and where visitors came from.</small></span></label>
    </section>
  );
}

export function BadgePanel({ serverId, vanity }: { serverId: string; vanity: string | null }) {
  const [copied, setCopied] = useState(false);
  const target = vanity ? `https://modstoat.site/${vanity}` : "https://modstoat.site/discovery";
  const image = `https://modstoat.site/api/public/discovery/badge/${serverId}.svg`;
  const markdown = `[![Listed on Stoatmod Discovery](${image})](${target})`;
  const html = `<a href="${target}"><img src="${image}" alt="Listed on Stoatmod Discovery" height="28"></a>`;
  async function copy(text: string) {
    try { await navigator.clipboard.writeText(text); setCopied(true); window.setTimeout(() => setCopied(false), 1500); } catch { setCopied(false); }
  }
  return (
    <section className={`panel ${styles.card}`}>
      <p className="eyebrow">Share</p>
      <h2>Discovery badge</h2>
      <p>Add this badge to your website or README. It shows your live member count and links to your listing.</p>
      <img className={styles.badge} src={`${apiBase()}/api/public/discovery/badge/${serverId}.svg`} alt="Listed on Stoatmod Discovery badge" height={28} />
      <div className={styles.actions}>
        <button type="button" className="secondary-button" onClick={() => void copy(markdown)}>Copy Markdown</button>
        <button type="button" className="secondary-button" onClick={() => void copy(html)}>Copy HTML</button>
        {copied && <span role="status">Copied</span>}
      </div>
    </section>
  );
}
