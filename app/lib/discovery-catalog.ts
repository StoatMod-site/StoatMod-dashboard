import { slugify } from "./public-slugs";
import type { DiscoveryServer } from "./public-types";

// Curated Discovery categories. A server belongs to a category when its owner chose it, when one of its tags matches,
// or when its name or description contains one of the category's words. Keep the slugs in sync with
// CATEGORY_SLUGS in website/discovery_extras.py (a test checks this). Category pages are indexed once they hold enough listings.
export type DiscoveryCategory = {
  slug: string;
  name: string;
  emoji: string;
  title: string;
  description: string;
  intro: string;
  tags: string[];
  words: string[];
};

export const CATEGORY_INDEX_MINIMUM = 2;

export const discoveryCategories: DiscoveryCategory[] = [
  {
    slug: "gaming", name: "Gaming", emoji: "🎮",
    title: "Gaming Stoat Servers",
    description: "Find gaming communities on Stoat: squads, game nights, Minecraft, trading card games and more.",
    intro: "Gaming servers on Stoat bring players together for game nights, squads, trading and voice chat. Browse reviewed gaming communities below and open an invite to join.",
    tags: ["gaming", "games", "game", "gamer", "gamers", "jogos", "juegos", "minecraft", "roblox", "tcg", "fortnite", "valorant", "archipelago", "esports"],
    words: ["gaming", "games", "gamers", "minecraft", "roblox", "jogos", "esports"],
  },
  {
    slug: "anime", name: "Anime & Manga", emoji: "🌸",
    title: "Anime Stoat Servers",
    description: "Join anime and manga communities on Stoat to talk about series, share art and meet other fans.",
    intro: "Anime and manga servers on Stoat are where fans discuss new seasons, share art and recommend series. Explore reviewed anime communities below.",
    tags: ["anime", "manga", "otaku", "weeb", "cosplay"],
    words: ["anime", "manga", "otaku"],
  },
  {
    slug: "art-and-creative", name: "Art & Creative", emoji: "🎨",
    title: "Art & Creative Stoat Servers",
    description: "Discover art, design, writing and animation communities on Stoat to share your work and get feedback.",
    intro: "Creative servers on Stoat are places to share drawings, animation, design and writing, take part in challenges and get friendly feedback.",
    tags: ["art", "artist", "artists", "drawing", "creative", "animation", "design", "novel", "writing", "photography"],
    words: ["art", "artists", "drawing", "creative", "animation", "illustration"],
  },
  {
    slug: "music", name: "Music", emoji: "🎧",
    title: "Music Stoat Servers",
    description: "Find music communities on Stoat for producers, musicians and listeners.",
    intro: "Music servers on Stoat connect listeners, musicians and producers to share tracks, swap recommendations and listen together.",
    tags: ["music", "musica", "música", "producer", "phonk", "rap", "kpop", "k-pop"],
    words: ["music", "musica", "producers", "playlist"],
  },
  {
    slug: "roleplay", name: "Roleplay & Fandom", emoji: "🐉",
    title: "Roleplay Stoat Servers",
    description: "Explore roleplay, fandom and storytelling communities on Stoat.",
    intro: "Roleplay and fandom servers on Stoat host shared stories, characters and lore. Browse reviewed roleplay communities and find your next campaign.",
    tags: ["roleplay", "rp", "fandom", "book series", "franchise", "lore", "dnd", "rpg"],
    words: ["roleplay", "fandom", "rpg", "lore"],
  },
  {
    slug: "social", name: "Chill & Social", emoji: "💬",
    title: "Chill & Social Stoat Servers",
    description: "Hang out in friendly Stoat servers for chatting, memes, voice calls and making friends.",
    intro: "Social servers on Stoat are friendly places to chat, share memes, hop into voice and make new friends. Find a relaxed community below.",
    tags: ["chill", "chat", "chatting", "talk", "casual", "fun", "funny", "goofy", "community", "hangout", "social", "friends", "vc", "conversas", "conversar"],
    words: ["hangout", "chill", "chatting", "make friends"],
  },
  {
    slug: "lgbtq", name: "LGBTQ+", emoji: "🏳️‍🌈",
    title: "LGBTQ+ Stoat Servers",
    description: "Find welcoming LGBTQ+ communities on Stoat.",
    intro: "LGBTQ+ servers on Stoat offer welcoming spaces to chat, find support and meet people. Read each community's rules before joining.",
    tags: ["lgbtq", "lgbt", "lgbtq+", "queer", "pride", "trans"],
    words: ["lgbtq", "lgbt", "queer"],
  },
  {
    slug: "brasil", name: "Brasil & Português", emoji: "🌎",
    title: "Brazilian Stoat Servers – Servidores Brasileiros",
    description: "Find Brazilian and Portuguese-speaking Stoat servers: servidores brasileiros para conversar e jogar.",
    intro: "Brazilian and Portuguese-speaking communities on Stoat. Encontre servidores brasileiros para conversar, jogar e fazer amigos.",
    tags: ["brasil", "brazil", "br", "portugues", "português", "pt-br"],
    words: ["brasil", "brazil", "brasileiro", "brasileiros"],
  },
  {
    slug: "tech", name: "Tech & Coding", emoji: "💻",
    title: "Tech & Coding Stoat Servers",
    description: "Join technology, programming and open-source communities on Stoat.",
    intro: "Tech servers on Stoat are for programmers, tinkerers and open-source fans to share projects, get help and talk technology.",
    tags: ["tech", "technology", "coding", "programming", "dev", "developer", "linux", "open source", "bots", "ai"],
    words: ["programming", "coding", "developers", "linux", "open source"],
  },
];

function hasWord(text: string, word: string) {
  return new RegExp(`(^|[^\\p{L}\\p{N}])${word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}([^\\p{L}\\p{N}]|$)`, "iu").test(text);
}

export function serverInCategory(server: DiscoveryServer, category: DiscoveryCategory) {
  if (server.categories?.includes(category.slug)) return true;
  const tags = server.tags.map((tag) => tag.toLowerCase());
  if (tags.some((tag) => category.tags.includes(tag))) return true;
  const text = `${server.server_name} ${server.description}`;
  return category.words.some((word) => hasWord(text, word));
}

export function serversInCategory(servers: DiscoveryServer[], category: DiscoveryCategory) {
  return rankPopular(servers.filter((server) => serverInCategory(server, category)));
}

export function categoriesForServer(server: DiscoveryServer) {
  return discoveryCategories.filter((category) => serverInCategory(server, category));
}

export function findCategory(slug: string) {
  return discoveryCategories.find((category) => category.slug === slug.toLowerCase()) ?? null;
}

/**
 * A tag page that would duplicate a category (#gaming and Gaming) points to the category instead.
 * Only when the category's own tags include the slug: then every server with the tag is also in the category.
 */
export function categoryReplacingTag(tagSlug: string) {
  const category = findCategory(tagSlug);
  return category && category.tags.includes(tagSlug.toLowerCase()) ? category : null;
}

/** Where a tag link should go: its category when one replaces the tag page. */
export function tagHref(tag: string) {
  const slug = slugify(tag);
  const category = categoryReplacingTag(slug);
  return category ? "/discovery/categories/" + category.slug : "/discovery/tags/" + slug;
}

function timestamp(value: string | null | undefined) {
  const parsed = value ? Date.parse(value) : NaN;
  return Number.isFinite(parsed) ? parsed : 0;
}

function comparePopular(a: DiscoveryServer, b: DiscoveryServer) {
  return (a.global_rank ?? Number.MAX_SAFE_INTEGER) - (b.global_rank ?? Number.MAX_SAFE_INTEGER)
    || b.daily_messages - a.daily_messages
    || b.member_count - a.member_count
    || a.server_name.localeCompare(b.server_name);
}

export function rankPopular(servers: DiscoveryServer[]) {
  return [...servers].sort(comparePopular);
}

export function rankActive(servers: DiscoveryServer[]) {
  return [...servers].sort((a, b) => b.daily_messages - a.daily_messages || b.member_count - a.member_count || a.server_name.localeCompare(b.server_name));
}

export function rankNewest(servers: DiscoveryServer[]) {
  return [...servers].sort((a, b) => timestamp(b.approved_at) - timestamp(a.approved_at) || a.server_id.localeCompare(b.server_id));
}

export function rankBumped(servers: DiscoveryServer[]) {
  return [...servers].sort((a, b) => timestamp(b.last_bumped_at) - timestamp(a.last_bumped_at) || comparePopular(a, b));
}

/** Featured: servers bumped in the last week first (most recent bump wins), then the most popular. */
export function featuredServers(servers: DiscoveryServer[], count = 3, now = Date.now()) {
  const week = 7 * 24 * 60 * 60 * 1000;
  const bumped = servers.filter((server) => now - timestamp(server.last_bumped_at) < week);
  const ordered = [...rankBumped(bumped), ...rankPopular(servers)];
  const seen = new Set<string>();
  return ordered.filter((server) => !seen.has(server.server_id) && seen.add(server.server_id)).slice(0, count);
}

export function similarServers(servers: DiscoveryServer[], server: DiscoveryServer, count = 3) {
  const tags = new Set(server.tags.map(slugify));
  const categories = new Set(categoriesForServer(server).map((category) => category.slug));
  return rankPopular(servers.filter((other) => other.server_id !== server.server_id))
    .map((other) => ({
      other,
      score: other.tags.filter((tag) => tags.has(slugify(tag))).length * 2
        + categoriesForServer(other).filter((category) => categories.has(category.slug)).length,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(({ other }) => other);
}

export function topTags(servers: DiscoveryServer[], count = 12) {
  const counts = new Map<string, number>();
  for (const server of servers) for (const tag of new Set(server.tags)) counts.set(tag, (counts.get(tag) || 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, count).map(([tag, total]) => ({ tag, count: total }));
}

export function directoryStats(servers: DiscoveryServer[]) {
  return {
    servers: servers.length,
    members: servers.reduce((total, server) => total + server.member_count, 0),
    messagesToday: servers.reduce((total, server) => total + server.daily_messages, 0),
    topics: new Set(servers.flatMap((server) => server.tags)).size,
  };
}

/** "A, B and C" for meta descriptions. */
export function exampleNames(servers: DiscoveryServer[], count = 3) {
  const names = servers.slice(0, count).map((server) => server.server_name.replace(/\s+/g, " ").trim());
  return names.length > 1 ? `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}` : names[0] ?? "";
}

export function countLabel(value: number, singular: string, plural: string) {
  return value === 1 ? singular : plural;
}

export const discoveryLanguages: Record<string, string> = {
  en: "English", pt: "Português", es: "Español", fr: "Français", de: "Deutsch", it: "Italiano", nl: "Nederlands",
  pl: "Polski", ru: "Русский", uk: "Українська", tr: "Türkçe", ar: "العربية", hi: "हिन्दी", id: "Bahasa Indonesia",
  ja: "日本語", ko: "한국어", zh: "中文", other: "Other",
};

export function verifiedServers(servers: DiscoveryServer[]) {
  const order = { official: 0, organization: 1, impact: 2, standing: 3 } as const;
  return rankPopular(servers.filter((server) => server.verified)).sort((a, b) => order[a.verified!.tier] - order[b.verified!.tier]);
}

export function compactNumber(value: number) {
  return new Intl.NumberFormat("en-GB", { notation: value >= 10_000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}
