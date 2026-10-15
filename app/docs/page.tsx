import { DocsPage } from "../DocsPage";
import { JsonLd } from "../JsonLd";
import { collectionSchema } from "../lib/schema";
import { documentationPages } from "../content/docs";
import { buildMetadata } from "../lib/seo";

export const metadata = buildMetadata({
  title: "Stoatmod Documentation and Command Reference",
  description: "Install, configure and troubleshoot Stoatmod with task-focused guides, exact commands, permissions and outcome checks.",
  path: "/docs",
});

export default function DocumentationPage() {
  const guides = Object.values(documentationPages).map((page) => ({ href: `/docs/${page.slug}`, title: page.title, description: page.description }));
  return <><JsonLd data={collectionSchema({ title: "Stoatmod Documentation and Command Reference", description: "Install, configure and troubleshoot the Stoatmod moderation bot for Stoat servers.", path: "/docs", items: guides })} /><DocsPage guides={guides} /></>;
}
