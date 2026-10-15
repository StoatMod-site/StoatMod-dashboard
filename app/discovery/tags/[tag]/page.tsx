import { notFound } from "next/navigation";
import { Breadcrumbs } from "../../../Breadcrumbs";
import { JsonLd } from "../../../JsonLd";
import { PublicFooter } from "../../../PublicFooter";
import { SiteNav } from "../../../SiteNav";
import { breadcrumbSchema, organizationSchema, websiteSchema } from "../../../lib/schema";
import { getRequiredPublicDiscovery } from "../../../lib/public-data.server";
import { discoveryServerSlug, slugify } from "../../../lib/public-slugs";
import { buildMetadata } from "../../../lib/seo";
import { absoluteUrl, siteConfig } from "../../../lib/site-config";
import { PublicPageHeading, PublicSummary } from "../../../PublicPageHeading";
import { ServerArtwork } from "../../../ServerArtwork";
import styles from "../../DiscoveryProfile.module.css";

async function taggedServers(tagSlug: string) {
  const servers = await getRequiredPublicDiscovery();
  const displayTag = servers.flatMap((server) => server.tags).find((tag) => slugify(tag) === tagSlug.toLowerCase());
  if (!displayTag) return { displayTag: null, servers: [] };
  return {
    displayTag,
    servers: servers.filter((server) => server.tags.some((tag) => slugify(tag) === tagSlug.toLowerCase())),
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
  const description = "Browse reviewed Stoat server listings tagged " + result.displayTag + " in the Stoatmod Discovery directory.";
  return buildMetadata({
    title,
    description,
    path: "/discovery/tags/" + slugify(result.displayTag),
    index: result.servers.length >= 3,
  });
}

export default async function DiscoveryTagPage({ params }: { params: Promise<{ tag: string }> }) {
  const { tag } = await params;
  const result = await taggedServers(tag);
  if (!result.displayTag) notFound();
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
      <Breadcrumbs items={breadcrumbs} />
      <PublicPageHeading compact eyebrow="Discovery topic" title={`#${result.displayTag} Stoat servers`} description="Explore reviewed communities that share this topic." action={{href:"/discovery",label:"All communities"}} />
      <PublicSummary title={`${result.servers.length} reviewed ${result.servers.length===1?"listing":"listings"}.`} description="Tags are supplied by community owners and checked as part of the directory review. Read the descriptions and server rules before joining." facts={[`Topic: #${result.displayTag}`,"Community-provided details","Direct Stoat invites"]} icon={<span>#</span>} />
      <section className={styles.directory} aria-label={"Servers tagged " + result.displayTag}>
        {result.servers.map((server) => (
          <a className={styles.card} href={"/discovery/servers/" + discoveryServerSlug(server)} key={server.server_id}>
            <ServerArtwork serverId={server.server_id} name={server.server_name} src={server.server_banner_url} kind="banner" className={styles.cardBanner} />
            <span>Reviewed listing</span>
            <h2>{server.server_name}</h2>
            <p>{server.description}</p>
            <dl><div><dt>Memberships</dt><dd>{server.member_count.toLocaleString("en-GB")}</dd></div><div><dt>Messages today</dt><dd>{server.daily_messages.toLocaleString("en-GB")}</dd></div></dl>
          </a>
        ))}
      </section>
      <PublicFooter />
    </main>
  );
}
