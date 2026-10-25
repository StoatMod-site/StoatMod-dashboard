import { notFound } from "next/navigation";
import type { AppLocale } from "../../lib/i18n-core";
import { pageLanguage } from "./localize";
import { Breadcrumbs } from "../../Breadcrumbs";
import { JsonLd } from "../../JsonLd";
import { PublicFooter } from "../../PublicFooter";
import { SiteNav } from "../../SiteNav";
import { CATEGORY_INDEX_MINIMUM, discoveryCategories, exampleNames, findCategory, serversInCategory } from "../../lib/discovery-catalog";
import { getRequiredPublicDiscovery } from "../../lib/public-data.server";
import { breadcrumbSchema, organizationSchema, websiteSchema } from "../../lib/schema";
import { discoveryOgImage, discoveryOgPath, imageObject } from "../../lib/discovery-seo";
import { buildMetadata } from "../../lib/seo";
import { absoluteUrl, siteConfig } from "../../lib/site-config";
import { AdvertiseBand, DiscoveryNav, SectionHeading, ServerGrid, SubHero, serverPath } from "../DiscoveryUI";
import styles from "../Discovery.module.css";

export async function categoryMetadata(locale: AppLocale, { params }: { params: Promise<{ slug: string }> }) {
  const language = pageLanguage(locale);
  const { slug } = await params;
  const category = findCategory(slug);
  if (!category) {
    return buildMetadata({ title: language.phrase("Category not found | Stoatmod Discovery"), description: language.phrase("This Discovery category does not exist."), path: "/discovery/categories", index: false, locale });
  }
  const servers = serversInCategory(await getRequiredPublicDiscovery(), category);
  // Translated in parts: the category text and the count sentence are separate dictionary entries.
  const count = servers.length === 1 ? `1 reviewed server, including ${exampleNames(servers)}.` : `${servers.length} reviewed servers, including ${exampleNames(servers)}.`;
  return buildMetadata({
    title: language.phrase(`${category.title} | Stoatmod Discovery`),
    description: servers.length ? `${language.phrase(category.description)} ${language.text(count)}` : language.phrase(category.description),
    path: "/discovery/categories/" + category.slug,
    index: servers.length >= CATEGORY_INDEX_MINIMUM,
    locale,
    ...discoveryOgImage("category-" + category.slug, language.phrase(`${category.title} – Stoatmod Discovery`)),
  });
}

export async function CategoryView(locale: AppLocale, { params }: { params: Promise<{ slug: string }> }) {
  const language = pageLanguage(locale);
  const { slug } = await params;
  const category = findCategory(slug);
  if (!category) notFound();
  const all = await getRequiredPublicDiscovery();
  const servers = serversInCategory(all, category);
  const path = "/discovery/categories/" + category.slug;
  const others = discoveryCategories.filter((other) => other.slug !== category.slug).map((other) => ({ other, count: serversInCategory(all, other).length })).filter(({ count }) => count > 0);
  const breadcrumbs = [
    { name: siteConfig.name, path: "/" },
    { name: "Discovery", path: "/discovery" },
    { name: "Categories", path: "/discovery/categories" },
    { name: category.name, path },
  ];
  return language.render(
    <main className={styles.page} lang={language.lang}>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@graph": [
          organizationSchema(),
          websiteSchema(),
          {
            "@type": "CollectionPage", "@id": language.url(path) + "#page", url: language.url(path), name: language.phrase(category.title), description: language.phrase(category.description), inLanguage: locale, primaryImageOfPage: imageObject(discoveryOgPath("category-" + category.slug)),
            isPartOf: { "@id": siteConfig.origin + "/#website" },
            mainEntity: { "@type": "ItemList", itemListElement: servers.map((server, index) => ({ "@type": "ListItem", position: index + 1, name: server.server_name, url: language.url(serverPath(server)) })) },
          },
          breadcrumbSchema(language.breadcrumbs(breadcrumbs)),
        ],
      }} />
      <SiteNav active="discovery" />
      <SubHero eyebrow={`${category.emoji} Category · ${servers.length === 1 ? "1 server" : `${servers.length} servers`}`} title={category.title} description={category.intro} />
      <DiscoveryNav active="categories" />
      <Breadcrumbs items={breadcrumbs} />
      <section className={`${styles.section} ${styles.sectionTight}`} aria-labelledby="category-servers">
        <h2 id="category-servers" className="sr-only">{category.title}</h2>
        <ServerGrid servers={servers} empty={`No ${category.name.toLowerCase()} servers are listed yet. Run a ${category.name.toLowerCase()} community? List it for free and be the first.`} />
      </section>
      {others.length > 0 && <section className={styles.section} aria-labelledby="other-categories">
        <SectionHeading eyebrow="More topics" title="Other categories" />
        <div className={styles.tagRow}>{others.map(({ other, count }) => <a href={"/discovery/categories/" + other.slug} key={other.slug}>{other.emoji} {other.name} · {count}</a>)}</div>
      </section>}
      <AdvertiseBand compact />
      <div className={styles.spacer} />
      <PublicFooter />
    </main>
  );
}
