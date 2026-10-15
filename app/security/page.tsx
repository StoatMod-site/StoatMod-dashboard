import { PublicContentPage } from "../PublicContentPage";
import { trustPages } from "../content/trust";
import { buildMetadata } from "../lib/seo";

const page = trustPages.security;
export const metadata = buildMetadata({ title: page.seoTitle, description: page.description, path: "/security" });
export default function SecurityPage() { return <PublicContentPage page={page} group="trust" />; }
