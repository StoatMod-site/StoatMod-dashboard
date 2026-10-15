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
  ["changes", "What we changed"],
  ["retention", "What we keep, and for how long"],
  ["remains", "What's still there"],
  ["consistency", "Why we're raising this"],
  ["examples", "Examples"],
  ["request", "What we're asking Stoat for"],
  ["commitment", "What happens next"],
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
    period: "If you opt in, we can keep that one message for up to 90 days after the appeal is decided. We haven't trained on anyone's messages so far.",
  },
] as const;

const automodSource = "https://tangled.org/vale.rocks/AutoMod/blob/32cf0a36481ee7dfcca310f5a06aa73f4cd20461";

const automodFindings = [
  {
    title: "The code prints the text of every message",
    body: "Every message AutoMod sees, in every server, is printed with its full text to the bot's output, and nothing in the code turns this off. Under the Docker setup in AutoMod's self-hosting guide, that output would be saved to a log file with no size limit. AutoMod's developer has since told us these logs are a debugging feature and aren't kept on the official instance.",
    file: "packages/bot/src/bot/modules/command_handler.ts#L40",
  },
  {
    title: "Every command logged with who ran it",
    body: "Each command is also logged with the person's username and user ID, the server's name and the full text of the command.",
    file: "packages/bot/src/bot/modules/command_handler.ts#L126",
  },
  {
    title: "No privacy policy, despite Stoat's trust signals",
    body: "AutoMod's support server carries Stoat's verified badge, its developer is on the Stoat team, and its README calls it \"Stoat's premier moderation bot\". Yet its website, docs and source code have no privacy policy, terms or privacy notice, so members can't find out what it collects, how long it keeps it or how to ask for deletion. Its developer has told us Stoat has asked for one and that it's being prepared with legal advice.",
    file: "README.md",
  },
  {
    title: "Votekick votes stored",
    body: "Votekicks save who voted against whom, in which server and when. We found nothing that deletes these records.",
    file: "packages/bot/src/bot/modules/votekick.ts#L97",
  },
] as const;

const kumaFindings = [
  {
    title: "Cross-server flagging, on by default",
    fixed: true,
    update: "Fixed on 14 October 2026. Kuma's updated privacy policy says Stoat communities are excluded from cross-server flagging, and its announcement says Raid Guard no longer uses other communities' reports on Stoat.",
    body: "Kuma's Raid Guard \"automatically isolates or kicks accounts that have been auto-flagged for raid/spam activity in other Kuma-protected communities\". Its dashboard lists Raid Guard as \"(on by default)\", and its verification queue scores new members on a factor called \"Flagged in another Kuma server\". Its privacy policy says data is only shared between communities an admin has \"explicitly connected\", but Raid Guard draws on every Kuma server.",
    sources: [
      { label: "Commands page: !raidguard", href: "https://kumabot.xyz/commands" },
      { label: "Demo dashboard: Moderation → AutoMod & Anti-Raid, and Verification Queue", href: "https://kumabot.xyz/demo?role=owner" },
      { label: "Privacy policy: section 4, \"Linked communities you connect\"", href: "https://kumabot.xyz/privacy" },
    ],
  },
  {
    title: "IP checks and network linking, on by default",
    fixed: true,
    update: "Fixed on 14 October 2026. Kuma's updated privacy policy says that on Stoat it has no Cloudflare captcha, no VPN or proxy check and no IP hashing, and that its verification doesn't look at your connection.",
    body: "Kuma's verification help text says \"With 'ip on' (default) a captcha-passer's connection is screened for VPN/proxy or high-risk IPs (via proxycheck.io) and same-network accounts are linked on the Member Dossier\", using a hashed IP kept for 30 days. Its privacy policy describes anti-VPN as something used only \"where a server enables the anti-VPN option\".",
    sources: [
      { label: "Commands page: verification", href: "https://kumabot.xyz/commands" },
      { label: "Privacy policy: section 1, \"Verification\"", href: "https://kumabot.xyz/privacy" },
    ],
  },
  {
    title: "Bridging without member consent",
    body: "A server owner can bridge a channel to Discord and Fluxer with !bridge. Kuma's privacy policy says it then copies members' messages, \"their text, attachments, and your username and avatar\", to the other platforms. The only control it mentions is that \"bridging is off until an admin sets it up\". We found no notice to members, consent step or opt-out in its policy or command help, so this raises the same consent question as bolt.",
    sources: [
      { label: "Commands page: !bridge", href: "https://kumabot.xyz/commands" },
      { label: "Privacy policy: section 1, \"Cross-platform bridging\"", href: "https://kumabot.xyz/privacy" },
    ],
  },
] as const;

const boltSource ="https://codeberg.org/jersey/lightning/src/commit/39ac9ff656755e16074ef4c63c554826ea7a2901";

const boltFindings = [
  {
    title: "Every message in a bridged channel leaves Stoat",
    body: "Once a server admin links a channel, every message posted in it is copied to the other platforms in the bridge, such as Discord, Telegram or Matrix. The only check is whether the channel is bridged, not who sent the message.",
    file: "cmd/lightning/bridge.go#L18-L40",
  },
  {
    title: "No consent, notice or opt-out for members",
    body: "The bridge has three settings: whether @everyone mentions pass through, whether platform names are shown, and whether join codes expire. There's nothing that asks members for consent, tells them the channel is bridged or lets one person opt out.",
    file: "cmd/lightning/commands.go#L294-L317",
  },
  {
    title: "Members may not know the channel is bridged",
    body: "Someone can join a server, open a channel and start chatting without realising their messages, name and avatar are being reposted on another platform where Stoat's rules and deletion controls don't apply.",
    file: "cmd/lightning/bridge.go#L40",
  },
] as const;

const botCentralBots = [
  { name: "DailyFacts", id: "01H2ZZ46M5ASFTGP3F7PE8G3SZ" },
  { name: "Starboard", id: "01H2Y6PWF5HG5KC1TQ6E6V0XBB" },
  { name: "Logger", id: "01H302WEK18E6F06NXW3ZF1JQ4" },
] as const;

const botCentralFindings = [
  {
    title: "No privacy policy, terms or notice",
    body: "None of the three bots has a privacy policy, terms or privacy notice. Their bot profiles link only to the support server, and we found nothing there that explains what the bots collect or how long they keep it.",
  },
  {
    title: "No website or source code",
    body: "There's no website, documentation or public source code for any of them, so nobody can check what they do with the messages and member events they receive.",
  },
  {
    title: "Logger promises a \"complete record\"",
    body: "Logger's profile advertises logging of message edits, deletions, joins and leaves, and says it will \"keep a complete record of your server's activity\". It doesn't say where that record is kept or for how long.",
  },
  {
    title: "Apparently no longer maintained",
    body: "Their profiles still describe them as Revolt bots and link to rvlt.gg, Stoat's old name and domain. Bots that are still running but no longer maintained keep receiving data with nobody accountable for it.",
  },
] as const;

const bronxSource = "https://codeberg.org/siq/bronx-stoat/src/commit/4d15cd47900e186201d78f9e873f570a38c95971";

const bronxFindings = [
  {
    title: "Per-person activity history",
    body: "Each person's daily message, edit, delete and command counts are stored for every server and every channel until they opt out or the bot leaves. Stoat's latest guidance allows this kind of data to be kept that long, but says counts tied to a person are user data that need opt-in.",
    file: "database/tables.cpp",
  },
  {
    title: "A leaderboard across servers",
    body: "Anyone can run .stats top g to rank the most active people across every server bronx is in, even outside a server. People are ranked whether or not they've ever used bronx, unless they've opted out. Stoat says cross-server rankings fall under a bot's general opt-in.",
    file: "cogs/stats.h#L161-L187",
  },
  {
    title: "Server details sent to a developer channel",
    body: "When bronx joins or leaves a server, it posts the server's name, ID, owner and member counts to a fixed Stoat channel. A developer webhook like this is something Stoatmod was told to remove.",
    file: "main.cpp",
  },
  {
    title: "Applications kept indefinitely",
    body: "Application answers are stored with the applicant's user ID and no deletion deadline. Stoat's latest guidance says content like this should be kept for 30 days unless there's a specific reason to keep it longer. Stoatmod deletes applications after 14 days.",
    file: "database/tables.cpp",
  },
  {
    title: "Messages relayed to other platforms",
    body: "When an admin bridges a channel, bronx relays members' messages, names and avatars to another platform. Members get no notice or choice before their messages leave the server.",
    file: "cogs/bridge.h",
  },
] as const;

const stoatGuidance = [
  {
    question: "Per-person statistics: are message, edit, delete and command counts tied to a user ID allowed?",
    answer: "You can store these yes, but if they are tied to a user then they must be considered user data/user statistics and not generic statistics, and would fall under #4.",
  },
  {
    question: "Opt-in or opt-out: is a one-command opt-out enough, or is opt-in required?",
    answer: "At this time we're asking everyone to use opt-in. This may be changed/become more nuanced in future developer policies.",
  },
  {
    question: "Cross-server rankings: is a leaderboard across every server allowed?",
    answer: "I would say this falls under your general data collection opt in, though offering the option to opt out of that feature specifically may be nice (this isn't a requirement, just a personal opinion).",
  },
  {
    question: "Retention: how long can activity stats, command logs, edit and delete history, and applications be kept?",
    answer: "Data that contains PII (eg. message content, attachments) should be kept for 30 days unless there is an explicit reason to keep it further (eg. moderation case that is being appealed at 29 days). Other operational data may be kept as long as it is relevant (The longest period would likely be until the bot is removed from the server).",
  },
  {
    question: "Bridges: does an admin setting up a bridge count as authorisation, or do members need notice or to consent?",
    answer: "Tbh we're still discussing policy on bridge bots, I don't have an answer on this currently.",
  },
  {
    question: "Privacy policies: will they be mandatory for every bot that handles user data?",
    answer: "We would like bots to have privacy policies. I can confirm this will be a requirement with our new policies.",
  },
  {
    question: "Developer guidelines: is there a timeline, and will existing bots get time to comply?",
    answer: "In the works yes, no timeline atm. [...] yes there will be a migration period.",
  },
] as const;

const stoatppSource ="https://codeberg.org/siq/stoatplusplus/src/commit/ee2d509545537e666862fef6e1e10afc7284bfa1";

const bronxConsent = [
  {
    title: "Everyone is counted per person, automatically",
    body: "Every message is counted against the sender's user ID from the moment bronx joins. Only the number is stored, not what was said. Server-wide totals would be anonymous, but these counts are tied to each person and used to rank them.",
    label: "main.cpp#L1010-L1021",
    href: `${bronxSource}/main.cpp#L1010-L1021`,
  },
  {
    title: "Members can opt out, but aren't asked first",
    body: "bronx's privacy page lets anyone download their data or opt out, which deletes their records and stops future tracking. The code supports this: messages from an opted-out user are dropped before bronx counts them. But nobody is asked before counting starts, and Stoat has since said it's asking every bot to use opt-in.",
    label: "bronx privacy page",
    href: "https://bronx.siqnole.dev/privacy",
  },
  {
    title: "Its privacy page says nothing is collected passively",
    body: "The privacy page says \"nothing is collected passively — data is only written when you interact with a feature\". The code counts every message a person sends, whether or not they've ever used bronx.",
    label: "main.cpp#L1011",
    href: `${bronxSource}/main.cpp#L1011`,
  },
  {
    title: "Anyone can see the rankings",
    body: "The stats commands are open to every member. They show who sends the most messages in a server, and across all servers with the global option. People are listed unless they've opted out.",
    label: "cogs/stats.h#L161-L187",
    href: `${bronxSource}/cogs/stats.h#L161-L187`,
  },
  {
    title: "Even server admins aren't asked",
    body: "XP levels stay off until an admin turns them on. Activity tracking and the leaderboards don't: they start as soon as bronx joins a server.",
    label: "main.cpp#L1023-L1025",
    href: `${bronxSource}/main.cpp#L1023-L1025`,
  },
] as const;

const requests = [
  "A mandatory privacy policy for every bot that handles user data, explaining what it collects, why, how it's used, who it's shared with, how long it's kept and how to ask for deletion.",
  "One clear consent standard for every bot, including what counts as actually saying yes.",
  "Clear rules on moderation, logging, message context and automatic filtering within a server.",
  "Maximum retention times and deletion rules for live data, files, logs and backups.",
  "A clear line between sending data to an outside company and running a model yourself.",
  "One platform-wide rule for records, alerts, bans and warnings that cross servers.",
  "A way for users and bot developers to get an answer on policy without anyone's private case being exposed.",
] as const;

const seo = {
  title: "What We Changed About Privacy | Stoatmod",
  headline: "What we changed. Why it should apply to everyone.",
  description: "Stoatmod's AI now runs on our own hardware, moderated messages are deleted within 30 days and IP checks are gone. Here's what changed and why.",
  path: "/privacy-changes",
  image: "/og-privacy-changes.png",
  imageAlt: "Stoatmod privacy update: what we changed. Less data, kept for less time.",
  publishedTime: "2026-10-02T00:00:00+01:00",
  modifiedTime: "2026-10-14T00:00:00+01:00",
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
  keywords: ["Stoatmod privacy", "Stoat bot privacy", "Stoat moderation bot", "data retention", "self-hosted AI moderation", "Stoat bot rules"],
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
      about: ["Privacy", "Data retention", "Content moderation", "Stoat bots"],
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
        <strong>Privacy update</strong>
        <span>Published 2 October 2026 · Updated 14 October 2026</span>
      </div>
      <Breadcrumbs items={[
        { name: siteConfig.name, path: "/" },
        { name: "Privacy changes", path: "/privacy-changes" },
      ]} />

      <PublicPageHeading
        compact
        eyebrow="Privacy update"
        title={<>What we changed.<br />Why it should apply to everyone.</>}
        description="After a privacy review by Stoat, we rebuilt a lot of how Stoatmod handles your data. This page explains what we changed and what we keep now. It also explains why we think Stoat should hold every bot to the same rules."
        action={{ href: "/privacy", label: "Read the privacy policy" }}
      />
      <PublicSummary
        title="Less data, kept for less time."
        description="We've stopped using outside AI, IP checks, cross-server sharing and per-user stats. What's left is kept only as long as moderation, consent and appeals need it."
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
          <section className={styles.section} id="changes">
            <p className={styles.sectionNumber}>01 / What we changed</p>
            <h2>We switched things off, deleted old data and collect less.</h2>
            <p className={styles.lede}>All of this is already done. None of it is a promise about the future.</p>
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
            <p className={styles.sectionNumber}>02 / What we keep, and for how long</p>
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
              <strong>In line with Stoat&apos;s latest guidance</strong>
              <p>Stoat has since said message content should be kept for 30 days unless there&apos;s a specific reason to keep it longer, such as a moderation case being appealed at 29 days. That&apos;s the schedule above. See &ldquo;Stoat&apos;s latest guidance&rdquo; in section 06 for the full answers.</p>
            </div>
          </section>

          <section className={styles.section} id="remains">
            <p className={styles.sectionNumber}>03 / What&apos;s still there</p>
            <h2>Moderators can still see what happened without us keeping your message forever.</h2>
            <p>After a message is deleted, a server&apos;s moderators can still see the outcome, why the AI acted and the scores it gave. They can see what Stoatmod did, but the dashboard doesn&apos;t become a permanent archive of people&apos;s messages.</p>
            <ul className={styles.plainList}>
              <li>Global bans and warnings stay. Only authorised Stoatmod admins can see them, and only to deal with abuse directly.</li>
              <li>Each server&apos;s moderators can see only their own server&apos;s members and history. We&apos;ve asked Stoat to confirm this Members tab can stay as it is, and we&apos;re waiting for a reply.</li>
              <li>Server stats are anonymous totals only. No popular words, no per-person counts and no rankings.</li>
              <li>When Stoatmod is removed from a server, we delete everything we hold for that server, except network-level enforcement records such as a server blacklist entry. This matches Stoat&apos;s guidance that other data can be kept until the bot is removed.</li>
              <li>Join verification and the report form still use Cloudflare Turnstile as a browser CAPTCHA, but only after the person agrees: it doesn&apos;t load until they tick the agreement. Kuma has dropped Cloudflare from its Stoat verification, which we see as a step in the right direction. Stoat has not objected to us continuing to use it where the person consents.</li>
              <li>Moderators can choose to get a private ping when someone appeals in their server. The ping doesn&apos;t include the message or the appeal itself.</li>
            </ul>
          </section>

          <section className={`${styles.section} ${styles.argument}`} id="consistency">
            <p className={styles.sectionNumber}>04 / Why we&apos;re raising this</p>
            <h2>Whether a bot has to follow the privacy rules shouldn&apos;t depend on who runs it.</h2>
            <p>On 5 September, Stoat Trust &amp; Safety gave us 30 days to remove or redesign the parts of Stoatmod that collected or kept data without consent, and we did. The notice quoted Stoat&apos;s published Community Guidelines:</p>
            <figure className={styles.mailQuote}>
              <blockquote>
                <p>&ldquo;We do not permit the gathering of any personally identifiable information (PII) without end-user consent. This includes, but is not limited to, the automated scraping of messages, member lists, and user profiles without explicit permission from the users whose data is being collected.&rdquo;</p>
              </blockquote>
              <figcaption>Stoat Community Guidelines, quoted in Stoat&apos;s notice · 5 September 2026</figcaption>
            </figure>
            <p>In our reply the same day, we asked whether the same requirements apply to log_it and other logging bots. Stoat&apos;s answer on 10 September didn&apos;t address that question. We asked again that day and named AutoMod as well. On 13 September, Stoat Trust &amp; Safety replied:</p>
            <figure className={styles.mailQuote}>
              <blockquote>
                <p>&ldquo;I will not disclose or discuss any details of enforcement actions or compliance issues involving outside bot operators with an outside party. Each bot service on the platform must comply with our policies independently, and any other potential infringement by another operator does not change the requirements enforced for Stoatmod.&rdquo;</p>
              </blockquote>
              <figcaption>Mana, Lead, Trust &amp; Safety, Stoat · 13 September 2026</figcaption>
            </figure>
            <p>We agree that every bot should comply independently, and we understand why individual cases are kept private. The general rule is published, but the detail we were held to isn&apos;t. That detail covers what counts as consent, how long data can be kept, what statistics are allowed and when a self-hosted model can run without opt-in. We only learned it through private emails, which say, for example:</p>
            <figure className={styles.mailQuote}>
              <blockquote>
                <p>&ldquo;Aggregate statistic collection would need to be genuinely anonymous and cannot reasonably be used/collected to identify individual users. The statistics also cannot contain message content or user-level records.&rdquo;</p>
                <p>&ldquo;These identifiers should never be retained indefinitely for the reason(s) that they may potentially be useful in the future.&rdquo;</p>
              </blockquote>
              <figcaption>Mana, Lead, Trust &amp; Safety, Stoat · 10 September 2026</figcaption>
            </figure>
            <figure className={styles.mailQuote}>
              <blockquote>
                <p>&ldquo;The content outlined may be processed without individual user opt-in as long as the content is destroyed after the initial assessment has finished, and it cannot be retained to create an archive.&rdquo;</p>
                <p>&ldquo;Processing should continue to remain limited to what is necessary and should not be used to create records or profiles about individual users.&rdquo;</p>
              </blockquote>
              <figcaption>Mana, Lead, Trust &amp; Safety, Stoat · 13 September 2026</figcaption>
            </figure>
            <p>If every bot must meet these requirements independently, every bot developer needs to be able to read them. Right now, other developers can&apos;t know them, and users can&apos;t check whether the bots in their servers follow them. The examples below show why that matters. bronx, for instance, keeps per-person message counts with no expiry and ranks people on leaderboards any member can see, which is the kind of &ldquo;user-level records&rdquo; Stoat told us aren&apos;t allowed.</p>
            <a className={styles.emailLink} href="/stoat-trust-and-safety-emails.pdf" target="_blank" rel="noopener">
              <span>Read the full email chain with Stoat Trust &amp; Safety</span>
              <span>PDF · 7 messages, 5 Sep to 2 Oct · opens in a new tab ↗</span>
            </a>
            <div className={styles.stoatConnection}>
              <span>Why this matters more</span>
              <h3>AutoMod has a direct link to Stoat.</h3>
              <p>AutoMod&apos;s own website says its developer has been on the Stoat team since 2023, and its support server has Stoat&apos;s verified badge. It reads members&apos; messages in every server it&apos;s in. Yet its website has no privacy policy, no terms and no privacy notice telling users what it collects, how long it keeps it, or how to say no or ask for deletion.</p>
              <p>A staff link and a verified badge don&apos;t mean Stoat runs AutoMod. They do tell users it can be trusted. If we have to provide detailed notices, consent and deletion controls while a bot run by a Stoat staff member, carrying that badge, publishes none of the basics, that looks like unequal treatment. Stoat should either explain what makes the cases different or apply the same minimum rules to both.</p>
              <div className={styles.connectionLinks}>
                <a href="https://automod.vale.rocks/blog/understanding-stoat-ids-ulids" target="_blank" rel="noreferrer">Stoat team disclosure <span aria-hidden="true">↗</span></a>
                <a href="https://stt.gg/automod" target="_blank" rel="noreferrer">Verified support server <span aria-hidden="true">↗</span></a>
                <a href="https://automod.vale.rocks/sitemap.xml" target="_blank" rel="noreferrer">Published website sitemap <span aria-hidden="true">↗</span></a>
              </div>
            </div>
            <blockquote>
              <p>We didn&apos;t ask about anyone else&apos;s case. We asked for the rules everyone is held to.</p>
            </blockquote>
            <p>Keeping cases confidential doesn&apos;t stop Stoat from publishing the requirements it already enforces. Without them, users can&apos;t fairly compare bots, and developers can&apos;t tell whether similar features are judged the same way.</p>
          </section>

          <section className={styles.section} id="examples">
            <p className={styles.sectionNumber}>05 / Examples</p>
            <h2>Why we asked.</h2>
            <p>We raised log_it and AutoMod with Stoat because of what their public docs seemed to describe when we looked. We looked at bronx, a group of three bots by one developer, bolt and Kuma later. AutoMod, bronx and bolt are open source, so we also read their code to check what they actually do. The code for log_it, Kuma and the group of three bots isn&apos;t public, so for those we relied on what their own websites and profiles say. These examples are here to show why a platform-wide answer is needed, not to accuse anyone.</p>
            <p className={styles.legend}><span className={styles.tick} aria-hidden="true">✓</span> A green tick means the bot&apos;s own public pages show the issue has since been fixed. We re-checked AutoMod, bronx, bolt and Kuma on 14 October 2026, and so far only two of Kuma&apos;s findings have been fixed. We haven&apos;t re-checked log_it or the Bot Central bots.</p>
            <div className={styles.evidenceGrid}>
              <article className={`${styles.evidenceCard} ${styles.evidenceWide}`} id="automod">
                <div className={styles.evidenceHeading}>
                  <div><span>Bot example · open source</span><h3>AutoMod</h3></div>
                  <code>01FHGJ3NPP7XANQQH8C2BE44ZY</code>
                </div>
                <p>AutoMod&apos;s developer is on the Stoat team, and its support server is verified by Stoat. Its website and docs have no privacy policy, terms or privacy notice, and neither does its source repository. Here&apos;s what the code we read on 2 October 2026 shows.</p>
                <ul className={styles.findings}>
                  {automodFindings.map((finding) => (
                    <li key={finding.title}>
                      <strong>{finding.title}</strong>
                      <p>{finding.body}</p>
                      <a href={`${automodSource}/${finding.file}`} target="_blank" rel="noreferrer">{finding.file} <span aria-hidden="true">↗</span></a>
                    </li>
                  ))}
                </ul>
                <p className={styles.fairNote}>To be fair to AutoMod, we found no per-person activity stats, no sharing between servers and no messages sent to an outside AI service. Its main gap is that it doesn&apos;t yet tell members what it collects or how long it keeps it.</p>
                <p className={styles.findingsIntro}>What AutoMod&apos;s developer told us:</p>
                <figure className={styles.cardQuote}>
                  <blockquote>
                    <p>&ldquo;AutoMod doesn&apos;t keep message logs on the production instance &ndash; they&apos;re a debugging feature.&rdquo;</p>
                    <p>&ldquo;[I] have similarly been told to create policy as part of Stoat&apos;s wider crackdown. It is being applied evenly to everyone, as far as I can tell.&rdquo;</p>
                  </blockquote>
                  <figcaption>Declan Chidlow, AutoMod&apos;s developer, by email · October 2026</figcaption>
                </figure>
                <ul className={styles.notesList}>
                  <li><strong>Message logs:</strong> we can only see the code, not the official instance, so we&apos;ve updated the first finding to reflect what the developer told us.</li>
                  <li><strong>Privacy policy:</strong> the developer says Stoat has asked AutoMod to create one, and that it&apos;s waiting on legal advice before publishing it.</li>
                  <li><strong>Consistency:</strong> this is the first sign we&apos;ve seen that Stoat is asking other bots to meet the same requirements. That&apos;s welcome. It still came privately, so the rules themselves remain unpublished.</li>
                  <li>The developer has said a fuller reply will follow. We&apos;ll update this section when it does.</li>
                </ul>
                <div className={styles.sourceLinks}>
                  <a href="https://automod.vale.rocks/blog/understanding-stoat-ids-ulids" target="_blank" rel="noreferrer">Developer disclosure <span aria-hidden="true">↗</span></a>
                  <a href="https://stt.gg/automod" target="_blank" rel="noreferrer">Verified support server <span aria-hidden="true">↗</span></a>
                  <a href={automodSource.replace("/blob/", "/tree/")} target="_blank" rel="noreferrer">Source code at the version we read <span aria-hidden="true">↗</span></a>
                </div>
              </article>

              <article className={`${styles.evidenceCard} ${styles.evidenceWide}`} id="log-it">
                <div className={styles.evidenceHeading}>
                  <div><span>Bot example · code not public</span><h3>log_it</h3></div>
                  <code>01J4Q9DS6CV4DNCW6AZRMV349A</code>
                </div>
                <p>Its public pages seemed to describe collecting server and channel IDs, event activity, and edited and deleted messages, which are kept in a local <code>log.txt</code> file. The deletion wording didn&apos;t seem to cover what stays in that file. Its developers publish the website&apos;s code but not the bot&apos;s, so we can&apos;t check what it actually does.</p>
                <div className={styles.sourceLinks}>
                  <a href="https://mu-mega-bots.github.io/log-it/information/privacy.html" target="_blank" rel="noreferrer">Privacy page <span aria-hidden="true">↗</span></a>
                  <a href="https://mu-mega-bots.github.io/log-it/information/transparency.html" target="_blank" rel="noreferrer">Transparency page <span aria-hidden="true">↗</span></a>
                  <a href="https://github.com/mu-mega-bots/log-it" target="_blank" rel="noreferrer">Website repository (no bot code) <span aria-hidden="true">↗</span></a>
                </div>
              </article>
              <article className={`${styles.evidenceCard} ${styles.evidenceWide}`} id="bronx">
                <div className={styles.evidenceHeading}>
                  <div><span>Bot example · open source</span><h3>bronx</h3></div>
                  <code>01FZB4GBHDVYY6KT8JH4RBX4KR</code>
                </div>
                <p>bronx is open source, so we read its code as well as its website. It has a privacy page that explains what it stores and lets members download their data or opt out. We missed it when we first wrote this section, because it isn&apos;t linked from bronx&apos;s homepage; its developer has told us it&apos;s been up since September. Here&apos;s what the privacy page and the code (latest version, last changed 30 September 2026) show.</p>
                <div className={styles.consentCallout}>
                  <span>Opt-out, not opt-in</span>
                  <h4>Everyone is tracked and ranked by default. Members can opt out, but nobody is asked first.</h4>
                  <ul className={styles.findings}>
                    {bronxConsent.map((point) => (
                      <li key={point.title}>
                        <strong>{point.title}</strong>
                        <p>{point.body}</p>
                        <a href={point.href} target="_blank" rel="noreferrer">{point.label} <span aria-hidden="true">↗</span></a>
                      </li>
                    ))}
                  </ul>
                </div>
                <p className={styles.findingsIntro}>Other personal data it handles:</p>
                <ul className={styles.findings}>
                  {bronxFindings.map((finding) => (
                    <li key={finding.title}>
                      <strong>{finding.title}</strong>
                      <p>{finding.body}</p>
                      <a href={`${bronxSource}/${finding.file}`} target="_blank" rel="noreferrer">{finding.file} <span aria-hidden="true">↗</span></a>
                    </li>
                  ))}
                </ul>
                <p className={styles.fairNote}>To be fair to bronx, we found no message content stored outside Stoat (only counts), no AI services, no IP collection, and no personal data sent to outside services that the user didn&apos;t ask for with a command.</p>
                <p className={styles.findingsIntro}>What bronx&apos;s developer told us:</p>
                <ul className={styles.notesList}>
                  <li><strong>No AI, IP addresses or stored message content.</strong> This matches what we found in the code.</li>
                  <li><strong>Members can opt out at any time.</strong> We&apos;ve confirmed the code drops messages from opted-out users before counting them (<a href={`${stoatppSource}/src/event_handler.cpp#L155-L156`} target="_blank" rel="noreferrer">stoat++ event_handler.cpp</a>). The developer sees this as consent; we see opt-out as different from being asked first.</li>
                  <li><strong>Most features are off by default.</strong> Activity counting and the leaderboards are not among them.</li>
                  <li><strong>bronx hadn&apos;t received a notice from Stoat.</strong> Its developer has since asked Stoat directly and shared the answers with us. They&apos;re in &ldquo;Stoat&apos;s latest guidance&rdquo; below.</li>
                  <li><strong>The developer doesn&apos;t see bridging as a privacy issue.</strong> Stoat told them it&apos;s still deciding its policy on bridge bots, so we&apos;ve kept it listed as an open question.</li>
                  <li><strong>The privacy page will be linked more prominently,</strong> the developer told us.</li>
                </ul>
                <div className={styles.sourceLinks}>
                  <a href="https://bronx.siqnole.dev/privacy" target="_blank" rel="noreferrer">Privacy page <span aria-hidden="true">↗</span></a>
                  <a href="https://bronx.siqnole.dev/" target="_blank" rel="noreferrer">Website <span aria-hidden="true">↗</span></a>
                  <a href="https://bronx.siqnole.dev/docs/" target="_blank" rel="noreferrer">Documentation <span aria-hidden="true">↗</span></a>
                  <a href={bronxSource} target="_blank" rel="noreferrer">Source code at the version we read <span aria-hidden="true">↗</span></a>
                </div>
              </article>

              <article className={`${styles.evidenceCard} ${styles.evidenceWide}`} id="bot-central">
                <div className={styles.evidenceHeading}>
                  <div><span>Bot group · one developer · code not public</span><h3>DailyFacts, Starboard and Logger</h3></div>
                  <div className={styles.idList}>
                    {botCentralBots.map((bot) => <code key={bot.id}>{bot.name} · {bot.id}</code>)}
                  </div>
                </div>
                <p>These three bots were created by the same developer on the same day, 15 June 2023, and all point to one support server, Bot Central. We looked for public information about them on 2 October 2026 and found almost none.</p>
                <ul className={styles.findings}>
                  {botCentralFindings.map((finding) => (
                    <li key={finding.title}>
                      <strong>{finding.title}</strong>
                      <p>{finding.body}</p>
                    </li>
                  ))}
                </ul>
                <div className={styles.sourceLinks}>
                  {botCentralBots.map((bot) => (
                    <a key={bot.id} href={`https://stoat.chat/bot/${bot.id}`} target="_blank" rel="noreferrer">{bot.name} bot profile <span aria-hidden="true">↗</span></a>
                  ))}
                </div>
              </article>

              <article className={`${styles.evidenceCard} ${styles.evidenceWide}`} id="bolt">
                <div className={styles.evidenceHeading}>
                  <div><span>Bot example · open source · has a privacy policy</span><h3>bolt</h3></div>
                  <code>01G1Y9M6G254VWBF41W3N5DQY5</code>
                </div>
                <p>bolt is a bridge bot. It links channels on Stoat with channels on other platforms so the same conversation appears in both. To be fair to bolt, it publishes a privacy policy with a contact for data requests, its code is open source, and its database stores only message IDs, not message content. The problem is consent.</p>
                <ul className={styles.findings}>
                  {boltFindings.map((finding) => (
                    <li key={finding.title}>
                      <strong>{finding.title}</strong>
                      <p>{finding.body}</p>
                      <a href={`${boltSource}/${finding.file}`} target="_blank" rel="noreferrer">{finding.file} <span aria-hidden="true">↗</span></a>
                    </li>
                  ))}
                </ul>
                <p className={styles.findingsIntro}>What Stoat told us about consent and off-platform content:</p>
                <figure className={styles.cardQuote}>
                  <blockquote>
                    <p>&ldquo;A server owner&apos;s decision to implement the bot into their server should not, by itself, be treated as a blanket consent for collecting user information, such as message content, IPs, user profiles, and other PII.&rdquo;</p>
                    <p>&ldquo;External classification usage, such as OpenAI or other third-party services, may continue only where end-user consent is explicitly obtained from each user before their content is transmitted to an external service. Disclosure of these practices through a Privacy Policy does not constitute consent by itself.&rdquo;</p>
                  </blockquote>
                  <figcaption>Mana, Lead, Trust &amp; Safety, Stoat · 10 September 2026</figcaption>
                </figure>
                <p>Stoat required us to get each person&apos;s consent before their content was sent to an outside service, and told us that neither a server owner&apos;s choice nor a privacy policy counts as consent. A bridge sends members&apos; messages to other platforms on the strength of an admin&apos;s choice and a privacy policy alone. If the rule we were held to applies to every bot, bridged channels need a way for each member to agree before their messages are sent off Stoat. Stoat has since told another developer it&apos;s still deciding its policy on bridge bots.</p>
                <div className={styles.sourceLinks}>
                  <a href="https://williamhorning.dev/bolt/legal" target="_blank" rel="noreferrer">Privacy policy and terms <span aria-hidden="true">↗</span></a>
                  <a href={boltSource} target="_blank" rel="noreferrer">Source code at the version we read <span aria-hidden="true">↗</span></a>
                  <a href="https://stoat.chat/bot/01G1Y9M6G254VWBF41W3N5DQY5" target="_blank" rel="noreferrer">bolt bot profile <span aria-hidden="true">↗</span></a>
                </div>
              </article>

              <article className={`${styles.evidenceCard} ${styles.evidenceWide}`} id="kuma">
                <div className={styles.evidenceHeading}>
                  <div><span>Bot example · has a privacy policy · code not public</span><h3>Kuma</h3></div>
                  <code>01KSQCGBPB79E4V5W6RG6VA7YC</code>
                </div>
                <p>Kuma describes itself as &ldquo;Stoat&apos;s most advanced all-in-one community and security bot&rdquo;. To be fair to Kuma, it publishes a detailed privacy policy, lets members view, export and delete their data, says it doesn&apos;t keep copies of messages, and deletes some records automatically. Its code isn&apos;t public, so everything below comes from Kuma&apos;s own website, privacy policy and public demo dashboard, as we read them on 6 October 2026. Each claim links to where it appears.</p>
                <ul className={styles.findings}>
                  {kumaFindings.map((finding) => (
                    <li key={finding.title}>
                      <strong>{(finding as { fixed?: boolean }).fixed && <span className={styles.tick} role="img" aria-label="Fixed">✓</span>}{finding.title}</strong>
                      <p>{finding.body}</p>
                      {(finding as { update?: string }).update && <p className={styles.fixedNote}>{(finding as { update?: string }).update}</p>}
                      <span className={styles.findingSources}>
                        {finding.sources.map((source) => (
                          <a key={source.label} href={source.href} target="_blank" rel="noreferrer">{source.label} <span aria-hidden="true">↗</span></a>
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className={styles.fairNote}>Kuma updated its privacy policy in October 2026. It now says image scanning, which sends images to Google&apos;s Vision API, is only available on Discord and Fluxer and not on Stoat, so we&apos;ve left it out.</p>
                <div className={styles.note}>
                  <strong>Update, 14 October 2026: Kuma has rebuilt its verification on Stoat</strong>
                  <p>Kuma says the changes bring its verification in line with Stoat&apos;s guidelines. Its announcement says Stoat verification no longer checks IP addresses, VPNs or anything about a member&apos;s connection, that hashed IP addresses from earlier verifications have been deleted, that Kuma&apos;s own browser check replaces the Cloudflare captcha, and that Raid Guard no longer uses other servers&apos; reports on Stoat. Discord and Fluxer verification are unchanged.</p>
                  <p>That answers the first two findings above, which describe what we read on 6 October. We welcome it, and we see Kuma dropping Cloudflare Turnstile as a step in the right direction. Our own join verification and report form still use Turnstile, but it only loads after the person agrees, and Stoat has not objected to us continuing to use it where the person consents.</p>
                  <p>The announcement doesn&apos;t mention bridging, so that finding stands, and we haven&apos;t re-read the rest of Kuma&apos;s site since 6 October.</p>
                  <a href="https://kumabot.xyz/blog/updating-our-verification-for-compliance" target="_blank" rel="noreferrer">Kuma&apos;s announcement <span aria-hidden="true">↗</span></a>
                </div>
                <p className={styles.findingsIntro}>Kuma&apos;s connection to Stoat:</p>
                <figure className={styles.cardQuote}>
                  <blockquote>
                    <p>&ldquo;For obvious reasons, as I work much closer to the wonderful Stoat Team, it is clear that I can no longer maintain a direct line between Stoat and Kuma on some levels. [&hellip;] I am staying on as a maintainer; however, I will be stepping back from Platform Compliance entirely. [&hellip;] I will no longer oversee platform compliance in order to eliminate any conflict of interest as much as possible.&rdquo;</p>
                  </blockquote>
                  <figcaption>Aki, Kuma&apos;s developer, in a message on Stoat · October 2026</figcaption>
                </figure>
                <p>We welcome Kuma separating its compliance work from its developer&apos;s role at Stoat. It also shows why public rules matter: when a bot&apos;s developer works closely with the platform, users and other developers need to be able to see that the same requirements apply.</p>
                <p className={styles.findingsIntro}>What Stoat told us about the same practices:</p>
                <figure className={styles.cardQuote}>
                  <blockquote>
                    <p>&ldquo;Having cross-server processing cannot be used to create a general profile for users across unrelated community servers.&rdquo;</p>
                    <p>&ldquo;Removing the raw IP address data from the equation does not in itself resolve the core concern if a fingerprint continues to function as a persistent identifier.&rdquo;</p>
                    <p>&ldquo;A server owner&apos;s decision to implement the bot into their server should not, by itself, be treated as a blanket consent for collecting user information, such as message content, IPs, user profiles, and other PII.&rdquo;</p>
                  </blockquote>
                  <figcaption>Mana, Lead, Trust &amp; Safety, Stoat · 10 September 2026</figcaption>
                </figure>
                <p>We removed cross-server alerts and IP checks to meet these requirements. When we read Kuma&apos;s website on 6 October it described both, switched on by default, and Kuma has since removed them from its Stoat verification. Its bridging, as we read it then, sends members&apos; messages to other platforms on an admin&apos;s decision alone. If the same standard applies to every bot, Stoat should say so publicly. If it doesn&apos;t, it should explain what makes the cases different.</p>
                <div className={styles.sourceLinks}>
                  <a href="https://kumabot.xyz/privacy" target="_blank" rel="noreferrer">Privacy policy <span aria-hidden="true">↗</span></a>
                  <a href="https://kumabot.xyz/commands" target="_blank" rel="noreferrer">Commands <span aria-hidden="true">↗</span></a>
                  <a href="https://stoat.chat/bot/01KSQCGBPB79E4V5W6RG6VA7YC" target="_blank" rel="noreferrer">Kuma bot profile <span aria-hidden="true">↗</span></a>
                </div>
              </article>
            </div>
            <div className={styles.caveat}>
              <strong>What these examples don&apos;t prove</strong>
              <p>Public docs don&apos;t tell us how either bot actually works today, what it really keeps, what consent it gets or whether it&apos;s been looked at by Stoat. Similar features don&apos;t mean identical processing either. What the examples do show is why everyone needs a clear rule that applies to similar behaviour.</p>
            </div>
          </section>

          <section className={styles.section} id="request">
            <p className={styles.sectionNumber}>06 / What we&apos;re asking Stoat for</p>
            <h2>Public rules, not details of anyone&apos;s case.</h2>
            <p>Stoat can keep enforcement private and still give everyone the same rules. We&apos;re asking it to publish:</p>
            <ol className={styles.requestList}>
              {requests.map((request, index) => (
                <li key={request}><span>{String(index + 1).padStart(2, "0")}</span><p>{request}</p></li>
              ))}
            </ol>
            <p className={styles.requestNote}>The first point is already standard elsewhere. Discord&apos;s Developer Terms of Service, for example, require developers to provide and follow a privacy policy that clearly and accurately tells users what information is collected and how it&apos;s used and shared. Several of the bots above publish nothing at all, so their users have no way of knowing what is collected about them. A baseline like Discord&apos;s would give every Stoat user the same basic transparency, whichever bots their servers use.</p>
            <div className={styles.officialResponse}>
              <span>Stoat&apos;s official response</span>
              <p className={styles.officialContext}>We sent these requests to Stoat Trust &amp; Safety in a separate ticket, along with a question about whether the consent requirement also applies to bridge bots. This is their reply in full:</p>
              <figure>
                <blockquote>
                  <p>&ldquo;Fleshed out developer guidelines are already in the works. We cannot provide a timeline or more information at this time.&rdquo;</p>
                </blockquote>
                <figcaption>Stoat Moderation (abuse@stoat.chat) · October 2026</figcaption>
              </figure>
              <p className={styles.officialContext}>We&apos;re glad developer guidelines are on the way, and we&apos;ll update this page when they&apos;re published. Until then there&apos;s no timeline.</p>
            </div>
            <div className={styles.officialResponse}>
              <span id="stoat-guidance">Stoat&apos;s latest guidance</span>
              <p className={styles.officialContext}>bronx&apos;s developer asked Stoat Trust &amp; Safety a detailed set of questions and shared the answers with us on 10 October 2026. We&apos;ve summarised each question and quoted Stoat&apos;s answer.</p>
              <ol className={styles.guidanceList}>
                {stoatGuidance.map((item) => (
                  <li key={item.question}>
                    <strong>{item.question}</strong>
                    <p>&ldquo;{item.answer}&rdquo;</p>
                  </li>
                ))}
              </ol>
              <p className={styles.officialContext}><strong>What this means:</strong> Stoat is currently asking every bot to use opt-in for data tied to a person, including per-person stats and rankings. Message content and attachments should be kept for 30 days unless there&apos;s a specific reason, such as a case under appeal, which is the schedule Stoatmod already uses. Other operational data can be kept while it&apos;s needed. Privacy policies will become a requirement, with a migration period once the guidelines are published. Stoat hasn&apos;t decided on bridge bots yet.</p>
            </div>
          </section>

          <section className={`${styles.section} ${styles.commitment}`} id="commitment">
            <p className={styles.sectionNumber}>07 / What happens next</p>
            <h2>We&apos;ll keep telling you what we change.</h2>
            <p>We&apos;ll keep documenting what we do with data, fix things when the evidence says we should, stick to our deletion deadlines and give you a real choice wherever consent is needed. We&apos;re also happy for every other bot on Stoat to get the same scrutiny we did.</p>
            <p className={styles.closing}>We&apos;re not asking for special treatment. We&apos;re asking for one set of rules that everyone follows.</p>
            <div className={styles.actions}>
              <a href="/privacy">Read the privacy policy <span aria-hidden="true">→</span></a>
              <a href="/stoat-trust-and-safety-emails.pdf" target="_blank" rel="noopener">Read the emails (PDF) <span aria-hidden="true">↗</span></a>
              <a href={`mailto:${siteConfig.contactEmail}`}>Get in touch <span aria-hidden="true">→</span></a>
            </div>
          </section>
        </article>
      </div>

      <PublicFooter description="Transparent moderation, clear deletion deadlines and real privacy choices." />
    </main>
  );
}
