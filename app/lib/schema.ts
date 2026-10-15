import { absoluteUrl, siteConfig } from "./site-config";

export type BreadcrumbItem = { name: string; path: string };

export function organizationSchema() {
  return {
    "@type": "Organization",
    "@id": `${siteConfig.origin}/#organization`,
    name: siteConfig.name,
    legalName: siteConfig.legalName,
    url: `${siteConfig.origin}/`,
    logo: absoluteUrl("/brand-mark.png"),
  };
}

export function webPageSchema(input: {
  title: string; description: string; path: string;
  type?: "WebPage" | "AboutPage" | "CollectionPage";
}) {
  return {
    "@type": input.type || "WebPage",
    "@id": `${absoluteUrl(input.path)}#page`,
    url: absoluteUrl(input.path),
    name: input.title,
    description: input.description,
    inLanguage: "en-GB",
    primaryImageOfPage: {
      "@type": "ImageObject",
      url: absoluteUrl(siteConfig.socialImage),
      width: 1731,
      height: 909,
    },
    isPartOf: { "@id": `${siteConfig.origin}/#website` },
    publisher: { "@id": `${siteConfig.origin}/#organization` },
  };
}

export function collectionSchema(input: {
  title: string; description: string; path: string;
  items: { title: string; href: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationSchema(), websiteSchema(), {
      ...webPageSchema({ ...input, type: "CollectionPage" }),
      mainEntity: {
        "@type": "ItemList",
        itemListElement: input.items.map((item, index) => ({
          "@type": "ListItem", position: index + 1,
          name: item.title, url: absoluteUrl(item.href),
        })),
      },
    }, breadcrumbSchema([{ name: siteConfig.name, path: "/" }, { name: input.title, path: input.path }])],
  };
}

export function pageSchema(input: { title: string; description: string; path: string }) {
  return {
    "@context": "https://schema.org",
    "@graph": [organizationSchema(), websiteSchema(), webPageSchema(input),
      breadcrumbSchema([{ name: siteConfig.name, path: "/" }, { name: input.title, path: input.path }])],
  };
}

export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function websiteSchema() {
  return {
    "@type": "WebSite",
    "@id": `${siteConfig.origin}/#website`,
    name: siteConfig.name,
    alternateName: "StoatMod",
    url: `${siteConfig.origin}/`,
    description: siteConfig.description,
    publisher: { "@id": `${siteConfig.origin}/#organization` },
  };
}

export function softwareSchema() {
  return {
    "@type": "SoftwareApplication",
    "@id": `${siteConfig.origin}/#software`,
    name: siteConfig.name,
    alternateName: "StoatMod",
    url: `${siteConfig.origin}/`,
    applicationCategory: "BusinessApplication",
    applicationSubCategory: "Community moderation bot",
    operatingSystem: "Stoat",
    installUrl: siteConfig.inviteUrl,
    softwareHelp: { "@type": "WebPage", url: absoluteUrl("/docs") },
    description: siteConfig.description,
    featureList: [
      "Configurable text and image moderation",
      "Spam, link and mass-mention protection",
      "Moderation cases and appeals",
      "Automatic roles and moderation logs",
      "Live server statistics",
      "Polls, automations and server reporting",
    ],
  };
}

export function articleSchema(input: {
  title: string;
  description: string;
  path: string;
  updated: string;
  breadcrumbs: BreadcrumbItem[];
  type?: "TechArticle" | "WebPage" | "AboutPage";
}) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      organizationSchema(),
      websiteSchema(),
      {
        "@type": input.type || "TechArticle",
        "@id": `${absoluteUrl(input.path)}#article`,
        headline: input.title,
        name: input.title,
        url: absoluteUrl(input.path),
        inLanguage: "en-GB",
        description: input.description,
        image: absoluteUrl(siteConfig.socialImage),
        mainEntityOfPage: absoluteUrl(input.path),
        dateModified: input.updated,
        author: { "@id": `${siteConfig.origin}/#organization` },
        publisher: { "@id": `${siteConfig.origin}/#organization` },
        isPartOf: { "@id": `${siteConfig.origin}/#website` },
      },
      breadcrumbSchema(input.breadcrumbs),
    ],
  };
}
