import { notFound } from "next/navigation";
import { FeatureDetailPage } from "../../FeatureDetailPage";
import { featurePages } from "../../content/features";
import { buildMetadata } from "../../lib/seo";

export const dynamicParams = false;
export function generateStaticParams() { return Object.keys(featurePages).map((slug) => ({ slug })); }

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = featurePages[slug];
  return page ? buildMetadata({ title: page.seoTitle, description: page.description, path: `/features/${slug}` }) : buildMetadata({ title: "Feature not found | Stoatmod", description: "This Stoatmod feature page does not exist.", path: `/features/${slug}`, index: false });
}

export default async function FeaturePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = featurePages[slug];
  if (!page) notFound();
  return <FeatureDetailPage page={page} />;
}
