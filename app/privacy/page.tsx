import { PrivacyPage } from "../PrivacyPage";
import { JsonLd } from "../JsonLd";
import { pageSchema } from "../lib/schema";
import { buildMetadata } from "../lib/seo";

export const metadata = buildMetadata({
  title: "Privacy Policy | Stoatmod",
  description: "What personal data Stoatmod processes, why, how long it is kept, who it is shared with and how to use your privacy rights.",
  path: "/privacy",
});

export default function PrivacyPolicyPage() {
  return <><JsonLd data={pageSchema({ title: "Stoatmod Privacy Policy", description: "What personal data Stoatmod processes, why, how long it is kept, who it is shared with and how to use your privacy rights.", path: "/privacy" })} /><PrivacyPage /></>;
}
