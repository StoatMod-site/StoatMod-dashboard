"use client";

import { useState, useSyncExternalStore } from "react";
import { discoveryMedia } from "./lib/discovery-media";

export function ServerArtwork({ serverId, name, src, kind, className, href, priority = false }: {
  serverId: string;
  name: string;
  src: string;
  kind: "icon" | "banner";
  className?: string;
  href?: string;
  priority?: boolean;
}) {
  const current = useSyncExternalStore(discoveryMedia.subscribe, () => discoveryMedia.getSnapshot(serverId), discoveryMedia.getServerSnapshot);
  const source = current ? current[kind] : src;
  const displayName = current?.name || name;
  const [failedSource, setFailedSource] = useState<string>();
  const showImage = Boolean(source) && failedSource !== source;
  if (kind === "banner" && !showImage) return null;
  const content = <>
    {kind === "icon" && <span aria-hidden="true">{(Array.from(displayName)[0] || "?").toUpperCase()}</span>}
    {showImage && <img key={source} src={source} alt={kind === "banner" ? `${displayName} server banner` : ""} width={kind === "banner" ? 1200 : 76} height={kind === "banner" ? 400 : 76} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async" referrerPolicy="no-referrer" onError={() => setFailedSource(source)} />}
  </>;
  return href
    ? <a className={className} href={href} aria-label={`View ${displayName}`}>{content}</a>
    : <span className={className}>{content}</span>;
}
