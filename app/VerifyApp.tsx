"use client";

import { pluralize } from "./lib/plural";
import { useEffect, useState, type FormEvent } from "react";
import { apiBase } from "./lib/api";
import { SiteNav } from "./SiteNav";
import { PublicFooter } from "./PublicFooter";
import { PublicPageHeading, PublicSummary } from "./PublicPageHeading";
import styles from "./PrivateForms.module.css";
import { LocaleSelector, normalizeAppLocale, useSiteLocale, type AppLocale } from "./WebsiteI18n";

type VerificationInfo = {
  application_required?: boolean;
  locale: AppLocale;
  server_name: string;
  expires_at: string;
  turnstile_site_key: string;
  turnstile_configured: boolean;
  privacy_policy_version: string;
  verification_retention_days: number;
  attempts_used: number;
  attempts_remaining: number;
  max_attempts: number;
  last_failure_reason: string | null;
};

type VerificationFailure = {
  application_required?: boolean;
  error?: string;
  reason?: string;
  attempt?: number;
  attempts_remaining?: number;
  max_attempts?: number;
  kicked?: boolean;
};

declare global {
  interface Window {
    turnstile?: {
      render: (target: string, options: Record<string, unknown>) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

export function VerifyApp({ token }: { token: string }) {
  const [info, setInfo] = useState<VerificationInfo | null>(null);
  const [pageError, setPageError] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [complete, setComplete] = useState(false);
  const [failure, setFailure] = useState<VerificationFailure | null>(null);
  useSiteLocale(info ? normalizeAppLocale(info.locale) : undefined);

  useEffect(() => {
    if (!token) return;
    fetch(`${apiBase()}/api/verification?token=${encodeURIComponent(token)}`)
      .then(async (response) => {
        const body = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(body.error || "This verification link is unavailable.");
        return body as VerificationInfo;
      })
      .then((verification) => {
        setInfo(verification);
      })
      .catch((error) => setPageError(error instanceof Error ? error.message : "Verification could not be opened."));
  }, [token]);

  useEffect(() => {
    if (!privacyAgreed || complete || !info?.turnstile_configured || !info.turnstile_site_key) return;
    let cancelled = false;
    let widgetId: string | undefined;
    const render = () => {
      if (cancelled || !window.turnstile) return;
      widgetId = window.turnstile.render("#turnstile-widget", {
      sitekey: info.turnstile_site_key,
      action: "join-verification",
      theme: "light",
      callback: (value: string) => setCaptchaToken(value),
      "expired-callback": () => setCaptchaToken(""),
      "error-callback": () => setPageError("The browser CAPTCHA could not load. Refresh and try again."),
      });
    };
    let script: HTMLScriptElement | undefined;
    if (window.turnstile) render();
    else {
      script = document.createElement("script");
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      script.async = true;
      script.defer = true;
      script.onload = render;
      script.onerror = () => { if (!cancelled) setPageError("The browser CAPTCHA could not load."); };
      document.head.appendChild(script);
    }
    return () => {
      cancelled = true;
      if (script) { script.onload = null; script.onerror = null; script.remove(); }
      if (widgetId) window.turnstile?.remove(widgetId);
    };
  }, [privacyAgreed, complete, info?.turnstile_configured, info?.turnstile_site_key]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!privacyAgreed || !info) {
      setPageError("Agree to the privacy policy and verification processing before submitting.");
      return;
    }
    setBusy(true); setPageError("");
    try {
      const response = await fetch(`${apiBase()}/api/verification/complete`, {
        method: "POST",
        credentials: "include",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({
          token,
          turnstile_token: captchaToken,
          privacy_policy_agreed: privacyAgreed,
          privacy_policy_version: info.privacy_policy_version,
        }),
      });
      const body = await response.json().catch(() => ({})) as VerificationFailure;
      if (!response.ok) {
        setFailure(body);
        setInfo((current) => current ? {
          ...current,
          attempts_used: body.attempt ?? current.attempts_used,
          attempts_remaining: body.attempts_remaining ?? current.attempts_remaining,
          max_attempts: body.max_attempts ?? current.max_attempts,
          last_failure_reason: body.reason ?? current.last_failure_reason,
        } : current);
        throw new Error(body.error || "Verification failed.");
      }
      setFailure(null);
      if (body.application_required) setInfo((current) => current ? {...current, application_required: true} : current);
      setComplete(true);
    } catch (error) {
      setPageError(error instanceof Error ? error.message : "Verification failed.");
      window.turnstile?.reset();
      setCaptchaToken("");
    } finally {
      setBusy(false);
    }
  }

  return <main className={`verify-page ${styles.verify}`}>
    <SiteNav />
    <PublicPageHeading eyebrow="Member access" title="Join verification." description="Complete the checks requested by your Stoat server." action={{href:"/privacy",label:"Privacy information"}} />
    <PublicSummary title={complete?"Your checks are complete.":"A safer start for your community."} description={complete?"Follow the next step below to continue in Stoat.":"Review the privacy notice, agree to verification processing and complete the browser CAPTCHA."} facts={["One-time server link","Browser CAPTCHA","No IP scanning"]} />
    <div className={styles.verificationLayout}><section className="verify-card">
      <div className="verify-step">JOIN / VERIFY</div>
      {complete ? <div className="verify-result"><span>✓</span><h2>{info?.application_required ? "Checks passed." : "Verification complete."}</h2><p>{info?.application_required ? "Return to your Stoatmod DMs to answer the application questions. Server access stays restricted until an admin approves your application." : "The bot is removing your temporary restriction. You can safely close this page and return to Stoat."}</p></div> : <>
        <p className="eyebrow">Secure member check</p>
        <h2>{info ? `Join ${info.server_name}` : !token || pageError ? "Verification unavailable." : "Preparing verification…"}</h2>
        <p className="verify-lede">This one-time browser CAPTCHA helps the server check that you are human. Stoatmod does not scan your IP address, store it or use it to identify alternate accounts.</p>
        {info && <div className="verify-attempts" aria-live="polite"><div><span>Verification attempt</span><strong>{Math.min(info.attempts_used + 1, info.max_attempts)}/{info.max_attempts}</strong></div><p>{pluralize(info.attempts_remaining,"attempt","attempts")} remaining</p>{(failure?.reason||info.last_failure_reason)&&<p className="verify-failure-reason"><b>Reason:</b> {failure?.reason||info.last_failure_reason}</p>}</div>}
        {info && <div className="scan-list"><div><i className={info.turnstile_configured ? "ready" : "missing"}/><span><strong>Browser CAPTCHA</strong><small>{info.turnstile_configured ? "Loads after you agree below" : "Not configured by the server owner"}</small></span></div><div><i className="ready"/><span><strong>One-time link</strong><small>Expires {new Date(info.expires_at).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</small></span></div></div>}
        {info?.turnstile_configured && <form onSubmit={submit}>
          <div className={styles.verificationConsent}>
            <p id="verification-data-notice">Stoatmod uses your Stoat user and server IDs, one-time verification token, CAPTCHA result, and the time and version of your agreement to verify this join. This link expires on {new Date(info.expires_at).toLocaleString()}; verification results and agreement records are deleted after {info.verification_retention_days} days. Cloudflare processes browser and connection information to provide the CAPTCHA. You can stop before submitting or request deletion through the privacy policy contact.</p>
            <label><input type="checkbox" required checked={privacyAgreed} disabled={busy} aria-describedby="verification-data-notice" onChange={(event)=>{setPrivacyAgreed(event.target.checked);setCaptchaToken("");}}/><span>I agree to the <a href="/privacy" target="_blank" rel="noreferrer">privacy policy</a> and the verification data processing described above.</span></label>
          </div>
          <div id="turnstile-widget" className="turnstile-slot"/>
          <button className="primary-button" disabled={busy || !privacyAgreed || !captchaToken}>{busy ? "Running checks…" : info.application_required ? "Verify and start application" : "Verify and enter server"}<span>→</span></button>
        </form>}
        {(pageError || !token) && <p className="verify-error" role="alert">{pageError || "This verification link is missing or invalid."}</p>}
        <p className="verify-privacy">Your agreement covers this verification. If you cannot complete it, contact the server moderators. <a href="/privacy">Read the privacy policy.</a></p>
      </>}
    </section><aside className={styles.verificationHelp}><p className="section-number">How verification works</p><h2>Three checks. One link.</h2><ol><li><strong>Open your private link</strong><p>Use the link from the bot for the server you want to join.</p></li><li><strong>Complete the browser check</strong><p>Follow the CAPTCHA instructions if the server has enabled them.</p></li><li><strong>Return to Stoat</strong><p>Check your DMs for the result and any application questions.</p></li></ol><a href="/docs/server-applications">Read about server applications →</a></aside></div>
    <LocaleSelector />
    <PublicFooter />
  </main>;
}
