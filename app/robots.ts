import type { MetadataRoute } from "next";
import { isPrivatePreview } from "./lib/preview";

export default function robots(): MetadataRoute.Robots {
  if (isPrivatePreview()) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: {
      userAgent: "*",
      // Public access screens must be crawlable for their noindex tags to work.
      // Authentication still protects all account data behind the API.
      allow: ["/", "/admin/login$", "/owner/login$", "/api/public/discovery/og/", "/api/public/discovery/media/", "/api/public/discovery/badge/"],
      disallow: ["/api/", "/admin", "/dashboard", "/owner"],
    },
    sitemap: "https://modstoat.site/sitemap.xml",
    host: "https://modstoat.site",
  };
}
