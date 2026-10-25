import { Breadcrumbs } from "../../Breadcrumbs";
import type { AppLocale } from "../../lib/i18n-core";
import { pageLanguage } from "./localize";
import { JsonLd } from "../../JsonLd";
import { PublicFooter } from "../../PublicFooter";
import { SiteNav } from "../../SiteNav";
import { rankPopular } from "../../lib/discovery-catalog";
import { getRequiredPublicDiscovery } from "../../lib/public-data.server";
import { breadcrumbSchema, organizationSchema, websiteSchema } from "../../lib/schema";
import { discoveryOgImage, discoveryOgPath, imageObject } from "../../lib/discovery-seo";
import { buildMetadata } from "../../lib/seo";
import { absoluteUrl, siteConfig } from "../../lib/site-config";
import { AdvertiseBand, CategoryTiles, DiscoveryNav, RankedList, SectionHeading, SubHero, serverPath } from "../DiscoveryUI";
import styles from "../Discovery.module.css";

const path = "/discovery/top";
const title = "Top Stoat Servers – Most Active Communities | Stoatmod";
const description = "The top Stoat servers on Stoatmod Discovery, ranked by public activity and members. Find the most active Stoat communities and join with a direct invite.";

export function topMetadata(locale: AppLocale) {
  const language = pageLanguage(locale);
  return buildMetadata({ title: language.phrase(title), description: language.phrase(description), path, locale, ...discoveryOgImage("top", language.phrase("Top Stoat servers – Stoatmod Discovery")) });
}

export async function TopView(locale: AppLocale) {
  const language = pageLanguage(locale);
  const servers = rankPopular(await getRequiredPublicDiscovery());
  const breadcrumbs = [
    { name: siteConfig.name, path: "/" },
    { name: "Discovery", path: "/discovery" },
    { name: "Top Stoat servers", path },
  ];
  return language.render(
    <main className={styles.page} lang={language.lang}>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          organizationSchema(),
          websiteSchema(),
          {
            "@type": "CollectionPage", "@id": language.url(path) + "#page", url: language.url(path), name: language.phrase(title), description: language.phrase(description), inLanguage: locale, primaryImageOfPage: imageObject(discoveryOgPath("top")),
            isPartOf: { "@id": siteConfig.origin + "/#website" },
            mainEntity: { "@type": "ItemList", itemListOrder: "https://schema.org/ItemListOrderDescending", itemListElement: servers.map((server, index) => ({ "@type": "ListItem", position: index + 1, name: server.server_name, url: language.url(serverPath(server)) })) },
          },
          breadcrumbSchema(language.breadcrumbs(breadcrumbs)),
        ],
      }} />
      <SiteNav active="discovery" />
      <SubHero eyebrow="Rankings" title={<>Top <span className={styles.heroAccent}>Stoat servers</span></>} description="The most active reviewed communities on Stoatmod Discovery, ranked by public activity, messages today and members. Rankings update throughout the day." />
      <DiscoveryNav active="top" />
      <Breadcrumbs items={breadcrumbs} />
      <section className={`${styles.section} ${styles.sectionTight}`} aria-labelledby="top-servers">
        <h2 id="top-servers" className="sr-only">Top Stoat servers</h2>
        <RankedList servers={servers} />
      </section>
      <section className={styles.section} aria-labelledby="top-categories">
        <SectionHeading eyebrow="Keep exploring" title="Top servers by category" action={{ href: "/discovery/categories", label: "All categories" }} />
        <CategoryTiles servers={servers} />
      </section>
      <AdvertiseBand compact />
      <div className={styles.spacer} />
      <PublicFooter />
    </main>
  );
}
