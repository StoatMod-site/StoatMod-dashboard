"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Public links use browser navigation because the production client router fails. */

import { pluralize } from "./lib/plural";
import { useMemo, useState } from "react";
import { PublicFooter } from "./PublicFooter";
import { SiteNav } from "./SiteNav";
import { discoveryServerSlug, slugify } from "./lib/public-slugs";
import type { DiscoveryServer } from "./lib/public-types";
import { PublicPageHeading, PublicSummary } from "./PublicPageHeading";
import { ServerArtwork } from "./ServerArtwork";
import styles from "./DiscoveryPage.module.css";

type FeedKind = "popular" | "bumped" | "newest" | "search";

function listingTimestamp(value: string | null) {
  const timestamp = value ? Date.parse(value) : NaN;
  return Number.isFinite(timestamp) ? timestamp : 0;
}

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

function listingDate(prefix: string, value: string | null) {
  if (!value) return prefix + " date unavailable";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return prefix + " date unavailable";
  return prefix + " " + new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(parsed);
}

export function DiscoveryPage({ initialServers, dataAvailable = true }: { initialServers: DiscoveryServer[]; dataAvailable?: boolean }) {
  const servers = initialServers;
  const [query, setQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const tagOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const server of servers) {
      for (const tag of server.tags) counts.set(tag, (counts.get(tag) || 0) + 1);
    }
    return [...counts]
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([tag, count]) => ({ tag, count }));
  }, [servers]);
  const tokens = useMemo(
    () => query.trim().toLowerCase().split(/\s+/).filter(Boolean),
    [query],
  );
  const searching = tokens.length > 0 || Boolean(selectedTag);
  const filtered = useMemo(() => servers
    .map((server) => ({ server, score: searchScore(server, tokens) }))
    .filter(({ server, score }) => score >= 0 && (
      !selectedTag || server.tags.some((tag) => tag.toLowerCase() === selectedTag.toLowerCase())
    ))
    .sort((a, b) => (
      b.score - a.score
      || (a.server.global_rank ?? Number.MAX_SAFE_INTEGER) - (b.server.global_rank ?? Number.MAX_SAFE_INTEGER)
      || b.server.member_count - a.server.member_count
    ))
    .map(({ server }) => server), [servers, tokens, selectedTag]);
  const { popular, bumped, newest, remaining } = useMemo(() => {
    // Each feed ranks the whole directory. A popular server can also be newly
    // approved or recently bumped, especially in a small directory.
    const popularServers = [...servers]
      .sort((a, b) => (
        (a.global_rank ?? Number.MAX_SAFE_INTEGER) - (b.global_rank ?? Number.MAX_SAFE_INTEGER)
        || b.daily_messages - a.daily_messages
        || b.member_count - a.member_count
      ))
      .slice(0, 8);
    const bumpedServers = [...servers]
      .filter((server) => listingTimestamp(server.last_bumped_at) > 0)
      .sort((a, b) => (
        listingTimestamp(b.last_bumped_at) - listingTimestamp(a.last_bumped_at)
        || a.server_id.localeCompare(b.server_id)
      ))
      .slice(0, 8);

    const newestServers = [...servers]
      .sort((a, b) => (
        listingTimestamp(b.approved_at) - listingTimestamp(a.approved_at)
        || a.server_id.localeCompare(b.server_id)
      ))
      .slice(0, 8);
    const shown = new Set([...popularServers, ...bumpedServers, ...newestServers].map((server) => server.server_id));
    return { popular: popularServers, bumped: bumpedServers, newest: newestServers, remaining: servers.filter((server) => !shown.has(server.server_id)) };
  }, [servers]);

  function clearSearch() {
    setQuery("");
    setSelectedTag("");
  }

  return (
    <main className={styles.page}>
      <SiteNav active="discovery" />
      <PublicPageHeading eyebrow="Discovery" title="Find your community." description="Discover Stoat servers by name, topic, and public activity." action={{href:"#advertise-your-server",label:"List your server"}} />
      <PublicSummary title={dataAvailable ? `${servers.length} communities to explore.` : "Directory temporarily unavailable."} description={dataAvailable ? "Read community descriptions, compare activity, and open a direct Stoat invite. Every visible listing has passed Discovery review." : "The upstream directory could not be reached. Existing listings have not been removed. Try again shortly."} facts={["Reviewed listings",`${tagOptions.length} topics`,"Direct Stoat invites"]} action={{href:"#server-directory",label:"Browse servers"}} icon={<span>↗</span>} />
      <section className={styles.listingRequirement} id="listing-requirements" aria-labelledby="listing-requirement-title">
        <div><span>Required to list</span><strong aria-hidden="true">BOT + PERMISSIONS</strong></div>
        <div><h2 id="listing-requirement-title">Stoatmod must be installed and eligible</h2><p>Listings require Stoatmod, every audited permission, a server icon and public statistics. Approval is a directory review, not a safety endorsement of every community or message.</p></div>
        <a href="/docs/discovery">Read the listing rules <span>→</span></a>
      </section>
      <section className={styles.finder} id="server-directory">
        <div><p className="eyebrow">Directory search</p><h2>Browse the Stoat server list</h2></div>
        <label><span>Search names, topics and tags</span><div className={styles.searchBox}><span aria-hidden="true">⌕</span><input type="search" aria-controls="discovery-results" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search gaming, art, technology…" />{(query || selectedTag) && <button type="button" onClick={clearSearch}>Clear</button>}</div></label>
      </section>
      <section className={styles.directoryShell}>
        <aside className={styles.sidebar}>
          <div><strong>Popular tags</strong><span>{tagOptions.length} topics</span></div>
          <button type="button" aria-pressed={!searching} onClick={clearSearch}><span>All servers</span><b>{servers.length}</b></button>
          {tagOptions.slice(0, 14).map(({ tag, count }) => <button type="button" aria-pressed={selectedTag === tag} key={tag} onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}><span>#{tag}</span><b>{count}</b></button>)}
          {!tagOptions.length && <p>Topics will appear when reviewed listings are available.</p>}
          <div className={styles.sidebarCta}><span>Own a Stoat server?</span><strong>Submit a reviewed listing.</strong><a href="#advertise-your-server">View the process <b>→</b></a></div>
        </aside>
        <div className={styles.results} id="discovery-results">
          <p className={styles.resultCount} role="status">{searching ? pluralize(filtered.length, "matching server", "matching servers") : pluralize(servers.length, "reviewed server", "reviewed servers")}</p>
          {searching ? (
            <DiscoverySection
              title={selectedTag ? "Servers tagged #" + selectedTag : "Search results"}
              eyebrow={pluralize(filtered.length, "matching server", "matching servers")}
              description="Results match every search term and the selected tag."
              servers={filtered}
              kind="search"
              empty="No reviewed listing matches every word and tag in that search."
            />
          ) : (
            <>
              <nav className={styles.feedNav} aria-label="Discovery lists"><a href="#popular">Popular</a><a href="#recently-bumped">Recently bumped</a><a href="#newest">Newest</a></nav>
              <DiscoverySection id="popular" title="Popular Stoat servers" eyebrow="Directory rankings" description="Ordered by the public activity rank supplied by Stoatmod, then recent messages and member count." servers={popular} kind="popular" />
              <DiscoverySection id="recently-bumped" title="Recently bumped" eyebrow="Recently promoted" description="Listings recently promoted by their administrators through Discovery’s two-hour bump feature." servers={bumped} kind="bumped" empty="No reviewed listing has been bumped in this snapshot." />
              <DiscoverySection id="newest" title="Newest reviewed listings" eyebrow="New to Discovery" description="The latest communities approved for the directory." servers={newest} kind="newest" />
              {remaining.length > 0 && <DiscoverySection id="more-servers" title="More Stoat servers" eyebrow="Explore the directory" description="More reviewed communities from the Stoat server list." servers={remaining} kind="search" />}
              {!servers.length && <p className={styles.emptyState}>{dataAvailable ? "No reviewed listings are available yet." : "The reviewed directory is temporarily unavailable. Existing listings have not been removed."}</p>}
            </>
          )}
        </div>
      </section>
      <section className={styles.seoCopy}>
        <div><p className="eyebrow">What the directory shows</p><h2>Context before you join</h2></div>
        <div><p>Each listing includes the community’s own description, tags and invite alongside a current server snapshot. Member totals are server memberships, not unique people. “Messages today” reflects the current UTC day.</p><p>Discovery approval checks listing eligibility and presentation. It does not guarantee that a community is appropriate for every visitor, so review its description and rules before joining.</p></div>
      </section>
      <section className={styles.advertise} id="advertise-your-server">
        <header>
          <div><p className="eyebrow">Community submissions</p><h2>List your Stoat server</h2></div>
          <div><p>Prepare a clear description, a valid Stoat invite and up to five accurate tags. Stoatmod must already be installed with the required permissions and public statistics enabled.</p><a className={styles.primaryButton} href="/login">Open server dashboard <span>→</span></a></div>
        </header>
        <div className={styles.advertiseSteps}>
          <article><span>01</span><div><h3>Meet the requirements</h3><p>Install Stoatmod, grant the 12 audited permissions, add a server icon and enable public statistics.</p></div></article>
          <article><span>02</span><div><h3>Submit accurate details</h3><p>Add a 20–500 character description, a valid Stoat invite and up to five relevant tags.</p></div></article>
          <article><span>03</span><div><h3>Pass review</h3><p>Approved eligible listings can be bumped every two hours. Material edits return to review before publication.</p></div></article>
        </div>
        <p className={styles.advertiseNote}>Losing eligibility removes a listing from public results. A denied application has a seven-day cooldown before it can be resubmitted.</p>
      </section>
      <section className={styles.faq} id="discovery-faq">
        <header><p className="eyebrow">Discovery FAQ</p><h2>Before finding or listing a server</h2></header>
        <div>
          <details><summary>How do I find a Stoat server?<span>＋</span></summary><p>Search the server list by its name or choose a topic. Open a listing to read its description, see public activity and find its Stoat invite.</p></details>
          <details><summary>How do I join a Stoat server?<span>＋</span></summary><p>Choose a community and open its invite link. Sign in to Stoat or create an account if prompted, then follow the invite to join and read the server’s rules.</p></details>
          <details><summary>What does Discovery approval mean?<span>＋</span></summary><p>It means the listing passed Stoatmod’s directory review and met its eligibility requirements. It is not a blanket endorsement of a community or all content shared there.</p></details>
          <details><summary>What is required to submit a listing?<span>＋</span></summary><p>Stoatmod must be installed with all 12 audited permissions. The server also needs an icon, public statistics, an eligible Stoat invite, a compliant description and no more than five tags.</p></details>
          <details><summary>Is listing a server free?<span>＋</span></summary><p>Yes. Applying for a Discovery listing and using the two-hour bump feature is free.</p></details>
          <details><summary>Why can a listing disappear?<span>＋</span></summary><p>A listing is hidden if it loses eligibility, is revoked or is awaiting review after a material edit.</p></details>
        </div>
      </section>
      <PublicFooter />
    </main>
  );
}

function DiscoverySection({
  id,
  title,
  eyebrow,
  description,
  servers,
  kind,
  empty,
}: {
  id?: string;
  title: string;
  eyebrow: string;
  description: string;
  servers: DiscoveryServer[];
  kind: FeedKind;
  empty?: string;
}) {
  return (
    <section className={styles.listSection} id={id}>
      <header><div><p className="eyebrow">{eyebrow}</p><h2>{title}</h2></div><p>{description}</p></header>
      {servers.length ? <div className={styles.grid}>{servers.map((server, index) => <DiscoveryCard server={server} index={index} kind={kind} key={server.server_id} />)}</div> : <p className={styles.sectionEmpty}>{empty || "No servers are available in this list yet."}</p>}
    </section>
  );
}

function DiscoveryCard({
  server,
  index,
  kind,
}: {
  server: DiscoveryServer;
  index: number;
  kind: FeedKind;
}) {
  const freshness = kind === "bumped"
    ? listingDate("Bumped", server.last_bumped_at)
    : kind === "newest"
      ? listingDate("Approved", server.approved_at)
      : server.global_rank
        ? "#" + server.global_rank + " in public activity"
        : "Public activity available";
  const detailPath = "/discovery/servers/" + discoveryServerSlug(server);
  return (
    <article className={styles.listing}>
      <ServerArtwork serverId={server.server_id} name={server.server_name} src={server.server_banner_url} kind="banner" className={styles.serverBanner} href={detailPath} />
      <ServerArtwork serverId={server.server_id} name={server.server_name} src={server.server_icon_url} kind="icon" className={styles.serverIcon} />
      <div className={styles.listingBody}>
        <header><div><span className={styles.verified}>✓ Reviewed listing</span><h3><a href={detailPath}>{server.server_name}</a></h3></div><span className={styles.cardNumber}>{String(index + 1).padStart(2, "0")}</span></header>
        <div className={styles.cardTags}>{server.tags.map((tag) => <a href={"/discovery/tags/" + slugify(tag)} key={tag}>#{tag}</a>)}</div>
        <p className={styles.listingDescription}>{server.description}</p>
        <footer><span>{freshness}</span><div className={styles.inlineStats}><span><b>{server.member_count.toLocaleString("en-GB")}</b> memberships</span><span><b>{server.daily_messages.toLocaleString("en-GB")}</b> messages today</span></div></footer>
      </div>
      <div className={styles.cardActions}><a className={styles.details} href={detailPath}>Details</a><a className={styles.join} href={server.invite_url} target="_blank" rel="ugc nofollow noopener noreferrer"><span>Join</span><b>↗</b></a></div>
    </article>
  );
}
