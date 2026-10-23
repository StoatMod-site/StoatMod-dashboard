"use client";

import { useEffect, useRef, useState } from "react";
import { BadgePanel, CustomLinkPanel, DiscoveryNotificationsPanel, DiscoveryStatsPanel, HeldEditNotice, ListingMediaPanel, MarkdownHelp, RecentEdits, VerificationPanel, useDiscoveryExtras, weekChange, type DiscoveryExtrasState } from "./DiscoveryExtras";
import { api, apiBase } from "./lib/api";
import { discoveryCategories, discoveryLanguages } from "./lib/discovery-catalog";
import { DiscoveryMarkdown } from "./lib/discovery-markdown";
import { safeServerMediaUrl } from "./lib/discovery-media";
import { pluralize } from "./lib/plural";
import styles from "./DiscoveryTab.module.css";

export type DiscoveryState = {
  application: {
    server_id: string; description: string; information: string; invite_url: string; tags: string[];
    status: "pending" | "approved" | "denied" | "revoked"; submitted_at: string; reviewed_at: string | null;
    review_note: string | null; revocation_note: string | null; updated_at: string; last_bumped_at?: string | null; is_revoked?: boolean;
  } | null;
  eligibility: { eligible: boolean; requirements: { stoatmod: boolean; full_permissions: boolean; server_icon: boolean; global_statistics: boolean } };
  cooldown_until: string | null;
  can_apply: boolean;
  bump_cooldown_until: string | null;
  can_bump: boolean;
};

type Server = { id: string; name: string; icon_url: string | null; member_count: number };
type Section = "listing" | "appearance" | "stats" | "promote";
type EditResult = DiscoveryState & { edit?: { status: "live" | "held"; reason: string } | null };

const requirements = [
  { key: "stoatmod" as const, label: "Stoatmod is in the server", help: "The bot must be connected and sending server snapshots." },
  { key: "full_permissions" as const, label: "All required permissions", help: "Run ~setup after granting every permission shown in the audit." },
  { key: "server_icon" as const, label: "Server icon", help: "Add a recognisable icon to your Stoat server." },
  { key: "global_statistics" as const, label: "Global statistics enabled", help: "The server must be included in public aggregate statistics." },
];
const statusLabels = { approved: "Listed", pending: "In review", denied: "Not approved", revoked: "Removed" } as const;

function countdown(milliseconds: number) {
  const total = Math.max(0, Math.ceil(milliseconds / 1000));
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(Math.floor(total / 3600))}:${pad(Math.floor(total % 3600 / 60))}:${pad(total % 60)}`;
}

function shortDate(value: string | null | undefined) {
  return value ? new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)) : "";
}

function media(path: string | null | undefined) {
  return path ? apiBase() + path : "";
}

function Tick({ label }: { label: string }) {
  return (
    <span className={styles.tick} title={`Verified: ${label}`} role="img" aria-label={`Verified: ${label}`}>
      <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5l2.2 1.6 2.7-.1.9 2.6 2.2 1.6-.8 2.6.8 2.6-2.2 1.6-.9 2.6-2.7-.1L10 18.5l-2.2-1.6-2.7.1-.9-2.6L2 12.8l.8-2.6L2 7.6l2.2-1.6.9-2.6 2.7.1z" /><path d="M6.6 10.2l2.2 2.2 4.6-4.7" fill="none" /></svg>
    </span>
  );
}

function Avatar({ server, extras, className }: { server: Server; extras: DiscoveryExtrasState | null; className: string }) {
  const [failed, setFailed] = useState("");
  const source = media(extras?.media.logo_url) || server.icon_url || "";
  return (
    <span className={className} aria-hidden="true">
      {(Array.from(server.name)[0] || "?").toUpperCase()}
      {source && failed !== source && <img src={source} alt="" onError={() => setFailed(source)} />}
    </span>
  );
}

/** The card as visitors see it on Discovery, built from the unsaved form values. */
function ListingPreview({ server, extras, description, information, tags, today, live }: {
  server: Server; extras: DiscoveryExtrasState | null; description: string; information: string; tags: string[]; today: number; live: boolean;
}) {
  // A custom banner wins; otherwise the banner set on Stoat, as on the public listing.
  const banner = media(extras?.media.banner_url) || safeServerMediaUrl(extras?.stoat_media?.banner_url);
  return (
    <article className={styles.preview}>
      <div className={styles.previewBanner}>{banner && <img src={banner} alt="" referrerPolicy="no-referrer" />}</div>
      <div className={styles.previewBody}>
        <Avatar server={server} extras={extras} className={styles.previewIcon} />
        <h3><span>{server.name}</span>{extras?.verified && <Tick label={extras.verified.label} />}</h3>
        {tags.length > 0 && <div className={styles.previewTags}>{tags.map((tag) => <span key={tag}>#{tag}</span>)}</div>}
        <p className={styles.previewDescription}>{description.trim() || "Your public server description will appear here."}</p>
        {information.trim() && <details className={styles.previewMore}>
          <summary>More about this server</summary>
          <DiscoveryMarkdown source={information} className={styles.previewMarkdown} headingBase={4} />
        </details>}
      </div>
      <footer className={styles.previewFooter}>
        <span>{pluralize(server.member_count, "member", "members")} · {pluralize(today, "message today", "messages today")}</span>
        <span className={styles.previewJoin}>{live ? "Join" : "Join after approval"} <span aria-hidden="true">↗</span></span>
      </footer>
    </article>
  );
}

export function DiscoveryTab({ initial, server, today, focusBump, guided, onBumpFocused, onStateChange, onOpenSettings }: {
  initial: DiscoveryState; server: Server; today: { messages: number }; focusBump: boolean; guided: boolean;
  onBumpFocused: () => void; onStateChange: (state: DiscoveryState) => void; onOpenSettings: () => void;
}) {
  const state = initial;
  const application = state.application;
  const status = application?.status;
  const approved = status === "approved";
  const [section, setSection] = useState<Section>("listing");
  const [description, setDescription] = useState(application?.description || "");
  const [information, setInformation] = useState(application?.information || "");
  const [inviteUrl, setInviteUrl] = useState(application?.invite_url || "");
  const [tags, setTags] = useState<string[]>(application?.tags || []);
  const [newTag, setNewTag] = useState("");
  const [language, setLanguage] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [links, setLinks] = useState<string[]>([]);
  const [busy, setBusy] = useState<"" | "save" | "apply" | "bump">("");
  const [notice, setNotice] = useState<{ tone: "ok" | "warn" | "error"; text: string }>();
  const [now, setNow] = useState(() => Date.now());
  const [copied, setCopied] = useState(false);
  const bumpButtonRef = useRef<HTMLButtonElement>(null);
  const { extras, reload } = useDiscoveryExtras(Boolean(application));
  const profileLoaded = useRef(false);

  useEffect(() => {
    if (!extras || profileLoaded.current) return;
    profileLoaded.current = true;
    setLanguage(extras.profile.language);
    setCategories(extras.profile.categories);
    setLinks(extras.profile.links);
  }, [extras]);
  useEffect(() => {
    if (!state.bump_cooldown_until) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [state.bump_cooldown_until]);
  useEffect(() => {
    if (!focusBump || !approved) return;
    const frame = window.requestAnimationFrame(() => {
      bumpButtonRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      bumpButtonRef.current?.focus();
      onBumpFocused();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [focusBump, approved, onBumpFocused]);

  const informationMax = extras?.options.information_max || 2000;
  const canSave = description.trim().length >= 20 && description.trim().length <= 500 && information.trim().length <= informationMax && inviteUrl.trim().startsWith("https://");
  const bumpRemaining = state.bump_cooldown_until ? Math.max(0, new Date(state.bump_cooldown_until).getTime() - now) : 0;
  const canBump = approved && state.eligibility.eligible && bumpRemaining === 0;
  const metCount = requirements.filter((item) => state.eligibility.requirements[item.key]).length;
  const publicLink = extras?.vanity ? `modstoat.site/${extras.vanity.slug}` : "";

  async function submit(mode: "apply" | "save") {
    setBusy(mode);
    setNotice(approved ? { tone: "ok", text: "Running automatic checks…" } : undefined);
    try {
      const updated = await api<EditResult>(mode === "apply" ? "/api/discovery/apply" : "/api/discovery/listing", {
        method: mode === "apply" ? "POST" : "PUT",
        body: JSON.stringify({ description, information, invite_url: inviteUrl, tags, language, categories, links: links.filter((link) => link.trim()) }),
      });
      onStateChange(updated);
      void reload();
      if (mode === "apply") setNotice({ tone: "ok", text: "Application sent to the Stoatmod owner for review." });
      else if (updated.edit?.status === "live") setNotice({ tone: "ok", text: "Changes are live on Discovery." });
      else if (updated.edit?.status === "held") setNotice({ tone: "warn", text: "Changes saved, but automatic checks held them for a quick review. Your current listing stays live." });
      else setNotice({ tone: "ok", text: "Discovery listing details saved." });
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "Could not save the discovery application." });
    } finally {
      setBusy("");
    }
  }

  async function bump() {
    setBusy("bump");
    try {
      const updated = await api<DiscoveryState & { bump: { bumped: boolean } }>("/api/discovery/bump", { method: "POST", body: "{}" });
      onStateChange(updated);
      setNow(Date.now());
      setNotice(updated.bump.bumped ? { tone: "ok", text: "Listing bumped. Your server has moved to the top of Recently bumped." } : { tone: "warn", text: "This listing is still on its two-hour bump cooldown." });
    } catch (error) {
      setNotice({ tone: "error", text: error instanceof Error ? error.message : "Could not bump the Discovery listing." });
    } finally {
      setBusy("");
    }
  }

  function addTag() {
    const tag = newTag.trim().replace(/\s+/g, " ");
    if (tag.length < 2 || tag.length > 24 || tags.length >= 5 || tags.some((item) => item.toLowerCase() === tag.toLowerCase())) return;
    setTags([...tags, tag]);
    setNewTag("");
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`https://${publicLink}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  const statusNote = status === "pending" ? "Your application is waiting for a decision. You can keep editing while it is reviewed."
    : status === "denied" ? `Not approved${application?.review_note ? `: ${application.review_note}` : "."}${state.cooldown_until ? ` You can apply again after ${shortDate(state.cooldown_until)}.` : ""}`
      : status === "revoked" ? `Removed from Discovery${application?.revocation_note ? `: ${application.revocation_note}` : "."} Update the listing and apply again when ready.`
        : !application ? "List your community in Stoatmod's public directory. Applications are reviewed by the Stoatmod team before they appear." : "";
  const sections: { key: Section; label: string; hidden?: boolean }[] = [
    { key: "listing", label: "Listing" },
    { key: "appearance", label: "Logo & banner", hidden: !application },
    { key: "stats", label: "Statistics", hidden: !approved },
    { key: "promote", label: "Promote", hidden: !application },
  ];
  const week = extras?.stats.week;
  const joinRate = extras?.stats.join_rate ?? null;
  const previousWeek = extras?.stats.previous_week;

  return (
    <div id="discovery-guide-target" className={`${styles.tab} dashboard-surface${guided ? " onboarding-destination-active" : ""}`}>
      <section className={`panel ${styles.status}`} aria-labelledby="discovery-status-title">
        <div className={styles.identity}>
          <Avatar server={server} extras={extras} className={styles.statusIcon} />
          <div>
            <p className="eyebrow">Stoatmod Discovery</p>
            <h2 id="discovery-status-title"><span>{server.name}</span>{extras?.verified && <Tick label={extras.verified.label} />}</h2>
            <div className={styles.meta}>
              <span className={`${styles.pill} ${styles[`pill_${status || "none"}`]}`}>{status ? statusLabels[status] : "Not listed"}</span>
              {extras?.verified && <span>{extras.verified.label}</span>}
              {approved && application?.reviewed_at && <span>Listed {shortDate(application.reviewed_at)}</span>}
              {publicLink && <button type="button" className={styles.linkChip} onClick={() => void copyLink()} title="Copy link">{publicLink} <span aria-hidden="true">{copied ? "✓" : "⧉"}</span></button>}
            </div>
          </div>
        </div>
        <div className={styles.statusActions}>
          <a className="secondary-button" href={approved ? `/discovery/servers/${server.id.toLowerCase()}` : "/discovery"} target="_blank" rel="noreferrer">{approved ? "View listing" : "View Discovery"} ↗</a>
          {approved && <button ref={bumpButtonRef} id="discovery-bump-button" type="button" className={`primary-button ${styles.bump}`} disabled={Boolean(busy) || !canBump} onClick={() => void bump()} aria-label="Bump server listing now">
            {busy === "bump" ? "Bumping…" : bumpRemaining > 0 ? <>Next bump <b>{countdown(bumpRemaining)}</b></> : <>Bump now <b aria-hidden="true">↑</b></>}
          </button>}
        </div>
        {approved && week && previousWeek && <dl className={styles.kpis}>
          <div><dt>Profile views · 7 days</dt><dd>{week.views.toLocaleString()}</dd><small>{weekChange(week.views, previousWeek.views)}</small></div>
          <div><dt>Join clicks · 7 days</dt><dd>{week.joins.toLocaleString()}</dd><small>{weekChange(week.joins, previousWeek.joins)}</small></div>
          <div><dt>Custom link visits · 7 days</dt><dd>{week.link_visits.toLocaleString()}</dd><small>{weekChange(week.link_visits, previousWeek.link_visits)}</small></div>
          <div><dt>Join rate · 30 days</dt><dd>{joinRate === null ? "—" : `${Math.round(joinRate * 100)}%`}</dd><small>join clicks per profile view</small></div>
        </dl>}
        {statusNote && <p className={styles.statusNote}>{statusNote}</p>}
      </section>

      {sections.filter((item) => !item.hidden).length > 1 && <nav className={styles.sections} aria-label="Discovery sections">
        {sections.filter((item) => !item.hidden).map((item) => <button type="button" key={item.key} aria-pressed={section === item.key} onClick={() => setSection(item.key)}>{item.label}</button>)}
      </nav>}

      {section === "listing" && <div className={styles.listing}>
        <section className={`panel ${styles.form}`} aria-labelledby="discovery-form-title">
          <header className={styles.formHead}>
            <div><p className="eyebrow">Listing details</p><h3 id="discovery-form-title">Describe your community</h3></div>
            {approved && <p>Edits go live straight away. Stoatmod&apos;s AI checks new text and a new invite must open this server; anything flagged waits for a quick review while the current listing stays live.</p>}
          </header>
          {extras?.held_edit && <HeldEditNotice edit={extras.held_edit} onWithdraw={() => void api("/api/discovery/edits/held", { method: "DELETE" }).then(reload)} />}

          <fieldset className={styles.group}>
            <legend>Basics</legend>
            <label className={styles.field}><span>Short description <em>{description.length}/500</em></span>
              <textarea rows={3} value={description} minLength={20} maxLength={500} onChange={(event) => setDescription(event.target.value)} placeholder="What kind of community is this, and who is it for?" />
            </label>
            <label className={styles.field}><span>Server invite <em>Required</em></span>
              <input type="url" value={inviteUrl} maxLength={500} onChange={(event) => setInviteUrl(event.target.value)} placeholder="https://stt.gg/your-invite" />
              <small>Only HTTPS Stoat invite links are accepted. This becomes the public Join button after approval.</small>
            </label>
          </fieldset>

          <fieldset className={styles.group}>
            <legend>Topics</legend>
            <div className={styles.field}>
              <span>Tags <em>{tags.length}/5</em></span>
              <div className={styles.tagInput}>
                {tags.map((tag) => <span key={tag} className={styles.tagChip}>#{tag}<button type="button" aria-label={`Remove ${tag}`} onClick={() => setTags(tags.filter((item) => item !== tag))}>×</button></span>)}
                {tags.length < 5 && <input value={newTag} maxLength={24} aria-label="Add a tag" onChange={(event) => setNewTag(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === ",") { event.preventDefault(); addTag(); } }} onBlur={addTag} placeholder={tags.length ? "Add another…" : "Gaming, Art, Technology… press Enter"} />}
              </div>
            </div>
            <div className={styles.field}>
              <span>Categories <em>{categories.length}/2</em></span>
              <div className={styles.choices}>
                {discoveryCategories.map((category) => {
                  const selected = categories.includes(category.slug);
                  return <button type="button" key={category.slug} aria-pressed={selected} disabled={!selected && categories.length >= 2} onClick={() => setCategories(selected ? categories.filter((item) => item !== category.slug) : [...categories, category.slug])}><span aria-hidden="true">{category.emoji}</span> {category.name}</button>;
                })}
              </div>
            </div>
            <label className={styles.field}><span>Main language</span>
              <select value={language} onChange={(event) => setLanguage(event.target.value)}>
                <option value="">Not set</option>
                {Object.entries(discoveryLanguages).map(([code, name]) => <option value={code} key={code}>{name}</option>)}
              </select>
            </label>
          </fieldset>

          <fieldset className={styles.group}>
            <legend>About your server</legend>
            <label className={styles.field}><span>More information <em>{information.length}/{informationMax}</em></span>
              <textarea rows={9} value={information} maxLength={informationMax} onChange={(event) => setInformation(event.target.value)} placeholder="Share the topics, atmosphere, activities, rules, or anything else visitors should know." />
            </label>
            <MarkdownHelp />
          </fieldset>

          <fieldset className={styles.group}>
            <legend>Links <em>{links.filter(Boolean).length}/4</em></legend>
            <p className={styles.groupHelp}>Your website or social accounts. Use full https:// addresses; shortened links are held for review.</p>
            {[...links, ...(links.length < 4 ? [""] : [])].map((link, index) => (
              <input key={index} className={styles.linkInput} type="url" value={link} placeholder="https://example.org" aria-label={`Link ${index + 1}`} onChange={(event) => {
                const next = [...links];
                if (index >= links.length) next.push(event.target.value); else next[index] = event.target.value;
                setLinks(next.filter((item, itemIndex) => item.trim() || itemIndex === index).slice(0, 4));
              }} />
            ))}
          </fieldset>

          <footer className={styles.actions}>
            {notice && <p className={`${styles.notice} ${styles[`notice_${notice.tone}`]}`} role={notice.tone === "error" ? "alert" : "status"}>{notice.text}</p>}
            <div>
              {application && <button type="button" className={approved ? "primary-button" : "secondary-button"} disabled={Boolean(busy) || !canSave} onClick={() => void submit("save")}>{busy === "save" ? (approved ? "Checking…" : "Saving…") : approved ? "Save changes" : "Save details"}</button>}
              {!approved && <button type="button" className="primary-button" disabled={Boolean(busy) || !canSave || !state.can_apply} onClick={() => void submit("apply")}>{busy === "apply" ? "Sending…" : status === "denied" || status === "revoked" ? "Reapply for Discovery" : "Apply for Discovery"} <span aria-hidden="true">→</span></button>}
            </div>
          </footer>
        </section>

        <aside className={styles.side}>
          <section className={`panel ${styles.sidePanel}`} aria-labelledby="discovery-preview-title">
            <header><p className="eyebrow">Visitor view</p><h3 id="discovery-preview-title">Live preview</h3></header>
            <ListingPreview server={server} extras={extras} description={description} information={information} tags={tags} today={today.messages} live={approved} />
          </section>
          {(!approved || metCount < requirements.length) && <section className={`panel ${styles.sidePanel}`} aria-labelledby="discovery-requirements-title">
            <header><p className="eyebrow">Requirements · {metCount}/{requirements.length}</p><h3 id="discovery-requirements-title">{state.eligibility.eligible ? (application ? "All requirements met" : "Ready to apply") : "Complete every requirement"}</h3></header>
            <ul className={styles.requirements}>
              {requirements.map((item) => {
                const met = state.eligibility.requirements[item.key];
                return <li key={item.key} className={met ? styles.met : styles.missing}><b aria-hidden="true">{met ? "✓" : "×"}</b><span><strong>{item.label}</strong><small>{item.help}</small>{item.key === "global_statistics" && !met && <button type="button" onClick={onOpenSettings}>Open settings</button>}</span></li>;
              })}
            </ul>
          </section>}
          {extras && extras.edits.length > 0 && <section className={`panel ${styles.sidePanel}`}><RecentEdits edits={extras.edits} /></section>}
        </aside>
      </div>}

      {section === "appearance" && extras && <div className={styles.appearance}>
        <ListingMediaPanel extras={extras} onChange={() => void reload()} />
        <section className={`panel ${styles.sidePanel}`}>
          <header><p className="eyebrow">Visitor view</p><h3>How it looks</h3></header>
          <ListingPreview server={server} extras={extras} description={description} information="" tags={tags} today={today.messages} live={approved} />
        </section>
      </div>}

      {section === "stats" && extras && <DiscoveryStatsPanel stats={extras.stats} showTiles={false} />}

      {section === "promote" && extras && <div className={styles.promote}>
        <CustomLinkPanel key={extras.vanity?.slug || "none"} extras={extras} approved={approved} onChange={() => void reload()} />
        <VerificationPanel extras={extras} approved={approved} onChange={() => void reload()} />
        {approved && <BadgePanel serverId={server.id} vanity={extras.vanity?.slug || null} />}
        {approved && <DiscoveryNotificationsPanel extras={extras} onChange={() => void reload()} />}
      </div>}
    </div>
  );
}
