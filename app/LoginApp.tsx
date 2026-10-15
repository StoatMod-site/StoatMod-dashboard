"use client";

import { useEffect, useState, type FormEvent } from "react";
import { api } from "./lib/api";
import { AccessLayout } from "./AccessLayout";
import { LocaleSelector } from "./WebsiteI18n";

export function LoginApp() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<{ authenticated: boolean }>("/api/session").then(() => window.location.replace("/dashboard")).catch(() => undefined);
  }, []);

  async function signIn(event: FormEvent) {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      await api("/api/auth/verify", { method: "POST", body: JSON.stringify({ code: code.replaceAll(/[^a-z0-9]/gi, "") }) });
      await api<{ authenticated: boolean }>("/api/session");
      window.location.replace("/dashboard");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Sign-in failed.");
      setBusy(false);
    }
  }

  return <AccessLayout eyebrow="Moderator access" title="Keep your community" accent="in good shape." description="Review activity, resolve cases, and tune protections from your server dashboard." steps={[{title:"Request your code",text:"Run ~dashboard in your Stoat server."},{title:"Check your messages",text:"Stoatmod sends a private, one-time sign-in code."},{title:"Pick up where you left off",text:"Open the dashboard for the servers you can manage."}]} utility={<LocaleSelector/>}>
    <p className="eyebrow">Secure handoff</p><h2>Enter your dashboard code</h2><p>Run <code>~dashboard</code> in your server. Stoatmod will DM you a one-time code.</p><form onSubmit={signIn}><label htmlFor="access-code">Eight-character code</label><input id="access-code" value={code} onChange={(event)=>setCode(event.target.value.toUpperCase().slice(0,8))} placeholder="AB12CD34" autoComplete="one-time-code" spellCheck={false}/>{error&&<p className="form-error" role="alert">{error}</p>}<button className="primary-button" disabled={busy||code.length<8}>{busy?"Checking…":"Open dashboard"}<span aria-hidden="true">→</span></button></form><p className="fine-print">Codes expire after 10 minutes · Sessions last 12 hours</p>
  </AccessLayout>;
}
