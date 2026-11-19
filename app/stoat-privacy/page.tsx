import { Breadcrumbs } from "../Breadcrumbs";
import { PublicFooter } from "../PublicFooter";
import { PublicPageHeading, PublicSummary } from "../PublicPageHeading";
import { SiteNav } from "../SiteNav";
import { JsonLd } from "../JsonLd";
import { breadcrumbSchema, organizationSchema, webPageSchema, websiteSchema } from "../lib/schema";
import { buildMetadata } from "../lib/seo";
import { absoluteUrl, siteConfig } from "../lib/site-config";
import styles from "../privacy-changes/PrivacyChanges.module.css";

const checkedLabel = "19 November 2026";

const contents = [
  ["status", "Where things stand"],
  ["consistency", "Why we look at other bots"],
  ["examples", "Bot by bot"],
  ["discovery", "How Discovery bots are checked"],
  ["stoat-guidance", "What Stoat has said"],
  ["request", "What we're asking Stoat for"],
  ["checking", "How to check a bot yourself"],
] as const;

const statusRows = [
  {
    bot: "Stoat's developer rules",
    latest: "Still not published. Stoat's legal page lists only its general terms, privacy policy and community guidelines, and its updates page has nothing on bots since 30 June 2026.",
    open: "Stoat has said developer guidelines are in the works, privacy policies will become a requirement and there will be a migration period. There's still no date.",
  },
  {
    bot: "AutoMod",
    latest: "Still no privacy policy, terms or privacy notice: its privacy, legal and terms addresses all return \"not found\". The latest code is the same version we read in October, and it still prints every message's text and logs every command with who ran it.",
    open: "Members can't find out what it collects, how long it keeps it or how to ask for deletion.",
  },
  {
    bot: "Kuma",
    latest: "Rewrote its privacy policy in November 2026. It now sorts data into three tiers, keeps logged message text only in the server's own log channel, stores only message IDs for chat snapshots (deleted after 60 days) and lets members view, export and delete their data themselves. On Stoat it confirms no cross-server flagging, no IP or VPN checks, no Cloudflare captcha and no image scanning.",
    open: "Bridging still copies members' messages to Discord and Fluxer with no notice, consent or opt-out for members. Most other data is kept while Kuma is in a server and deleted after it leaves only if someone asks.",
  },
  {
    bot: "bronx",
    latest: "Added an opt-out for activity tracking and levels on 14 October 2026.",
    open: "Counting is still on by default rather than opt-in, the cross-server leaderboard is still there, the privacy page gives no retention periods and still isn't linked from the homepage.",
  },
  {
    bot: "bolt",
    latest: "Still supports Stoat and is actively developed. Its legal page lists the data it may collect, including message content, user information, activity and IP addresses, stored in the United States with backups on Microsoft OneDrive, but gives no retention periods.",
    open: "Bridged channels still have no notice, consent or opt-out for members.",
  },
  {
    bot: "log_it",
    latest: "No change. Its privacy page was last edited in September 2024.",
    open: "Deleted and edited messages go into a log file that isn't covered by its deletion promise and has no stated retention period.",
  },
  {
    bot: "magbot",
    latest: "New since our last check. An open-source AI chatbot, made for fun, with a real opt-in step: nothing from you reaches the AI until you say yes. Approved for Stoat Discovery while it was offline.",
    open: "No privacy policy. Its opt-in message doesn't say which AI company gets your messages, people who used it before opt-in were counted as having agreed, and saved memories have no expiry.",
  },
  {
    bot: "DailyFacts, Starboard and Logger",
    latest: "No change. Logger's profile still calls it \"the ultimate logging Revolt bot\" and links to Stoat's old domain, and there's still no website, privacy policy or public code.",
    open: "Nobody can tell what they collect or keep.",
  },
] as const;

const automodSource = "https://tangled.org/vale.rocks/AutoMod/blob/32cf0a36481ee7dfcca310f5a06aa73f4cd20461";

const automodFindings = [
  {
    title: "The code prints the text of every message",
    body: "Every message AutoMod sees, in every server, is printed with its full text to the bot's output, and nothing in the code turns this off. We checked the latest code again on 19 November and the line is still there. Under the Docker setup in AutoMod's self-hosting guide, that output would be saved to a log file with no size limit. AutoMod's developer has told us these logs are a debugging feature and aren't kept on the official instance.",
    file: "packages/bot/src/bot/modules/command_handler.ts#L40",
  },
  {
    title: "Every command logged with who ran it",
    body: "Each command is also logged with the person's username and user ID, the server's name and the full text of the command.",
    file: "packages/bot/src/bot/modules/command_handler.ts#L126",
  },
  {
    title: "No privacy policy, despite Stoat's trust signals",
    body: "AutoMod's support server carries Stoat's verified badge, its developer is on the Stoat team, and its README calls it \"Stoat's premier moderation bot\". Yet its website, docs and source code have no privacy policy, terms or privacy notice, so members can't find out what it collects, how long it keeps it or how to ask for deletion. Its developer told us in October that Stoat had asked for one and that it was being prepared with legal advice. As of 19 November it still hasn't been published.",
    file: "README.md",
  },
  {
    title: "Votekick votes stored",
    body: "Votekicks save who voted against whom, in which server and when. When a vote passes, the records are only marked as ignored. Nothing in the code deletes them.",
    file: "packages/bot/src/bot/modules/votekick.ts#L97",
  },
] as const;

const kumaFindings = [
  {
    title: "Cross-server flagging, on by default",
    fixed: true,
    update: "Fixed on 14 October 2026 and still the case on 19 November. Kuma's November privacy policy says cross-server flagging is off for every Stoat community, and its commands page says Raid Guard isn't available on Stoat because Stoat's rules don't allow sharing raid flags between communities.",
    body: "Kuma's Raid Guard \"automatically isolates or kicks accounts that have been auto-flagged for raid/spam activity in other Kuma-protected communities\". Its dashboard listed Raid Guard as \"(on by default)\", and its verification queue scored new members on a factor called \"Flagged in another Kuma server\".",
    sources: [
      { label: "Commands page: !raidguard", href: "https://kumabot.xyz/commands" },
      { label: "Privacy policy (updated November 2026)", href: "https://kumabot.xyz/privacy" },
    ],
  },
  {
    title: "IP checks and network linking, on by default",
    fixed: true,
    update: "Fixed on 14 October 2026 and still the case on 19 November. Kuma's privacy policy says there's no VPN or proxy check and no IP hashing on Stoat, and its commands page says Stoat servers never get IP, VPN or alt-linking checks.",
    body: "Kuma's verification help text said that with \"ip on\" by default, a captcha-passer's connection was screened for VPN, proxy or high-risk IPs and same-network accounts were linked, using a hashed IP kept for 30 days.",
    sources: [
      { label: "Commands page: verification", href: "https://kumabot.xyz/commands" },
      { label: "Privacy policy: verification", href: "https://kumabot.xyz/privacy" },
    ],
  },
  {
    title: "Bridging without member consent",
    body: "A server owner can bridge a channel to Discord and Fluxer with !bridge. Kuma's privacy policy says it then copies members' messages, \"their text, attachments, and your username and avatar\", to the other platforms. Its November policy still describes bridging only as off until an admin sets it up. We found no notice to members, consent step or opt-out, so this raises the same consent question as bolt.",
    sources: [
      { label: "Commands page: !bridge", href: "https://kumabot.xyz/commands" },
      { label: "Privacy policy: cross-platform bridging", href: "https://kumabot.xyz/privacy" },
    ],
  },
  {
    title: "Data kept after Kuma leaves, unless someone asks",
    body: "Kuma's November policy says most data, including settings, moderation history, levels, notes and logs, is kept for as long as Kuma is in a server. When Kuma is removed, that data \"can be deleted on request\". Stoat's guidance puts the longest period for this kind of data at \"until the bot is removed from the server\", so deleting it automatically on removal would match that more closely.",
    sources: [
      { label: "Privacy policy: section 3, where we store it and how long", href: "https://kumabot.xyz/privacy" },
    ],
  },
] as const;

const boltSource = "https://codeberg.org/jersey/lightning/src/commit/39ac9ff656755e16074ef4c63c554826ea7a2901";

const boltFindings = [
  {
    title: "Every message in a bridged channel leaves Stoat",
    body: "Once a server admin links a channel, every message posted in it is copied to the other platforms in the bridge, such as Discord, Telegram or Matrix. The only check is whether the channel is bridged, not who sent the message.",
    file: "cmd/lightning/bridge.go#L18-L40",
  },
  {
    title: "No consent, notice or opt-out for members",
    body: "The bridge has three settings: whether @everyone mentions pass through, whether platform names are shown, and whether join codes expire. There's nothing that asks members for consent, tells them the channel is bridged or lets one person opt out. Each channel can also be set to read-only or write-only within the bridge, but that's a channel setting, not a choice for members. Its website and legal page still mention none of this, as of 19 November.",
    file: "cmd/lightning/commands.go#L294-L317",
  },
  {
    title: "Members may not know the channel is bridged",
    body: "Someone can join a server, open a channel and start chatting without realising their messages, name and avatar are being reposted on another platform where Stoat's rules and deletion controls don't apply. Showing the platform name, such as \"Joey (Stoat)\", is off by default.",
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
    body: "Each person's daily message, edit, delete and command counts are stored for every server and every channel until they opt out or the bot leaves. Stoat's guidance allows this kind of data to be kept that long, but says counts tied to a person are user data that need opt-in.",
    file: "database/tables.cpp",
  },
  {
    title: "A leaderboard across servers",
    body: "Anyone can run .stats top g to rank the most active people across every server bronx is in, even outside a server. People are ranked whether or not they've ever used bronx, unless they've opted out. bronx's homepage and README still advertise it. Stoat says cross-server rankings fall under a bot's general opt-in.",
    file: "cogs/stats.h#L161-L187",
  },
  {
    title: "Server details sent to a developer channel",
    body: "When bronx joins or leaves a server, it still posts the server's name, ID and owner, with channel and role counts, to a fixed Stoat channel. A developer webhook like this is something Stoatmod was told to remove.",
    file: "main.cpp",
  },
  {
    title: "Applications kept indefinitely",
    body: "Application answers are stored with the applicant's user ID and no deletion deadline, and the privacy page still gives no retention period for them. Stoat's guidance says content like this should be kept for 30 days unless there's a specific reason to keep it longer. Stoatmod deletes applications after 14 days.",
    file: "database/tables.cpp",
  },
  {
    title: "Messages relayed to other platforms",
    body: "When an admin bridges a channel, bronx relays members' messages, names and avatars to another platform. Members get no notice or choice before their messages leave the server.",
    file: "cogs/bridge.h",
  },
] as const;

const stoatppSource = "https://codeberg.org/siq/stoatplusplus/src/commit/ee2d509545537e666862fef6e1e10afc7284bfa1";

const bronxConsent = [
  {
    title: "Everyone is counted per person, automatically",
    body: "Every message is counted against the sender's user ID from the moment bronx joins. Only the number is stored, not what was said. Server-wide totals would be anonymous, but these counts are tied to each person and used to rank them.",
    label: "main.cpp#L1010-L1021",
    href: `${bronxSource}/main.cpp#L1010-L1021`,
  },
  {
    title: "Members can opt out, but aren't asked first",
    body: "bronx's privacy page lets anyone download their data or opt out, which deletes their records and stops future tracking, and on 14 October bronx added the same opt-out to levels. But nobody is asked before counting starts, and Stoat has said it's asking every bot to use opt-in.",
    label: "bronx privacy page",
    href: "https://bronx.siqnole.dev/privacy",
  },
  {
    title: "Its privacy page says nothing is collected passively",
    body: "The privacy page still says \"nothing is collected passively\" and that data is only written when you use a feature. The code counts every message a person sends, whether or not they've ever used bronx.",
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

const magbotSource = "https://github.com/Maglcite/magbot/blob/main";

const magbotGood = [
  { title: "Opt-in before anything is sent", body: "Until you say \"magbot opt in\", your messages are never sent to the AI, never used as context and never answered. Messages from people who haven't opted in are left out of the context it sends for others too.", file: "docs/CONSENT.md" },
  { title: "Opting out deletes your memories", body: "Saying \"magbot opt out\" removes you from the list and deletes everything it has remembered about you. /forget-me deletes your memories without opting out.", file: "magbot/consent.py" },
] as const;

const magbotFindings = [
  { title: "No privacy policy", body: "There's a detailed consent document in the code, but no privacy policy telling members what is stored, where, for how long or how to ask for deletion. Stoat has said privacy policies will become a requirement.", file: "README.md" },
  { title: "The AI company isn't named", body: "The opt-in message says your message and the few around it go to \"an AI model\". The default settings send them to OpenAI, an outside company. Stoat told us that sending content to an outside AI service needs each person's explicit consent, so the message should say who receives it.", file: "magbot/consent.py#L38-L46" },
  { title: "Earlier users counted as agreeing", body: "Everyone who had used magbot before the opt-in system was added to the opt-in list automatically. Using a bot before it asked isn't the same as saying yes.", file: "docs/CONSENT.md" },
  { title: "Memories with no expiry", body: "Facts it remembers about each person are kept in a database until that person deletes them or opts out. Nothing removes them after a set time.", file: "magbot/memory.py" },
] as const;

const discoveryEmail = [
  "My friend recently got their bot approved for discovery and then informed me after that his bot hasn't been online at all for the review process. This raises serious concerns about how Stoat is keeping the platform safe and how bots are actually verified for discovery listings.",
  "I understand that you cannot comment on individual cases. However I'd like to know a few things:",
] as const;

const discoveryQuestions = [
  "How was this allowed to happen?",
  "What is the process for reviewing bots for discovery?",
  "What does Stoat do to make sure the bot isn't malicious?",
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

const requests = [
  "A mandatory privacy policy for every bot that handles user data, explaining what it collects, why, how it's used, who it's shared with, how long it's kept and how to ask for deletion.",
  "One clear consent standard for every bot, including what counts as actually saying yes.",
  "Clear rules on moderation, logging, message context and automatic filtering within a server.",
  "Maximum retention times and deletion rules for live data, files, logs and backups.",
  "A clear line between sending data to an outside company and running a model yourself.",
  "One platform-wide rule for records, alerts, bans and warnings that cross servers.",
  "A decision on bridge bots: whether members must be told, or asked, before their messages are copied to another platform.",
  "A published review process for Discovery that checks a bot while it's online, including what it does with members' data, before it's listed.",
  "A way for users and bot developers to get an answer on policy without anyone's private case being exposed.",
] as const;

const checklist = [
  { title: "Find its privacy policy", body: "Look for a link on the bot's website or profile. It should say what's collected, why, who it's shared with, how long it's kept and how to ask for deletion. No policy at all is the biggest warning sign." },
  { title: "Check whether you're asked first", body: "Stoat is asking bots to use opt-in for data tied to you. Being able to opt out afterwards isn't the same as being asked." },
  { title: "Look for anything that leaves Stoat", body: "Bridges, outside AI services and image-scanning APIs send your messages or pictures off the platform. Check the policy says so and lets you choose." },
  { title: "Look for deadlines", body: "Message content and attachments should go after about 30 days unless something like an appeal needs them. \"Until the bot is removed\" is the longest Stoat allows for other data." },
  { title: "Check whether the code is public", body: "Open-source bots can be checked line by line. For closed-source bots you're relying on what the developer tells you." },
] as const;

const seo = {
  title: "Stoat Bots and How They Use Your Data | Stoatmod",
  headline: "Stoat bots and how they use your data.",
  description: "What popular Stoat bots like AutoMod, Kuma, bronx and bolt collect, keep and share, what's changed since October 2026, and what Stoat has said about bot privacy.",
  path: "/stoat-privacy",
  image: "/og-stoat-privacy.png",
  imageAlt: "Stoat bots and your data: what they collect, keep and share. AutoMod, Kuma, bolt, bronx and log_it, every finding sourced.",
  publishedTime: "2026-11-19T00:00:00+00:00",
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
  keywords: ["Stoat privacy", "Stoat bot privacy", "Stoat bots data", "Stoat bot privacy policy", "AutoMod Stoat privacy", "Stoat bridge bots", "Stoat developer guidelines"],
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
      about: ["Privacy", "Stoat bots", "Bot developer policy", "Consent"],
    },
    breadcrumbSchema([
      { name: siteConfig.name, path: "/" },
      { name: "Stoat privacy", path: seo.path },
    ]),
  ],
};

export default function StoatPrivacyPage() {
  return (
    <main className={styles.page}>
      <JsonLd data={schema} />
      <SiteNav />
      <div className={styles.draftBar} role="status">
        <strong>Stoat privacy</strong>
        <span>Every bot re-checked {checkedLabel}</span>
      </div>
      <Breadcrumbs items={[
        { name: siteConfig.name, path: "/" },
        { name: "Stoat privacy", path: "/stoat-privacy" },
      ]} />

      <PublicPageHeading
        compact
        eyebrow="Stoat privacy"
        title={<>Stoat bots and<br />how they use your data.</>}
        description="Bots on Stoat can read your messages, track your activity and copy what you say to other platforms. This page looks at what popular bots collect, keep and share, what has changed since we first looked, and what Stoat has said about the rules."
        action={{ href: "/privacy-changes", label: "What Stoatmod changed" }}
      />
      <PublicSummary
        title="Most bots still don't ask first."
        description="Stoat hasn't published its developer rules yet. Kuma has fixed two of the issues we raised, bronx has added an opt-out and AutoMod still has no privacy policy. Bridges still copy messages off Stoat without asking members, and a bot was approved for Discovery while it was offline."
        facts={["8 bots and groups checked", "Re-checked " + checkedLabel, "Every finding links to its source"]}
      />

      <div className={styles.layout}>
        <aside className={styles.toc} aria-label="On this page">
          <strong>On this page</strong>
          {contents.map(([id, label], index) => (
            <a key={id} href={`#${id}`}><span>{String(index + 1).padStart(2, "0")}</span>{label}</a>
          ))}
        </aside>

        <article className={styles.article}>
          <section className={styles.section} id="status">
            <p className={styles.sectionNumber}>01 / Where things stand</p>
            <h2>What&apos;s changed since October, and what hasn&apos;t.</h2>
            <p className={styles.lede}>We re-read every bot&apos;s public pages, and the latest code where it&apos;s public, on {checkedLabel}.</p>
            <div className={styles.retentionTable} role="table" aria-label="Privacy status of Stoat bots">
              <div className={styles.tableHead} role="row">
                <span role="columnheader">Bot</span>
                <span role="columnheader">Latest</span>
                <span role="columnheader">Still open</span>
              </div>
              {statusRows.map((row) => (
                <div className={styles.tableRow} role="row" key={row.bot}>
                  <strong role="cell">{row.bot}</strong>
                  <p role="cell">{row.latest}</p>
                  <p role="cell">{row.open}</p>
                </div>
              ))}
            </div>
          </section>

          <section className={`${styles.section} ${styles.argument}`} id="consistency">
            <p className={styles.sectionNumber}>02 / Why we look at other bots</p>
            <h2>Whether a bot has to follow the privacy rules shouldn&apos;t depend on who runs it.</h2>
            <p>On 5 September 2026, Stoat Trust &amp; Safety gave Stoatmod 30 days to remove or redesign the parts that collected or kept data without consent, and we did. The notice quoted Stoat&apos;s published Community Guidelines:</p>
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
            <p>If every bot must meet these requirements independently, every bot developer needs to be able to read them. More than two months later they still aren&apos;t published, so other developers can&apos;t know them and users can&apos;t check whether the bots in their servers follow them. bronx, for instance, still keeps per-person message counts with no expiry and ranks people on leaderboards any member can see, which is the kind of &ldquo;user-level records&rdquo; Stoat told us aren&apos;t allowed.</p>
            <a className={styles.emailLink} href="/stoat-trust-and-safety-emails.pdf" target="_blank" rel="noopener">
              <span>Read the full email chain with Stoat Trust &amp; Safety</span>
              <span>PDF · 7 messages, 5 Sep to 2 Oct · opens in a new tab ↗</span>
            </a>
            <div className={styles.stoatConnection}>
              <span>Why this matters more</span>
              <h3>AutoMod has a direct link to Stoat.</h3>
              <p>AutoMod&apos;s own website says its developer has been on the Stoat team since 2023, and its support server has Stoat&apos;s verified badge. It reads members&apos; messages in every server it&apos;s in. Yet as of {checkedLabel} its website still has no privacy policy, no terms and no privacy notice telling users what it collects, how long it keeps it, or how to say no or ask for deletion.</p>
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
            <p className={styles.sectionNumber}>03 / Bot by bot</p>
            <h2>What each bot collects, keeps and shares.</h2>
            <p>We raised log_it and AutoMod with Stoat because of what their public docs seemed to describe. We looked at bronx, a group of three bots by one developer, bolt and Kuma later. AutoMod, bronx and bolt are open source, so we also read their code to check what they actually do. The code for log_it, Kuma and the group of three bots isn&apos;t public, so for those we relied on what their own websites and profiles say. These examples are here to show why a platform-wide answer is needed, not to accuse anyone.</p>
            <p className={styles.legend}><span className={styles.tick} aria-hidden="true">✓</span> A green tick means the bot&apos;s own public pages show the issue has since been fixed. We re-checked every bot on {checkedLabel}. So far two of Kuma&apos;s findings have been fixed.</p>
            <div className={styles.evidenceGrid}>
              <article className={`${styles.evidenceCard} ${styles.evidenceWide}`} id="automod">
                <div className={styles.evidenceHeading}>
                  <div><span>Moderation bot · open source · no privacy policy</span><h3>AutoMod</h3></div>
                  <code>01FHGJ3NPP7XANQQH8C2BE44ZY</code>
                </div>
                <p>AutoMod&apos;s developer is on the Stoat team, and its support server is verified by Stoat. We first read its code on 2 October 2026. When we checked again on {checkedLabel}, the newest commit in its repository was still that same version, so the findings below describe the code as it is today. Its website still links no privacy policy, terms or legal page, its privacy address returns &ldquo;not found&rdquo;, and it has published no blog posts since July.</p>
                <ul className={styles.findings}>
                  {automodFindings.map((finding) => (
                    <li key={finding.title}>
                      <strong>{finding.title}</strong>
                      <p>{finding.body}</p>
                      <a href={`${automodSource}/${finding.file}`} target="_blank" rel="noreferrer">{finding.file} <span aria-hidden="true">↗</span></a>
                    </li>
                  ))}
                </ul>
                <p className={styles.fairNote}>To be fair to AutoMod, we found no per-person activity stats, no sharing between servers and no messages sent to an outside AI service. Its main gap is that it doesn&apos;t tell members what it collects or how long it keeps it.</p>
                <p className={styles.findingsIntro}>What AutoMod&apos;s developer told us:</p>
                <figure className={styles.cardQuote}>
                  <blockquote>
                    <p>&ldquo;AutoMod doesn&apos;t keep message logs on the production instance &ndash; they&apos;re a debugging feature.&rdquo;</p>
                    <p>&ldquo;[I] have similarly been told to create policy as part of Stoat&apos;s wider crackdown. It is being applied evenly to everyone, as far as I can tell.&rdquo;</p>
                  </blockquote>
                  <figcaption>Declan Chidlow, AutoMod&apos;s developer, by email · October 2026</figcaption>
                </figure>
                <ul className={styles.notesList}>
                  <li><strong>Message logs:</strong> we can only see the code, not the official instance, so the first finding reflects what the developer told us.</li>
                  <li><strong>Privacy policy:</strong> in October the developer said Stoat had asked AutoMod to create one and that it was waiting on legal advice. Seven weeks later it still hasn&apos;t appeared.</li>
                  <li><strong>Consistency:</strong> this was the first sign we saw that Stoat is asking other bots to meet the same requirements. That&apos;s welcome, but it came privately, so the rules themselves remain unpublished.</li>
                </ul>
                <div className={styles.sourceLinks}>
                  <a href="https://automod.vale.rocks/blog/understanding-stoat-ids-ulids" target="_blank" rel="noreferrer">Developer disclosure <span aria-hidden="true">↗</span></a>
                  <a href="https://stt.gg/automod" target="_blank" rel="noreferrer">Verified support server <span aria-hidden="true">↗</span></a>
                  <a href={automodSource.replace("/blob/", "/tree/")} target="_blank" rel="noreferrer">Source code at the version we read <span aria-hidden="true">↗</span></a>
                </div>
              </article>

              <article className={`${styles.evidenceCard} ${styles.evidenceWide}`} id="kuma">
                <div className={styles.evidenceHeading}>
                  <div><span>All-in-one bot · has a privacy policy · code not public</span><h3>Kuma</h3></div>
                  <code>01KSQCGBPB79E4V5W6RG6VA7YC</code>
                </div>
                <p>Kuma describes itself as &ldquo;Stoat&apos;s most advanced all-in-one community and security bot&rdquo;. To be fair to Kuma, it publishes a detailed privacy policy, lets members view, export and delete their data, says it doesn&apos;t keep copies of messages, and deletes some records automatically. Its code isn&apos;t public, so everything below comes from Kuma&apos;s own website, privacy policy and commands page. We first read them on 6 October 2026 and again in full on {checkedLabel}. Kuma rewrote its privacy policy in November 2026, and it&apos;s now one of the most detailed of any Stoat bot.</p>
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
                <p className={styles.findingsIntro}>What the November privacy policy changed:</p>
                <ul className={styles.notesList}>
                  <li><strong>Data in three tiers.</strong> Essential data such as IDs, moderation records and settings; operational data such as join and leave events, logs and command usage; and optional data such as levels, economy and feeds, which is only collected once a server turns that feature on.</li>
                  <li><strong>No copy of your messages.</strong> When logging is on, the text of edited, deleted and automatically moderated messages goes to the server&apos;s own log channel on Stoat. Kuma keeps only a pointer to that post and reads it back when a moderator opens the dashboard.</li>
                  <li><strong>Chat snapshots store IDs only.</strong> When a report or punishment happens, Kuma records which of the last 30 messages were in the channel, not what they said. The text is fetched live when staff open the snapshot. Snapshots are on by default, deleted after 60 days, and owners can turn them off.</li>
                  <li><strong>Short retention for some data.</strong> Per-server daily message and command counts are kept for 60 days, uptime history for about 90 days, and login sessions for minutes.</li>
                  <li><strong>Members control their own data.</strong> A privacy hub lets members check what Kuma holds about them, download it or ask for deletion, and Kuma says it handles emailed requests within 30 days. Kuma&apos;s own surveys are opt-in and anonymous by default.</li>
                </ul>
                <p className={styles.fairNote}>On Stoat, Kuma&apos;s verification now uses its own puzzle, a drawn picture, a rules quiz or a probation period for newcomers, with no Cloudflare captcha and nothing about your connection. Image scanning, which sends images to Google&apos;s Vision API, is only available on Discord and Fluxer. Account linking with !link is opt-in.</p>
                <div className={styles.note}>
                  <strong>14 October 2026: Kuma rebuilt its verification on Stoat</strong>
                  <p>Kuma said the changes bring its verification in line with Stoat&apos;s guidelines: no IP, VPN or connection checks, hashed IP addresses from earlier verifications deleted, its own browser check in place of the Cloudflare captcha, and no use of other servers&apos; reports on Stoat. Its November privacy policy still says all of this. We welcome it, and we see Kuma dropping Cloudflare Turnstile as a step in the right direction.</p>
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
                <p>Kuma has removed cross-server flagging and IP checks on Stoat, just as we did. Its bridging still sends members&apos; messages to other platforms on an admin&apos;s decision alone. If the same standard applies to every bot, Stoat should say so publicly. If it doesn&apos;t, it should explain what makes the cases different.</p>
                <div className={styles.sourceLinks}>
                  <a href="https://kumabot.xyz/privacy" target="_blank" rel="noreferrer">Privacy policy <span aria-hidden="true">↗</span></a>
                  <a href="https://kumabot.xyz/commands" target="_blank" rel="noreferrer">Commands <span aria-hidden="true">↗</span></a>
                  <a href="https://stoat.chat/bot/01KSQCGBPB79E4V5W6RG6VA7YC" target="_blank" rel="noreferrer">Kuma bot profile <span aria-hidden="true">↗</span></a>
                </div>
              </article>

              <article className={`${styles.evidenceCard} ${styles.evidenceWide}`} id="bronx">
                <div className={styles.evidenceHeading}>
                  <div><span>Utility bot · open source · has a privacy page</span><h3>bronx</h3></div>
                  <code>01FZB4GBHDVYY6KT8JH4RBX4KR</code>
                </div>
                <p>bronx is open source, so we read its code as well as its website. It has a privacy page that explains what it stores and lets members download their data or opt out. On 14 October 2026 it added an opt-out for levels too. Its latest code change was on 28 October. The findings below come from the code as of 30 September 2026 and its privacy page as we read it on {checkedLabel}. The privacy page is still not linked from bronx&apos;s homepage, though its developer told us in October that it would be.</p>
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
                  <li><strong>bronx hadn&apos;t received a notice from Stoat.</strong> Its developer asked Stoat directly and shared the answers with us. They&apos;re in &ldquo;What Stoat has said&rdquo; below.</li>
                  <li><strong>The developer doesn&apos;t see bridging as a privacy issue.</strong> Stoat told them it&apos;s still deciding its policy on bridge bots, so we&apos;ve kept it listed as an open question.</li>
                </ul>
                <div className={styles.sourceLinks}>
                  <a href="https://bronx.siqnole.dev/privacy" target="_blank" rel="noreferrer">Privacy page <span aria-hidden="true">↗</span></a>
                  <a href="https://bronx.siqnole.dev/" target="_blank" rel="noreferrer">Website <span aria-hidden="true">↗</span></a>
                  <a href="https://bronx.siqnole.dev/docs/" target="_blank" rel="noreferrer">Documentation <span aria-hidden="true">↗</span></a>
                  <a href={bronxSource} target="_blank" rel="noreferrer">Source code at the version we read <span aria-hidden="true">↗</span></a>
                  <a href="https://codeberg.org/siq/bronx-stoat" target="_blank" rel="noreferrer">Latest source code <span aria-hidden="true">↗</span></a>
                </div>
              </article>

              <article className={`${styles.evidenceCard} ${styles.evidenceWide}`} id="bolt">
                <div className={styles.evidenceHeading}>
                  <div><span>Bridge bot · open source · has a privacy policy</span><h3>bolt</h3></div>
                  <code>01G1Y9M6G254VWBF41W3N5DQY5</code>
                </div>
                <p>bolt links channels on Stoat with channels on other platforms so the same conversation appears in both. It still supports Stoat and was last updated on 18 November 2026. To be fair to bolt, it publishes a privacy policy with a contact for data requests and its code is open source. When we read its code in October, its database stored message IDs rather than message content. Its legal page, which shows no date, lists the data it may collect more broadly: message content and metadata, user information, user activity and IP addresses, stored on hardware in the United States with encrypted backups on Microsoft OneDrive. The main problem is consent.</p>
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
                <p>Stoat required us to get each person&apos;s consent before their content was sent to an outside service, and told us that neither a server owner&apos;s choice nor a privacy policy counts as consent. A bridge sends members&apos; messages to other platforms on the strength of an admin&apos;s choice and a privacy policy alone. If the rule we were held to applies to every bot, bridged channels need a way for each member to agree before their messages are sent off Stoat. Stoat has told another developer it&apos;s still deciding its policy on bridge bots.</p>
                <div className={styles.sourceLinks}>
                  <a href="https://williamhorning.dev/bolt/legal" target="_blank" rel="noreferrer">Privacy policy and terms <span aria-hidden="true">↗</span></a>
                  <a href={boltSource} target="_blank" rel="noreferrer">Source code at the version we read <span aria-hidden="true">↗</span></a>
                  <a href="https://stoat.chat/bot/01G1Y9M6G254VWBF41W3N5DQY5" target="_blank" rel="noreferrer">bolt bot profile <span aria-hidden="true">↗</span></a>
                </div>
              </article>

              <article className={`${styles.evidenceCard} ${styles.evidenceWide}`} id="log-it">
                <div className={styles.evidenceHeading}>
                  <div><span>Logging bot · code not public</span><h3>log_it</h3></div>
                  <code>01J4Q9DS6CV4DNCW6AZRMV349A</code>
                </div>
                <p>log_it&apos;s privacy page, last edited on 15 September 2024, says it collects server and channel IDs and all event activity across every server it&apos;s in, records each server it joins in its support server, and sends error data to Sentry. Its transparency page says it stores deleted and edited messages with their content, and that most events end up in a local <code>log.txt</code> file that is backed up frequently. The privacy page says everything is deleted when the bot is removed, but not the log file, and gives no retention period for it. Its developers publish the website&apos;s code but not the bot&apos;s, so we can&apos;t check what it actually does. Nothing had changed when we checked on {checkedLabel}.</p>
                <div className={styles.sourceLinks}>
                  <a href="https://mu-mega-bots.github.io/log-it/information/privacy.html" target="_blank" rel="noreferrer">Privacy page <span aria-hidden="true">↗</span></a>
                  <a href="https://mu-mega-bots.github.io/log-it/information/transparency.html" target="_blank" rel="noreferrer">Transparency page <span aria-hidden="true">↗</span></a>
                  <a href="https://github.com/mu-mega-bots/log-it" target="_blank" rel="noreferrer">Website repository (no bot code) <span aria-hidden="true">↗</span></a>
                </div>
              </article>

              <article className={`${styles.evidenceCard} ${styles.evidenceWide}`} id="magbot">
                <div className={styles.evidenceHeading}>
                  <div><span>AI chatbot · open source · opt-in, no privacy policy</span><h3>magbot</h3></div>
                  <code>01KXJ0Z72PMQ01V3Z4GHGK21G0</code>
                </div>
                <p>magbot is an AI chatbot with a playful persona, made for fun and jokes. It answers when someone pings it or says its name, can search the web and remembers facts about the people it talks to. Its intentions are clearly good, and it does something many bots on this page don&apos;t: it asks before it touches your messages. We read its code on GitHub as of its latest change on 19 October 2026. It was approved for Stoat Discovery on 12 November 2026.</p>
                <p className={styles.findingsIntro}>What it gets right:</p>
                <ul className={styles.findings}>
                  {magbotGood.map((item) => (
                    <li key={item.title}>
                      <strong>{item.title}</strong>
                      <p>{item.body}</p>
                      <a href={`${magbotSource}/${item.file}`} target="_blank" rel="noreferrer">{item.file} <span aria-hidden="true">↗</span></a>
                    </li>
                  ))}
                </ul>
                <p className={styles.findingsIntro}>What&apos;s missing:</p>
                <ul className={styles.findings}>
                  {magbotFindings.map((item) => (
                    <li key={item.title}>
                      <strong>{item.title}</strong>
                      <p>{item.body}</p>
                      <a href={`${magbotSource}/${item.file}`} target="_blank" rel="noreferrer">{item.file} <span aria-hidden="true">↗</span></a>
                    </li>
                  ))}
                </ul>
                <p className={styles.fairNote}>magbot is a fun project, and its opt-in step is better than what several larger bots do. But if the rules are to apply equally, they should apply to this bot as well: a privacy policy, a consent message that names who receives your messages, and limits on how long memories are kept.</p>
                <div className={styles.sourceLinks}>
                  <a href="https://github.com/Maglcite/magbot" target="_blank" rel="noreferrer">Source code <span aria-hidden="true">↗</span></a>
                  <a href={`${magbotSource}/docs/CONSENT.md`} target="_blank" rel="noreferrer">Consent document <span aria-hidden="true">↗</span></a>
                  <a href="https://stoat.chat/bot/01KXJ0Z72PMQ01V3Z4GHGK21G0" target="_blank" rel="noreferrer">magbot bot profile <span aria-hidden="true">↗</span></a>
                </div>
              </article>

              <article className={`${styles.evidenceCard} ${styles.evidenceWide}`} id="bot-central">
                <div className={styles.evidenceHeading}>
                  <div><span>Bot group · one developer · code not public</span><h3>DailyFacts, Starboard and Logger</h3></div>
                  <div className={styles.idList}>
                    {botCentralBots.map((bot) => <code key={bot.id}>{bot.name} · {bot.id}</code>)}
                  </div>
                </div>
                <p>These three bots were created by the same developer on the same day, 15 June 2023, and all point to one support server, Bot Central. We looked for public information about them on 2 October 2026 and found almost none. There&apos;s still no website, policy or code to re-check.</p>
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
            </div>
            <div className={styles.caveat}>
              <strong>What these examples don&apos;t prove</strong>
              <p>Public docs don&apos;t tell us exactly how a bot works today, what it really keeps, what consent it gets or whether Stoat has looked at it. Similar features don&apos;t mean identical processing either. What the examples do show is why everyone needs a clear rule that applies to similar behaviour. If you run one of these bots and something here is out of date, <a href={`mailto:${siteConfig.contactEmail}`}>tell us</a> and we&apos;ll correct it.</p>
            </div>
          </section>

          <section className={styles.section} id="discovery">
            <p className={styles.sectionNumber}>04 / How Discovery bots are checked</p>
            <h2>A bot was approved for Discovery while it was offline.</h2>
            <p>Stoat Discovery lists bots for everyone on Stoat to find and add. Being listed tells people Stoat has looked at a bot, so they trust it more. On 12 November 2026, magbot&apos;s developer was told its Discovery listing had been approved. The bot had been down for about a month, so it can&apos;t have been running while it was reviewed.</p>
            <figure className={styles.screenshot}>
              <img src="/stoat-privacy/magbot-discovery-approval.webp" alt="A Stoat DM. mag shares a Platform Moderation notice that the Discover listing request for magbot#6581 has been approved, and says the bot has been down for the past month and was only just fixed. Kurome replies that it's very concerning, asking how Discovery can be approved for an offline bot. mag answers: no idea." width="2000" height="850" loading="lazy" />
              <figcaption>The approval notice, shared by magbot&apos;s developer on Stoat · 12 November 2026</figcaption>
            </figure>
            <p>This isn&apos;t about magbot doing anything wrong. It&apos;s about what a Discovery approval means. If a bot can be approved without running, nobody can have checked what it does with members&apos; messages, whether it asks for consent or whether it&apos;s safe. Every bot should be checked properly when it applies for Discovery, whoever made it.</p>
            <div className={styles.officialResponse}>
              <span>Our email to Stoat</span>
              <p className={styles.officialContext}>We emailed Stoat on 12 November 2026 to ask how bots are reviewed for Discovery. This is the email in full, apart from the sign-off:</p>
              <figure>
                <blockquote className={styles.emailQuote}>
                  <p>Hi there,</p>
                  {discoveryEmail.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
                  <ul>{discoveryQuestions.map((question) => <li key={question}>{question}</li>)}</ul>
                  <p>Discovery is a powerful tool for bot developers to get outreach for their projects. But it can be easily abused if the bot isn&apos;t checked properly and the trust of that application goes up significantly because the end-user believes stoat will do the necessary safety checks.</p>
                  <p>Attached is a screenshot of our discussion. Bot ID in question: 01KXJ0Z72PMQ01V3Z4GHGK21G0</p>
                </blockquote>
                <figcaption>Email to Stoat · 12 November 2026</figcaption>
              </figure>
              <p className={styles.officialContext}><strong>Stoat&apos;s reply:</strong> none yet. As of {checkedLabel}, a week later, we haven&apos;t heard back. We&apos;ll add their answer here when it arrives.</p>
            </div>
          </section>

          <section className={styles.section} id="stoat-guidance">
            <p className={styles.sectionNumber}>05 / What Stoat has said</p>
            <h2>Opt-in, 30 days for content, and privacy policies on the way.</h2>
            <p>As of {checkedLabel}, Stoat hasn&apos;t published developer guidelines for bots. Its legal page lists only its general terms, privacy policy and community guidelines, and the last policy update on its updates page was on 30 June 2026. So the most detailed answers are still the ones below, which bronx&apos;s developer got from Stoat Trust &amp; Safety and shared with us on 10 October 2026. We&apos;ve summarised each question and quoted Stoat&apos;s answer.</p>
            <div className={styles.officialResponse}>
              <span>Stoat&apos;s answers to bot developers</span>
              <ol className={styles.guidanceList}>
                {stoatGuidance.map((item) => (
                  <li key={item.question}>
                    <strong>{item.question}</strong>
                    <p>&ldquo;{item.answer}&rdquo;</p>
                  </li>
                ))}
              </ol>
              <p className={styles.officialContext}><strong>What this means:</strong> Stoat is asking every bot to use opt-in for data tied to a person, including per-person stats and rankings. Message content and attachments should be kept for 30 days unless there&apos;s a specific reason, such as a case under appeal. Other operational data can be kept while it&apos;s needed, at most until the bot is removed. Privacy policies will become a requirement, with a migration period once the guidelines are published. Stoat hasn&apos;t decided on bridge bots yet.</p>
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
              <p className={styles.officialContext}>We&apos;re glad developer guidelines are on the way. They hadn&apos;t been published by {checkedLabel}, and we&apos;ll update this page when they are.</p>
            </div>
          </section>

          <section className={`${styles.section} ${styles.commitment}`} id="checking">
            <p className={styles.sectionNumber}>07 / How to check a bot yourself</p>
            <h2>Five things to look for before you trust a bot with your messages.</h2>
            <ol className={styles.requestList}>
              {checklist.map((item, index) => (
                <li key={item.title}><span>{String(index + 1).padStart(2, "0")}</span><p><strong>{item.title}.</strong> {item.body}</p></li>
              ))}
            </ol>
            <p className={styles.closing}>We&apos;re not asking for special treatment. We&apos;re asking for one set of rules that everyone follows.</p>
            <div className={styles.actions}>
              <a href="/privacy-changes">What Stoatmod changed <span aria-hidden="true">→</span></a>
              <a href="/privacy">Read our privacy policy <span aria-hidden="true">→</span></a>
              <a href="/compare">Compare Stoat bots <span aria-hidden="true">→</span></a>
            </div>
          </section>
        </article>
      </div>

      <PublicFooter description="Transparent moderation, clear deletion deadlines and real privacy choices." />
    </main>
  );
}
