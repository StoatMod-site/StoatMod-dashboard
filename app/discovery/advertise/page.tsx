/* eslint-disable @next/next/no-html-link-for-pages -- Public links use browser navigation because the production client router fails. */
import { Breadcrumbs } from "../../Breadcrumbs";
import { JsonLd } from "../../JsonLd";
import { PublicFooter } from "../../PublicFooter";
import { SiteNav } from "../../SiteNav";
import { directoryStats, featuredServers } from "../../lib/discovery-catalog";
import { advertiseFaq } from "../../lib/discovery-faq";
import { getPublicDiscoveryResult } from "../../lib/public-data.server";
import { breadcrumbSchema, organizationSchema, websiteSchema } from "../../lib/schema";
import { buildMetadata } from "../../lib/seo";
import { absoluteUrl, siteConfig } from "../../lib/site-config";
import { DiscoveryNav, Faq, SectionHeading, ServerCard, SubHero, faqSchema } from "../DiscoveryUI";
import styles from "../Discovery.module.css";

const path = "/discovery/advertise";
const title = "Stoat Server Advertising – Advertise Your Stoat Server Free | Stoatmod";
const description = "Advertise your Stoat server for free on Stoatmod Discovery. Get a reviewed listing with its own page, appear in search and categories, and bump it every two hours.";

export const metadata = buildMetadata({ title, description, path });

const benefits = [
  { title: "Found by people searching", text: "Discovery is built to rank for Stoat server searches, so people looking for a community can find yours." },
  { title: "A page of its own", text: "Every listing gets a server page with your banner, icon, description, tags and a direct invite that is easy to share." },
  { title: "Bump every two hours", text: "Bump with ~bump or from the dashboard to move your server to the top of Recently bumped and into the featured spot." },
  { title: "Live activity", text: "Member counts and today's message activity show visitors that your community is active before they join." },
  { title: "Categories and tags", text: "Up to five tags place your server in topic pages and categories such as gaming, anime, art and music." },
  { title: "Reviewed and free", text: "Every listing is reviewed, which keeps the directory trustworthy. Listing and bumping cost nothing." },
];

export default async function AdvertisePage() {
  const discovery = await getPublicDiscoveryResult();
  const stats = directoryStats(discovery.servers);
  const example = featuredServers(discovery.servers, 1)[0];
  const breadcrumbs = [
    { name: siteConfig.name, path: "/" },
    { name: "Discovery", path: "/discovery" },
    { name: "Advertise your server", path },
  ];
  return (
    <main className={styles.page}>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          organizationSchema(),
          websiteSchema(),
          { "@type": "WebPage", "@id": absoluteUrl(path) + "#page", url: absoluteUrl(path), name: title, description, isPartOf: { "@id": siteConfig.origin + "/#website" } },
          { "@type": "HowTo", name: "How to advertise a Stoat server on Stoatmod Discovery", step: [
            { "@type": "HowToStep", name: "Add Stoatmod", text: "Invite Stoatmod to your Stoat server." },
            { "@type": "HowToStep", name: "Give Stoatmod a role", text: "Give Stoatmod a role with its permissions above your members, add a server icon and turn on public statistics." },
            { "@type": "HowToStep", name: "Apply", text: "Open the Discovery tab in the Stoatmod dashboard and submit a description, invite and tags." },
            { "@type": "HowToStep", name: "Get reviewed and bump", text: "Once approved, your server is listed. Bump it every two hours with ~bump." },
          ] },
          { ...faqSchema(advertiseFaq), "@id": absoluteUrl(path) + "#faq" },
          breadcrumbSchema(breadcrumbs),
        ],
      }} />
      <SiteNav active="discovery" />
      <SubHero eyebrow="Stoat server advertising" title={<>Advertise your <span className={styles.titleMuted}>Stoat server</span>, free.</>} description="List your community on Stoatmod Discovery, the reviewed directory of Stoat servers. Reach people searching for a new server, get your own server page and bump your listing every two hours.">
        <div className={styles.heroActions}>
          <a className={styles.primaryButton} href="/login">List your server <span aria-hidden="true">→</span></a>
          <a className={styles.ghostButton} href={siteConfig.inviteUrl}>Add Stoatmod to Stoat ↗</a>
        </div>
        {discovery.available && stats.servers > 0 && <dl className={styles.heroStats}><div><dt>servers listed</dt><dd>{stats.servers.toLocaleString("en-GB")}</dd></div><div><dt>members across listed servers</dt><dd>{stats.members.toLocaleString("en-GB")}</dd></div><div><dt>to list and bump</dt><dd>£0</dd></div></dl>}
      </SubHero>
      <DiscoveryNav active="advertise" />
      <Breadcrumbs items={breadcrumbs} />

      <section className={`${styles.section} ${styles.sectionTight}`} aria-labelledby="benefits-title">
        <SectionHeading eyebrow="Why list on Discovery" title="Everything you need to grow your Stoat community" />
        <div className={styles.benefitGrid}>{benefits.map((benefit, index) => <article className={styles.benefit} key={benefit.title}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><h3>{benefit.title}</h3><p>{benefit.text}</p></article>)}</div>
      </section>

      <section className={styles.section} aria-labelledby="steps-title">
        <SectionHeading eyebrow="How it works" title="List your server in four steps" description="Most applications are reviewed within a day." />
        <ol className={styles.steps}>
          <li className={styles.step}><h3>Add Stoatmod</h3><p><a href={siteConfig.inviteUrl}>Invite Stoatmod</a> to your Stoat server. It is free and open source.</p></li>
          <li className={styles.step}><h3>Give it a role</h3><p>Give Stoatmod a role with its permissions and move it above your members. Add a server icon and keep public statistics on.</p></li>
          <li className={styles.step}><h3>Apply from the dashboard</h3><p>Open the Discovery tab in the <a href="/login">dashboard</a>, then add a description, an invite and up to five tags.</p></li>
          <li className={styles.step}><h3>Get listed and bump</h3><p>After review your server goes live with its own page. Bump it every two hours with <code>~bump</code>.</p></li>
        </ol>
      </section>

      <section className={styles.section} aria-labelledby="requirements-title">
        <div className={styles.copy}>
          <div>
            <SectionHeading eyebrow="Requirements" title="What your server needs" description="Requirements keep the directory active and trustworthy. The dashboard shows which ones your server already meets." />
            {example && <div className={styles.previewCard}><p className={styles.eyebrow}>Example listing</p><ServerCard server={example} /></div>}
          </div>
          <ul className={styles.checklist}>
            <li><div><strong>Stoatmod installed</strong><span>Stoatmod is in your server.</span></div></li>
            <li><div><strong>All audited permissions</strong><span>Stoatmod&apos;s role has its permissions and sits above your members.</span></div></li>
            <li><div><strong>A server icon</strong><span>Listings without an icon are not shown.</span></div></li>
            <li><div><strong>Public statistics on</strong><span>Member and activity counts appear on your page.</span></div></li>
            <li><div><strong>A Stoat invite link</strong><span>Use an invite that does not expire.</span></div></li>
            <li><div><strong>A clear description</strong><span>20–500 characters, plus optional longer information.</span></div></li>
            <li><div><strong>Up to five tags</strong><span>Accurate topics place you in categories.</span></div></li>
            <li><div><strong>Follows the Discovery rules</strong><span>Read the <a href="/docs/discovery">listing rules</a> before applying.</span></div></li>
          </ul>
        </div>
      </section>

      <section className={styles.section} aria-labelledby="tips-title">
        <div className={styles.copy}>
          <div><p className={styles.eyebrow}>Tips</p><h2 id="tips-title">Make your listing stand out</h2></div>
          <div>
            <p><strong>Lead with what makes you different.</strong> The first sentence of your description appears on cards and in search results. Say who the server is for and what happens there.</p>
            <p><strong>Add a banner.</strong> Listings with a server banner get a full-width image on their card and page.</p>
            <p><strong>Pick specific tags.</strong> &ldquo;minecraft&rdquo; or &ldquo;anime&rdquo; puts you in the right category faster than &ldquo;fun&rdquo;.</p>
            <p><strong>Bump regularly and stay active.</strong> Recently bumped and active servers are featured first. Read the full <a href="/guides/how-to-list-and-advertise-a-stoat-server">guide to listing and advertising a Stoat server</a>.</p>
          </div>
        </div>
      </section>

      <Faq items={advertiseFaq} title="Advertising questions" eyebrow="Stoat server advertising FAQ" />
      <section className={`${styles.band} ${styles.bandCompact}`} aria-labelledby="advertise-final">
        <div><p className={styles.kicker}><span aria-hidden="true" />Stoatmod / Ready when you are</p><h2 id="advertise-final">Put your Stoat server in front of new members.</h2></div>
        <div className={styles.bandActions}><a className={styles.primaryButton} href="/login">List your server <span aria-hidden="true">→</span></a><a className={styles.ghostButton} href="/discovery">Browse Discovery</a></div>
      </section>
      <div className={styles.spacer} />
      <PublicFooter />
    </main>
  );
}
