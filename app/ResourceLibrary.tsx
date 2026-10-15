"use client";

import { useState } from "react";
import styles from "./ResourceLibrary.module.css";

export function ResourceLibrary({ items, label }: { items: { href: string; title: string; description: string }[]; label: string }) {
  const [query, setQuery] = useState("");
  const filtered = items.filter((item) => `${item.title} ${item.description}`.toLowerCase().includes(query.trim().toLowerCase()));
  return <div>
    <div className={styles.toolbar}>
      <p role="status">{filtered.length} of {items.length} {label}</p>
      <label className={styles.search}><span>Search {label}</span><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Find ${label}…`} /></label>
    </div>
    {filtered.length ? <div className={styles.grid}>{filtered.map((item, index) => <a className={styles.card} href={item.href} key={item.href}><span className={styles.number}>{String(index + 1).padStart(2, "0")}<b aria-hidden="true">↗</b></span><h3>{item.title}</h3><p>{item.description}</p><span className={styles.action}>Read guide <b aria-hidden="true">→</b></span></a>)}</div> : <div className={styles.empty}><h3>No matching {label}</h3><p>Try a different keyword or return to the full collection.</p><button type="button" onClick={() => setQuery("")}>Clear search</button></div>}
  </div>;
}
