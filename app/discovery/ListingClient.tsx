"use client";

import { useEffect, useState, type FormEvent } from "react";
import { apiBase } from "../lib/api";
import styles from "./Discovery.module.css";

declare global {
  interface Window {
    turnstile?: {
      render: (target: string, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

function visitSource() {
  try {
    const host = document.referrer ? new URL(document.referrer).hostname.toLowerCase() : "";
    if (!host) return "direct";
    if (host === location.hostname || host.endsWith("modstoat.site")) return "discovery";
    if (host === "stoat.chat" || host === "stt.gg" || host.endsWith(".stoat.chat")) return "stoat";
    if (/(^|\.)(google|bing|duckduckgo|yahoo|yandex|ecosia|brave|baidu|naver|startpage|qwant)\./.test(host)) return "search";
    return "other";
  } catch {
    return "other";
  }
}

/**
 * Counts one profile view per browser tab session. Only the server ID and a source category
 * (search, Stoat, Discovery, direct or other) are sent: no cookie, no identifier, no referrer URL.
 */
export function ListingViewBeacon({ serverId }: { serverId: string }) {
  useEffect(() => {
    const key = "discovery-view:" + serverId;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, "1");
    } catch {
      // Private mode: the server still de-duplicates repeat visits for a short time.
    }
    const body = JSON.stringify({ server_id: serverId, source: visitSource() });
    const sent = navigator.sendBeacon?.(apiBase() + "/api/public/discovery/view", new Blob([body], { type: "text/plain" }));
    if (!sent) void fetch(apiBase() + "/api/public/discovery/view", { method: "POST", body, keepalive: true }).catch(() => undefined);
  }, [serverId]);
  return null;
}

type ReportConfig = { reasons: Record<string, string>; turnstile_configured: boolean; turnstile_site_key: string };

// Same keys as REPORT_REASONS in website/discovery_extras.py; labels live here so they are translated.
const reportReasons: Record<string, string> = {
  scam: "Scam, phishing or fake giveaway",
  nsfw: "Sexual or graphic content",
  hate: "Hate, harassment or extremism",
  impersonation: "Impersonation",
  broken_invite: "Invite does not work",
  spam: "Spam or misleading listing",
  other: "Something else",
};

export function ReportListing({ serverId, serverName }: { serverId: string; serverName: string }) {
  const [open, setOpen] = useState(false);
  const [config, setConfig] = useState<ReportConfig>();
  const [reason, setReason] = useState("");
  const [details, setDetails] = useState("");
  const [consent, setConsent] = useState(false);
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<{ ok: boolean; message: string }>();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open || config) return;
    fetch(apiBase() + "/api/public/discovery/report-config", { headers: { Accept: "application/json" } })
      .then((response) => response.ok ? response.json() : Promise.reject())
      .then((value: ReportConfig) => setConfig(value))
      .catch(() => setStatus({ ok: false, message: "Reports are unavailable right now. Try again later." }));
  }, [open, config]);

  useEffect(() => {
    if (!consent || !config?.turnstile_configured || !config.turnstile_site_key) return;
    const render = () => window.turnstile?.render("#discovery-report-turnstile", {
      sitekey: config.turnstile_site_key, action: "discovery-report", theme: "auto",
      callback: (value: string) => setToken(value), "expired-callback": () => setToken(""),
    });
    if (window.turnstile) { render(); return; }
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = render;
    document.head.appendChild(script);
    return () => { script.onload = null; };
  }, [consent, config]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setStatus(undefined);
    try {
      const response = await fetch(apiBase() + "/api/public/discovery/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ server_id: serverId, reason, details, turnstile_token: token }),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || "The report could not be sent.");
      setStatus({ ok: true, message: "Thanks. The Stoatmod team will review this listing." });
      setDetails("");
    } catch (error) {
      window.turnstile?.reset();
      setToken("");
      setStatus({ ok: false, message: error instanceof Error ? error.message : "The report could not be sent." });
    } finally {
      setBusy(false);
    }
  }

  if (!open) return <button type="button" className={styles.reportLink} onClick={() => setOpen(true)}>Report this listing</button>;
  const needsCaptcha = Boolean(config?.turnstile_configured);
  return (
    <form className={styles.reportForm} onSubmit={submit} aria-label={`Report ${serverName}`}>
      <label>Why are you reporting this listing?
        <select required value={reason} onChange={(event) => setReason(event.target.value)}>
          <option value="">Choose a reason</option>
          {Object.keys(config?.reasons || {}).filter((value) => value in reportReasons).map((value) => <option value={value} key={value}>{reportReasons[value]}</option>)}
        </select>
      </label>
      <label>Details (optional)
        <textarea maxLength={1000} value={details} onChange={(event) => setDetails(event.target.value)} placeholder="What is wrong with this listing?" />
      </label>
      {needsCaptcha && <label className="consent"><input type="checkbox" checked={consent} onChange={(event) => { setConsent(event.target.checked); if (!event.target.checked) setToken(""); }} /><span>Load Cloudflare Turnstile to check this report comes from a person. Cloudflare receives browser and connection details to run it. <a href="/privacy" target="_blank" rel="noreferrer">Privacy policy</a></span></label>}
      {needsCaptcha && consent && <div id="discovery-report-turnstile" />}
      <p className={styles.reportStatus}>Reports are anonymous. Stoatmod stores only the reason and details you write.</p>
      <button disabled={busy || !reason || !config || (needsCaptcha && !token)}>{busy ? "Sending…" : "Send report"}</button>
      {status && <p className={styles.reportStatus} role={status.ok ? "status" : "alert"}>{status.message}</p>}
    </form>
  );
}
