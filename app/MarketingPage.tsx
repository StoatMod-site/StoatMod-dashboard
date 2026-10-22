
import { PublicFooter } from "./PublicFooter";
import type { PublicProofServer, PublicStats } from "./lib/public-types";
import { PointerGlow } from "./PointerGlow";
import { SiteNav } from "./SiteNav";
import { FeatureIcon } from "./FeatureIcon";
import { ServerArtwork } from "./ServerArtwork";
import { siteConfig } from "./lib/site-config";
import styles from "./MarketingPage.module.css";

const features = [
  ["01", "Stoat automod", "Scan configured text and image risks, then apply the server's chosen moderation policy.", "/features/automod"],
  ["02", "Spam protection", "Control rapid messages, repeats, mass mentions and external links.", "/features/spam-protection"],
  ["03", "Moderation cases", "Record warnings and eligible actions with reasons, status and review history.", "/features/moderation-cases"],
  ["04", "Moderation statistics", "Review activity, member trends and case totals from a secure web dashboard.", "/features/moderation-statistics"],
  ["05", "Automatic roles", "Assign one or several configured roles when a new member joins.", "/features/automatic-roles"],
  ["06", "Join protection", "Challenge suspicious new accounts and give moderators a controlled bypass path.", "/features/join-protection"],
] as const;

function formattedUpdate(value: string | null | undefined) {
  if (!value) return "Public totals are temporarily unavailable";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "Public totals recently updated";
  return `Public snapshot updated ${parsed.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" })} UTC`;
}

export function MarketingPage({ initialStats, trustedServers }: { initialStats: PublicStats | null; trustedServers: PublicProofServer[] }) {
  const stats = initialStats;

  return (
    <main className={`marketing-page ${styles.page}`}>
      <PointerGlow />
      <SiteNav active="home" />
      <section className="marketing-hero">
        <div className="hero-orbit" aria-hidden="true"><span /><span /><span /></div>
        <div className="hero-copy-public">
          <div className="live-count"><i /> {stats ? <><strong>{stats.server_count.toLocaleString()}</strong> {stats.server_count === 1 ? "server" : "servers"} sharing public totals</> : <>Public network totals unavailable</>}</div>
          <p className="eyebrow">Moderation bot for Stoat servers</p>
          <h1>Automod and moderation.<br /><em>Built for Stoat servers.</em></h1>
          <p className="hero-lede">Keep spam in check, make moderation decisions clear and give your team the context to act. One Stoat bot, with protections you control.</p>
          <div className="hero-actions">
            <a className="button-light" href={siteConfig.inviteUrl} target="_blank" rel="noopener noreferrer">Add Stoatmod to your server <span>↗</span></a>
            <a className="button-ghost" href="/guides/how-to-set-up-stoatmod">Start with the setup guide</a>
          </div>
          <p className={styles.heroNote}><span>Your rules. Your thresholds. Your decisions.</span><a href="/docs">Explore the documentation →</a></p>
        </div>
        <div className="hero-console" aria-label="Example moderation workflow">
          <div className="console-top"><span>STOATMOD / REVIEWABLE</span><i /><i /><i /></div>
          <div className="console-score"><span>Example protection flow</span><strong>03</strong><small>clear stages</small></div>
          <div className="console-events">
            <p><i>01</i><span><strong>Risk detected</strong><small>Configured protection matches</small></span><b>CHECK</b></p>
            <p><i>02</i><span><strong>Policy applied</strong><small>Server settings decide the action</small></span><b>ACT</b></p>
            <p><i>03</i><span><strong>Review the record</strong><small>Eligible actions can create cases</small></span><b>REVIEW</b></p>
          </div>
          <div className={styles.consoleFooter}><span>Automation, with a review path.</span>Illustrative workflow</div>
        </div>
      </section>

      <div className="trust-strip" aria-label="Stoatmod capabilities"><span>CONFIGURABLE PROTECTION</span><span>ONE-TIME CODE ACCESS</span><span>REVIEWABLE CASES</span><span>LIVE SETTINGS</span></div>

      <section className="homepage-definition" aria-labelledby="what-is-stoatmod">
        <div><p className="eyebrow">What is Stoatmod?</p><h2 id="what-is-stoatmod">A moderation system that keeps people in control.</h2></div>
        <div><p>Stoatmod is a moderation bot for Stoat communities. It can watch the protections a server enables, apply its configured policy and preserve enough context for moderators to understand what happened.</p><p>Automatic checks do not replace human judgement. Thresholds, exclusions, moderation categories and warning escalation remain configurable by the server team.</p></div>
      </section>

      <section className="feature-section" id="features">
        <div className="section-heading"><p className="eyebrow">Built for the whole moderation team</p><h2>Protection your team<br />can configure and review.</h2><p>Use commands for quick changes and the dashboard for evidence, statistics and the complete configuration.</p></div>
        <div className="feature-grid">{features.map(([number, title, description, href]) => <a className="feature-card" href={href} key={number}><span>{number}</span><div className={styles.featureIcon}><FeatureIcon name={href.split("/").pop()!} /></div><h3>{title}</h3><p>{description}</p><b>Explore {title.toLowerCase()} →</b></a>)}</div>
        <a className={styles.sectionLink} href="/features">See all Stoatmod features <span>→</span></a>
      </section>

      <section className="homepage-flow" aria-labelledby="setup-flow-title">
        <header><p className="eyebrow">A controlled setup</p><h2 id="setup-flow-title">From installation to a verified configuration.</h2><a href="/guides/how-to-set-up-stoatmod">Open the complete setup guide →</a></header>
        <ol>
          <li><span>01</span><div><h3>Add Stoatmod</h3><p>Invite the bot through its official Stoat profile.</p></div></li>
          <li><span>02</span><div><h3>Check permissions</h3><p>Run the setup audit and correct role hierarchy or missing permissions.</p></div></li>
          <li><span>03</span><div><h3>Choose protections</h3><p>Configure moderation categories, thresholds and channel exclusions.</p></div></li>
          <li><span>04</span><div><h3>Verify an outcome</h3><p>Confirm the bot can complete a real configured action before relying on automation.</p></div></li>
        </ol>
      </section>

      <section className="trusted-section" aria-labelledby="trusted-title">
        <div className="trusted-heading"><p className="eyebrow">Approved public communities</p><h2 id="trusted-title">See servers that chose to appear in Discovery.</h2><a className="trusted-discovery-link" href="/discovery">Browse Stoat Discovery <span>→</span></a></div>
        <div className="trusted-servers">{trustedServers.map((server) => <a href={server.detail_url} key={server.server_id}><ServerArtwork serverId={server.server_id} name={server.server_name} src={server.server_icon_url} kind="icon" className="trusted-icon" /><div><strong>{server.server_name}</strong><p className={styles.communityDescription}>{server.description}</p><small>{server.member_count.toLocaleString()} members · Reviewed listing</small></div><span aria-hidden="true">↗</span></a>)}{!trustedServers.length && <p>Approved public server profiles will appear here when the public directory is available.</p>}</div>
      </section>

      <section className="numbers-section" aria-label="Stoatmod public network statistics">
        <div><span>Servers sharing public totals</span><strong>{stats ? stats.server_count.toLocaleString() : "Unavailable"}</strong></div>
        <div><span>Combined memberships</span><strong>{stats ? stats.member_count.toLocaleString() : "Unavailable"}</strong></div>
        <div><span>Historical cases recorded</span><strong>{stats ? stats.case_count.toLocaleString() : "Unavailable"}</strong></div>
        <p>{formattedUpdate(stats?.updated_at)}. Membership totals are aggregate server counts and may include the same person in more than one community.</p>
      </section>

      <section className="homepage-resources" aria-labelledby="resources-title">
        <header><p className="eyebrow">Moderator resources</p><h2 id="resources-title">Solve the task, then configure it.</h2></header>
        <div>
          <a href="/guides/how-to-stop-spam-and-mass-mentions-on-stoat"><span>Guide</span><h3>Stop spam and mass mentions on Stoat</h3><p>Choose the right protection and verify that it behaves as expected.</p></a>
          <a href="/docs/permissions"><span>Documentation</span><h3>Required permissions and role hierarchy</h3><p>Understand every permission Stoatmod needs and why actions can be blocked.</p></a>
          <a href="/guides/stoat-server-moderation-checklist"><span>Checklist</span><h3>Review your server moderation setup</h3><p>Work through permissions, policy, logs, appeals and ongoing maintenance.</p></a>
        </div>
      </section>

      <section className="automod-faq" aria-labelledby="automod-faq-title"><div><p className="eyebrow">Stoatmod FAQ</p><h2 id="automod-faq-title">A few things before you invite the bot.</h2></div><div>
        <details open><summary>What can Stoatmod protect?<span aria-hidden="true">＋</span></summary><p>Depending on your configuration, Stoatmod can check moderation categories, spam, mass mentions, external links, uploaded images, usernames, nicknames and new accounts. <a href="/features">Compare the available protections.</a></p></details>
        <details><summary>How do I set up Stoatmod?<span aria-hidden="true">＋</span></summary><p>Add the bot to your Stoat server, check its permissions and role position, then choose the protections your community needs. <a href="/guides/how-to-set-up-stoatmod">Follow the step-by-step setup guide.</a></p></details>
        <details><summary>Can moderators review automatic decisions?<span aria-hidden="true">＋</span></summary><p>Warnings and eligible moderation actions can be recorded as cases with reasons and status. The dashboard and <a href="/features/appeals">appeal flow</a> give your team a structured review path.</p></details>
        <details><summary>Is Stoatmod open source?<span aria-hidden="true">＋</span></summary><p>Stoatmod&apos;s bot, dashboard API, website and server dashboard are open source under AGPL-3.0. The GitHub repositories include setup instructions for running your own instance. <a href="/about">View the source repositories</a>.</p></details>
      </div></section>

      <section className="homepage-trust" aria-labelledby="trust-title"><div><p className="eyebrow">Trust and accountability</p><h2 id="trust-title">Check how the service is operated.</h2></div><div><a href="/security"><strong>Security and moderation safeguards</strong><span>Read the operational approach →</span></a><a href="/privacy"><strong>Privacy policy</strong><span>See what information is processed →</span></a><a href="/status"><strong>Live system status</strong><span>Check current service health →</span></a><a href="/changelog"><strong>Stoatmod changelog</strong><span>Follow meaningful updates →</span></a></div></section>

      <section className="final-cta"><img src="/brand-mark.png" alt="" width="84" height="84" loading="lazy" /><div><p className="eyebrow">Start with a verified setup</p><h2>A calmer server.<br />A clearer process.</h2></div><a href={siteConfig.inviteUrl} target="_blank" rel="noopener noreferrer">Invite Stoatmod <span>↗</span></a></section>
      <PublicFooter description="Stoat automod, moderation statistics and accountable protection for healthier communities." />
    </main>
  );
}
