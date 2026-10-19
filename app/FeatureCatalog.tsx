"use client";

import { useState } from "react";
import { FeatureIcon } from "./FeatureIcon";
import { featureGroups, type FeatureGroup, type FeatureProfile } from "./content/feature-library";
import styles from "./FeaturePages.module.css";

export function FeatureCatalog({ features }: { features: (FeatureProfile & { slug: string })[] }) {
  const [group, setGroup] = useState<FeatureGroup | "All features">("All features");
  const [query, setQuery] = useState("");
  const search = query.trim().toLowerCase();
  const filtered = features.filter((feature) => (group === "All features" || feature.group === group)
    && `${feature.name} ${feature.group} ${feature.summary} ${feature.benefits.join(" ")}`.toLowerCase().includes(search));
  return <section className={styles.catalog} id="feature-library" aria-labelledby="catalog-title">
    <header className={styles.sectionHeading}><div><p className={styles.eyebrow}>Find your next tool</p><h2 id="catalog-title">Built around your community.</h2></div><p>Choose a feature to see how it works, what you control and how to get started.</p></header>
    <div className={styles.catalogControls}>
      <div className={styles.filters} aria-label="Feature categories">{(["All features", ...featureGroups] as const).map((name) => <button type="button" key={name} aria-pressed={group === name} onClick={() => setGroup(name)}>{name}<span>{name === "All features" ? features.length : features.filter((feature) => feature.group === name).length}</span></button>)}</div>
      <label className={styles.search}><svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="10" cy="10" r="6"/><path d="m15 15 6 6"/></svg><span className={styles.srOnly}>Search features</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Find a feature…"/></label>
    </div>
    <p className={styles.resultCount} role="status" aria-live="polite">{filtered.length} {filtered.length === 1 ? "feature" : "features"}{search ? ` matching “${query.trim()}”` : group === "All features" ? " to explore" : ` in ${group.toLowerCase()}`}</p>
    {filtered.length ? <div className={styles.cardGrid}>{filtered.map((feature) => <a className={styles.featureCard} href={`/features/${feature.slug}`} key={feature.slug}>
      <div className={styles.cardTop}><span className={styles.featureGlyph}><FeatureIcon name={feature.slug}/></span><span>{feature.group}</span><span className={styles.cardArrow} aria-hidden="true">↗</span></div>
      <h3>{feature.name}</h3><p>{feature.summary}</p><div className={styles.cardBottom}><span>{feature.facts[0].value}</span><strong>Explore feature <span aria-hidden="true">→</span></strong></div>
    </a>)}</div> : <div className={styles.empty}><h3>No features found</h3><p>Try a different search or browse the full feature library.</p><button type="button" onClick={() => { setQuery(""); setGroup("All features"); }}>Clear filters</button></div>}
  </section>;
}
