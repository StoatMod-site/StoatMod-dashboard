import { SiteNav } from "./SiteNav";
import { PublicFooter } from "./PublicFooter";
import { PublicPageHeading, PublicSummary } from "./PublicPageHeading";
import styles from "./PublicPage.module.css";

export const metadata = {
  title: "Page not found | Stoatmod",
  description: "This Stoatmod page is not available.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return <main className={styles.page}><SiteNav /><PublicPageHeading eyebrow="404 / Page not found" title="This page isn’t here." description="The link may have changed, or this page is no longer available." action={{href:"/",label:"Return home"}} /><PublicSummary title="Find your next step." description="Browse the documentation for setup help, commands, and moderation guides." facts={["Documentation","Features","Community guides"]} action={{href:"/docs",label:"Open documentation"}} icon={<span>↗</span>} /><PublicFooter /></main>;
}
