import { PublicHubPage } from "../PublicHubPage";
import { guidePages } from "../content/guides";
import { buildMetadata } from "../lib/seo";

export const metadata = buildMetadata({
  title: "Stoat Server Moderation Guides | Stoatmod",
  description: "Practical guides for setting up Stoatmod, reporting scams, understanding global bans, stopping spam, managing roles, reviewing appeals and using Discovery.",
  path: "/guides",
});

export default function GuidesPage() {
  return <PublicHubPage group="guides" eyebrow="Practical Stoat moderation" title="Stoat server setup and moderation guides." lede="Use tested steps, exact commands, outcome checks and recovery notes instead of copying a setting without understanding its effect." pages={Object.values(guidePages)} />;
}
