import type { ReactNode } from "react";
import { ServerArtwork } from "../ServerArtwork";
import { compactNumber, countLabel, discoveryCategories, serversInCategory } from "../lib/discovery-catalog";
import { discoveryServerSlug, slugify } from "../lib/public-slugs";
import type { DiscoveryServer } from "../lib/public-types";
import styles from "./Discovery.module.css";

export function serverPath(server: Pick<DiscoveryServer, "server_id" | "server_name">) {
  return "/discovery/servers/" + discoveryServerSlug(server);
}

export function ServerCard({ server, rank, note, feature = false }: { server: DiscoveryServer; rank?: number; note?: string; feature?: boolean }) {
  const path = serverPath(server);
  return (
    <article className={`${styles.card} ${feature ? styles.cardFeature : ""}`}>
      <div className={styles.cardBanner}>
        <ServerArtwork serverId={server.server_id} name={server.server_name} src={server.server_banner_url} kind="banner" className={styles.cardBannerImage} href={path} />
        {rank !== undefined && <span className={styles.rank}>#{rank}</span>}
      </div>
      <div className={styles.cardBody}>
        <ServerArtwork serverId={server.server_id} name={server.server_name} src={server.server_icon_url} kind="icon" className={styles.cardIcon} />
        <h3><a href={path} data-no-translate>{server.server_name}</a></h3>
        {note && <p className={styles.cardNote}>{note}</p>}
        <p className={styles.cardDescription} data-no-translate>{server.description}</p>
        {server.tags.length > 0 && <div className={styles.tagRow}>{server.tags.slice(0, 4).map((tag) => <a href={"/discovery/tags/" + slugify(tag)} key={tag} data-no-translate>#{tag}</a>)}</div>}
      </div>
      <footer className={styles.cardFooter}>
        <span className={styles.cardStats}><b>{compactNumber(server.member_count)}</b> {countLabel(server.member_count, "member", "members")} <i aria-hidden="true">·</i> <b>{compactNumber(server.daily_messages)}</b> {countLabel(server.daily_messages, "message today", "messages today")}</span>
        <a className={styles.joinButton} href={server.invite_url} target="_blank" rel="ugc nofollow noopener noreferrer" aria-label={`Join ${server.server_name} on Stoat`}>Join <span aria-hidden="true">↗</span></a>
      </footer>
    </article>
  );
}

export function ServerGrid({ servers, ranked = false, empty = "No servers to show yet." }: { servers: DiscoveryServer[]; ranked?: boolean; empty?: string }) {
  if (!servers.length) return <p className={styles.empty}>{empty}</p>;
  return <div className={styles.grid}>{servers.map((server, index) => <ServerCard server={server} rank={ranked ? index + 1 : undefined} key={server.server_id} />)}</div>;
}

const navItems = [
  { key: "explore", href: "/discovery", label: "Explore" },
  { key: "top", href: "/discovery/top", label: "Top servers" },
  { key: "new", href: "/discovery/new", label: "New" },
  { key: "categories", href: "/discovery/categories", label: "Categories" },
  { key: "advertise", href: "/discovery/advertise", label: "Advertise your server" },
] as const;

export type DiscoveryNavKey = (typeof navItems)[number]["key"];

export function DiscoveryNav({ active }: { active?: DiscoveryNavKey }) {
  return (
    <nav className={styles.subnav} aria-label="Discovery">
      <div>
        {navItems.map((item) => <a key={item.key} href={item.href} aria-current={active === item.key ? "page" : undefined} className={item.key === "advertise" ? styles.subnavCta : undefined}>{item.label}</a>)}
      </div>
    </nav>
  );
}

export function SubHero({ eyebrow, title, description, children }: { eyebrow: string; title: ReactNode; description: string; children?: ReactNode }) {
  return (
    <header className={styles.subHero}>
      <div className={styles.subHeroInner}>
        <p className={styles.kicker}><span aria-hidden="true" />Stoatmod / {eyebrow}</p>
        <h1>{title}</h1>
        <p className={styles.lede}>{description}</p>
        {children}
      </div>
    </header>
  );
}

export function SectionHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: { href: string; label: string } }) {
  return (
    <header className={styles.sectionHeading}>
      <div>{eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}<h2>{title}</h2>{description && <p>{description}</p>}</div>
      {action && <a href={action.href}>{action.label} <span aria-hidden="true">→</span></a>}
    </header>
  );
}

export function CategoryTiles({ servers, showEmpty = false }: { servers: DiscoveryServer[]; showEmpty?: boolean }) {
  const tiles = discoveryCategories
    .map((category) => ({ category, count: serversInCategory(servers, category).length }))
    .filter(({ count }) => showEmpty || count > 0);
  return (
    <div className={styles.categoryGrid}>
      {tiles.map(({ category, count }, index) => (
        <a href={"/discovery/categories/" + category.slug} key={category.slug} className={styles.categoryTile}>
          <span className={styles.categoryNumber} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
          <strong>{category.name}</strong>
          <small>{count === 1 ? "1 server" : `${count} servers`}</small>
        </a>
      ))}
    </div>
  );
}

export function AdvertiseBand({ compact = false }: { compact?: boolean }) {
  return (
    <section className={`${styles.band} ${compact ? styles.bandCompact : ""}`} aria-labelledby="advertise-band-title">
      <div>
        <p className={styles.kicker}><span aria-hidden="true" />Stoatmod / Free Stoat server advertising</p>
        <h2 id="advertise-band-title">Grow your Stoat server.</h2>
        <p>List your community on Stoatmod Discovery for free. Get your own server page, appear in search and categories, and bump your listing every two hours.</p>
      </div>
      <div className={styles.bandActions}>
        <a className={styles.primaryButton} href="/discovery/advertise">Advertise your server <span aria-hidden="true">→</span></a>
        <a className={styles.ghostButton} href="/login">Open dashboard</a>
      </div>
    </section>
  );
}

export type FaqItem = { question: string; answer: string };

export function Faq({ items, title = "Frequently asked questions", eyebrow = "FAQ" }: { items: FaqItem[]; title?: string; eyebrow?: string }) {
  return (
    <section className={styles.faq} aria-labelledby="discovery-faq-title">
      <header><p className={styles.eyebrow}>{eyebrow}</p><h2 id="discovery-faq-title">{title}</h2></header>
      <div>{items.map((item) => <details key={item.question}><summary>{item.question}<span aria-hidden="true">+</span></summary><p>{item.answer}</p></details>)}</div>
    </section>
  );
}

export function faqSchema(items: FaqItem[]) {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({ "@type": "Question", name: item.question, acceptedAnswer: { "@type": "Answer", text: item.answer } })),
  };
}

export function RankedList({ servers, note, numbered = true }: { servers: DiscoveryServer[]; note?: (server: DiscoveryServer) => string; numbered?: boolean }) {
  if (!servers.length) return <p className={styles.empty}>No reviewed listings are available yet.</p>;
  return (
    <ol className={styles.rankList}>
      {servers.map((server, index) => (
        <li className={styles.rankItem} key={server.server_id}>
          <span className={styles.rankNumber}>{numbered ? String(index + 1).padStart(2, "0") : "→"}</span>
          <ServerArtwork serverId={server.server_id} name={server.server_name} src={server.server_icon_url} kind="icon" className={styles.rankIcon} />
          <div>
            <h3><a href={serverPath(server)} data-no-translate>{server.server_name}</a></h3>
            <p data-no-translate>{server.description}</p>
            <span className={styles.cardStats}><b>{compactNumber(server.member_count)}</b> {countLabel(server.member_count, "member", "members")} <i aria-hidden="true">·</i> <b>{compactNumber(server.daily_messages)}</b> {countLabel(server.daily_messages, "message today", "messages today")}{note ? <> <i aria-hidden="true">·</i> {note(server)}</> : null}</span>
          </div>
          <a className={styles.joinButton} href={server.invite_url} target="_blank" rel="ugc nofollow noopener noreferrer" aria-label={`Join ${server.server_name} on Stoat`}>Join <span aria-hidden="true">↗</span></a>
        </li>
      ))}
    </ol>
  );
}

export function listingDate(value: string | null | undefined) {
  const parsed = value ? new Date(value) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(parsed);
}
