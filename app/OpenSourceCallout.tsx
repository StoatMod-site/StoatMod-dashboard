import { siteConfig } from "./lib/site-config";
import styles from "./OpenSourceCallout.module.css";

export function OpenSourceCallout({ inset = false }: { inset?: boolean }) {
  return (
    <div className={`${styles.wrap}${inset ? ` ${styles.inset}` : ""}`}>
      <aside className={styles.callout} aria-label="Open source">
        <div className={styles.text}>
          <strong>Stoatmod is open source.</strong>
          <p>Read the code and find self-hosting instructions in our GitHub repositories.</p>
        </div>
        <nav className={styles.links} aria-label="Source repositories">
          <a href={siteConfig.botSourceUrl}>Bot and API source <span aria-hidden="true">↗</span></a>
          <a href={siteConfig.websiteSourceUrl}>Website and dashboard source <span aria-hidden="true">↗</span></a>
        </nav>
      </aside>
    </div>
  );
}
