import { notFound, permanentRedirect } from "next/navigation";
import type { AppLocale } from "../../lib/i18n-core";
import { pageLanguage, type PageLanguage } from "./localize";
import { Breadcrumbs } from "../../Breadcrumbs";
import { JsonLd } from "../../JsonLd";
import { PublicFooter } from "../../PublicFooter";
import { SiteNav } from "../../SiteNav";
import { breadcrumbSchema, organizationSchema, websiteSchema } from "../../lib/schema";
import { getRequiredPublicDiscovery } from "../../lib/public-data.server";
import { discoveryServerSlug, findDiscoveryServer } from "../../lib/public-slugs";
import type { DiscoveryServer } from "../../lib/public-types";
import { serverOgImage, serverOgUrl } from "../../lib/discovery-seo";
import { buildMetadata } from "../../lib/seo";
import { absoluteUrl, siteConfig } from "../../lib/site-config";
import { ServerArtwork } from "../../ServerArtwork";
import { categoriesForServer, compactNumber, discoveryLanguages, similarServers, tagHref } from "../../lib/discovery-catalog";
import { listingLanguage } from "../../lib/listing-language";
import { DiscoveryMarkdown } from "../../lib/discovery-markdown";
import { AdvertiseBand, DiscoveryNav, RankedList, SectionHeading, VerifiedBadge, joinHref } from "../DiscoveryUI";
import { ListingViewBeacon, ReportListing } from "../ListingClient";
import styles from "../Discovery.module.css";

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

function profileMetadataDescription(server: DiscoveryServer, language: PageLanguage) {
  // The owner's description stays in its own language; the sentences around it are translated one by one.
  const description = server.description.replace(/\s+/g, " ").trim();
  let text = `${language.text(`Join ${server.server_name} on Stoat.`)} ${description}`;
  // Short owner descriptions leave room for facts that help searchers choose.
  if (text.length < 120) {
    const category = categoriesForServer(server)[0];
    const members = server.member_count.toLocaleString("en-GB");
    const facts = [
      server.member_count > 0 ? language.text(server.member_count === 1 ? "1 member" : `${members} members`) : "",
      category ? (language.locale === "en" ? `${category.name.toLowerCase()} community` : language.text(category.name)) : "",
    ].filter(Boolean).join(", ");
    text = `${text.replace(/[.!?…]*$/, ".")} ${facts ? facts.charAt(0).toUpperCase() + facts.slice(1) + ". " : ""}${language.text("Free direct invite on Stoatmod Discovery.")}`;
  }
  return metadataText(text, 160);
}

/** "Name – Gaming Stoat Server | Stoatmod" when it fits in a search result title, otherwise without the category. */
function profileTitle(server: DiscoveryServer, language: PageLanguage) {
  const category = categoriesForServer(server)[0];
  const withCategory = `${server.server_name} – ${language.text(`${category?.name ?? ""} Stoat Server`)} | Stoatmod`;
  return category && withCategory.length <= 60 ? withCategory : `${server.server_name} – ${language.text("Stoat Server")} | Stoatmod`;
}

export async function serverMetadata(locale: AppLocale, { params }: { params: Promise<{ slug: string }> }) {
  const language = pageLanguage(locale);
  const { slug } = await params;
  const servers = await getRequiredPublicDiscovery();
  const server = findDiscoveryServer(servers, slug);
  if (!server) {
    return buildMetadata({
      title: language.phrase("Server listing not found | Stoatmod"),
      description: language.phrase("This Stoatmod Discovery listing is not available."),
      path: "/discovery",
      index: false,
      locale,
    });
  }
  const canonical = "/discovery/servers/" + discoveryServerSlug(server);
  const description = profileMetadataDescription(server, language);
  return buildMetadata({
    title: profileTitle(server, language),
    description,
    path: canonical,
    locale,
    ...serverOgImage(server),
  });
}

export async function ServerView(locale: AppLocale, { params }: { params: Promise<{ slug: string }> }) {
  const language = pageLanguage(locale);
  const { slug } = await params;
  const servers = await getRequiredPublicDiscovery();
  const server = findDiscoveryServer(servers, slug);
  if (!server) notFound();
  const canonicalSlug = discoveryServerSlug(server);
  if (slug !== canonicalSlug) permanentRedirect(language.path("/discovery/servers/" + canonicalSlug));
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
  const shareUrl = server.vanity ? `${siteConfig.origin.replace(/^https:\/\//, "")}/${server.vanity}` : language.url(canonicalPath);
  const languageName = server.language ? discoveryLanguages[server.language] : "";
  // The owner's text keeps its own language even though the page around it is English.
  const textLanguage = listingLanguage(server);
  const textLang = textLanguage && textLanguage !== "en" ? textLanguage : undefined;
  const linkLabel = (url: string) => new URL(url).hostname.replace(/^www\./, "");
  return language.render(
    <main className={styles.page} lang={language.lang}>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          organizationSchema(),
          websiteSchema(),
          {
            "@type": "WebPage",
            "@id": language.url(canonicalPath) + "#page",
            url: language.url(canonicalPath),
            name: server.server_name + " – " + language.text("Stoat server listing"),
            description: server.description,
            image: [serverOgUrl(server), ...(server.server_banner_url ? [server.server_banner_url] : [])],
            isPartOf: { "@id": siteConfig.origin + "/#website" },
            ...(locale !== "en" ? { inLanguage: locale } : textLanguage ? { inLanguage: textLanguage } : {}),
            mainEntity: {
              "@type": "Organization",
              "@id": language.url(canonicalPath) + "#community",
              name: server.server_name,
              description: server.description,
              url: language.url(canonicalPath),
              ...(server.server_icon_url ? { logo: server.server_icon_url } : {}),
              ...(server.tags.length ? { keywords: server.tags.join(", ") } : {}),
              ...(server.links.length ? { sameAs: server.links } : {}),
              ...(server.verified ? { award: server.verified.label + " on Stoatmod Discovery" } : {}),
            },
          },
          breadcrumbSchema(language.breadcrumbs(breadcrumbs)),
        ],
      }} />
      <SiteNav active="discovery" />
      <ListingViewBeacon serverId={server.server_id} />
      <header className={styles.profileHero}>
        <div className={styles.profileBanner}><ServerArtwork serverId={server.server_id} name={server.server_name} src={server.server_banner_url} kind="banner" priority original /></div>
        <div className={styles.profileShade} aria-hidden="true" />
        <div className={styles.profileInner}>
          <ServerArtwork serverId={server.server_id} name={server.server_name} src={server.server_icon_url} kind="icon" className={styles.profileIcon} />
          <div>
            <p className={styles.kicker}><span aria-hidden="true" />{server.verified ? server.verified.label : "Reviewed Stoat server"}</p>
            <h1><span data-no-translate>{server.server_name}</span><VerifiedBadge verified={server.verified} large /></h1>
            <p className={styles.profileMeta}>{server.member_count.toLocaleString("en-GB")} members · {server.daily_messages.toLocaleString("en-GB")} messages today{server.global_rank ? ` · #${server.global_rank} in public activity` : ""}</p>
            {server.tags.length > 0 && <div className={styles.tagRow}>{server.tags.map((tag) => <a href={tagHref(tag)} key={tag} data-no-translate>#{tag}</a>)}</div>}
          </div>
          <div className={styles.profileJoin}>
            <a className={styles.primaryButton} href={joinHref(server)} target="_blank" rel="ugc nofollow noopener noreferrer">Join {server.server_name} <span aria-hidden="true">↗</span></a>
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
            <p data-no-translate lang={textLang}>{server.description}</p>
            {extraInformation && <div data-no-translate lang={textLang}><DiscoveryMarkdown source={extraInformation} className={styles.markdown} /></div>}
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
          <a className={styles.joinButton} href={joinHref(server)} target="_blank" rel="ugc nofollow noopener noreferrer">Join on Stoat <span aria-hidden="true">↗</span></a>
          <dl>
            {server.verified && <div><dt>Verified</dt><dd>{server.verified.label}</dd></div>}
            {languageName && <div><dt>Language</dt><dd>{languageName}</dd></div>}
            {approved && <div><dt>Listed</dt><dd>{approved}</dd></div>}
            {updated && <div><dt>Listing updated</dt><dd>{updated}</dd></div>}
            {server.global_rank && <div><dt>Activity rank</dt><dd>#{server.global_rank}</dd></div>}
            {categories.length > 0 && <div><dt>Categories</dt><dd>{categories.map((category, index) => <span key={category.slug}>{index ? ", " : ""}<a href={"/discovery/categories/" + category.slug}>{category.name}</a></span>)}</dd></div>}
          </dl>
          {server.links.length > 0 && <>
            <h2>Links</h2>
            <ul className={styles.linkList}>{server.links.map((link) => <li key={link}><a href={link} target="_blank" rel="ugc nofollow noopener noreferrer" data-no-translate>{linkLabel(link)} <span aria-hidden="true">↗</span></a></li>)}</ul>
          </>}
          <p className={styles.shareLink}>Share this server: <span data-no-translate>{shareUrl}</span></p>
          <ReportListing serverId={server.server_id} serverName={server.server_name} />
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
