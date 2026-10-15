/* eslint-disable @next/next/no-html-link-for-pages -- Public links use browser navigation because the production client router fails. */
import { Breadcrumbs } from "./Breadcrumbs";
import { FeatureCatalog } from "./FeatureCatalog";
import { JsonLd } from "./JsonLd";
import { PublicFooter } from "./PublicFooter";
import { SiteNav } from "./SiteNav";
import { featurePages } from "./content/features";
import { featureProfiles } from "./content/feature-library";
import { collectionSchema } from "./lib/schema";
import { siteConfig } from "./lib/site-config";
import { PublicPageHeading, PublicSummary } from "./PublicPageHeading";
import { PrivacyUpdateCallout } from "./PrivacyUpdateCallout";
import { OpenSourceCallout } from "./OpenSourceCallout";
import styles from "./FeaturePages.module.css";

export function FeatureLibraryPage() {
  const features = Object.values(featurePages).map((page) => ({ slug: page.slug, ...featureProfiles[page.slug] }));
  return <main className={`docs-page ${styles.page}`}>
    <JsonLd data={collectionSchema({ title: "Stoatmod features", description: "Explore configurable protection, moderation cases, appeals and tools for your Stoat community.", path: "/features", items: features.map((feature) => ({ title: feature.name, href: `/features/${feature.slug}` })) })}/>
    <SiteNav active="features"/>
    <div className={styles.shell}>
      <Breadcrumbs items={[{ name: siteConfig.name, path: "/" }, { name: "Features", path: "/features" }]}/>
      <PublicPageHeading compact inset eyebrow="The toolkit" title="Features." description="Protection, moderation, and community tools. Configured for your server." action={{href:"/guides/how-to-set-up-stoatmod",label:"Read the setup guide"}} />
      <PublicSummary inset title="From the first join to the final appeal." description="Choose the protections your community needs, configure the response, and give your moderators the context to review each decision." facts={[`${features.length} features`,"Commands + dashboard","Server-specific settings"]} action={{href:siteConfig.inviteUrl,label:"Add Stoatmod"}} icon={<span>↗</span>} />
      <PrivacyUpdateCallout inset />
      <OpenSourceCallout inset />
      <div className={styles.principles}><span><b>01</b> Settings for your server</span><span><b>02</b> Commands + dashboard</span><span><b>03</b> Context for human review</span></div>
      <FeatureCatalog features={features}/>
      <section className={styles.getStarted} aria-labelledby="start-title"><div><p className={styles.eyebrow}>A good place to start</p><h2 id="start-title">Build your setup,<br/>one step at a time.</h2><p>Start with permissions, choose the protection your server needs, then check the outcome.</p><a className={styles.textLink} href="/guides/how-to-set-up-stoatmod">Follow the complete setup guide <span aria-hidden="true">→</span></a></div><ol><li><span>01</span><div><h3>Connect your community</h3><p>Add Stoatmod and run <code>~setup</code> to check permissions and role hierarchy.</p></div></li><li><span>02</span><div><h3>Make the rules yours</h3><p>Choose categories, thresholds, channel exclusions and how the bot responds.</p></div></li><li><span>03</span><div><h3>Review a real outcome</h3><p>Test one feature at a time and use the dashboard to review the result.</p></div></li></ol></section>
      <section className={styles.bottomCta}><div><p className={styles.eyebrow}>Ready when you are</p><h2>Give your team<br/>a better starting point.</h2></div><div><a className={styles.primary} href={siteConfig.inviteUrl}>Add Stoatmod to your server <span aria-hidden="true">↗</span></a><a href="/docs">Explore the documentation →</a></div></section>
    </div><PublicFooter/>
  </main>;
}
