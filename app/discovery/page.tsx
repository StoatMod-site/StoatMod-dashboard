import { DiscoveryPage } from "../DiscoveryPage";
import { JsonLd } from "../JsonLd";
import { featuredServers, rankPopular } from "../lib/discovery-catalog";
import { discoveryFaq } from "../lib/discovery-faq";
import { breadcrumbSchema, organizationSchema, websiteSchema } from "../lib/schema";
import { getPublicDiscoveryResult } from "../lib/public-data.server";
import { discoveryServerSlug } from "../lib/public-slugs";
import { buildMetadata } from "../lib/seo";
import { absoluteUrl, siteConfig } from "../lib/site-config";
import { faqSchema } from "./DiscoveryUI";

const title = "Stoat Servers – Discover & Join Stoat Communities | Stoatmod Discovery";
const description = "Find Stoat servers to join with Stoat Discovery by Stoatmod. Browse reviewed Stoat communities by topic, see live activity, and advertise your own Stoat server for free.";

export const metadata = buildMetadata({ title, description, path: "/discovery" });

export default async function DiscoveryRoute() {
  const discovery = await getPublicDiscoveryResult();
  const servers = discovery.servers;
  const items = rankPopular(servers).map((server, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: server.server_name,
    url: absoluteUrl(`/discovery/servers/${discoveryServerSlug(server)}`),
  }));
  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          organizationSchema(),
          websiteSchema(),
          {
            "@type": "CollectionPage",
            "@id": `${absoluteUrl("/discovery")}#page`,
            url: absoluteUrl("/discovery"),
            name: title,
            description,
            isPartOf: { "@id": `${siteConfig.origin}/#website` },
            ...(items.length ? { mainEntity: { "@type": "ItemList", itemListElement: items } } : {}),
          },
          { ...faqSchema(discoveryFaq), "@id": `${absoluteUrl("/discovery")}#faq` },
          breadcrumbSchema([
            { name: siteConfig.name, path: "/" },
            { name: "Discovery", path: "/discovery" },
          ]),
        ],
      }} />
      <DiscoveryPage initialServers={servers} featuredIds={featuredServers(servers).map((server) => server.server_id)} dataAvailable={discovery.available} />
    </>
  );
}
