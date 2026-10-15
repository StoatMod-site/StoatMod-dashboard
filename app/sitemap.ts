import type { MetadataRoute } from "next";
import { allContentPages } from "./content";
import { getRequiredPublicDiscovery } from "./lib/public-data.server";
import { discoveryServerSlug, slugify } from "./lib/public-slugs";
import { isPrivatePreview } from "./lib/preview";
import { absoluteUrl } from "./lib/site-config";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isPrivatePreview()) return [];
  const core = [
    { path: "/", updated: "2026-09-30" },
    { path: "/features", updated: "2026-10-02" },
    { path: "/guides", updated: "2026-09-30" },
    { path: "/docs", updated: "2026-10-02" },
    { path: "/discovery", updated: "2026-09-30" },
    { path: "/privacy", updated: "2026-10-02" },
    { path: "/privacy-changes", updated: "2026-10-14" },
    { path: "/compare", updated: "2026-10-14" },
    { path: "/status", updated: "2026-09-30" },
  ];
  const content = allContentPages().map(({ href, page }) => ({ path: href, updated: page.updated }));
  const dynamic: { path: string; updated?: string; images?: string[] }[] = [];
  const servers = await getRequiredPublicDiscovery();
  for (const server of servers) {
    dynamic.push({
      path: "/discovery/servers/" + discoveryServerSlug(server),
      images: [server.server_banner_url, server.server_icon_url].filter(Boolean),
      updated: [server.updated_at, server.approved_at].find(
        (value): value is string => typeof value === "string" && Number.isFinite(Date.parse(value)),
      ),
    });
  }
  const tagCounts = new Map<string, number>();
  for (const server of servers) {
    for (const key of new Set(server.tags.map(slugify))) {
      tagCounts.set(key, (tagCounts.get(key) || 0) + 1);
    }
  }
  for (const [key, count] of tagCounts) {
    if (count >= 3) dynamic.push({ path: "/discovery/tags/" + key });
  }
  const unique = new Map([...core, ...content, ...dynamic].map((entry) => [entry.path, entry]));
  return [...unique.values()].map((entry) => ({
    url: absoluteUrl(entry.path),
    lastModified: entry.updated,
    ...("images" in entry && entry.images ? { images: entry.images } : {}),
  }));
}
