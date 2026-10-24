"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { discoveryMedia, safeDiscoveryMediaUrl, safeServerMediaUrl } from "./lib/discovery-media";

/** Short, stable version of an image URL so a changed icon or banner gets a new thumbnail URL. */
function version(value: string) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(36);
}

/** Card banners fill a phone screen, otherwise about a third of the page. */
const BANNER_DEFAULTS = { sizes: "(max-width: 700px) 100vw, 420px" };

/** Resized WebP from the Stoatmod API: Stoat's CDN only serves the full-size upload (animated banners can be megabytes). */
function thumbnail(serverId: string, kind: "icon" | "banner", source: string, width: number) {
  return `/api/public/discovery/thumb/${encodeURIComponent(serverId)}/${kind}.webp?w=${width}&v=${version(source)}`;
}

export function ServerArtwork({ serverId, name, src, kind, className, href, priority = false, original = false, sizes }: {
  serverId: string;
  name: string;
  src: string;
  kind: "icon" | "banner";
  className?: string;
  href?: string;
  priority?: boolean;
  /** Show the owner's original file (keeps animation), e.g. the banner at the top of their own page. */
  original?: boolean;
  /** `sizes` for a banner's responsive thumbnails. */
  sizes?: string;
}) {
  const current = useSyncExternalStore(discoveryMedia.subscribe, () => discoveryMedia.getSnapshot(serverId), discoveryMedia.getServerSnapshot);
  const source = current ? current[kind] : src;
  const displayName = current?.name || name;
  const [failed, setFailed] = useState<{ source?: string; thumbnail?: boolean; original?: boolean }>({});
  const failedNow = failed.source === source ? failed : {};
  const resizable = Boolean(source) && !original && Boolean(safeServerMediaUrl(source) || safeDiscoveryMediaUrl(source));
  const useThumbnail = resizable && !failedNow.thumbnail;
  const showImage = Boolean(source) && !failedNow.original;
  const imageProps = useThumbnail
    ? kind === "banner"
      ? {
          src: thumbnail(serverId, kind, source, 640),
          srcSet: [480, 640, 960, 1200].map((width) => `${thumbnail(serverId, kind, source, width)} ${width}w`).join(", "),
          sizes: sizes || BANNER_DEFAULTS.sizes,
        }
      : { src: thumbnail(serverId, kind, source, 152) }
    : { src: source };
  const onError = () => setFailed(useThumbnail ? { source, thumbnail: true } : { source, thumbnail: true, original: true });
  // An image that failed before hydration never reaches onError, so check once the component is live.
  const image = useRef<HTMLImageElement>(null);
  const imageSource = imageProps.src;
  useEffect(() => {
    const element = image.current;
    if (element && element.complete && element.naturalWidth === 0 && element.getAttribute("src") === imageSource) {
      setFailed(useThumbnail ? { source, thumbnail: true } : { source, thumbnail: true, original: true });
    }
  }, [imageSource, source, useThumbnail]);
  if (kind === "banner" && !showImage) return null;
  const content = <>
    {kind === "icon" && <span aria-hidden="true">{(Array.from(displayName)[0] || "?").toUpperCase()}</span>}
    {showImage && <img ref={image} key={imageProps.src} {...imageProps} alt={kind === "banner" ? `${displayName} server banner` : ""} width={kind === "banner" ? 1200 : 76} height={kind === "banner" ? 400 : 76} loading={priority ? "eager" : "lazy"} fetchPriority={priority ? "high" : "auto"} decoding="async" referrerPolicy="no-referrer" onError={onError} />}
  </>;
  return href
    ? <a className={className} href={href} aria-label={`View ${displayName}`}>{content}</a>
    : <span className={className}>{content}</span>;
}
