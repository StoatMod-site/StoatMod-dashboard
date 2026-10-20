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
import { ServerArtwork } from "../../../ServerArtwork";
import { categoriesForServer, compactNumber, similarServers } from "../../../lib/discovery-catalog";
import { AdvertiseBand, DiscoveryNav, RankedList, SectionHeading, hueStyle } from "../../DiscoveryUI";
import styles from "../../Discovery.module.css";

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
  const categories = categoriesForServer(server);
  // Owners often repeat the description at the start of the longer information; show only what is new.
  const information = server.information.trim();
  const extraInformation = information.startsWith(server.description.trim()) ? information.slice(server.description.trim().length).trim() : information;
  const similar = similarServers(servers, server, 4);
  const shareUrl = absoluteUrl(canonicalPath);
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
              ...(server.tags.length ? { keywords: server.tags.join(", ") } : {}),
            },
          },
          breadcrumbSchema(breadcrumbs),
        ],
      }} />
      <SiteNav active="discovery" />
      <header className={styles.profileHero} style={hueStyle(server.server_id)}>
        <div className={styles.profileBanner}><ServerArtwork serverId={server.server_id} name={server.server_name} src={server.server_banner_url} kind="banner" priority /></div>
        <div className={styles.profileShade} aria-hidden="true" />
        <div className={styles.profileInner}>
          <ServerArtwork serverId={server.server_id} name={server.server_name} src={server.server_icon_url} kind="icon" className={styles.profileIcon} />
          <div>
            <p className={styles.kicker}><span aria-hidden="true" />Reviewed Stoat server</p>
            <h1>{server.server_name}</h1>
            <p className={styles.profileMeta}>{server.member_count.toLocaleString("en-GB")} members · {server.daily_messages.toLocaleString("en-GB")} messages today{server.global_rank ? ` · #${server.global_rank} in public activity` : ""}</p>
            {server.tags.length > 0 && <div className={styles.tagRow}>{server.tags.map((tag) => <a href={"/discovery/tags/" + slugify(tag)} key={tag} data-no-translate>#{tag}</a>)}</div>}
          </div>
          <div className={styles.profileJoin}>
            <a className={styles.primaryButton} href={server.invite_url} target="_blank" rel="ugc nofollow noopener noreferrer">Join {server.server_name} <span aria-hidden="true">↗</span></a>
            <a className={styles.ghostButton} href="/discovery">Browse more servers</a>
          </div>
        </div>
      </header>
      <DiscoveryNav />
      <Breadcrumbs items={breadcrumbs} />
      <div className={styles.profileLayout}>
        <article>
          <div className={styles.statRow}>
            <div className={styles.stat}><strong>{compactNumber(server.member_count)}</strong><span>server memberships</span></div>
            <div className={styles.stat}><strong>{compactNumber(server.daily_messages)}</strong><span>messages today (UTC)</span></div>
            <div className={styles.stat}><strong>{server.global_rank ? `#${server.global_rank}` : "—"}</strong><span>public activity rank</span></div>
          </div>
          <section className={styles.prose}>
            <p className={styles.eyebrow}>About this server</p>
            <h2>What is {server.server_name}?</h2>
            <p data-no-translate>{server.description}</p>
            {extraInformation && <p data-no-translate>{extraInformation}</p>}
          </section>
          <section className={styles.prose}>
            <h2>How to join {server.server_name}</h2>
            <p>Use the Stoat invite on this page to open {server.server_name} in Stoat. Sign in or create a Stoat account if prompted, then follow the invite and read the community&apos;s rules.</p>
            <p>Looking for more communities? <a href="/discovery">Browse the Stoat server list</a>{categories.length > 0 && <>, or explore {categories.map((category, index) => <span key={category.slug}>{index > 0 ? (index === categories.length - 1 ? " and " : ", ") : ""}<a href={"/discovery/categories/" + category.slug}>{category.name.toLowerCase()} servers</a></span>)}</>}.</p>
          </section>
          <p className={styles.notice}><strong>Review scope:</strong> Discovery approval checks listing eligibility and presentation. It does not guarantee that every message, member or external destination in a community is safe or suitable. Membership totals are not unique people across Stoat.</p>
        </article>
        <aside className={styles.sidePanel}>
          <h2>Visit this community on Stoat</h2>
          <p>Read the server&apos;s own rules and use your judgement before joining. The invite is supplied by the listing owner.</p>
          <a className={styles.joinButton} href={server.invite_url} target="_blank" rel="ugc nofollow noopener noreferrer">Join on Stoat <span aria-hidden="true">↗</span></a>
          <dl>
            {approved && <div><dt>Listed</dt><dd>{approved}</dd></div>}
            {updated && <div><dt>Listing updated</dt><dd>{updated}</dd></div>}
            {server.global_rank && <div><dt>Activity rank</dt><dd>#{server.global_rank}</dd></div>}
            {categories.length > 0 && <div><dt>Categories</dt><dd>{categories.map((category, index) => <span key={category.slug}>{index ? ", " : ""}<a href={"/discovery/categories/" + category.slug}>{category.name}</a></span>)}</dd></div>}
          </dl>
          <p className={styles.shareLink}>Share this server: {shareUrl}</p>
        </aside>
      </div>
      {similar.length > 0 && <section className={styles.section} aria-labelledby="similar-servers">
        <SectionHeading eyebrow="Similar communities" title={`Servers like ${server.server_name}`} action={{ href: "/discovery", label: "Explore Discovery" }} />
        <RankedList servers={similar} numbered={false} />
      </section>}
      <AdvertiseBand compact />
      <div className={styles.spacer} />
      <PublicFooter />
    </main>
  );
}
