import { Breadcrumbs } from "../../Breadcrumbs";
import { JsonLd } from "../../JsonLd";
import { PublicFooter } from "../../PublicFooter";
import { SiteNav } from "../../SiteNav";
import { discoveryCategories, serversInCategory, topTags } from "../../lib/discovery-catalog";
import { getRequiredPublicDiscovery } from "../../lib/public-data.server";
import { slugify } from "../../lib/public-slugs";
import { breadcrumbSchema, organizationSchema, websiteSchema } from "../../lib/schema";
import { buildMetadata } from "../../lib/seo";
import { absoluteUrl, siteConfig } from "../../lib/site-config";
import { AdvertiseBand, CategoryTiles, DiscoveryNav, SectionHeading, SubHero } from "../DiscoveryUI";
import styles from "../Discovery.module.css";

const path = "/discovery/categories";
const title = "Stoat Server Categories – Gaming, Anime, Art & More | Stoatmod Discovery";
const description = "Browse Stoat servers by category: gaming, anime, art, music, roleplay, social, LGBTQ+, Brazilian and tech communities on Stoatmod Discovery.";

export const metadata = buildMetadata({ title, description, path });

export default async function CategoriesPage() {
  const servers = await getRequiredPublicDiscovery();
  const tags = topTags(servers, 40);
  const breadcrumbs = [
    { name: siteConfig.name, path: "/" },
    { name: "Discovery", path: "/discovery" },
    { name: "Categories", path },
  ];
  return (
    <main className={styles.page}>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          organizationSchema(),
          websiteSchema(),
          {
            "@type": "CollectionPage", "@id": absoluteUrl(path) + "#page", url: absoluteUrl(path), name: title, description,
            isPartOf: { "@id": siteConfig.origin + "/#website" },
            mainEntity: { "@type": "ItemList", itemListElement: discoveryCategories.map((category, index) => ({ "@type": "ListItem", position: index + 1, name: category.title, url: absoluteUrl("/discovery/categories/" + category.slug) })) },
          },
          breadcrumbSchema(breadcrumbs),
        ],
      }} />
      <SiteNav active="discovery" />
      <SubHero eyebrow="Categories" title={<>Stoat servers by <span className={styles.titleMuted}>category</span></>} description="Pick a topic to see reviewed Stoat communities for it, from gaming and anime to art, music and making friends." />
      <DiscoveryNav active="categories" />
      <Breadcrumbs items={breadcrumbs} />
      <section className={`${styles.section} ${styles.sectionTight}`} aria-label="Categories">
        <CategoryTiles servers={servers} showEmpty />
      </section>
      {tags.length > 0 && <section className={styles.section} aria-labelledby="all-tags">
        <SectionHeading eyebrow="Tags" title="Popular tags" description="Tags are chosen by each server's owners." />
        <div className={styles.tagRow}>{tags.map(({ tag, count }) => <a href={"/discovery/tags/" + slugify(tag)} key={tag}><span data-no-translate>#{tag}</span> · {count}</a>)}</div>
      </section>}
      <section className={styles.section} aria-labelledby="category-copy">
        <div className={styles.copy}>
          <div><p className={styles.eyebrow}>Finding a server</p><h2 id="category-copy">How categories work</h2></div>
          <div>
            <p>A server appears in a category when its tags or description match that topic, so one server can appear in several categories. Category pages show the most active servers first.</p>
            <p>Can&apos;t find your topic? <a href="/discovery">Search every Stoat server</a> by name or tag. Own a server for this topic? <a href="/discovery/advertise">Advertise it for free</a>.</p>
            <p>{discoveryCategories.filter((category) => serversInCategory(servers, category).length === 0).length > 0 ? "Some categories are still waiting for their first listing, and yours could be the first." : "Every category has active listings."}</p>
          </div>
        </div>
      </section>
      <AdvertiseBand compact />
      <div className={styles.spacer} />
      <PublicFooter />
    </main>
  );
}
