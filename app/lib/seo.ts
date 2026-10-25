import type { Metadata } from "next";
import { absoluteUrl, canonicalPath, siteConfig } from "./site-config";
import { isPrivatePreview } from "./preview";

type MetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  index?: boolean;
  type?: "website" | "article";
  modifiedTime?: string;
};

export function buildMetadata({
  title,
  description,
  path,
  image = siteConfig.socialImage,
  imageAlt = `${siteConfig.name} — moderation for Stoat servers`,
  imageWidth,
  imageHeight,
  index = true,
  type = "website",
  modifiedTime,
}: MetadataInput): Metadata {
  const canonical = canonicalPath(path);
  const absoluteCanonical = absoluteUrl(canonical);
  const absoluteImage = absoluteUrl(image);
  const shouldIndex = index && !isPrivatePreview();
  return {
    title,
    description,
    alternates: { canonical: absoluteCanonical },
    openGraph: {
      type,
      locale: "en_GB",
      url: absoluteCanonical,
      siteName: siteConfig.name,
      title,
      description,
      ...(type === "article" ? { modifiedTime, authors: [absoluteUrl("/about")] } : {}),
      images: [{
        url: absoluteImage,
        ...(image === siteConfig.socialImage
          ? { width: 1731, height: 909 }
          : imageWidth && imageHeight ? { width: imageWidth, height: imageHeight } : {}),
        alt: imageAlt,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: absoluteImage, alt: imageAlt }],
    },
    robots: shouldIndex
      ? {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
            "max-image-preview": "large",
            "max-snippet": -1,
            "max-video-preview": -1,
          },
        }
      : { index: false, follow: false },
  };
}
