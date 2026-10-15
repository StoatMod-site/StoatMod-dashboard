import { PublicFooter } from "./PublicFooter";
import { Breadcrumbs } from "./Breadcrumbs";
import { JsonLd } from "./JsonLd";
import { collectionSchema } from "./lib/schema";
import { SiteNav } from "./SiteNav";
import type { ContentPage } from "./content/types";
import { siteConfig } from "./lib/site-config";
import { ResourceLibrary } from "./ResourceLibrary";
import styles from "./PublicHubPage.module.css";
import { PublicPageHeading, PublicSummary } from "./PublicPageHeading";

export function PublicHubPage({
  group,
  eyebrow,
  title,
  lede,
  pages,
}: {
  group: "features" | "guides";
  eyebrow: string;
  title: string;
  lede: string;
  pages: ContentPage[];
}) {
  return (
    <main className={styles.page}>
      <JsonLd data={collectionSchema({ title, description: lede, path: `/${group}`, items: pages.map((page) => ({ title: page.title, href: `/${group}/${page.slug}` })) })} />
      <SiteNav active={group} />
      <Breadcrumbs items={[{ name: siteConfig.name, path: "/" }, { name: group === "features" ? "Features" : "Guides", path: `/${group}` }]} />
      <PublicPageHeading compact eyebrow={eyebrow} title="Practical guides." description={lede} action={{href:"#resource-library",label:"Find your guide"}} />
      <PublicSummary title="A good setup starts here." description="Connect the bot, check its permissions, and choose the protections your community needs. Start with the quickstart, then work through the guides below." facts={[`${pages.length} practical guides`,"Exact commands","Outcome checks"]} action={{href:"/docs/getting-started",label:"Open the quickstart"}} />
      <section className={styles.library} id="resource-library" aria-label={title}><header><p className={styles.eyebrow}>From setup to everyday moderation</p><h2>Choose your next step.</h2></header><ResourceLibrary label="guides" items={pages.map((page) => ({ href: `/${group}/${page.slug}`, title: page.title, description: page.description }))} /></section>
      <section className={styles.cta}><div><p className={styles.eyebrow}>Ready for your community</p><h2>Put your setup into practice.</h2></div><a href={siteConfig.inviteUrl}>Open the official bot profile <span aria-hidden="true">↗</span></a></section>
      <PublicFooter />
    </main>
  );
}
