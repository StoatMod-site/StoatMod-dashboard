import { Breadcrumbs } from "../Breadcrumbs";
import { PublicFooter } from "../PublicFooter";
import { OpenSourceCallout } from "../OpenSourceCallout";
import { PublicPageHeading, PublicSummary } from "../PublicPageHeading";
import { SiteNav } from "../SiteNav";
import { JsonLd } from "../JsonLd";
import { breadcrumbSchema, organizationSchema, webPageSchema, websiteSchema } from "../lib/schema";
import { buildMetadata } from "../lib/seo";
import { absoluteUrl, siteConfig } from "../lib/site-config";
import styles from "./PrivacyChanges.module.css";

const contents = [
  ["timeline", "Every change, newest first"],
  ["changes", "The October rebuild"],
  ["retention", "What we keep, and for how long"],
  ["remains", "What's still there"],
  ["why", "Why we changed"],
  ["commitment", "What happens next"],
] as const;

const timeline = [
  {
    date: "19 November 2026",
    title: "Other bots moved to their own page",
    items: [
      "Everything about how other Stoat bots handle your data, and what Stoat has said about the rules, now lives on its own page, so this one only covers what Stoatmod changed.",
    ],
    link: { href: "/stoat-privacy", label: "Stoat bots and how they use your data" },
  },
  {
    date: "20 October 2026",
    title: "Removed images and uploaded files get a deadline",
    items: [
      "When Stoatmod removes an image, moderators can see what was removed behind a content warning. Graphic violence is kept only as a reduced copy. Explicit nudity is kept only as a small thumbnail that is permanently blurred, and the original is never stored. Images that may involve minors are never kept at all.",
      "These copies are deleted with the case content 30 days after the decision, or when an appeal is decided.",
      "Every uploaded file, including report evidence, case evidence and appeal attachments, is now deleted 30 days after upload unless an open appeal needs it.",
    ],
  },
  {
    date: "19 October 2026",
    title: "Image scanning on by default",
    items: [
      "Image scanning now runs by default, on our own hardware like text moderation. It checks only for graphic gore and explicit nudity, and the image isn't kept unless it's removed.",
      "Servers that had turned image scanning off kept their choice. Server owners can still turn it off for the whole server or for single channels.",
    ],
  },
  {
    date: "15 October 2026",
    title: "Our code is public",
    items: [
      "We published the bot, the dashboard API and the website under AGPL-3.0, so anyone can check that Stoatmod does what this page says.",
    ],
    link: { href: siteConfig.botSourceUrl, label: "Bot and API source" },
  },
  {
    date: "14 October 2026",
    title: "Older message text purged, and new features built to expire",
    items: [
      "The 30-day deletion rule now covers the message text in every kind of moderation record, not just AI decisions. Older records that still had message text were cleaned up the same day.",
      "The optional Thinking check stores the AI's reasoning about a flagged message. It's off by default and deleted with the original message after 30 days.",
      "Join protection, which stops new members posting links or attachments for a while, records only the server, the account and the start and end times, and deletes that record when protection ends.",
      "The report form now loads Cloudflare Turnstile only after you agree to it, the same as join verification.",
    ],
  },
  {
    date: "2 October 2026",
    title: "The October rebuild",
    items: [
      "After Stoat's privacy review, we stopped using outside AI, removed IP checks, cross-server sharing and personal stats, deleted old data and set deadlines for everything we keep. The details are in the next section.",
    ],
  },
] as const;

const changes = [
  {
    number: "01",
    title: "We stopped sending messages to OpenAI",
    body: "Moderation now runs on our own model, on hardware we control. Your messages no longer go to an outside AI company, and we haven't used anyone's messages to train or fine-tune the model.",
  },
  {
    number: "02",
    title: "We removed the developer webhook",
    body: "We deleted the developer audit webhook and its channel, along with anything it had queued up or kept.",
  },
  {
    number: "03",
    title: "We deleted old data",
    body: "Old message content, member information and hashed IP identifiers covered by the review are gone, including from the backups we manage.",
  },
  {
    number: "04",
    title: "We dropped IP and alt-account checks",
    body: "We no longer store IP addresses or IP fingerprints, and we've stopped checking for alt accounts, VPNs, proxies, Tor or IP reputation.",
  },
  {
    number: "05",
    title: "We stopped sharing between servers",
    body: "Join histories and cross-server alerts are gone, and so is the data behind them. Global bans and warnings stay, because we still need them to deal with abuse directly.",
  },
  {
    number: "06",
    title: "We removed personal stats",
    body: "No more popular-word lists, per-user activity counts or leaderboards. The dashboard only shows anonymous totals for each server now.",
  },
] as const;

const retentionRows = [
  {
    feature: "Join CAPTCHA",
    rule: "Off unless a server turns it on. You have to agree to a short privacy notice before you can submit it.",
    period: "We delete verification records within 30 days.",
  },
  {
    feature: "Join protection",
    rule: "On by default. Stops new members posting links or attachments for a while, and tells them by DM when it starts and ends.",
    period: "The record is deleted when protection ends (1 day by default, at most 30 days) or when the member leaves.",
  },
  {
    feature: "Member applications",
    rule: "You see the privacy notice before any questions. Only moderators of the server you're applying to can read your answers.",
    period: "Deleted 14 days after you apply, whatever the outcome. If nobody has decided by then, the application is denied automatically.",
  },
  {
    feature: "AI moderation",
    rule: "We only keep a message if the AI actually took action on it. Ordinary messages, deleted messages and harmless edits aren't saved.",
    period: "If you don't appeal, the message is deleted 30 days after the decision.",
  },
  {
    feature: "AI reasoning (Thinking)",
    rule: "Only if a server turns on the optional Thinking check. The AI's reasoning about a flagged message is shown to that server's moderators.",
    period: "Deleted with the original message, 30 days after the decision unless you appeal.",
  },
  {
    feature: "Removed images",
    rule: "Graphic violence is kept as a reduced copy and explicit nudity only as a permanently blurred thumbnail. Images that may involve minors are never kept.",
    period: "Deleted with the case content 30 days after the decision, or when an appeal is decided.",
  },
  {
    feature: "Uploaded files",
    rule: "Report evidence, case evidence added by moderators, and attachments sent with appeals or to our support email.",
    period: "Deleted 30 days after upload, unless an open appeal needs them.",
  },
  {
    feature: "Other moderation records",
    rule: "Automatic link removals, self-harm removals and automation runs keep the message text only so moderators can review what happened.",
    period: "The message text is deleted 30 days after the event, unless an open appeal needs it. The case outcome, dates and scores stay.",
  },
  {
    feature: "Appeals",
    rule: "Appealing has its own privacy notice. If you appeal in time, we keep the message until a moderator decides, but never for more than 10 days after you appeal.",
    period: "So an appeal on day 29 could keep the message until day 39 at the latest. It's deleted once the appeal is decided, or when it's automatically rejected at 10 days.",
  },
  {
    feature: "Helping improve the AI (optional)",
    rule: "When you appeal, you can tick a box to let us use your own moderated message to help fix mistakes the AI makes. It's unticked by default.",
    period: "If you opt in, we can keep that one message for up to 90 days after the appeal is decided.",
  },
] as const;

const seo = {
  title: "What We Changed About Privacy | Stoatmod",
  headline: "What we changed about privacy, and when.",
  description: "Every change Stoatmod has made to how it handles your data, newest first: AI on our own hardware, 30-day deletion, no IP checks and deadlines for files.",
  path: "/privacy-changes",
  image: "/og-privacy-changes.png",
  imageAlt: "Stoatmod privacy update: what we changed. Less data, kept for less time.",
  publishedTime: "2026-10-02T00:00:00+01:00",
  modifiedTime: "2026-11-19T00:00:00+00:00",
};

export const metadata = {
  ...buildMetadata({
    title: seo.title,
    description: seo.description,
    path: seo.path,
    image: seo.image,
    imageAlt: seo.imageAlt,
    imageWidth: 1200,
    imageHeight: 630,
    type: "article",
    modifiedTime: seo.modifiedTime,
  }),
  keywords: ["Stoatmod privacy", "Stoatmod privacy changes", "Stoat moderation bot", "data retention", "self-hosted AI moderation"],
};

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    organizationSchema(),
    websiteSchema(),
    webPageSchema({ title: seo.title, description: seo.description, path: seo.path }),
    {
      "@type": "Article",
      "@id": `${absoluteUrl(seo.path)}#article`,
      headline: seo.headline,
      description: seo.description,
      image: { "@type": "ImageObject", url: absoluteUrl(seo.image), width: 1200, height: 630 },
      datePublished: seo.publishedTime,
      dateModified: seo.modifiedTime,
      inLanguage: "en-GB",
      mainEntityOfPage: { "@id": `${absoluteUrl(seo.path)}#page` },
      author: { "@id": `${siteConfig.origin}/#organization` },
      publisher: { "@id": `${siteConfig.origin}/#organization` },
      about: ["Privacy", "Data retention", "Content moderation"],
    },
    breadcrumbSchema([
      { name: siteConfig.name, path: "/" },
      { name: "Privacy changes", path: seo.path },
    ]),
  ],
};

export default function PrivacyChangesPage() {
  return (
    <main className={styles.page}>
      <JsonLd data={schema} />
      <SiteNav />
      <div className={styles.draftBar} role="status">
        <strong>Privacy changes</strong>
        <span>Published 2 October 2026 · Updated 19 November 2026</span>
      </div>
      <Breadcrumbs items={[
        { name: siteConfig.name, path: "/" },
        { name: "Privacy changes", path: "/privacy-changes" },
      ]} />

      <PublicPageHeading
        compact
        eyebrow="Privacy changes"
        title={<>What we changed about privacy,<br />and when.</>}
        description="Every change Stoatmod has made to how it handles your data, newest first. It starts with the rebuild after Stoat's privacy review in October 2026 and carries on with everything since."
        action={{ href: "/privacy", label: "Read the privacy policy" }}
      />
      <PublicSummary
        title="Less data, kept for less time."
        description="We've stopped using outside AI, IP checks, cross-server sharing and per-user stats. Everything we still keep, including removed images and uploaded files, has a deletion deadline."
        facts={["AI runs on our own hardware", "Clear deletion deadlines", "Anonymous server totals only"]}
      />

      <OpenSourceCallout />
      <div className={styles.layout}>
        <aside className={styles.toc} aria-label="On this page">
          <strong>On this page</strong>
          {contents.map(([id, label], index) => (
            <a key={id} href={`#${id}`}><span>{String(index + 1).padStart(2, "0")}</span>{label}</a>
          ))}
        </aside>

        <article className={styles.article}>
          <section className={styles.section} id="timeline">
            <p className={styles.sectionNumber}>01 / Every change, newest first</p>
            <h2>A record of every privacy change we&apos;ve made.</h2>
            <p className={styles.lede}>Each entry is already live. None of it is a promise about the future.</p>
            <ol className={styles.timeline}>
              {timeline.map((entry) => (
                <li key={entry.date}>
                  <time>{entry.date}</time>
                  <div>
                    <h3>{entry.title}</h3>
                    <ul>{entry.items.map((item) => <li key={item}>{item}</li>)}</ul>
                    {"link" in entry && <a href={entry.link.href}>{entry.link.label} <span aria-hidden="true">→</span></a>}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className={styles.section} id="changes">
            <p className={styles.sectionNumber}>02 / The October rebuild</p>
            <h2>We switched things off, deleted old data and collect less.</h2>
            <p className={styles.lede}>These six changes went live by 2 October 2026, within the 30 days Stoat gave us.</p>
            <div className={styles.changeGrid}>
              {changes.map((change) => (
                <article className={styles.changeCard} key={change.number}>
                  <span>{change.number}</span>
                  <h3>{change.title}</h3>
                  <p>{change.body}</p>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.section} id="retention">
            <p className={styles.sectionNumber}>03 / What we keep, and for how long</p>
            <h2>Everything we keep has a deadline.</h2>
            <p>We keep only what each feature needs to work, and time-limited content is deleted automatically. The <a href="/privacy">privacy policy</a> has the full details, including exactly what each form collects.</p>
            <div className={styles.retentionTable} role="table" aria-label="What Stoatmod keeps and when it's deleted">
              <div className={styles.tableHead} role="row">
                <span role="columnheader">Feature</span>
                <span role="columnheader">How it works</span>
                <span role="columnheader">When it&apos;s deleted</span>
              </div>
              {retentionRows.map((row) => (
                <div className={styles.tableRow} role="row" key={row.feature}>
                  <strong role="cell">{row.feature}</strong>
                  <p role="cell">{row.rule}</p>
                  <p role="cell">{row.period}</p>
                </div>
              ))}
            </div>
            <div className={styles.note}>
              <strong>Your server&apos;s own mod log</strong>
              <p>If a server has a mod-log channel set up, we post each automatic decision there. Those messages belong to that server, not to us. They live on Stoat, outside our database and files.</p>
            </div>
            <div className={styles.note}>
              <strong>In line with Stoat&apos;s guidance</strong>
              <p>Stoat has said message content should be kept for 30 days unless there&apos;s a specific reason to keep it longer, such as a moderation case being appealed at 29 days. That&apos;s the schedule above. Stoat&apos;s full answers are on <a href="/stoat-privacy#stoat-guidance">Stoat bots and how they use your data</a>.</p>
            </div>
          </section>

          <section className={styles.section} id="remains">
            <p className={styles.sectionNumber}>04 / What&apos;s still there</p>
            <h2>Moderators can still see what happened without us keeping your message forever.</h2>
            <p>After a message is deleted, a server&apos;s moderators can still see the outcome, why the AI acted and the scores it gave. They can see what Stoatmod did, but the dashboard doesn&apos;t become a permanent archive of people&apos;s messages.</p>
            <ul className={styles.plainList}>
              <li>Global bans and warnings stay. Only authorised Stoatmod admins can see them, and only to deal with abuse directly.</li>
              <li>Each server&apos;s moderators can see only their own server&apos;s members and history. We&apos;ve asked Stoat to confirm this Members tab can stay as it is, and we&apos;re waiting for a reply.</li>
              <li>Server stats are anonymous totals only. No popular words, no per-person counts and no rankings.</li>
              <li>When Stoatmod is removed from a server, we delete everything we hold for that server, except network-level enforcement records such as a server blacklist entry. This matches Stoat&apos;s guidance that other data can be kept until the bot is removed.</li>
              <li>Join verification and the report form still use Cloudflare Turnstile as a browser CAPTCHA, but only after the person agrees: it doesn&apos;t load until they tick the agreement. Stoat has not objected to us continuing to use it where the person consents.</li>
              <li>Our AI reads every message in the channels it moderates, and images too unless a server turns image scanning off. Stoat has said this is allowed without opt-in as long as nothing is kept after the check, which is how it works: only messages the AI acts on are kept, and only for the times above.</li>
              <li>Moderators can choose to get a private ping when someone appeals in their server. The ping doesn&apos;t include the message or the appeal itself.</li>
            </ul>
          </section>

          <section className={`${styles.section} ${styles.argument}`} id="why">
            <p className={styles.sectionNumber}>05 / Why we changed</p>
            <h2>Stoat reviewed Stoatmod, and we rebuilt it.</h2>
            <p>On 5 September 2026, Stoat Trust &amp; Safety gave us 30 days to remove or redesign the parts of Stoatmod that collected or kept data without consent. The notice quoted Stoat&apos;s published Community Guidelines:</p>
            <figure className={styles.mailQuote}>
              <blockquote>
                <p>&ldquo;We do not permit the gathering of any personally identifiable information (PII) without end-user consent. This includes, but is not limited to, the automated scraping of messages, member lists, and user profiles without explicit permission from the users whose data is being collected.&rdquo;</p>
              </blockquote>
              <figcaption>Stoat Community Guidelines, quoted in Stoat&apos;s notice · 5 September 2026</figcaption>
            </figure>
            <p>We made the October changes within that deadline, and we&apos;ve kept going since. The full email chain shows exactly what Stoat asked of us.</p>
            <a className={styles.emailLink} href="/stoat-trust-and-safety-emails.pdf" target="_blank" rel="noopener">
              <span>Read the full email chain with Stoat Trust &amp; Safety</span>
              <span>PDF · 7 messages, 5 Sep to 2 Oct · opens in a new tab ↗</span>
            </a>
            <div className={styles.stoatConnection}>
              <span>What about other bots?</span>
              <h3>We think every bot should be held to the same rules.</h3>
              <p>We&apos;ve looked at how AutoMod, Kuma, bronx, bolt, log_it and others handle your data, what&apos;s changed since, and what Stoat has said about the rules. That now has its own page.</p>
              <div className={styles.connectionLinks}>
                <a href="/stoat-privacy">Stoat bots and how they use your data <span aria-hidden="true">→</span></a>
                <a href="/stoat-privacy#stoat-guidance">What Stoat has said <span aria-hidden="true">→</span></a>
              </div>
            </div>
          </section>

          <section className={`${styles.section} ${styles.commitment}`} id="commitment">
            <p className={styles.sectionNumber}>06 / What happens next</p>
            <h2>We&apos;ll keep telling you what we change.</h2>
            <p>Every future change to how Stoatmod handles your data will be added to the top of this page. We&apos;ll fix things when the evidence says we should, stick to our deletion deadlines and give you a real choice wherever consent is needed. When Stoat publishes its developer guidelines, we&apos;ll check Stoatmod against them and record what we change here.</p>
            <p className={styles.closing}>Less data, kept for less time, and a public record of every change.</p>
            <div className={styles.actions}>
              <a href="/privacy">Read the privacy policy <span aria-hidden="true">→</span></a>
              <a href="/stoat-privacy">How other Stoat bots use your data <span aria-hidden="true">→</span></a>
              <a href={`mailto:${siteConfig.contactEmail}`}>Get in touch <span aria-hidden="true">→</span></a>
            </div>
          </section>
        </article>
      </div>

      <PublicFooter description="Transparent moderation, clear deletion deadlines and real privacy choices." />
    </main>
  );
}
