import type { DiscoveryServer } from "./public-types";
import { absoluteUrl, siteConfig } from "./site-config";

// Social images for Discovery pages. Static cards live in public/discovery/og (scripts/generate_discovery_og.py);
// server cards are rendered by the public API from the listing's banner, icon, name and stats.
const OG_SIZE = { imageWidth: 1200, imageHeight: 630 } as const;

export function discoveryOgPath(name: string) {
  return `/discovery/og/${name}.png`;
}

export function discoveryOgImage(name: string, alt: string) {
  return { image: discoveryOgPath(name), imageAlt: alt, ...OG_SIZE };
}

export function serverOgUrl(server: Pick<DiscoveryServer, "server_id" | "updated_at" | "member_count">) {
  // The version changes when the listing or its member count changes, so shared links pick up a fresh card.
  const version = `${Date.parse(server.updated_at) || 0}-${server.member_count}`;
  return `${siteConfig.origin}/api/public/discovery/og/${server.server_id}.png?v=${encodeURIComponent(version)}`;
}

export function serverOgImage(server: Pick<DiscoveryServer, "server_id" | "server_name" | "updated_at" | "member_count">) {
  return { image: serverOgUrl(server), imageAlt: `${server.server_name} on Stoat`, ...OG_SIZE };
}

export function imageObject(url: string) {
  return { "@type": "ImageObject", url: absoluteUrl(url), width: 1200, height: 630 };
}
