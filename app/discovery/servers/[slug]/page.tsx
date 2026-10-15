import { notFound, permanentRedirect } from "next/navigation";
import { Breadcrumbs } from "../../../Breadcrumbs";
import { JsonLd } from "../../../JsonLd";
import { PublicFooter } from "../../../PublicFooter";
import { SiteNav } from "../../../SiteNav";
import { breadcrumbSchema, organizationSchema, websiteSchema } from "../../../lib/schema";
import { getRequiredPublicDiscovery } from "../../../lib/public-data.server";
import { discoveryServerSlug, findDiscoveryServer, slugify } from "../../../lib/public-slugs";
import { buildMetadata } from "../../../lib/seo";
import { absoluteUrl, siteConfig } from "../../../lib/site-config";
import { PublicPageHeading, PublicSummary } from "../../../PublicPageHeading";
import { ServerArtwork } from "../../../ServerArtwork";
import styles from "../../DiscoveryProfile.module.css";

function readableDate(value: string | null | undefined) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

function metadataText(value: string, maximumLength: number) {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= maximumLength) return text;
  const candidate = text.slice(0, maximumLength - 1).trimEnd();
  const lastSpace = candidate.lastIndexOf(" ");
  const shortened = lastSpace >= Math.floor(maximumLength * 0.6)
    ? candidate.slice(0, lastSpace)
    : candidate;
  return shortened + "…";
}

function profileMetadataDescription(name: string, value: string) {
  const description = value.replace(/\s+/g, " ").trim();
  return metadataText(
    `Join ${name} on Stoat. ${description}`,
    160,
  );
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const servers = await getRequiredPublicDiscovery();
  const server = findDiscoveryServer(servers, slug);
  if (!server) {
    return buildMetadata({
      title: "Server listing not found | Stoatmod",
      description: "This Stoatmod Discovery listing is not available.",
      path: "/discovery",
      index: false,
    });
  }
  const canonical = "/discovery/servers/" + discoveryServerSlug(server);
  const titleName = server.server_name;
  const description = profileMetadataDescription(server.server_name, server.description);
  return buildMetadata({
    title: titleName + " – Stoat Server | Stoatmod",
    description,
    path: canonical,
    ...(server.server_banner_url ? {
      image: server.server_banner_url,
      imageAlt: `${server.server_name} on Stoat`,
    } : {}),
  });
}

export default async function DiscoveryServerProfile({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const servers = await getRequiredPublicDiscovery();
  const server = findDiscoveryServer(servers, slug);
  if (!server) notFound();
  const canonicalSlug = discoveryServerSlug(server);
  if (slug !== canonicalSlug) permanentRedirect("/discovery/servers/" + canonicalSlug);
  const canonicalPath = "/discovery/servers/" + canonicalSlug;
  const approved = readableDate(server.approved_at);
  const updated = readableDate(server.updated_at);
  const breadcrumbs = [
    { name: siteConfig.name, path: "/" },
    { name: "Discovery", path: "/discovery" },
    { name: server.server_name, path: canonicalPath },
  ];
  return (
    <main className={styles.page}>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          organizationSchema(),
          websiteSchema(),
          {
            "@type": "WebPage",
            "@id": absoluteUrl(canonicalPath) + "#page",
            url: absoluteUrl(canonicalPath),
            name: server.server_name + " – Stoat server listing",
            description: server.description,
            ...(server.server_banner_url ? { image: server.server_banner_url } : {}),
            isPartOf: { "@id": siteConfig.origin + "/#website" },
            mainEntity: {
              "@type": "Organization",
              "@id": absoluteUrl(canonicalPath) + "#community",
              name: server.server_name,
              description: server.description,
              url: absoluteUrl(canonicalPath),
              ...(server.server_icon_url ? { logo: server.server_icon_url } : {}),
            },
          },
          breadcrumbSchema(breadcrumbs),
        ],
      }} />
      <SiteNav active="discovery" />
      <Breadcrumbs items={breadcrumbs} />
      <ServerArtwork serverId={server.server_id} name={server.server_name} src={server.server_banner_url} kind="banner" className={styles.banner} priority />
      <PublicPageHeading compact eyebrow="Reviewed Discovery listing" title={server.server_name} description={server.description} action={{href:"/discovery",label:"All communities"}} />
      <PublicSummary title="Community at a glance" description="Public activity from the current server snapshot. Memberships are server memberships, not unique people across Stoat." facts={[`${server.member_count.toLocaleString("en-GB")} memberships`,`${server.daily_messages.toLocaleString("en-GB")} messages today (UTC)`]} icon={<ServerArtwork serverId={server.server_id} name={server.server_name} src={server.server_icon_url} kind="icon" className={styles.summaryIcon} />} />
      <div className={styles.layout}>
        <article className={styles.content}>
          <section className={styles.section}>
            <p className={styles.eyebrow}>Public activity snapshot</p>
            <h2>Community at a glance</h2>
            <div className={styles.stats}>
              <div><strong>{server.member_count.toLocaleString("en-GB")}</strong><span>server memberships</span></div>
              <div><strong>{server.daily_messages.toLocaleString("en-GB")}</strong><span>messages today (UTC)</span></div>
            </div>
            <p>Membership totals are not unique people across Stoat. Activity values come from the current public server snapshot and can change after this page is rendered.</p>
          </section>
          {server.information && <section className={styles.section}><p className={styles.eyebrow}>Community-provided information</p><h2>About this server</h2><p>{server.information}</p></section>}
          <section className={styles.section}>
            <h2>How to join {server.server_name}</h2>
            <p>Use the Stoat invite on this page to open {server.server_name} in Stoat. Sign in or create a Stoat account if prompted, then follow the invite and read the community’s rules.</p>
            <p>Looking for more communities? <a href="/discovery">Browse the Stoat server list</a> or explore this server’s topics below.</p>
          </section>
          <section className={styles.section}>
            <p className={styles.eyebrow}>Topics</p>
            <h2>Listing tags</h2>
            {server.tags.length ? <div className={styles.tags}>{server.tags.map((tag) => <a href={"/discovery/tags/" + slugify(tag)} key={tag}>#{tag}</a>)}</div> : <p>This listing has no public topic tags.</p>}
          </section>
          <p className={styles.notice}><strong>Review scope:</strong> Discovery approval checks listing eligibility and presentation. It does not guarantee that every message, member or external destination in a community is safe or suitable.</p>
        </article>
        <aside className={styles.aside}>
          <strong>Visit this community on Stoat</strong>
          <p>Read the server’s own rules and use your judgement before joining. The invite is supplied by the listing owner.</p>
          <a href={server.invite_url} target="_blank" rel="ugc nofollow noopener noreferrer">Join {server.server_name} <span>↗</span></a>
          <a className={styles.secondary} href="/discovery">Back to Discovery <span>←</span></a>
          <div className={styles.dates}>{approved && <span>Approved {approved}</span>}{updated && <span>Listing updated {updated}</span>}{server.global_rank && <span>Public activity rank #{server.global_rank}</span>}</div>
        </aside>
      </div>
      <PublicFooter />
    </main>
  );
}
