import { DiscoveryPage } from "../DiscoveryPage";
import { JsonLd } from "../JsonLd";
import { breadcrumbSchema, organizationSchema, websiteSchema } from "../lib/schema";
import { getPublicDiscoveryResult } from "../lib/public-data.server";
import { discoveryServerSlug } from "../lib/public-slugs";
import { buildMetadata } from "../lib/seo";
import { absoluteUrl, siteConfig } from "../lib/site-config";

const title = "Stoat Servers – Find & Join Communities | Stoatmod Discovery";
const description = "Find Stoat servers to join on Stoatmod Discovery. Search the Stoat server list by name or topic, explore active communities and open their invite links.";

export const metadata = buildMetadata({ title, description, path: "/discovery" });

export default async function DiscoveryRoute() {
  const discovery = await getPublicDiscoveryResult();
  const servers = discovery.servers;
  const items = servers.map((server, index) => ({
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
          breadcrumbSchema([
            { name: siteConfig.name, path: "/" },
            { name: "Discovery", path: "/discovery" },
          ]),
        ],
      }} />
      <DiscoveryPage initialServers={servers} dataAvailable={discovery.available} />
    </>
  );
}
