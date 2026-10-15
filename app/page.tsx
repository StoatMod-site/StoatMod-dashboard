import { JsonLd } from "./JsonLd";
import { MarketingPage } from "./MarketingPage";
import { discoveryServerSlug, getPublicDiscoveryResult, getPublicStats } from "./lib/public-data.server";
import { buildMetadata } from "./lib/seo";
import { organizationSchema, softwareSchema, webPageSchema, websiteSchema } from "./lib/schema";

const title = "Stoatmod – Automod & Moderation Bot for Stoat";
const description = "Keep your Stoat server safe with configurable automod, spam protection, moderation cases and appeals. Add Stoatmod and set up the protections your team needs.";

export const metadata = buildMetadata({ title, description, path: "/" });

export default async function Home() {
  const [stats, discovery] = await Promise.all([getPublicStats(), getPublicDiscoveryResult()]);
  const trustedServers = discovery.servers
    .slice()
    .sort((a, b) => (a.global_rank ?? Number.MAX_SAFE_INTEGER) - (b.global_rank ?? Number.MAX_SAFE_INTEGER))
    .slice(0, 3)
    .map((server) => ({
      server_id: server.server_id,
      server_name: server.server_name,
      server_icon_url: server.server_icon_url,
      member_count: server.member_count,
      description: server.description,
      detail_url: `/discovery/servers/${discoveryServerSlug(server)}`,
    }));

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@graph": [organizationSchema(), websiteSchema(), softwareSchema(), webPageSchema({ title, description, path: "/" })] }} />
      <MarketingPage initialStats={stats} trustedServers={trustedServers} />
    </>
  );
}
