"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Public links use browser navigation because the production client router fails. */

import { useMemo, useState } from "react";
import { PublicFooter } from "./PublicFooter";
import { ServerArtwork } from "./ServerArtwork";
import { SiteNav } from "./SiteNav";
import { AdvertiseBand, CategoryTiles, DiscoveryNav, Faq, SectionHeading, ServerCard, ServerGrid, serverPath } from "./discovery/DiscoveryUI";
import { compactNumber, directoryStats, rankActive, rankBumped, rankNewest, rankPopular, topTags } from "./lib/discovery-catalog";
import { discoveryFaq } from "./lib/discovery-faq";
import { pluralize } from "./lib/plural";
import type { DiscoveryServer } from "./lib/public-types";
import styles from "./discovery/Discovery.module.css";

type Sort = "popular" | "active" | "bumped" | "newest";
const SORTS: { key: Sort; label: string }[] = [
  { key: "popular", label: "Popular" },
  { key: "active", label: "Most active today" },
  { key: "bumped", label: "Recently bumped" },
  { key: "newest", label: "Newest" },
];
const PAGE_SIZE = 60;

function searchScore(server: DiscoveryServer, tokens: string[]) {
  const name = server.server_name.toLowerCase();
  const tags = server.tags.map((tag) => tag.toLowerCase());
  const searchable = [name, server.description, server.information, ...tags].join(" ").toLowerCase();
  if (!tokens.every((token) => searchable.includes(token))) return -1;
  return tokens.reduce((score, token) => (
    score
    + (name === token ? 100 : name.startsWith(token) ? 45 : name.includes(token) ? 25 : 0)
    + (tags.includes(token) ? 50 : tags.some((tag) => tag.includes(token)) ? 30 : 0)
    + (server.description.toLowerCase().includes(token) ? 10 : 0)
  ), 0);
}

function sorted(servers: DiscoveryServer[], sort: Sort) {
  if (sort === "active") return rankActive(servers);
  if (sort === "bumped") return rankBumped(servers);
  if (sort === "newest") return rankNewest(servers);
  return rankPopular(servers);
}

export function DiscoveryPage({ initialServers, featuredIds = [], dataAvailable = true }: { initialServers: DiscoveryServer[]; featuredIds?: string[]; dataAvailable?: boolean }) {
  const servers = initialServers;
  const [query, setQuery] = useState("");
  const [tag, setTag] = useState("");
  const [sort, setSort] = useState<Sort>("popular");
  const [visible, setVisible] = useState(PAGE_SIZE);
  const stats = useMemo(() => directoryStats(servers), [servers]);
  const tags = useMemo(() => topTags(servers, 16), [servers]);
  const featured = useMemo(() => featuredIds.map((id) => servers.find((server) => server.server_id === id)).filter((server): server is DiscoveryServer => Boolean(server)), [featuredIds, servers]);
  const collage = useMemo(() => rankPopular(servers).slice(0, 6), [servers]);
  const tokens = useMemo(() => query.trim().toLowerCase().split(/\s+/).filter(Boolean), [query]);
  const searching = tokens.length > 0 || Boolean(tag);
  const results = useMemo(() => {
    const matching = servers
      .map((server) => ({ server, score: searchScore(server, tokens) }))
      .filter(({ server, score }) => score >= 0 && (!tag || server.tags.some((item) => item.toLowerCase() === tag.toLowerCase())));
    if (tokens.length) return matching.sort((a, b) => b.score - a.score).map(({ server }) => server);
    return sorted(matching.map(({ server }) => server), sort);
  }, [servers, tokens, tag, sort]);

  function chooseTag(value: string) {
    setTag((current) => (current === value ? "" : value));
    setVisible(PAGE_SIZE);
    document.getElementById("server-directory")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  function clearFilters() {
    setQuery("");
    setTag("");
    setVisible(PAGE_SIZE);
  }

  return (
    <main className={styles.page}>
      <SiteNav active="discovery" />
      <section className={styles.hero} aria-labelledby="discovery-title">
        <div className={styles.glow} aria-hidden="true" />
        <div className={styles.heroInner}>
          <div>
            <p className={styles.kicker}><span aria-hidden="true" />Stoat Discovery · {dataAvailable ? pluralize(stats.servers, "reviewed server", "reviewed servers") : "Directory temporarily unavailable"}</p>
            <h1 id="discovery-title">Discover the best <span className={styles.heroAccent}>Stoat servers</span></h1>
            <p className={styles.lede}>Find communities for gaming, anime, art, music and more. Every listing is reviewed, shows its live activity and opens with a direct Stoat invite.</p>
            <form className={styles.heroSearch} role="search" onSubmit={(event) => { event.preventDefault(); document.getElementById("server-directory")?.scrollIntoView({ behavior: "smooth", block: "start" }); }}>
              <span aria-hidden="true">⌕</span>
              <input type="search" aria-label="Search Stoat servers" aria-controls="discovery-results" value={query} onChange={(event) => { setQuery(event.target.value); setVisible(PAGE_SIZE); }} placeholder="Search Stoat servers by name, topic or tag…" />
              <button type="submit">Search</button>
            </form>
            {tags.length > 0 && <div className={styles.trending}><span>Trending:</span>{tags.slice(0, 6).map(({ tag: item }) => <button type="button" key={item} onClick={() => chooseTag(item)} data-no-translate>#{item}</button>)}</div>}
            {dataAvailable
              ? <dl className={styles.heroStats}><div><dt>servers listed</dt><dd>{compactNumber(stats.servers)}</dd></div><div><dt>community members</dt><dd>{compactNumber(stats.members)}</dd></div><div><dt>messages today</dt><dd>{compactNumber(stats.messagesToday)}</dd></div><div><dt>topics</dt><dd>{compactNumber(stats.topics)}</dd></div></dl>
              : <p className={styles.lede}>The directory could not be reached. Existing listings have not been removed. Try again shortly.</p>}
          </div>
          {collage.length > 0 && <div className={styles.collage} aria-hidden="true">
            {collage.map((server) => <a className={styles.collageCard} href={serverPath(server)} key={server.server_id} tabIndex={-1}><ServerArtwork serverId={server.server_id} name={server.server_name} src={server.server_icon_url} kind="icon" className={styles.collageIcon} /><span><strong data-no-translate>{server.server_name}</strong><small>{compactNumber(server.member_count)} members</small></span></a>)}
          </div>}
        </div>
      </section>
      <DiscoveryNav active="explore" />

      {featured.length > 0 && <section className={styles.section} id="featured" aria-label="Featured Stoat servers">
        <SectionHeading eyebrow="Featured" title="Featured Stoat servers" description="Recently bumped and most active communities in the directory." action={{ href: "/discovery/top", label: "See the top servers" }} />
        <div className={styles.featureGrid}>{featured.map((server) => <ServerCard server={server} feature key={server.server_id} />)}</div>
      </section>}

      {servers.length > 0 && <section className={styles.section} aria-labelledby="categories-title">
        <SectionHeading eyebrow="Browse by topic" title="Explore categories" action={{ href: "/discovery/categories", label: "All categories" }} />
        <CategoryTiles servers={servers} />
      </section>}

      <section className={styles.section} id="server-directory" aria-labelledby="directory-title">
        <SectionHeading eyebrow="Server directory" title="Browse the Stoat server list" description="Search names, topics and tags, or sort the whole directory." />
        <div className={styles.toolbar}>
          <div className={styles.toolbarRow}>
            <label className={styles.searchField}><span aria-hidden="true">⌕</span><input type="search" aria-label="Search names, topics and tags" aria-controls="discovery-results" value={query} onChange={(event) => { setQuery(event.target.value); setVisible(PAGE_SIZE); }} placeholder="Search names, topics and tags" />{(query || tag) && <button type="button" onClick={clearFilters}>Clear</button>}</label>
            <div className={styles.sortTabs} role="group" aria-label="Sort servers">{SORTS.map((item) => <button type="button" key={item.key} aria-pressed={sort === item.key && !tokens.length} disabled={tokens.length > 0} onClick={() => { setSort(item.key); setVisible(PAGE_SIZE); }}>{item.label}</button>)}</div>
          </div>
          {tags.length > 0 && <div className={styles.chips} role="group" aria-label="Filter by tag"><button type="button" aria-pressed={!tag} onClick={() => setTag("")}>All</button>{tags.map(({ tag: item, count }) => <button type="button" key={item} aria-pressed={tag === item} onClick={() => chooseTag(item)}><span data-no-translate>#{item}</span> · {count}</button>)}</div>}
        </div>
        <div id="discovery-results">
          <p className={styles.resultMeta} role="status"><span>{searching ? pluralize(results.length, "matching server", "matching servers") : pluralize(servers.length, "reviewed server", "reviewed servers")}</span>{searching && <button type="button" className={styles.linkButton} onClick={clearFilters}>Show all servers</button>}</p>
          <ServerGrid servers={results.slice(0, visible)} empty={dataAvailable ? (searching ? "No reviewed listing matches every word and tag in that search." : "No reviewed listings are available yet.") : "The reviewed directory is temporarily unavailable. Existing listings have not been removed."} />
          {results.length > visible && <button type="button" className={styles.loadMore} onClick={() => setVisible((value) => value + PAGE_SIZE)}>Show more servers</button>}
        </div>
      </section>

      <AdvertiseBand />

      <section className={styles.section} aria-labelledby="about-discovery">
        <div className={styles.copy}>
          <div><p className={styles.eyebrow}>About Stoat Discovery</p><h2 id="about-discovery">A Stoat server list you can trust</h2></div>
          <div>
            <p>Stoatmod Discovery is a free directory of Stoat servers. Server owners submit their community with a description, tags and an invite, and every listing is reviewed before it appears. Each server gets its own page with its live member count and today&apos;s activity, so you can see a community is active before you join.</p>
            <p>Browse <a href="/discovery/top">the top Stoat servers</a>, see <a href="/discovery/new">new Stoat servers</a> or explore <a href="/discovery/categories">categories</a>. Member totals are server memberships, not unique people, and approval is a directory review, not a safety endorsement of every community or message.</p>
            <p>Run a Stoat community? <a href="/discovery/advertise">Advertise your Stoat server for free</a>: listings require Stoatmod with its permissions, a server icon and public statistics, and material edits return to review before publication.</p>
          </div>
        </div>
      </section>
      <Faq items={discoveryFaq} title="Stoat Discovery questions" eyebrow="Discovery FAQ" />
      <div className={styles.spacer} />
      <PublicFooter />
    </main>
  );
}
