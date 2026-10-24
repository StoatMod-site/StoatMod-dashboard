import { Breadcrumbs } from "../../Breadcrumbs";
import { JsonLd } from "../../JsonLd";
import { PublicFooter } from "../../PublicFooter";
import { SiteNav } from "../../SiteNav";
import { verifiedServers } from "../../lib/discovery-catalog";
import { getRequiredPublicDiscovery } from "../../lib/public-data.server";
import { breadcrumbSchema, organizationSchema, websiteSchema } from "../../lib/schema";
import { discoveryOgImage, discoveryOgPath, imageObject } from "../../lib/discovery-seo";
import { buildMetadata } from "../../lib/seo";
import { absoluteUrl, siteConfig } from "../../lib/site-config";
import { AdvertiseBand, DiscoveryNav, Faq, SectionHeading, ServerGrid, SubHero, faqSchema, serverPath, type FaqItem } from "../DiscoveryUI";
import styles from "../Discovery.module.css";

const path = "/discovery/verified";
const title = "Verified Stoat Servers – Official & Trusted | Stoatmod";
const description = "Verified Stoat servers on Stoatmod Discovery: official servers, verified organisations, communities of high standing and impactful communities, each checked by the Stoatmod team.";

const tiers = [
  { name: "Official Stoatmod server", text: "Servers run by the Stoatmod team, such as our support community." },
  { name: "Verified organisation", text: "Communities run by a real organisation, project, creator or brand that has shown it controls the server." },
  { name: "Community of high standing", text: "Established servers with a long, clean record, active moderation and a good reputation." },
  { name: "Impactful community", text: "Servers doing notable good: charity, education, open source, support groups or community events." },
];

const faq: FaqItem[] = [
  { question: "What does the verified tick mean?", answer: "The Stoatmod team has checked who runs the server and why it stands out. Verification is on top of the normal Discovery review; it does not mean Stoatmod moderates or endorses every message in the server." },
  { question: "How do I get my server verified?", answer: "List your server on Discovery first. Once it is approved, open Dashboard → Discovery and choose Apply for verification. Explain which kind of verification fits and add links that prove it, such as your website or social accounts." },
  { question: "Can verification be removed?", answer: "Yes. If a verified server breaks the Discovery rules, changes owner, or no longer meets the standard it was verified for, the tick can be removed." },
];

export const metadata = buildMetadata({ title, description, path, ...discoveryOgImage("verified", "Verified Stoat servers – Stoatmod Discovery") });

export default async function VerifiedServersPage() {
  const servers = verifiedServers(await getRequiredPublicDiscovery());
  const breadcrumbs = [
    { name: siteConfig.name, path: "/" },
    { name: "Discovery", path: "/discovery" },
    { name: "Verified servers", path },
  ];
  return (
    <main className={styles.page}>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          organizationSchema(),
          websiteSchema(),
          {
            "@type": "CollectionPage", "@id": absoluteUrl(path) + "#page", url: absoluteUrl(path), name: title, description, primaryImageOfPage: imageObject(discoveryOgPath("verified")),
            isPartOf: { "@id": siteConfig.origin + "/#website" },
            mainEntity: { "@type": "ItemList", itemListElement: servers.map((server, index) => ({ "@type": "ListItem", position: index + 1, name: server.server_name, url: absoluteUrl(serverPath(server)) })) },
          },
          { ...faqSchema(faq), "@id": absoluteUrl(path) + "#faq" },
          breadcrumbSchema(breadcrumbs),
        ],
      }} />
      <SiteNav active="discovery" />
      <SubHero eyebrow={servers.length === 1 ? "1 verified server" : `${servers.length} verified servers`} title={<>Verified <span className={styles.heroAccent}>Stoat servers</span></>} description="Official servers, verified organisations and standout communities, each checked by the Stoatmod team. Look for the green tick across Discovery." />
      <DiscoveryNav active="verified" />
      <Breadcrumbs items={breadcrumbs} />
      <section className={`${styles.section} ${styles.sectionTight}`} aria-labelledby="verified-servers">
        <h2 id="verified-servers" className="sr-only">Verified Stoat servers</h2>
        <ServerGrid servers={servers} empty="No servers are verified yet. Listed servers can apply from Dashboard → Discovery." />
      </section>
      <section className={styles.section} aria-labelledby="verification-tiers">
        <SectionHeading eyebrow="What the tick means" title="Four kinds of verification" description="Every verified server shows which kind of verification it holds when you hover or tap the tick." />
        <div className={`${styles.benefitGrid} ${styles.tierGrid}`}>
          {tiers.map((tier) => <article className={styles.benefit} key={tier.name}><h3>{tier.name}</h3><p>{tier.text}</p></article>)}
        </div>
      </section>
      <Faq items={faq} title="Verification questions" />
      <AdvertiseBand compact />
      <div className={styles.spacer} />
      <PublicFooter />
    </main>
  );
}
