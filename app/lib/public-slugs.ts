import type { DiscoveryServer } from "./public-types";

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 72) || "stoat-server";
}

export function discoveryServerSlug(server: Pick<DiscoveryServer, "server_id" | "server_name">) {
  return `${slugify(server.server_name)}-${server.server_id.toLowerCase()}`;
}

export function findDiscoveryServer(servers: DiscoveryServer[], slug: string) {
  const normalized = slug.toLowerCase();
  return servers.find((server) => discoveryServerSlug(server) === normalized)
    ?? servers.find((server) => normalized === server.server_id.toLowerCase() || normalized.endsWith(`-${server.server_id.toLowerCase()}`))
    ?? null;
}
