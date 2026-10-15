import type { ReactNode } from "react";
import styles from "./PublicPageHeading.module.css";

type Action = { href: string; label: string };

export function PublicPageHeading({ eyebrow, title, description, action, compact = false, inset = false }: {
  eyebrow: string; title: ReactNode; description: ReactNode; action?: Action; compact?: boolean; inset?: boolean;
}) {
  return <header className={`${styles.heading} ${compact ? styles.compact : ""} ${inset ? styles.inset : ""}`}>
    <div><p className={styles.eyebrow}><span aria-hidden="true" />Stoatmod / {eyebrow}</p><h1>{title}</h1><p className={styles.intro}>{description}</p></div>
    {action && <a className={styles.action} href={action.href}>{action.label}<span aria-hidden="true">↗</span></a>}
  </header>;
}

export function PublicSummary({ title, description, facts = [], action, icon, inset = false }: {
  title: string; description: ReactNode; facts?: string[]; action?: Action; icon?: ReactNode; inset?: boolean;
}) {
  return <div className={`${styles.summaryWrap} ${inset ? styles.inset : ""}`}><section className={styles.summary} aria-label={title}>
    <div className={styles.summaryTop}><span className={styles.symbol} aria-hidden="true">{icon || <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="6" y="10" width="12" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v2"/></svg>}</span><div className={styles.summaryText}><h2>{title}</h2><p>{description}</p></div>{action && <a className={styles.summaryAction} href={action.href}>{action.label}<span aria-hidden="true">→</span></a>}</div>
    {facts.length > 0 && <ul className={styles.facts}>{facts.map((fact) => <li key={fact}><span aria-hidden="true">·</span>{fact}</li>)}</ul>}
  </section></div>;
}
