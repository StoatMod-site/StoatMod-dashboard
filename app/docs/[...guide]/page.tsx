import { notFound } from "next/navigation";
import { PublicContentPage } from "../../PublicContentPage";
import { documentationPages } from "../../content/docs";
import { buildMetadata } from "../../lib/seo";

export const dynamicParams = false;
export function generateStaticParams() { return Object.keys(documentationPages).map((slug) => ({ guide: slug.split("/") })); }

export async function generateMetadata({ params }: { params: Promise<{ guide: string[] }> }) {
  const { guide } = await params;
  const slug = guide.join("/");
  const page = documentationPages[slug];
  return page ? buildMetadata({ title: page.seoTitle, description: page.description, path: `/docs/${slug}`, type: "article", modifiedTime: page.updated }) : buildMetadata({ title: "Documentation not found | Stoatmod", description: "This Stoatmod documentation page does not exist.", path: `/docs/${slug}`, index: false });
}

export default async function DocumentationArticle({ params }: { params: Promise<{ guide: string[] }> }) {
  const { guide } = await params;
  const page = documentationPages[guide.join("/")];
  if (!page) notFound();
  return <PublicContentPage page={page} group="docs" />;
}
