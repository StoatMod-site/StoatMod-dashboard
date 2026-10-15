export type ServerMedia = { name: string; icon: string; banner: string };

const emptyMedia: ServerMedia = { name: "", icon: "", banner: "" };

export function safeServerMediaUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password
      && (url.hostname === "cdn.stoatusercontent.com" || url.hostname.endsWith(".stoatusercontent.com"))
      ? url.toString() : "";
  } catch {
    return "";
  }
}

// One request per visible page, shared by every icon and banner on that page.
// A changed asset has a new CDN URL; no random cache-busting query is needed.
export function createDiscoveryMediaStore(request: typeof fetch = fetch) {
  let media: Map<string, ServerMedia> | undefined;
  let inFlight: AbortController | undefined;
  let interval: ReturnType<typeof setInterval> | undefined;
  let lastAttempt = 0;
  const listeners = new Set<() => void>();

  async function refresh() {
    if (inFlight || document.visibilityState === "hidden" || Date.now() - lastAttempt < 5_000) return;
    lastAttempt = Date.now();
    const controller = new AbortController();
    inFlight = controller;
    const timeout = setTimeout(() => controller.abort(), 8_000);
    try {
      const response = await request("/api/public/discovery", {
        cache: "no-store", signal: controller.signal, headers: { Accept: "application/json" },
      });
      if (!response.ok) return;
      const payload: unknown = await response.json();
      if (!payload || typeof payload !== "object" || !("servers" in payload) || !Array.isArray(payload.servers)) return;
      const next = new Map<string, ServerMedia>();
      for (const item of payload.servers) {
        if (!item || typeof item !== "object" || typeof item.server_id !== "string") continue;
        const entry = {
          name: typeof item.server_name === "string" ? item.server_name.slice(0, 100) : "",
          icon: safeServerMediaUrl(item.server_icon_url),
          banner: safeServerMediaUrl(item.server_banner_url),
        };
        const previous = media?.get(item.server_id);
        next.set(item.server_id, previous && previous.name === entry.name && previous.icon === entry.icon && previous.banner === entry.banner ? previous : entry);
      }
      if (controller.signal.aborted) return;
      media = next;
      listeners.forEach((listener) => listener());
    } catch {
      // Keep the last successful images during a temporary API outage.
    } finally {
      clearTimeout(timeout);
      if (inFlight === controller) inFlight = undefined;
    }
  }

  const onVisible = () => { void refresh(); };
  return {
    getSnapshot: (serverId: string) => media ? media.get(serverId) || emptyMedia : undefined,
    getServerSnapshot: () => undefined,
    subscribe(listener: () => void) {
      listeners.add(listener);
      if (listeners.size === 1) {
        void refresh();
        interval = setInterval(onVisible, 60_000);
        document.addEventListener("visibilitychange", onVisible);
        window.addEventListener("focus", onVisible);
      }
      return () => {
        listeners.delete(listener);
        if (!listeners.size) {
          clearInterval(interval);
          document.removeEventListener("visibilitychange", onVisible);
          window.removeEventListener("focus", onVisible);
          inFlight?.abort();
          inFlight = undefined;
          lastAttempt = 0;
        }
      };
    },
  };
}

export const discoveryMedia = createDiscoveryMediaStore();
