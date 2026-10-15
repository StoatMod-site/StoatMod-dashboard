import { notFound } from "next/navigation";
import { PublicContentPage } from "../../PublicContentPage";
import { guidePages } from "../../content/guides";
import { buildMetadata } from "../../lib/seo";

export const dynamicParams = false;
export function generateStaticParams() { return Object.keys(guidePages).map((slug) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = guidePages[slug];
  return page ? buildMetadata({ title: page.seoTitle, description: page.description, path: `/guides/${slug}`, type: "article", modifiedTime: page.updated }) : buildMetadata({ title: "Guide not found | Stoatmod", description: "This Stoatmod guide does not exist.", path: `/guides/${slug}`, index: false });
}

export default async function GuidePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = guidePages[slug];
  if (!page) notFound();
  return <PublicContentPage page={page} group="guides" />;
}
