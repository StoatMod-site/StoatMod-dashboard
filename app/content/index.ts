import { documentationPages } from "./docs";
import { featurePages } from "./features";
import { guidePages } from "./guides";
import { trustPages } from "./trust";
import type { ContentPage } from "./types";

export type ContentGroup = "features" | "docs" | "guides" | "trust";

export const contentGroups: Record<ContentGroup, Record<string, ContentPage>> = {
  features: featurePages,
  docs: documentationPages,
  guides: guidePages,
  trust: trustPages,
};

export function getContentPage(group: ContentGroup, slug: string) {
  return contentGroups[group][slug] ?? null;
}

export function contentHref(group: ContentGroup, page: ContentPage) {
  return group === "trust" ? `/${page.slug}` : `/${group}/${page.slug}`;
}

export function contentPageFromHref(href: string) {
  const [group, ...slugParts] = href.replace(/^\//, "").split("/");
  if (group === "about" || group === "security" || group === "changelog") {
    const page = trustPages[group];
    return page ? { group: "trust" as const, page, href } : null;
  }
  if (group !== "features" && group !== "docs" && group !== "guides") return null;
  const page = getContentPage(group, slugParts.join("/"));
  return page ? { group, page, href } : null;
}

export function allContentPages() {
  return (Object.entries(contentGroups) as [ContentGroup, Record<string, ContentPage>][]).flatMap(([group, pages]) =>
    Object.values(pages).map((page) => ({ group, page, href: contentHref(group, page) })),
  );
}
