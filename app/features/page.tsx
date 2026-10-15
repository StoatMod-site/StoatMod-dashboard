import { FeatureLibraryPage } from "../FeatureLibraryPage";
import { buildMetadata } from "../lib/seo";

export const metadata = buildMetadata({
  title: "Stoatmod Features – Automod and Moderation for Stoat",
  description: "Explore Stoatmod automod, spam, link, image, join, case, appeal, automatic-role and statistics features.",
  path: "/features",
});

export default function FeaturesPage() {
  return <FeatureLibraryPage />;
}
