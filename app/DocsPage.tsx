"use client";

import { PublicFooter } from "./PublicFooter";
import { useMemo, useState } from "react";
import { publicCommands } from "./content/commands";
import { SiteNav } from "./SiteNav";
import { ResourceLibrary } from "./ResourceLibrary";
import styles from "./ReadingPage.module.css";
import { PublicPageHeading, PublicSummary } from "./PublicPageHeading";
import { PrivacyUpdateCallout } from "./PrivacyUpdateCallout";
import { OpenSourceCallout } from "./OpenSourceCallout";
import { LocaleSelector, tr, useSiteLocale } from "./WebsiteI18n";

const permissions = ["View Channels", "Read Message History", "Send Messages", "Send Embeds", "Manage Messages", "React", "Timeout Members", "Kick Members", "Ban Members", "Assign Roles", "Manage Roles", "Manage Nicknames"];

export function DocsPage({ guides }: { guides: { href: string; title: string; description: string }[] }) {
  const [query, setQuery] = useState("");
  const [locale] = useSiteLocale();
  const filtered = useMemo(
    () => publicCommands.filter((row) => `${row.join(" ")} ${tr(locale, row[1])}`.toLowerCase().includes(query.toLowerCase())),
    [locale, query],
  );
  return <main className={styles.page}>
    <SiteNav active="docs" />
    <PublicPageHeading eyebrow="Documentation" title="Documentation & commands." description="The settings, permissions, and commands behind your moderation setup." action={{href:"#commands",label:"Search commands"}} />
    <PublicSummary title="Start with a setup you understand." description="Find the prerequisites, exact commands, and checks for each task. New to Stoatmod? The quickstart takes you through your first configuration." facts={[`${guides.length} documentation pages`,`${publicCommands.length} command entries`,"Server-specific configuration"]} action={{href:"/docs/getting-started",label:"Open the quickstart"}} />
    <PrivacyUpdateCallout />
    <OpenSourceCallout />
    <div className="docs-layout">
      <aside className="docs-sidebar"><strong>Documentation</strong><a href="/docs/getting-started">Getting started</a><a href="/docs/permissions">Permissions</a><a href="/docs/automod">Automod</a><a href="/docs/commands">Commands</a><a href="/docs/troubleshooting">Troubleshooting</a><a href="#permissions">Quick permissions</a><a href="#commands">Command reference</a><div><span>Need the control room?</span><a href="/login">Moderator login →</a></div></aside>
      <article className="docs-content">
        <section className="docs-hub" id="documentation-guides"><p className="section-number">01 / DOCUMENTATION</p><h2>Choose the task you need to complete</h2><p>Find the prerequisites, commands and checks for your next task. These guides cover the hosted Stoatmod service.</p><ResourceLibrary items={guides} label="documentation pages" /></section>
        <section id="permissions"><p className="section-number">02 / PERMISSIONS</p><h2>Required permissions</h2><p>Run <code>~setup</code> after installation and whenever the role or channel structure changes. The bot role must sit above every member it moderates and every role it assigns.</p><div className="permission-grid">{permissions.map((permission) => <span key={permission}>{permission}</span>)}</div><aside className="docs-note"><strong>Verify the real outcome</strong><p>A permission audit or success message supports diagnosis, but the member, message or role state in Stoat is the source of truth.</p></aside><a className="docs-inline-link" href="/docs/permissions">Read the complete permissions and hierarchy guide →</a></section>
        <section id="commands"><p className="section-number">03 / COMMAND REFERENCE</p><div className="docs-section-heading"><div><h2>Every public command</h2><p>Copy server, channel, role, user and case IDs directly from Stoat. Toggle commands use <code>enable</code>, <code>disable</code> or <code>status</code>.</p></div><label><span>Search commands</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try auto-role…" /></label></div><div className="command-list">{filtered.map(([command, description]) => <div key={command}><code>{command}</code><p>{tr(locale, description)}</p></div>)}{!filtered.length && <p className="docs-empty">No command matches “{query}”.</p>}</div></section>
      </article>
    </div>
    <LocaleSelector />
    <PublicFooter />
  </main>;
}
