import { PublicContentPage } from "../PublicContentPage";
import { trustPages } from "../content/trust";
import { buildMetadata } from "../lib/seo";

const page = trustPages.about;
export const metadata = buildMetadata({ title: page.seoTitle, description: page.description, path: "/about" });
export default function AboutPage() { return <PublicContentPage page={page} group="trust" />; }
