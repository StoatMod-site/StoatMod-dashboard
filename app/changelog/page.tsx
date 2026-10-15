import { PublicContentPage } from "../PublicContentPage";
import { trustPages } from "../content/trust";
import { buildMetadata } from "../lib/seo";

const page = trustPages.changelog;
export const metadata = buildMetadata({ title: page.seoTitle, description: page.description, path: "/changelog", type: "article" });
export default function ChangelogPage() { return <PublicContentPage page={page} group="trust" />; }
