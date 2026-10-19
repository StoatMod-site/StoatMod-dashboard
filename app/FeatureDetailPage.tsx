/* eslint-disable @next/next/no-html-link-for-pages -- Public links use browser navigation because the production client router fails. */
import { Breadcrumbs } from "./Breadcrumbs";
import { FeatureCommand } from "./FeatureCommand";
import { FeatureIcon } from "./FeatureIcon";
import { JsonLd } from "./JsonLd";
import { PublicFooter } from "./PublicFooter";
import { SiteNav } from "./SiteNav";
import { contentPageFromHref } from "./content";
import { featureProfiles } from "./content/feature-library";
import type { ContentPage, ContentSection } from "./content/types";
import { articleSchema } from "./lib/schema";
import { siteConfig } from "./lib/site-config";
import { PublicPageHeading, PublicSummary } from "./PublicPageHeading";
import styles from "./FeaturePages.module.css";

function sectionId(title: string) { return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); }
const resourceTitles: Record<string, string> = { "/discovery": "Discover Stoat communities", "/privacy": "Privacy policy", "/status": "Service status" };

function FeatureSection({ section, index }: { section: ContentSection; index: number }) {
  return <section className={styles.detailSection} id={sectionId(section.title)}>
    <header><span>{String(index + 1).padStart(2, "0")}</span><h2>{section.title}</h2></header>
    {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    {section.bullets && <ul className={styles.bullets}>{section.bullets.map((bullet) => <li key={bullet}><span aria-hidden="true">↗</span>{bullet}</li>)}</ul>}
    {section.steps && <ol className={styles.steps}>{section.steps.map((step, stepIndex) => <li key={step.title}><span>{String(stepIndex + 1).padStart(2, "0")}</span><div><h3>{step.title}</h3><p>{step.text}</p>{step.command && <FeatureCommand command={step.command}/>}</div></li>)}</ol>}
    {section.commands && <div className={styles.commands}>{section.commands.map((command) => <FeatureCommand key={command.command} {...command}/>)}</div>}
    {section.note && <aside className={styles.note}><span aria-hidden="true">i</span><div><strong>Good to know</strong><p>{section.note}</p></div></aside>}
  </section>;
}

export function FeatureDetailPage({ page }: { page: ContentPage }) {
  const feature = featureProfiles[page.slug];
  const href = `/features/${page.slug}`;
  const breadcrumbs = [{ name: siteConfig.name, path: "/" }, { name: "Features", path: "/features" }, { name: feature.name, path: href }];
  const related = page.related.flatMap((path) => {
    const content = contentPageFromHref(path);
    if (content) return [{ path, title: content.group === "features" ? featureProfiles[content.page.slug]?.name || content.page.title : content.page.title, type: content.group === "features" ? "Feature" : content.group === "guides" ? "Guide" : "Documentation" }];
    return resourceTitles[path] ? [{ path, title: resourceTitles[path], type: "Resource" }] : [];
  });
  const reviewed = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(`${page.updated}T00:00:00Z`));
  return <main className={`docs-page ${styles.page}`}>
    <JsonLd data={articleSchema({ title: page.title, description: page.description, path: href, updated: page.updated, breadcrumbs, type: "WebPage" })}/>
    <SiteNav active="features"/>
    <div className={styles.shell}>
      <Breadcrumbs items={breadcrumbs}/>
      <PublicPageHeading compact inset eyebrow={`${feature.group} / ${feature.name}`} title={`${feature.name}.`} description={page.lede} action={{href:"/features",label:"All features"}} />
      <PublicSummary inset title={feature.headline} description={feature.summary} icon={<FeatureIcon name={page.slug}/>} facts={feature.facts.map(fact=>`${fact.label}: ${fact.value}`)} action={{href:feature.setup.href,label:feature.setup.label}} />
      <ul className={styles.benefits} aria-label={`${feature.name} benefits`}>{feature.benefits.map((benefit, index) => <li key={benefit}><span>{String(index + 1).padStart(2, "0")}</span><p>{benefit}</p></li>)}</ul>
      <section className={styles.howItWorks} aria-labelledby="workflow-title"><header className={styles.sectionHeading}><div><p className={styles.eyebrow}>The walkthrough</p><h2 id="workflow-title">How it works.</h2></div><p>From your settings to the result your team can review.</p></header><ol>{feature.workflow.map((step, index) => <li key={step.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{step.title}</h3><p>{step.text}</p></li>)}</ol></section>
      <div className={styles.detailLayout}>
        <aside className={styles.contents}><nav aria-label="On this page"><strong>Explore {feature.name.toLowerCase()}</strong>{page.sections.map((section) => <a key={section.title} href={`#${sectionId(section.title)}`}>{section.title}<span aria-hidden="true">↘</span></a>)}</nav><div><p>Ready to configure it?</p><a href={feature.setup.href}>{feature.setup.label} <span aria-hidden="true">→</span></a></div></aside>
        <article className={styles.detailArticle}>{page.sections.map((section, index) => <FeatureSection key={section.title} section={section} index={index}/>)}<footer className={styles.reviewDate}><time dateTime={page.updated}>Reviewed {reviewed}</time><a href={siteConfig.supportUrl}>Need a hand? Contact support ↗</a></footer></article>
      </div>
      {related.length > 0 && <section className={styles.related} aria-labelledby="related-title"><header className={styles.sectionHeading}><div><p className={styles.eyebrow}>Keep exploring</p><h2 id="related-title">Put it into practice.</h2></div><a className={styles.textLink} href="/features">All features <span aria-hidden="true">→</span></a></header><div>{related.map((item) => <a href={item.path} key={item.path}><span>{item.type}</span><h3>{item.title}</h3><b aria-hidden="true">↗</b></a>)}</div></section>}
      <section className={styles.bottomCta}><div><p className={styles.eyebrow}>Make it part of your server</p><h2>Your community.<br/>Your configuration.</h2></div><div><a className={styles.primary} href={siteConfig.inviteUrl}>Add Stoatmod <span aria-hidden="true">↗</span></a><a href={feature.setup.href}>{feature.setup.label} →</a></div></section>
    </div><PublicFooter/>
  </main>;
}
