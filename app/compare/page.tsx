import { Breadcrumbs } from "../Breadcrumbs";
import { PublicFooter } from "../PublicFooter";
import { OpenSourceCallout } from "../OpenSourceCallout";
import { PublicPageHeading, PublicSummary } from "../PublicPageHeading";
import { SiteNav } from "../SiteNav";
import { JsonLd } from "../JsonLd";
import { breadcrumbSchema, organizationSchema, webPageSchema, websiteSchema } from "../lib/schema";
import { buildMetadata } from "../lib/seo";
import { absoluteUrl, siteConfig } from "../lib/site-config";
import styles from "./Compare.module.css";

type BotId = "stoatmod" | "kuma" | "automod" | "bronx";

const contents = [
  ["ranking", "The ranking"],
  ["scorecard", "Scorecard"],
  ["privacy", "Privacy"],
  ["choose", "Which one fits"],
  ["method", "How we checked"],
  ["request-bot", "Request a bot"],
] as const;

// Logos and banners are copies of each bot's public Stoat profile avatar and background.
const bots: Record<BotId, { name: string; tagline: string; logo: string; banner: string; bannerStill?: string }> = {
  stoatmod: { name: "Stoatmod", tagline: "AI moderation bot", logo: "/compare/stoatmod-logo.webp", banner: "/compare/stoatmod-banner.webp" },
  kuma: { name: "Kuma", tagline: "All-in-one community and security bot", logo: "/compare/kuma-logo.webp", banner: "/compare/kuma-banner.webp" },
  automod: { name: "AutoMod", tagline: "Open-source moderation bot", logo: "/compare/automod-logo.webp", banner: "/compare/automod-banner.webp" },
  bronx: { name: "bronx", tagline: "Entertainment bot with moderation tools", logo: "/compare/bronx-logo.webp", banner: "/compare/bronx-banner.webp", bannerStill: "/compare/bronx-banner-still.webp" },
};

const order: BotId[] = ["stoatmod", "kuma", "automod", "bronx"];

// 0 = not offered or not documented on Stoat, 1 = basic, 2 = good, 3 = the most complete of the four.
// Ties are broken by the first area in this list where the scores differ.
const criteria: { title: string; detail: string; scores: Record<BotId, number> }[] = [
  { title: "Understanding messages", detail: "Catches harmful content by what it means, not only by matching words.", scores: { stoatmod: 3, kuma: 2, automod: 1, bronx: 1 } },
  { title: "Spam and mass mentions", detail: "Floods, repeats, mention spam and automatic timeouts.", scores: { stoatmod: 2, kuma: 3, automod: 2, bronx: 1 } },
  { title: "Links and scams", detail: "Removing unwanted links and known scam or phishing sites.", scores: { stoatmod: 2, kuma: 3, automod: 0, bronx: 0 } },
  { title: "Raids and new members", detail: "Join floods, new accounts, verification and limits for newcomers.", scores: { stoatmod: 2, kuma: 3, automod: 0, bronx: 1 } },
  { title: "Actions and escalation", detail: "Warnings, timeouts, kicks and bans, with cases and automatic escalation.", scores: { stoatmod: 3, kuma: 3, automod: 2, bronx: 1 } },
  { title: "Appeals and notices", detail: "Telling members what happened and letting them appeal.", scores: { stoatmod: 3, kuma: 3, automod: 0, bronx: 1 } },
  { title: "Logs and review", detail: "Mod logs and tools for moderators to review decisions.", scores: { stoatmod: 2, kuma: 3, automod: 2, bronx: 2 } },
  { title: "Usernames and nicknames", detail: "Screening names automatically, not only changing them by hand.", scores: { stoatmod: 2, kuma: 2, automod: 0, bronx: 0 } },
  { title: "Images", detail: "Scanning images on Stoat for gore or explicit content.", scores: { stoatmod: 2, kuma: 0, automod: 0, bronx: 0 } },
  { title: "Network-wide protection", detail: "Stopping a known scammer or abuser across servers on Stoat.", scores: { stoatmod: 2, kuma: 0, automod: 0, bronx: 0 } },
];

const maxScore = criteria.length * 3;
const total = (bot: BotId) => criteria.reduce((sum, item) => sum + item.scores[bot], 0);

const ranking: { bot: BotId; headline: string; summary: string; strengths: string[]; gaps: string[] }[] = [
  {
    bot: "stoatmod",
    headline: "The only one that reads what a message means",
    summary: "Stoatmod's own AI, running on our hardware, checks messages for serious harm across categories such as hate, violent extremism, illegal activity and sexual content. It acts only when a category scores 90% or higher, and an optional Thinking check makes it double-check borderline cases and explain itself.",
    strengths: ["AI content moderation with per-category policies", "Cases, warning escalation and a full appeal portal", "Join protection, link protection, spam detection and optional CAPTCHA", "Global bans and reports reviewed by the Stoatmod team", "Image scanning for gore and explicit nudity, including GIFs and link previews", "Bot, API, website and dashboard source under AGPL-3.0"],
    gaps: ["No raid lockdown or waiting room yet", "No scam-link threat feed yet", "Image scanning can miss clinical close-up photos", "Model weights have not been released yet"],
  },
  {
    bot: "kuma",
    headline: "The widest rule-based toolkit",
    summary: "Kuma has the most complete set of rules: a tiered content filter that sees through leetspeak and look-alike letters, link checks against a threat feed, an anti-raid suite with lockdown and a waiting room, and cases with appeals. It doesn't use AI, so it matches patterns rather than reading meaning.",
    strengths: ["Anti-raid with lockdown, waiting room and probation for newcomers", "Tiered content filter and threat-feed link checks", "Cases, escalation ladder, appeals and detailed logs"],
    gaps: ["Pattern-based, so it can miss harm phrased in ordinary words", "Image scanning is Discord and Fluxer only", "Cross-server Raid Guard is Discord and Fluxer only"],
  },
  {
    bot: "automod",
    headline: "Solid basics, open source",
    summary: "AutoMod covers the essentials: warn, kick, ban, timeout and purge, an infractions record, a word filter with strictness levels, spam settings and logs for messages and moderator actions, plus a web dashboard.",
    strengths: ["Core moderation commands and infractions", "Word filter with strictness levels and spam settings", "Open-source code anyone can read"],
    gaps: ["No documented anti-raid, verification or link filter", "No appeals"],
  },
  {
    bot: "bronx",
    headline: "An entertainment bot with moderation on the side",
    summary: "bronx is built mainly for fun: economy, gambling games, counting, levelling, custom commands and roleplay. Its moderation tools are real but light: ban, kick and timeout, a moderation history, a word and regex filter, simple anti-raid triggers and audit logs.",
    strengths: ["Anti-raid triggers for join floods, message spam and accounts without an avatar", "Word and regex filter with exemptions", "Audit logs for deletes, edits, joins, leaves and moderator actions"],
    gaps: ["Moderation isn't its focus", "No warn command, appeals, link filter or verification"],
  },
];

type Finding = { text: string; fixed?: boolean };
const privacy: { bot: BotId; anchor: string; badge: string; findings: Finding[]; better: string[]; good: string }[] = [
  {
    bot: "kuma",
    anchor: "kuma",
    badge: "Two findings fixed",
    good: "Kuma publishes a detailed privacy policy, lets members view, export and delete their data, and says it doesn't keep copies of messages.",
    findings: [
      { text: "Cross-server flagging was on by default. Stoat communities are now excluded.", fixed: true },
      { text: "IP checks and network linking were on by default. Stoat verification no longer looks at your connection.", fixed: true },
      { text: "Bridging copies members' messages, names and avatars to Discord and Fluxer on an admin's decision alone, with no notice or consent step for members." },
    ],
    better: ["Tell members when a channel is bridged and let them agree before their messages leave Stoat.", "Publish its code, or have it checked independently, so its claims can be verified."],
  },
  {
    bot: "automod",
    anchor: "automod",
    badge: "No privacy policy yet",
    good: "We found no per-person activity stats, no sharing between servers and no messages sent to an outside AI service.",
    findings: [
      { text: "No privacy policy, terms or privacy notice, even though its developer is on the Stoat team and its support server is verified. Its developer says one is being prepared with legal advice." },
      { text: "The code prints the text of every message to the bot's output. Its developer says this is a debugging feature and isn't kept on the official instance." },
      { text: "Every command is logged with the username, user ID, server name and full command text." },
      { text: "Votekick records keep who voted against whom, with nothing that deletes them." },
    ],
    better: ["Publish a privacy policy that says what it collects and how long it keeps it.", "Turn message printing off by default in the code.", "Delete votekick records after a set time."],
  },
  {
    bot: "bronx",
    anchor: "bronx",
    badge: "Tracks people by default",
    good: "We found no message content stored outside Stoat (only counts), no AI services and no IP collection, and members can download their data or opt out.",
    findings: [
      { text: "Every member's messages, edits, deletes and commands are counted per person from the moment bronx joins. Members can opt out, but nobody is asked first." },
      { text: "Anyone can rank the most active people across every server bronx is in." },
      { text: "Its privacy page says nothing is collected passively, but the code counts every message a person sends." },
      { text: "Server details are posted to a developer channel, and application answers are kept with no deletion deadline." },
    ],
    better: ["Make activity tracking and leaderboards opt-in, which Stoat says it's now asking every bot to do.", "Delete applications after a set time; Stoat's guidance points to 30 days.", "Remove the developer channel and make the privacy page match what the code does."],
  },
];

const stoatmodBetter = [
  { text: "Our bot and website code is public, but the moderation model's weights have not been released yet.", href: siteConfig.botSourceUrl, label: "Bot and API source" },
  { text: "Join verification and the report form still use Cloudflare Turnstile, though only after the person agrees.", href: "/privacy-changes#remains", label: "What's still there" },
  { text: "Global bans and warnings work across servers. Only authorised Stoatmod admins can see them, and only to deal with abuse.", href: "/privacy-changes#remains", label: "What's still there" },
  { text: "Our AI reads every message in the channels it moderates. Stoat has said this is allowed without opt-in as long as nothing is kept after the check, which is how it works.", href: "/privacy-changes#consistency", label: "What Stoat told us" },
];

const choices = [
  { need: "Catch harmful messages by what they mean, with appeals and short retention", pick: "stoatmod" as BotId },
  { need: "Heavy raid protection, lockdowns and scam-link checks", pick: "kuma" as BotId },
  { need: "Simple, open-source moderation basics", pick: "automod" as BotId },
  { need: "Economy, games and levelling with light moderation", pick: "bronx" as BotId },
];

const sources: { bot: BotId; links: { label: string; href: string }[] }[] = [
  { bot: "stoatmod", links: [{ label: "Bot and API source", href: siteConfig.botSourceUrl }, { label: "Website and dashboard source", href: siteConfig.websiteSourceUrl }, { label: "Features", href: "/features" }, { label: "Documentation", href: "/docs" }, { label: "Privacy changes", href: "/privacy-changes" }] },
  { bot: "kuma", links: [{ label: "Website", href: "https://kumabot.xyz/" }, { label: "Commands", href: "https://kumabot.xyz/commands" }, { label: "Privacy policy", href: "https://kumabot.xyz/privacy" }] },
  { bot: "automod", links: [{ label: "Website", href: "https://automod.vale.rocks/" }, { label: "Documentation", href: "https://automod.vale.rocks/docs/automod" }, { label: "Source code", href: "https://tangled.org/vale.rocks/AutoMod" }] },
  { bot: "bronx", links: [{ label: "Website", href: "https://bronx.siqnole.dev/" }, { label: "Documentation", href: "https://bronx.siqnole.dev/docs/" }, { label: "Privacy page", href: "https://bronx.siqnole.dev/privacy" }] },
];

const seo = {
  title: "Stoat Moderation Bots Compared: Stoatmod, Kuma, AutoMod & bronx",
  description: "Compare Stoatmod, Kuma, AutoMod and bronx across 10 moderation features, privacy practices and source availability. See scores, evidence and setup links.",
  path: "/compare",
  image: "/compare/og-stoat-bots-comparison.png",
  imageAlt: "Stoat moderation bots compared: Stoatmod, Kuma, AutoMod and bronx. Features, privacy and open-source code.",
  publishedTime: "2026-10-14T00:00:00+01:00",
  modifiedTime: "2026-10-19T00:00:00+01:00",
};

export const metadata = buildMetadata({
  title: seo.title,
  description: seo.description,
  path: seo.path,
  image: seo.image,
  imageAlt: seo.imageAlt,
  imageWidth: 1733,
  imageHeight: 908,
  type: "article",
  modifiedTime: seo.modifiedTime,
});

const schema = {
  "@context": "https://schema.org",
  "@graph": [
    organizationSchema(),
    websiteSchema(),
    {
      ...webPageSchema({ title: seo.title, description: seo.description, path: seo.path }),
      dateModified: seo.modifiedTime,
      primaryImageOfPage: { "@id": `${absoluteUrl(seo.path)}#image` },
      mainEntity: { "@id": `${absoluteUrl(seo.path)}#article` },
    },
    {
      "@type": "ImageObject",
      "@id": `${absoluteUrl(seo.path)}#image`,
      url: absoluteUrl(seo.image),
      contentUrl: absoluteUrl(seo.image),
      width: 1733,
      height: 908,
      caption: seo.imageAlt,
    },
    {
      "@type": "Article",
      "@id": `${absoluteUrl(seo.path)}#article`,
      headline: seo.title,
      description: seo.description,
      url: absoluteUrl(seo.path),
      inLanguage: "en-GB",
      datePublished: seo.publishedTime,
      dateModified: seo.modifiedTime,
      image: { "@id": `${absoluteUrl(seo.path)}#image` },
      author: { "@id": `${siteConfig.origin}/#organization` },
      publisher: { "@id": `${siteConfig.origin}/#organization` },
      mainEntityOfPage: { "@id": `${absoluteUrl(seo.path)}#page` },
    },
    {
      "@type": "ItemList",
      "@id": `${absoluteUrl(seo.path)}#ranking`,
      name: "Stoat moderation bots ranked by moderation capability",
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      numberOfItems: ranking.length,
      itemListElement: ranking.map((item, index) => ({ "@type": "ListItem", position: index + 1, name: bots[item.bot].name, url: absoluteUrl(`${seo.path}#rank-${item.bot}`) })),
    },
    breadcrumbSchema([
      { name: siteConfig.name, path: "/" },
      { name: "Compare bots", path: seo.path },
    ]),
  ],
};

function BotLogo({ bot, size }: { bot: BotId; size: number }) {
  return <img className={styles.logo} src={bots[bot].logo} alt="" width={size} height={size} loading="lazy" decoding="async" />;
}

function BotBanner({ bot }: { bot: BotId }) {
  const { banner, bannerStill } = bots[bot];
  return (
    <picture className={styles.banner}>
      {bannerStill && <source media="(prefers-reduced-motion: reduce)" srcSet={bannerStill} />}
      <img src={banner} alt="" loading="lazy" decoding="async" />
    </picture>
  );
}

function Dots({ value, label }: { value: number; label: string }) {
  return (
    <span className={styles.dots} role="img" aria-label={`${label}: ${value} of 3`}>
      {[1, 2, 3].map((step) => <i key={step} className={step <= value ? styles.on : ""} />)}
    </span>
  );
}

export default function ComparePage() {
  return (
    <main className={styles.page}>
      <JsonLd data={schema} />
      <SiteNav />
      <Breadcrumbs items={[
        { name: siteConfig.name, path: "/" },
        { name: "Compare bots", path: "/compare" },
      ]} />

      <PublicPageHeading
        compact
        eyebrow="Bot comparison"
        title={<>Stoat moderation bots,<br />compared side by side.</>}
        description="Compare Stoatmod, Kuma, AutoMod and bronx across 10 moderation areas, with privacy findings and public source links."
        action={{ href: "#scorecard", label: "See the scorecard" }}
      />
      <PublicSummary
        title="Ranked on moderation. Checked for privacy."
        description="Every score is shown and every claim links to its source, so you can check our working."
        facts={["10 moderation areas", "Feature review: 14 October 2026", "Source update: 15 October 2026"]}
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
          <div className={styles.disclosure}>
            <strong>We make Stoatmod, so we aren&apos;t neutral.</strong>
            <p>That&apos;s why the full scorecard and our method are on this page. If you think we&apos;ve got something wrong about any bot, including ours, tell us and we&apos;ll correct it.</p>
            <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
          </div>

          <section className={styles.section} id="ranking">
            <p className={styles.sectionNumber}>01 / The ranking</p>
            <h2>Ranked by moderation capability.</h2>
            <p className={styles.lede}>Each bot is scored from 0 to 3 in ten areas of moderation, for a total out of 30.</p>
            <ol className={styles.rankList}>
              {ranking.map((item, index) => {
                const score = total(item.bot);
                return (
                  <li key={item.bot} id={`rank-${item.bot}`} className={`${styles.rankCard} ${index === 0 ? styles.leader : ""}`}>
                    <div className={styles.bannerWrap}>
                      <BotBanner bot={item.bot} />
                      <span className={styles.position}>#{index + 1}</span>
                    </div>
                    <div className={styles.rankBody}>
                    <div className={styles.rankHead}>
                      <BotLogo bot={item.bot} size={76} />
                      <div className={styles.rankName}>
                        <span className={styles.kind}>{bots[item.bot].tagline}</span>
                        <h3>{bots[item.bot].name}</h3>
                      </div>
                      <div className={styles.total}>
                        <strong>{score}</strong><span>/ {maxScore}</span>
                        <span className={styles.bar} aria-hidden="true"><i style={{ width: `${(score / maxScore) * 100}%` }} /></span>
                      </div>
                    </div>
                    <p className={styles.headline}>{item.headline}</p>
                    <p>{item.summary}</p>
                    <div className={styles.lists}>
                      <div><strong>Strengths</strong><ul>{item.strengths.map((text) => <li key={text}>{text}</li>)}</ul></div>
                      <div><strong>Gaps</strong><ul className={styles.gapList}>{item.gaps.map((text) => <li key={text}>{text}</li>)}</ul></div>
                    </div>
                    </div>
                  </li>
                );
              })}
            </ol>
            <div className={styles.note}>
              <strong>Stoatmod and Kuma are one point apart</strong>
              <p>Stoatmod scores 23 out of 30 and Kuma 22. Stoatmod leads on understanding messages, images and network-wide protection; Kuma leads on spam, links, raids and logs. If raids are your biggest worry, Kuma is the stronger choice. AutoMod and bronx are level on 7, and AutoMod ranks ahead because it is stronger on spam.</p>
            </div>
          </section>

          <section className={styles.section} id="scorecard">
            <p className={styles.sectionNumber}>02 / Scorecard</p>
            <h2>Ten areas, scored 0 to 3.</h2>
            <p>0 means a feature isn&apos;t offered or documented on Stoat, 1 is basic, 2 is good and 3 is the most complete of the four. Features only available on Discord or Fluxer don&apos;t count.</p>
            <div className={styles.tableWrap}>
              <table className={styles.scoreTable}>
                <caption className={styles.srOnly}>Moderation scores for each bot</caption>
                <thead>
                  <tr><th scope="col">Area</th>{order.map((bot) => <th scope="col" key={bot}><span className={styles.colHead}><BotLogo bot={bot} size={22} />{bots[bot].name}</span></th>)}</tr>
                </thead>
                <tbody>
                  {criteria.map((item) => (
                    <tr key={item.title}>
                      <th scope="row"><strong>{item.title}</strong><small>{item.detail}</small></th>
                      {order.map((bot) => <td key={bot}><Dots value={item.scores[bot]} label={bots[bot].name} /></td>)}
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr><th scope="row">Total</th>{order.map((bot) => <td key={bot}><strong>{total(bot)}</strong> / {maxScore}</td>)}</tr>
                </tfoot>
              </table>
            </div>
          </section>

          <section className={styles.section} id="privacy">
            <p className={styles.sectionNumber}>03 / Privacy</p>
            <h2>What each bot does with your data.</h2>
            <p>Moderation bots read a lot of messages, so how they handle data matters as much as what they catch. These summaries come straight from our privacy changes page, where every finding links to the code or page it came from. Stoat has said it&apos;s asking every bot to use opt-in for data tied to a person, and that privacy policies will become a requirement.</p>
            <div className={styles.inlineLinks}>
              <a href="/privacy-changes#examples">Read the privacy changes page <span aria-hidden="true">→</span></a>
              <a href="/privacy-changes#stoat-guidance">Stoat&apos;s latest guidance <span aria-hidden="true">→</span></a>
            </div>
            <div className={styles.privacyGrid}>
              {privacy.map((item) => (
                <article key={item.bot} className={styles.privacyCard}>
                  <div className={styles.privacyHead}>
                    <BotLogo bot={item.bot} size={36} />
                    <h3>{bots[item.bot].name}</h3>
                    <span className={styles.status}>{item.badge}</span>
                  </div>
                  <p className={styles.good}>{item.good}</p>
                  <strong className={styles.subhead}>Privacy concerns</strong>
                  <ul className={styles.findings}>
                    {item.findings.map((finding) => (
                      <li key={finding.text} className={finding.fixed ? styles.fixed : ""}>
                        {finding.fixed && <span className={styles.tick} role="img" aria-label="Fixed">✓</span>}{finding.text}
                      </li>
                    ))}
                  </ul>
                  <strong className={styles.subhead}>How it could do better</strong>
                  <ul className={styles.better}>{item.better.map((text) => <li key={text}>{text}</li>)}</ul>
                  <a className={styles.readMore} href={`/privacy-changes#${item.anchor}`}>Read the full findings <span aria-hidden="true">→</span></a>
                </article>
              ))}
              <article className={`${styles.privacyCard} ${styles.ours}`}>
                <div className={styles.privacyHead}>
                  <BotLogo bot="stoatmod" size={36} />
                  <h3>Stoatmod</h3>
                  <span className={styles.status}>Our own record</span>
                </div>
                <p className={styles.good}>After a privacy review by Stoat, our AI runs on our own hardware, moderated messages are deleted 30 days after the decision, and IP checks, cross-server sharing and per-person stats are gone.</p>
                <strong className={styles.subhead}>Where we could do better</strong>
                <ul className={styles.better}>
                  {stoatmodBetter.map((item) => <li key={item.text}>{item.text} <a href={item.href}>{item.label} <span aria-hidden="true">→</span></a></li>)}
                </ul>
                <a className={styles.readMore} href="/privacy-changes#changes">What we changed <span aria-hidden="true">→</span></a>
              </article>
            </div>
          </section>

          <section className={styles.section} id="choose">
            <p className={styles.sectionNumber}>04 / Which one fits</p>
            <h2>The best bot depends on what your server needs.</h2>
            <ul className={styles.choiceList}>
              {choices.map((item) => (
                <li key={item.need}><span>{item.need}</span><strong className={styles.pick}><BotLogo bot={item.pick} size={24} />{bots[item.pick].name}</strong></li>
              ))}
            </ul>
          </section>

          <section className={styles.section} id="method">
            <p className={styles.sectionNumber}>05 / How we checked</p>
            <h2>From each bot&apos;s own pages and code.</h2>
            <p>We checked each bot&apos;s website and documentation on 14 October 2026 and scored only what they say works on Stoat. AutoMod and bronx are open source, so we could also read their code. Kuma&apos;s code isn&apos;t public, so we relied on its own website, commands page and privacy policy. Features change, so if a bot has added something we missed, tell us and we&apos;ll re-score it.</p>
            <p>On 15 October 2026, we published Stoatmod&apos;s bot and dashboard API, plus the website and server dashboard, under AGPL-3.0. You can now inspect the code and its setup instructions in the repositories below. The moderation model&apos;s weights will be released separately.</p>
            <p>Each bot&apos;s logo and banner come from its public Stoat profile and belong to its developer. We show them only so you can recognise each bot.</p>
            <div className={styles.sources}>
              {sources.map((item) => (
                <div key={item.bot}>
                  <strong className={styles.pick}><BotLogo bot={item.bot} size={24} />{bots[item.bot].name}</strong>
                  {item.links.map((link) => {
                    const external = link.href.startsWith("http");
                    return <a key={link.href} href={link.href} {...(external ? { target: "_blank", rel: "noreferrer" } : {})}>{link.label} <span aria-hidden="true">{external ? "↗" : "→"}</span></a>;
                  })}
                </div>
              ))}
            </div>
          </section>
          <section className={styles.section} id="request-bot">
            <p className={styles.sectionNumber}>06 / Add a bot</p>
            <h2>Request your bot to be added.</h2>
            <p>Developers and community members can suggest a Stoat bot for this comparison. Send us the public details below so we can assess it using the same criteria as every other bot.</p>
            <ul className={styles.requestList}>
              <li>Bot name and its public Stoat bot profile.</li>
              <li>Website, documentation and supported Stoat moderation features.</li>
              <li>Privacy policy and public source code, where available.</li>
              <li>A contact address for questions or corrections.</li>
            </ul>
            <div className={styles.requestActions}>
              <a href={`mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent("Request to add a Stoat bot to the comparison")}`}>Request a bot review <span aria-hidden="true">↗</span></a>
              <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
            </div>
          </section>
        </article>
      </div>

      <PublicFooter description="Transparent moderation, clear deletion deadlines and real privacy choices." />
    </main>
  );
}
