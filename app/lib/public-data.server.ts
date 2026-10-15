import type { DiscoveryServer, PublicStats } from "./public-types";
export { discoveryServerSlug, findDiscoveryServer, slugify } from "./public-slugs";

const requestTimeoutMs = 2_500;
const publicCacheTtlMs = 60_000;
const publicCacheStaleTtlMs = 10 * 60_000;
const publicCache = new Map<string, { freshUntil: number; staleUntil: number; value: unknown }>();
const publicDataUnavailable = Symbol("public-data-unavailable");

export class PublicDataUnavailableError extends Error {
  constructor(resource: string) {
    super(`${resource} is temporarily unavailable.`);
    this.name = "PublicDataUnavailableError";
  }
}

function configuredOrigin() {
  const configured = process.env.STOATMOD_PUBLIC_API_ORIGIN?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return process.env.NODE_ENV === "development" ? "https://modstoat.site" : "";
}

async function publicJson(path: string): Promise<unknown> {
  const origin = configuredOrigin();
  if (!origin) return publicDataUnavailable;
  const cacheKey = origin + path;
  const cached = publicCache.get(cacheKey);
  const now = Date.now();
  if (cached && cached.freshUntil > now) return cached.value;
  const staleEntry = cached && cached.staleUntil > now ? cached : null;
  if (cached && cached.staleUntil <= now) publicCache.delete(cacheKey);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), requestTimeoutMs);
  try {
    const response = await fetch(`${origin}${path}`, {
      cache: "no-store",
      headers: { accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) return staleEntry?.value ?? publicDataUnavailable;
    const value = await response.json();
    const cachedAt = Date.now();
    publicCache.set(cacheKey, {
      freshUntil: cachedAt + publicCacheTtlMs,
      staleUntil: cachedAt + publicCacheStaleTtlMs,
      value,
    });
    return value;
  } catch {
    return staleEntry?.value ?? publicDataUnavailable;
  } finally {
    clearTimeout(timeout);
  }
}

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : 0;
}

function text(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

function safeHttpsUrl(value: unknown, allowedHost: (hostname: string) => boolean) {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && allowedHost(url.hostname.toLowerCase())
      ? url.toString()
      : "";
  } catch {
    return "";
  }
}

function safeIconUrl(value: unknown) {
  return safeHttpsUrl(value, (hostname) => hostname === "cdn.stoatusercontent.com" || hostname.endsWith(".stoatusercontent.com"));
}

function safeInviteUrl(value: unknown) {
  const invite = safeHttpsUrl(value, (hostname) => hostname === "stt.gg" || hostname === "stoat.chat" || hostname.endsWith(".stoat.chat"));
  if (!invite) return "";
  return new URL(invite).pathname.replace(/\//g, "") ? invite : "";
}

export async function getPublicStats(): Promise<PublicStats | null> {
  const value = await publicJson("/api/public/stats");
  if (value === publicDataUnavailable || !value || typeof value !== "object") return null;
  const record = value as Record<string, unknown>;
  const topServers = Array.isArray(record.top_servers)
    ? record.top_servers.slice(0, 3).flatMap((entry) => {
        if (!entry || typeof entry !== "object") return [];
        const server = entry as Record<string, unknown>;
        const serverId = text(server.server_id, 64);
        const serverName = text(server.server_name, 100);
        if (!serverId || !serverName) return [];
        return [{
          server_id: serverId,
          server_name: serverName,
          server_icon_url: safeIconUrl(server.server_icon_url) || null,
          value: finiteNumber(server.value),
        }];
      })
    : [];
  return {
    server_count: finiteNumber(record.server_count),
    member_count: finiteNumber(record.member_count),
    case_count: finiteNumber(record.case_count),
    updated_at: text(record.updated_at, 64) || null,
    top_servers: topServers,
  };
}

export async function getPublicDiscoveryResult(): Promise<{ available: boolean; servers: DiscoveryServer[] }> {
  const value = await publicJson("/api/public/discovery");
  if (value === publicDataUnavailable || !value || typeof value !== "object") {
    return { available: false, servers: [] };
  }
  const servers = (value as Record<string, unknown>).servers;
  if (!Array.isArray(servers)) return { available: false, servers: [] };
  const sanitized = servers.slice(0, 500).flatMap((entry) => {
    if (!entry || typeof entry !== "object") return [];
    const server = entry as Record<string, unknown>;
    const serverId = text(server.server_id, 64);
    const serverName = text(server.server_name, 100);
    const description = text(server.description, 500);
    const inviteUrl = safeInviteUrl(server.invite_url);
    if (!serverId || !serverName || !description || !inviteUrl) return [];
    return [{
      server_id: serverId,
      server_name: serverName,
      server_icon_url: safeIconUrl(server.server_icon_url),
      server_banner_url: safeIconUrl(server.server_banner_url),
      invite_url: inviteUrl,
      tags: Array.isArray(server.tags)
        ? server.tags.map((tag) => text(tag, 30).toLowerCase()).filter(Boolean).slice(0, 5)
        : [],
      member_count: finiteNumber(server.member_count),
      daily_messages: finiteNumber(server.daily_messages),
      global_rank: typeof server.global_rank === "number" && Number.isFinite(server.global_rank)
        ? server.global_rank
        : null,
      approved_at: text(server.approved_at, 64) || null,
      last_bumped_at: text(server.last_bumped_at, 64) || null,
      description,
      information: text(server.information, 4_000),
      updated_at: text(server.updated_at, 64),
    }];
  });
  return { available: true, servers: sanitized };
}

export async function getPublicDiscovery(): Promise<DiscoveryServer[]> {
  return (await getPublicDiscoveryResult()).servers;
}

export async function getRequiredPublicDiscovery(): Promise<DiscoveryServer[]> {
  const result = await getPublicDiscoveryResult();
  if (!result.available) throw new PublicDataUnavailableError("Stoatmod Discovery");
  return result.servers;
}
