"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { api, RateLimitedError } from "./lib/api";
import {
  MAX_COLOUR_LENGTH, MAX_GRADIENT_STOPS, buildColour, colourProblem, nameStyle, parseColour, swatch,
  type ColourModel, type GradientKind, type GradientStop,
} from "./lib/role-colour";
import styles from "./RolesPanel.module.css";

type Role = {
  id: string; name: string; colour: string | null; hoist: boolean; rank: number;
  allow: string[]; deny: string[]; editable: boolean; permissions_editable: boolean;
  locked_reason: string | null; locked_message: string | null;
};
type Permission = { key: string; group: string; name: string; description: string };
type Snapshot = {
  server: { id: string; name: string };
  limits: { max_roles: number; name_max: number; colour_max: number; max_stops: number };
  catalog: { groups: { id: string; label: string }[]; permissions: Permission[] };
  bot: { in_server: boolean; rank: number | null; can_manage_roles: boolean; can_manage_permissions: boolean };
  actor: { is_owner: boolean; can_manage_roles: boolean; can_manage_permissions: boolean };
  create_blocked: string | null;
  grantable: string[];
  default_permissions: string[];
  roles: Role[];
  changed_role_id?: string;
  log_channel?: { configured: boolean };
  log_status?: "posted" | "no_channel" | "failed";
};
/** A change Stoat has already made, when Stoat would not hand over the updated list straight away. */
type Deferred = {
  saved: true; needs_refresh: true; rate_limited: boolean; retry_after: number;
  changed_role_id?: string; log_status?: Snapshot["log_status"];
};
type Changed = Snapshot | Deferred;
/** A pause while a rate limit runs out: "retry" sends the same request again, "refresh" reloads the list. */
type Wait = { until: number; source: string; reason: "retry" | "refresh" };

const MAX_RATE_LIMIT_RETRIES = 3;
const RETRY_MARGIN_MS = 300;

class Abandoned extends Error {}

/** The clock, read only from event handlers and timers (never while rendering). */
function currentTime() {
  return Date.now();
}

function waitMessage(wait: Wait, seconds: number): string {
  const when = seconds > 0 ? `in ${seconds} ${seconds === 1 ? "second" : "seconds"}` : "now";
  if (wait.reason === "refresh") {
    return wait.source === "stoat"
      ? `Saved. The change is live in Stoat. Stoat is ratelimiting us, so this list will update ${when}.`
      : `Saved. The change is live in Stoat. This list will update ${when}.`;
  }
  if (wait.source === "stoatmod") {
    return seconds > 0
      ? `You're making changes faster than Stoatmod allows. We'll retry your request ${when} and reflect the change here.`
      : "Retrying your request now…";
  }
  return seconds > 0
    ? `Stoat is ratelimiting us! We'll retry your request ${when} and reflect the change here.`
    : "Stoat is ratelimiting us! Retrying your request now…";
}

function gaveUp(reason: RateLimitedError): Error {
  return new Error(reason.source === "stoatmod"
    ? "You're still making changes faster than Stoatmod allows, so we stopped retrying. Wait a minute, then try again."
    : "Stoat is still ratelimiting us, so we stopped retrying. Wait a minute, then try again.");
}
type Draft = { name: string; colour: ColourModel; hoist: boolean; allow: string[]; deny: string[] };
type PermissionState = "allow" | "neutral" | "deny";

const PRESETS: { name: string; angle: number; colours: [string, string] }[] = [
  { name: "Sunset", angle: 90, colours: ["#ff512f", "#f09819"] },
  { name: "Ocean", angle: 135, colours: ["#2193b0", "#6dd5ed"] },
  { name: "Aurora", angle: 90, colours: ["#00c9ff", "#92fe9d"] },
  { name: "Neon", angle: 90, colours: ["#ff00cc", "#3333ff"] },
  { name: "Gold", angle: 90, colours: ["#f7971e", "#ffd200"] },
  { name: "Rose", angle: 135, colours: ["#ee9ca7", "#ffdde1"] },
];
const DEFAULT_SOLID = "#5865f2";
const EXAMPLE_CSS = buildColour({ mode: "gradient", kind: "linear", angle: 90, stops: [{ colour: "#ff512f", position: null }, { colour: "#f09819", position: null }] }) ?? "";

function draftFrom(role: Role): Draft {
  return { name: role.name, colour: parseColour(role.colour), hoist: role.hoist, allow: [...role.allow], deny: [...role.deny] };
}
function sameSet(first: string[], second: string[]) {
  return first.length === second.length && first.every((item) => second.includes(item));
}
function normalName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}
function changesFor(role: Role, draft: Draft) {
  const payload: Record<string, unknown> = {};
  const name = normalName(draft.name);
  if (name !== role.name) payload.name = name;
  if (JSON.stringify(draft.colour) !== JSON.stringify(parseColour(role.colour))) payload.colour = buildColour(draft.colour);
  if (draft.hoist !== role.hoist) payload.hoist = draft.hoist;
  if (!sameSet(draft.allow, role.allow) || !sameSet(draft.deny, role.deny)) {
    payload.allow = draft.allow;
    payload.deny = draft.deny;
  }
  return payload;
}
function mergeOrder(order: string[], movable: string[]) {
  return [...order.filter((id) => movable.includes(id)), ...movable.filter((id) => !order.includes(id))];
}
function logNoteFor(result: Pick<Snapshot, "log_status">) {
  if (result.log_status === "posted") return "Posted to the moderation log channel.";
  if (result.log_status === "failed") return "Stoatmod could not post this to the moderation log channel. Check that it can send messages there.";
  return "";
}
function firstStop(model: ColourModel): string {
  if (model.mode === "solid") return model.colour;
  if (model.mode === "gradient") return model.stops[0]?.colour ?? DEFAULT_SOLID;
  return DEFAULT_SOLID;
}
function shiftColour(hex: string): string {
  const channel = (offset: number) => Math.min(255, Math.max(0, parseInt(hex.slice(offset, offset + 2), 16) + 70)).toString(16).padStart(2, "0");
  return /^#[0-9a-f]{6}$/i.test(hex) ? `#${channel(1)}${channel(3)}${channel(5)}` : "#ffffff";
}

export function RolesPanel() {
  const [data, setData] = useState<Snapshot | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [order, setOrder] = useState<string[] | null>(null);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loadError, setLoadError] = useState("");
  const [permissionQuery, setPermissionQuery] = useState("");
  const [newName, setNewName] = useState("");
  const [deleteName, setDeleteName] = useState("");
  const [logNote, setLogNote] = useState("");
  const [wait, setWait] = useState<Wait | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const alive = useRef(true);
  // While a rate limit runs out, everything that would send another request stays disabled.
  const busy = working || wait !== null;

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    if (!wait) return;
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [wait]);

  useEffect(() => {
    let active = true;
    let timer = 0;
    const load = (attempt: number) => {
      api<Snapshot>("/api/roles")
        .then((result) => {
          if (!active) return;
          setData(result);
          const first = result.roles.find((role) => role.editable || role.permissions_editable) ?? result.roles[0];
          if (first) {
            setSelectedId(first.id);
            setDraft(draftFrom(first));
          }
        })
        .catch((reason) => {
          if (!active) return;
          if (reason instanceof RateLimitedError && attempt < MAX_RATE_LIMIT_RETRIES) {
            const until = Date.now() + reason.retryAfter * 1000 + RETRY_MARGIN_MS;
            setNow(Date.now());
            setWait({ until, source: reason.source, reason: "retry" });
            timer = window.setTimeout(() => {
              if (!active) return;
              setWait(null);
              load(attempt + 1);
            }, until - Date.now());
            return;
          }
          setLoadError(reason instanceof RateLimitedError ? gaveUp(reason).message : reason instanceof Error ? reason.message : "The roles could not be loaded.");
        });
    };
    load(0);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, []);

  const roles = useMemo(() => data?.roles ?? [], [data]);
  const selected = roles.find((role) => role.id === selectedId) ?? null;
  const movableIds = useMemo(() => roles.filter((role) => role.editable).map((role) => role.id), [roles]);
  const movableOrder = useMemo(() => (order ? mergeOrder(order, movableIds) : movableIds), [order, movableIds]);
  const orderChanged = movableOrder.some((id, index) => id !== movableIds[index]);
  const listed = useMemo(() => {
    const byId = new Map(roles.map((role) => [role.id, role]));
    return [...roles.filter((role) => !role.editable), ...movableOrder.map((id) => byId.get(id)!)];
  }, [roles, movableOrder]);
  const grantable = useMemo(() => new Set(data?.grantable ?? []), [data]);

  const editableCount = roles.filter((role) => role.editable || role.permissions_editable).length;
  const blockedAll = Boolean(data) && roles.length > 0 && editableCount === 0;
  const payload = selected && draft ? changesFor(selected, draft) : {};
  const nameValue = draft ? normalName(draft.name) : "";
  const nameProblem = draft && (nameValue.length < 1 || nameValue.length > (data?.limits.name_max ?? 32));
  // A colour that was already on the role and is left alone is never a reason to refuse a save.
  const colourChanged = Boolean(selected && draft && JSON.stringify(draft.colour) !== JSON.stringify(parseColour(selected.colour)));
  const colourIssue = draft && colourChanged ? colourProblem(draft.colour) : null;
  const appearanceLocked = !selected?.editable;
  const permissionsLocked = !selected?.permissions_editable;
  const canSave = Boolean(selected && draft && Object.keys(payload).length && !nameProblem && !colourIssue && !busy);
  const previewColour = draft && !colourIssue ? buildColour(draft.colour) : null;

  function choose(role: Role) {
    setSelectedId(role.id);
    setDraft(draftFrom(role));
    setDeleteName("");
    setError("");
    setNotice("");
  }

  function adopt(next: Snapshot, keep: string | null) {
    setData(next);
    const role = next.roles.find((item) => item.id === keep) ?? null;
    setSelectedId(role ? role.id : null);
    setDraft(role ? draftFrom(role) : null);
    setOrder((current) => (current ? mergeOrder(current, next.roles.filter((item) => item.editable).map((item) => item.id)) : null));
    setDeleteName("");
  }

  /** Show the countdown and lock the page until the limit runs out. False if the panel was closed meanwhile. */
  function pause(seconds: number, source: string, reason: Wait["reason"]): Promise<boolean> {
    const started = currentTime();
    const until = started + Math.max(1, seconds) * 1000 + RETRY_MARGIN_MS;
    setNow(started);
    setWait({ until, source, reason });
    return new Promise((resolve) => {
      window.setTimeout(() => {
        if (!alive.current) return resolve(false);
        setWait(null);
        resolve(true);
      }, until - started);
    });
  }

  /** Send a request; when it is rate limited, wait out the limit and send the same request again. */
  async function withRetries<T>(call: () => Promise<T>): Promise<T> {
    for (let attempt = 0; ; attempt += 1) {
      try {
        return await call();
      } catch (reason) {
        if (!(reason instanceof RateLimitedError)) throw reason;
        if (attempt >= MAX_RATE_LIMIT_RETRIES) throw gaveUp(reason);
        if (!(await pause(reason.retryAfter, reason.source, "retry"))) throw new Abandoned();
      }
    }
  }

  /** Show the result of a change. If Stoat has made it but would not send the new list yet, fetch it once the limit runs out. */
  async function settle(result: Changed, keep: string | null, done: string) {
    setNotice(done);
    setLogNote(logNoteFor(result));
    if ("needs_refresh" in result) {
      if (!(await pause(result.retry_after, result.rate_limited ? "stoat" : "", "refresh"))) throw new Abandoned();
      adopt(await withRetries(() => api<Snapshot>("/api/roles")), keep);
      return;
    }
    adopt(result, keep);
  }

  async function run(work: () => Promise<void>) {
    setWorking(true);
    setError("");
    setNotice("");
    setLogNote("");
    try {
      await work();
    } catch (reason) {
      if (reason instanceof Abandoned || !alive.current) return;
      setError(reason instanceof Error ? reason.message : "The change could not be saved.");
      // Part of a change may have been applied, so show what Stoat really has now, but keep the edits on screen.
      try {
        const fresh = await api<Snapshot>("/api/roles");
        setData(fresh);
        setOrder((current) => (current ? mergeOrder(current, fresh.roles.filter((item) => item.editable).map((item) => item.id)) : null));
        if (selectedId && !fresh.roles.some((item) => item.id === selectedId)) {
          setSelectedId(null);
          setDraft(null);
        }
      } catch {
        /* the next successful load corrects the list */
      }
    } finally {
      if (alive.current) setWorking(false);
    }
  }

  async function save() {
    if (!selected || !canSave) return;
    const body = JSON.stringify(payload);
    await run(async () => {
      const result = await withRetries(() => api<Changed>(`/api/roles/${selected.id}`, { method: "PUT", body }));
      await settle(result, selected.id, "Saved. The change is live in Stoat.");
    });
  }

  async function saveOrder() {
    const body = JSON.stringify({ order: movableOrder });
    await run(async () => {
      const result = await withRetries(() => api<Changed>("/api/roles/order", { method: "PUT", body }));
      setOrder(null);
      await settle(result, selectedId, "The role order was saved in Stoat.");
    });
  }

  async function createRole() {
    const name = normalName(newName);
    if (!name) return;
    await run(async () => {
      const result = await withRetries(() => api<Changed>("/api/roles", { method: "POST", body: JSON.stringify({ name }) }));
      setNewName("");
      await settle(result, result.changed_role_id ?? null, "The role was created at the bottom of the list. Choose its colour and permissions, then save.");
    });
  }

  async function deleteRole() {
    if (!selected || deleteName !== selected.name) return;
    const body = JSON.stringify({ confirm_name: deleteName });
    await run(async () => {
      const result = await withRetries(() => api<Changed>(`/api/roles/${selected.id}`, { method: "DELETE", body }));
      await settle(result, null, "The role was deleted.");
    });
  }

  function move(id: string, delta: number) {
    const index = movableOrder.indexOf(id);
    const target = index + delta;
    if (index < 0 || target < 0 || target >= movableOrder.length) return;
    const next = [...movableOrder];
    [next[index], next[target]] = [next[target], next[index]];
    setOrder(next);
  }

  function setPermission(key: string, value: PermissionState) {
    setDraft((current) => current && {
      ...current,
      allow: value === "allow" ? [...current.allow.filter((item) => item !== key), key] : current.allow.filter((item) => item !== key),
      deny: value === "deny" ? [...current.deny.filter((item) => item !== key), key] : current.deny.filter((item) => item !== key),
    });
  }

  const secondsLeft = wait ? Math.max(0, Math.ceil((wait.until - RETRY_MARGIN_MS - now) / 1000)) : 0;
  const waitBanner = wait && <div className={styles.wait} role="status" aria-live="polite">
    <span className={styles.clock} aria-hidden="true">{secondsLeft > 0 ? secondsLeft : "…"}</span>
    <p>{waitMessage(wait, secondsLeft)}<small>{wait.reason === "refresh" ? "Changes are paused until the list has updated." : "Changes are paused until then, so we don't make the limit worse."}</small></p>
  </div>;

  if (loadError) return <div className={`dashboard-surface ${styles.page}`}><p className={styles.error} role="alert">{loadError}</p></div>;
  if (!data) return <div className={`dashboard-surface ${styles.page}`}>{waitBanner || <p className={styles.loading} role="status">Loading roles from Stoat…</p>}</div>;

  const query = permissionQuery.trim().toLowerCase();
  const visiblePermissions = data.catalog.permissions.filter((permission) => !query || `${permission.name} ${permission.description}`.toLowerCase().includes(query));

  return <div className={`dashboard-surface ${styles.page}`}>
    <header className={styles.header}>
      <div>
        <p className="eyebrow">Server roles</p>
        <h2>See and edit your roles.</h2>
        <p>Changes are made in Stoat straight away. Stoatmod can only change roles that sit below its own role, and you can only change roles below yours.</p>
        {data.log_channel && <p className={styles.logHint}>{data.log_channel.configured ? "Role changes are posted to your moderation log channel." : "No moderation log channel is set, so role changes are only kept in the Activity log. Choose one in Policy Studio."}</p>}
      </div>
      <p className={styles.count} role="status">{`${editableCount} of ${roles.length} roles can be edited here`}</p>
    </header>
    {blockedAll && <p className={styles.warning} role="status">{roles[0]?.locked_message}</p>}
    {waitBanner}
    {error && <p className={styles.error} role="alert">{error}</p>}
    {notice && !(wait && wait.reason === "refresh") && <p className={styles.notice} role="status">{notice}{logNote && <span className={styles.logNote}>{logNote}</span>}</p>}
    <div className={styles.layout}>
      <aside className={styles.list} aria-label="Roles in rank order">
        <div className={styles.row}><h3>Roles, highest first</h3></div>
        <ol className={styles.roleList}>
          {listed.map((role) => {
            const isSelected = role.id === selectedId;
            const shownName = isSelected && draft ? draft.name || role.name : role.name;
            const shownColour = isSelected && draft ? previewColour : role.colour;
            const index = movableOrder.indexOf(role.id);
            return <li key={role.id} className={`${styles.roleRow} ${isSelected ? styles.selected : ""}`}>
              <button type="button" className={styles.roleButton} aria-current={isSelected ? "true" : undefined} title={role.locked_message ?? undefined} onClick={() => choose(role)}>
                <i className={styles.dot} style={{ background: swatch(shownColour) } as CSSProperties} aria-hidden="true" />
                <span className={styles.roleName} data-no-translate style={nameStyle(shownColour)}>{shownName}</span>
                {!role.editable && !role.permissions_editable && <small className={styles.badge}>Read-only</small>}
                {!role.editable && role.permissions_editable && <small className={styles.badge}>Permissions only</small>}
              </button>
              {role.editable && <span className={styles.move}>
                <button type="button" disabled={busy || index <= 0} aria-labelledby={`${role.id}-up ${role.id}-name`} onClick={() => move(role.id, -1)}><span id={`${role.id}-up`} hidden>Move up</span>▲</button>
                <button type="button" disabled={busy || index >= movableOrder.length - 1} aria-labelledby={`${role.id}-down ${role.id}-name`} onClick={() => move(role.id, 1)}><span id={`${role.id}-down`} hidden>Move down</span>▼</button>
                <span id={`${role.id}-name`} hidden data-no-translate>{role.name}</span>
              </span>}
            </li>;
          })}
          <li className={`${styles.roleRow} ${styles.everyone}`}><span className={styles.roleButton}><i className={styles.dot} aria-hidden="true" /><span className={styles.roleName}>Everyone</span><small className={styles.badge}>Default permissions</small></span></li>
        </ol>
        {orderChanged && <div className={styles.orderActions}>
          <p className={styles.hint}>The new order has not been saved yet.</p>
          <button type="button" className="primary-button" disabled={busy} onClick={() => void saveOrder()}>Save order <span>→</span></button>
          <button type="button" className="secondary-button" disabled={busy} onClick={() => setOrder(null)}>Reset order</button>
        </div>}
        <form className={styles.create} onSubmit={(event) => { event.preventDefault(); void createRole(); }}>
          <label>New role name<input value={newName} maxLength={data.limits.name_max} disabled={busy || Boolean(data.create_blocked)} onChange={(event) => setNewName(event.target.value)} /></label>
          <button type="submit" className="secondary-button" disabled={busy || Boolean(data.create_blocked) || !normalName(newName)}>＋ Create role</button>
          {data.create_blocked && <p className={styles.hint}>{data.create_blocked}</p>}
        </form>
      </aside>

      <section className={styles.editor} aria-label="Role editor">
        {!selected || !draft ? <p className={styles.hint}>Choose a role to see or change it.</p> : <>
          <div className={styles.row}>
            <h3>Edit role</h3>
            {selected.editable ? <span className={styles.status}>Editable</span> : selected.permissions_editable ? <span className={styles.status}>Permissions only</span> : <span className={styles.status}>Read-only</span>}
          </div>
          {selected.locked_message && <p className={styles.warning} role="status">{selected.locked_message}</p>}
          <fieldset disabled={busy || appearanceLocked}>
            <legend>Appearance</legend>
            <label>Role name<input value={draft.name} maxLength={data.limits.name_max} aria-invalid={Boolean(nameProblem)} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
            {nameProblem && <p className={styles.fieldError} role="alert">{`Use 1 to ${data.limits.name_max} characters.`}</p>}
            <ColourEditor model={draft.colour} onChange={(colour) => setDraft({ ...draft, colour })} problem={colourIssue} />
            <label className={styles.check}><input type="checkbox" checked={draft.hoist} onChange={(event) => setDraft({ ...draft, hoist: event.target.checked })} />Show members with this role separately in the member list</label>
          </fieldset>

          <fieldset disabled={busy || permissionsLocked} className={styles.permissions}>
            <legend>Permissions</legend>
            <p className={styles.hint}>Allow grants a permission. Deny removes it, even if another role grants it. Neutral leaves it to the server default and other roles.</p>
            <label>Find a permission<input type="search" value={permissionQuery} onChange={(event) => setPermissionQuery(event.target.value)} placeholder="Search permissions" /></label>
            {data.catalog.groups.map((group) => {
              const items = visiblePermissions.filter((permission) => permission.group === group.id);
              if (!items.length) return null;
              return <section key={group.id} className={styles.group} aria-label={group.label}>
                <h4>{group.label}</h4>
                {items.map((permission) => {
                  const state: PermissionState = draft.allow.includes(permission.key) ? "allow" : draft.deny.includes(permission.key) ? "deny" : "neutral";
                  const cannotGrant = !grantable.has(permission.key) && !selected.allow.includes(permission.key);
                  return <div className={styles.permission} key={permission.key}>
                    <span><code data-no-translate>{permission.name}</code><small>{permission.description}</small></span>
                    <div className={styles.tri} role="radiogroup" aria-label={permission.name}>
                      {(["deny", "neutral", "allow"] as PermissionState[]).map((option) => {
                        const blocked = option === "allow" && cannotGrant;
                        return <button type="button" role="radio" key={option} aria-checked={state === option} data-state={option} disabled={blocked}
                          title={blocked ? "Stoatmod or you do not have this permission, so it cannot be granted here." : undefined}
                          onClick={() => setPermission(permission.key, option)}>{option === "deny" ? "Deny" : option === "allow" ? "Allow" : "Neutral"}</button>;
                      })}
                    </div>
                  </div>;
                })}
              </section>;
            })}
            {!visiblePermissions.length && <p className={styles.hint}>No permissions match your search.</p>}
          </fieldset>

          <div className={styles.actions}>
            <button type="button" className="primary-button" disabled={!canSave} onClick={() => void save()}>{wait ? (secondsLeft > 0 ? `Waiting ${secondsLeft}s…` : "Retrying…") : working ? "Saving…" : "Save changes"} <span>→</span></button>
            <button type="button" className="secondary-button" disabled={busy || !Object.keys(payload).length} onClick={() => setDraft(draftFrom(selected))}>Discard changes</button>
          </div>

          {selected.editable && <details className={styles.danger}>
            <summary>Delete this role</summary>
            <p>The role is removed from every member who has it. This cannot be undone. A role that Stoatmod uses for Auto-roles, Applications, Reaction roles or Automation Lab has to be removed there first.</p>
            <label>Type the role name to confirm<input value={deleteName} onChange={(event) => setDeleteName(event.target.value)} autoComplete="off" /></label>
            <button type="button" className="secondary-button" disabled={busy || deleteName !== selected.name} onClick={() => void deleteRole()}>Delete role</button>
          </details>}
        </>}
      </section>

      <aside className={styles.preview} aria-label="Live role preview">
        <p className="eyebrow">Live preview</p>
        <h3 data-no-translate style={nameStyle(previewColour)}>{draft ? draft.name || selected?.name : "No role selected"}</h3>
        {draft && <>
          <Stage tone="dark" name={draft.name || selected?.name || ""} colour={previewColour} hoist={draft.hoist} />
          <Stage tone="light" name={draft.name || selected?.name || ""} colour={previewColour} hoist={draft.hoist} />
          <p className={styles.hint}>{`Allows ${draft.allow.length} permissions and denies ${draft.deny.length}.`}</p>
          <p className={styles.hint}>This is how the name looks beside messages and in the member list. Stoat clients paint a gradient across the name.</p>
        </>}
      </aside>
    </div>
  </div>;
}

function Stage({ tone, name, colour, hoist }: { tone: "dark" | "light"; name: string; colour: string | null; hoist: boolean }) {
  const style = nameStyle(colour);
  return <div className={`${styles.stage} ${tone === "dark" ? styles.dark : styles.light}`}>
    <div className={styles.message}>
      <span className={styles.avatar} style={{ background: swatch(colour) ?? "#8b8f99" } as CSSProperties} aria-hidden="true">A</span>
      <div>
        <p><strong data-no-translate style={style}>Alex</strong> <small>Today at 12:34</small></p>
        <p>Welcome to the server!</p>
      </div>
    </div>
    <div className={styles.members}>
      <small>{hoist ? <><span data-no-translate>{name}</span> — 2</> : "Online — 3"}</small>
      <p><i style={{ background: swatch(colour) ?? "#8b8f99" } as CSSProperties} aria-hidden="true" /><span data-no-translate style={style}>Alex</span></p>
      <p><i aria-hidden="true" /><span data-no-translate>Sam</span></p>
    </div>
  </div>;
}

function ColourEditor({ model, onChange, problem }: { model: ColourModel; onChange: (model: ColourModel) => void; problem: string | null }) {
  const css = buildColour(model);
  function switchMode(mode: ColourModel["mode"]) {
    if (mode === model.mode) return;
    if (mode === "none") onChange({ mode });
    else if (mode === "solid") onChange({ mode, colour: firstStop(model) });
    else if (mode === "custom") onChange({ mode, css: css ?? "" });
    else {
      const first = firstStop(model);
      onChange({ mode, kind: "linear", angle: 90, stops: [{ colour: first, position: null }, { colour: shiftColour(first), position: null }] });
    }
  }
  function patchStop(index: number, patch: Partial<GradientStop>) {
    if (model.mode !== "gradient") return;
    onChange({ ...model, stops: model.stops.map((stop, position) => (position === index ? { ...stop, ...patch } : stop)) });
  }
  return <div className={styles.colour}>
    <div className={styles.modes} role="radiogroup" aria-label="Role colour type">
      {([["none", "No colour"], ["solid", "Solid"], ["gradient", "Gradient"], ["custom", "Custom CSS"]] as [ColourModel["mode"], string][]).map(([mode, label]) =>
        <label key={mode} className={styles.mode}><input type="radio" name="role-colour-mode" checked={model.mode === mode} onChange={() => switchMode(mode)} />{label}</label>)}
    </div>
    {model.mode === "solid" && <div className={styles.solid}>
      <label>Colour<input type="color" value={model.colour} onChange={(event) => onChange({ mode: "solid", colour: event.target.value })} /></label>
    </div>}
    {model.mode === "gradient" && <div className={styles.gradient}>
      <div className={styles.bar} style={{ background: css ?? undefined } as CSSProperties} aria-hidden="true" />
      <div className={styles.pair}>
        <label>Style<select value={model.kind} onChange={(event) => onChange({ ...model, kind: event.target.value as GradientKind })}>
          <option value="linear">Linear</option><option value="radial">Radial</option><option value="conic">Conic</option></select></label>
        {model.kind === "linear" && <label>{`Angle: ${Math.round(model.angle)}°`}<input type="range" min={0} max={360} value={model.angle} onChange={(event) => onChange({ ...model, angle: Number(event.target.value) })} /></label>}
      </div>
      {model.stops.map((stop, index) => <div className={styles.stop} key={index}>
        <input type="color" aria-label={`Colour ${index + 1}`} value={stop.colour} onChange={(event) => patchStop(index, { colour: event.target.value })} />
        <input type="number" aria-label={`Position of colour ${index + 1} in percent`} min={0} max={100} placeholder="Auto" value={stop.position ?? ""}
          onChange={(event) => patchStop(index, { position: event.target.value === "" ? null : Math.min(100, Math.max(0, Number(event.target.value))) })} />
        <button type="button" className="text-button" aria-label={`Remove colour ${index + 1}`} disabled={model.stops.length <= 2} onClick={() => onChange({ ...model, stops: model.stops.filter((_, position) => position !== index) })}>×</button>
      </div>)}
      <div className={styles.stopActions}>
        <button type="button" className="secondary-button" disabled={model.stops.length >= MAX_GRADIENT_STOPS} onClick={() => onChange({ ...model, stops: [...model.stops, { colour: shiftColour(model.stops.at(-1)?.colour ?? DEFAULT_SOLID), position: null }] })}>＋ Add a colour</button>
        <button type="button" className="secondary-button" onClick={() => onChange({ ...model, stops: [...model.stops].reverse() })}>Reverse</button>
      </div>
      <div className={styles.presets} aria-label="Gradient presets" role="group">
        {PRESETS.map((preset) => <button type="button" key={preset.name} style={{ background: `linear-gradient(${preset.angle}deg, ${preset.colours[0]}, ${preset.colours[1]})` } as CSSProperties}
          onClick={() => onChange({ mode: "gradient", kind: "linear", angle: preset.angle, stops: preset.colours.map((colour) => ({ colour, position: null })) })}>{preset.name}</button>)}
      </div>
    </div>}
    {model.mode === "custom" && <label>CSS colour or gradient
      <input value={model.css} maxLength={MAX_COLOUR_LENGTH + 40} spellCheck={false} aria-invalid={Boolean(problem)} placeholder={EXAMPLE_CSS} onChange={(event) => onChange({ mode: "custom", css: event.target.value })} />
    </label>}
    {model.mode !== "none" && css && <p className={styles.hint}><code data-no-translate>{css}</code> <span data-no-translate>{`${css.length}/${MAX_COLOUR_LENGTH}`}</span></p>}
    {problem && <p className={styles.fieldError} role="alert">{problem}</p>}
  </div>;
}
