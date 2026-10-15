import { PrivacyPage } from "../PrivacyPage";
import { JsonLd } from "../JsonLd";
import { pageSchema } from "../lib/schema";
import { buildMetadata } from "../lib/seo";

export const metadata = buildMetadata({
  title: "Privacy Policy | Stoatmod",
  description: "How Stoatmod Limited processes and protects personal information.",
  path: "/privacy",
});

export default function PrivacyPolicyPage() {
  return <><JsonLd data={pageSchema({ title: "Stoatmod Privacy Policy", description: "How Stoatmod Limited processes and protects personal information.", path: "/privacy" })} /><PrivacyPage /></>;
}
