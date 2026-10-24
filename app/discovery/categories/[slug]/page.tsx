import { notFound } from "next/navigation";
import { Breadcrumbs } from "../../../Breadcrumbs";
import { JsonLd } from "../../../JsonLd";
import { PublicFooter } from "../../../PublicFooter";
import { SiteNav } from "../../../SiteNav";
import { CATEGORY_INDEX_MINIMUM, discoveryCategories, exampleNames, findCategory, serversInCategory } from "../../../lib/discovery-catalog";
import { getRequiredPublicDiscovery } from "../../../lib/public-data.server";
import { breadcrumbSchema, organizationSchema, websiteSchema } from "../../../lib/schema";
import { discoveryOgImage, discoveryOgPath, imageObject } from "../../../lib/discovery-seo";
import { buildMetadata } from "../../../lib/seo";
import { absoluteUrl, siteConfig } from "../../../lib/site-config";
import { AdvertiseBand, DiscoveryNav, SectionHeading, ServerGrid, SubHero, serverPath } from "../../DiscoveryUI";
import styles from "../../Discovery.module.css";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = findCategory(slug);
  if (!category) {
    return buildMetadata({ title: "Category not found | Stoatmod Discovery", description: "This Discovery category does not exist.", path: "/discovery/categories", index: false });
  }
  const servers = serversInCategory(await getRequiredPublicDiscovery(), category);
  return buildMetadata({
    title: `${category.title} | Stoatmod Discovery`,
    description: servers.length ? `${category.description} ${servers.length === 1 ? "1 reviewed server" : `${servers.length} reviewed servers`}, including ${exampleNames(servers)}.` : category.description,
    path: "/discovery/categories/" + category.slug,
    index: servers.length >= CATEGORY_INDEX_MINIMUM,
    ...discoveryOgImage("category-" + category.slug, `${category.title} – Stoatmod Discovery`),
  });
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = findCategory(slug);
  if (!category) notFound();
  const all = await getRequiredPublicDiscovery();
  const servers = serversInCategory(all, category);
  const path = "/discovery/categories/" + category.slug;
  const others = discoveryCategories.filter((other) => other.slug !== category.slug).map((other) => ({ other, count: serversInCategory(all, other).length })).filter(({ count }) => count > 0);
  const breadcrumbs = [
    { name: siteConfig.name, path: "/" },
    { name: "Discovery", path: "/discovery" },
    { name: "Categories", path: "/discovery/categories" },
    { name: category.name, path },
  ];
  return (
    <main className={styles.page}>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          organizationSchema(),
          websiteSchema(),
          {
            "@type": "CollectionPage", "@id": absoluteUrl(path) + "#page", url: absoluteUrl(path), name: category.title, description: category.description, primaryImageOfPage: imageObject(discoveryOgPath("category-" + category.slug)),
            isPartOf: { "@id": siteConfig.origin + "/#website" },
            mainEntity: { "@type": "ItemList", itemListElement: servers.map((server, index) => ({ "@type": "ListItem", position: index + 1, name: server.server_name, url: absoluteUrl(serverPath(server)) })) },
          },
          breadcrumbSchema(breadcrumbs),
        ],
      }} />
      <SiteNav active="discovery" />
      <SubHero eyebrow={`${category.emoji} Category · ${servers.length === 1 ? "1 server" : `${servers.length} servers`}`} title={category.title} description={category.intro} />
      <DiscoveryNav active="categories" />
      <Breadcrumbs items={breadcrumbs} />
      <section className={`${styles.section} ${styles.sectionTight}`} aria-labelledby="category-servers">
        <h2 id="category-servers" className="sr-only">{category.title}</h2>
        <ServerGrid servers={servers} empty={`No ${category.name.toLowerCase()} servers are listed yet. Run a ${category.name.toLowerCase()} community? List it for free and be the first.`} />
      </section>
      {others.length > 0 && <section className={styles.section} aria-labelledby="other-categories">
        <SectionHeading eyebrow="More topics" title="Other categories" />
        <div className={styles.tagRow}>{others.map(({ other, count }) => <a href={"/discovery/categories/" + other.slug} key={other.slug}>{other.emoji} {other.name} · {count}</a>)}</div>
      </section>}
      <AdvertiseBand compact />
      <div className={styles.spacer} />
      <PublicFooter />
    </main>
  );
}
