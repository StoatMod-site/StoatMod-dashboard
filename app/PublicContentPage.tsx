import { Breadcrumbs } from "./Breadcrumbs";
import { JsonLd } from "./JsonLd";
import { PublicFooter } from "./PublicFooter";
import { SiteNav } from "./SiteNav";
import { contentPageFromHref, type ContentGroup } from "./content";
import type { ContentPage, ContentSection } from "./content/types";
import { articleSchema, type BreadcrumbItem } from "./lib/schema";
import { siteConfig } from "./lib/site-config";
import styles from "./PublicContentPage.module.css";
import { PublicPageHeading, PublicSummary } from "./PublicPageHeading";

const groupLabels: Record<ContentGroup, string> = { features: "Features", docs: "Documentation", guides: "Guides", trust: "Trust" };
const staticRelatedTitles: Record<string, string> = {
  "/discovery": "Discover reviewed Stoat servers",
  "/privacy": "Privacy policy",
  "/privacy-changes": "What we changed about privacy",
  "/status": "Service status",
};

function sectionId(title: string) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function reviewedDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })
    .format(new Date(`${value}T00:00:00Z`));
}

function ContentSectionView({ section, index }: { section: ContentSection; index: number }) {
  return (
    <section className={styles.section} id={sectionId(section.title)}>
      <span className={styles.sectionNumber} aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
      <h2>{section.title}</h2>
      {section.paragraphs?.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
      {section.bullets && <ul className={styles.bullets}>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul>}
      {section.steps && <ol className={styles.steps}>{section.steps.map((step, index) => <li className={styles.step} key={step.title}><span>{String(index + 1).padStart(2, "0")}</span><h3>{step.title}</h3><p>{step.text}</p>{step.command && <code>{step.command}</code>}</li>)}</ol>}
      {section.commands && <div className={styles.commands}>{section.commands.map((item) => <div className={styles.command} key={item.command}><code>{item.command}</code><p>{item.description}</p></div>)}</div>}
      {section.note && <p className={styles.note}><strong>Important:</strong> {section.note}</p>}
      {section.links && <div className={styles.sectionLinks}>{section.links.map((link) => <a key={link.href} href={link.href}>{link.label} <span aria-hidden="true">→</span></a>)}</div>}
    </section>
  );
}

export function PublicContentPage({ page, group }: { page: ContentPage; group: ContentGroup }) {
  const href = group === "trust" ? `/${page.slug}` : `/${group}/${page.slug}`;
  const groupPath = group === "trust" ? "/" : `/${group}`;
  const breadcrumbs: BreadcrumbItem[] = group === "trust"
    ? [{ name: siteConfig.name, path: "/" }, { name: page.title, path: href }]
    : [{ name: siteConfig.name, path: "/" }, { name: groupLabels[group], path: groupPath }, { name: page.title, path: href }];
  const related = page.related.flatMap((relatedHref) => {
    const match = contentPageFromHref(relatedHref);
    if (match) return [{ href: match.href, title: match.page.title }];
    const title = staticRelatedTitles[relatedHref];
    return title ? [{ href: relatedHref, title }] : [];
  });
  return (
    <main className={styles.page}>
      <JsonLd data={articleSchema({ title: page.title, description: page.description, path: href, updated: page.updated, breadcrumbs, type: group === "docs" || group === "guides" ? "TechArticle" : page.slug === "about" ? "AboutPage" : "WebPage" })} />
      <SiteNav active={group === "trust" ? undefined : group === "docs" ? "docs" : group} />
      <Breadcrumbs items={breadcrumbs} />
      <PublicPageHeading compact eyebrow={page.eyebrow} title={page.title} description={page.lede} action={{href:groupPath,label:group === "trust" ? "Return home" : `All ${groupLabels[group].toLowerCase()}`}} />
      <PublicSummary title={group === "trust" ? "About the service" : "The details, in one place."} description={page.description} facts={[`Reviewed ${reviewedDate(page.updated)}`,`${page.sections.length} sections`,groupLabels[group]]} />
      <div className={styles.layout}>
        <aside className={styles.toc}><strong>On this page</strong>{page.sections.map((section) => <a key={section.title} href={`#${sectionId(section.title)}`}>{section.title}</a>)}</aside>
        <article className={styles.article}>{page.sections.map((section, index) => <ContentSectionView key={section.title} section={section} index={index} />)}</article>
      </div>
      {related.length > 0 && <section className={styles.related}><div><p className={styles.eyebrow}>Continue the task</p><h2>Related Stoatmod resources</h2><div className={styles.relatedGrid}>{related.map((item) => <a href={item.href} key={item.href}><strong>{item.title}</strong><span>Open resource →</span></a>)}</div></div></section>}
      <section className={styles.cta}><div><p className={styles.eyebrow}>Ready to configure a server?</p><h2>Install Stoatmod, then verify the first outcome.</h2></div><a href={siteConfig.inviteUrl}>Open the official bot profile →</a></section>
      <PublicFooter />
    </main>
  );
}
