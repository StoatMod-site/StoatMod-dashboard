import { Breadcrumbs } from "../../Breadcrumbs";
import { JsonLd } from "../../JsonLd";
import { PublicFooter } from "../../PublicFooter";
import { SiteNav } from "../../SiteNav";
import { rankNewest } from "../../lib/discovery-catalog";
import { getRequiredPublicDiscovery } from "../../lib/public-data.server";
import { breadcrumbSchema, organizationSchema, websiteSchema } from "../../lib/schema";
import { discoveryOgImage, discoveryOgPath, imageObject } from "../../lib/discovery-seo";
import { buildMetadata } from "../../lib/seo";
import { absoluteUrl, siteConfig } from "../../lib/site-config";
import { AdvertiseBand, DiscoveryNav, RankedList, SubHero, listingDate, serverPath } from "../DiscoveryUI";
import styles from "../Discovery.module.css";

const path = "/discovery/new";
const title = "New Stoat Servers – Recently Added Communities | Stoatmod Discovery";
const description = "New Stoat servers recently approved on Stoatmod Discovery. Be one of the first to join fresh Stoat communities.";

export const metadata = buildMetadata({ title, description, path, ...discoveryOgImage("new", "New Stoat servers – Stoatmod Discovery") });

export default async function NewServersPage() {
  const servers = rankNewest(await getRequiredPublicDiscovery());
  const breadcrumbs = [
    { name: siteConfig.name, path: "/" },
    { name: "Discovery", path: "/discovery" },
    { name: "New Stoat servers", path },
  ];
  return (
    <main className={styles.page}>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          organizationSchema(),
          websiteSchema(),
          {
            "@type": "CollectionPage", "@id": absoluteUrl(path) + "#page", url: absoluteUrl(path), name: title, description, primaryImageOfPage: imageObject(discoveryOgPath("new")),
            isPartOf: { "@id": siteConfig.origin + "/#website" },
            mainEntity: { "@type": "ItemList", itemListElement: servers.map((server, index) => ({ "@type": "ListItem", position: index + 1, name: server.server_name, url: absoluteUrl(serverPath(server)) })) },
          },
          breadcrumbSchema(breadcrumbs),
        ],
      }} />
      <SiteNav active="discovery" />
      <SubHero eyebrow="Fresh listings" title={<>New <span className={styles.heroAccent}>Stoat servers</span></>} description="Communities recently approved for Stoatmod Discovery, newest first. New servers are a great place to get in early and help shape a community." />
      <DiscoveryNav active="new" />
      <Breadcrumbs items={breadcrumbs} />
      <section className={`${styles.section} ${styles.sectionTight}`} aria-label="New Stoat servers">
        <RankedList servers={servers} note={(server) => { const date = listingDate(server.approved_at); return date ? `listed ${date}` : "recently listed"; }} />
      </section>
      <AdvertiseBand compact />
      <div className={styles.spacer} />
      <PublicFooter />
    </main>
  );
}
