import { notFound } from "next/navigation";
import { Breadcrumbs } from "../../../Breadcrumbs";
import { JsonLd } from "../../../JsonLd";
import { PublicFooter } from "../../../PublicFooter";
import { SiteNav } from "../../../SiteNav";
import { breadcrumbSchema, organizationSchema, websiteSchema } from "../../../lib/schema";
import { getRequiredPublicDiscovery } from "../../../lib/public-data.server";
import { discoveryServerSlug, slugify } from "../../../lib/public-slugs";
import { discoveryOgImage, discoveryOgPath, imageObject } from "../../../lib/discovery-seo";
import { buildMetadata } from "../../../lib/seo";
import { absoluteUrl, siteConfig } from "../../../lib/site-config";
import { exampleNames, rankPopular } from "../../../lib/discovery-catalog";
import { AdvertiseBand, CategoryTiles, DiscoveryNav, SectionHeading, ServerGrid, SubHero } from "../../DiscoveryUI";
import styles from "../../Discovery.module.css";

async function taggedServers(tagSlug: string) {
  const servers = await getRequiredPublicDiscovery();
  const displayTag = servers.flatMap((server) => server.tags).find((tag) => slugify(tag) === tagSlug.toLowerCase());
  if (!displayTag) return { displayTag: null, servers: [], all: servers };
  return {
    displayTag,
    servers: servers.filter((server) => server.tags.some((tag) => slugify(tag) === tagSlug.toLowerCase())),
    all: servers,
  };
}

export async function generateMetadata({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const result = await taggedServers(tag);
  if (!result.displayTag) {
    return buildMetadata({
      title: "Discovery topic not found | Stoatmod",
      description: "This Stoatmod Discovery topic is not available.",
      path: "/discovery",
      index: false,
    });
  }
  const title = "#" + result.displayTag + " Stoat Servers | Stoatmod Discovery";
  const listed = rankPopular(result.servers);
  const description = `${listed.length === 1 ? "1 reviewed Stoat server" : `${listed.length} reviewed Stoat servers`} tagged #${result.displayTag}, including ${exampleNames(listed)}. Join with a direct invite on Stoatmod Discovery.`;
  return buildMetadata({
    title,
    description,
    path: "/discovery/tags/" + slugify(result.displayTag),
    index: result.servers.length >= 3,
    ...discoveryOgImage("tags", `#${result.displayTag} Stoat servers – Stoatmod Discovery`),
  });
}

export default async function DiscoveryTagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const result = await taggedServers(tag);
  if (!result.displayTag) notFound();
  const all = result.all;
  const canonicalPath = "/discovery/tags/" + slugify(result.displayTag);
  const breadcrumbs = [
    { name: siteConfig.name, path: "/" },
    { name: "Discovery", path: "/discovery" },
    { name: "#" + result.displayTag, path: canonicalPath },
  ];
  return (
    <main className={styles.page}>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          organizationSchema(),
          websiteSchema(),
          {
            "@type": "CollectionPage",
            "@id": absoluteUrl(canonicalPath) + "#page",
            url: absoluteUrl(canonicalPath),
            name: "#" + result.displayTag + " Stoat servers",
            primaryImageOfPage: imageObject(discoveryOgPath("tags")),
            description: "Reviewed Stoat Discovery listings tagged " + result.displayTag + ".",
            mainEntity: {
              "@type": "ItemList",
              itemListElement: result.servers.map((server, index) => ({
                "@type": "ListItem",
                position: index + 1,
                name: server.server_name,
                url: absoluteUrl("/discovery/servers/" + discoveryServerSlug(server)),
              })),
            },
          },
          breadcrumbSchema(breadcrumbs),
        ],
      }} />
      <SiteNav active="discovery" />
      <SubHero eyebrow="Discovery topic" title={<>#{result.displayTag} <span className={styles.heroAccent}>Stoat servers</span></>} description={`${result.servers.length === 1 ? "1 reviewed listing" : `${result.servers.length} reviewed listings`} tagged #${result.displayTag}. Tags are supplied by community owners and checked as part of the directory review. Read the descriptions and server rules before joining.`} />
      <DiscoveryNav />
      <Breadcrumbs items={breadcrumbs} />
      <section className={`${styles.section} ${styles.sectionTight}`} aria-label={"Servers tagged " + result.displayTag}>
        <ServerGrid servers={rankPopular(result.servers)} />
      </section>
      <section className={styles.section} aria-labelledby="tag-categories">
        <SectionHeading eyebrow="Keep exploring" title="Browse by category" action={{ href: "/discovery/categories", label: "All categories" }} />
        <CategoryTiles servers={all} />
      </section>
      <AdvertiseBand compact />
      <div className={styles.spacer} />
      <PublicFooter />
    </main>
  );
}
