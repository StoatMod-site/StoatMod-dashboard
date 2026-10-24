import { siteConfig } from "./lib/site-config";
import styles from "./PublicFooter.module.css";

export function PublicFooter({ description }: { description?: string }) {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.identity}>
          <a className={styles.brand} href="/" aria-label="Stoatmod home">
            <img src="/brand-mark-88.png" alt="" width="44" height="44" loading="lazy" decoding="async" />
            <strong>{siteConfig.name}</strong>
          </a>
          {description && <p>{description}</p>}
        </div>
        <nav className={styles.navigation} aria-label="Footer navigation">
          <div className={styles.group}>
            <h2>Explore</h2>
            <a href="/features">Features</a>
            <a href="/docs">Documentation</a>
            <a href="/guides">Guides</a>
            <a href="/discovery">Stoat servers</a>
            <a href="/discovery/advertise">Advertise a server</a>
            <a href="/compare">Compare bots</a>
          </div>
          <div className={styles.group}>
            <h2>Resources</h2>
            <a href="/status">Status</a>
            <a href="/changelog">Changelog</a>
            <a href={siteConfig.githubUrl}>GitHub <span aria-hidden="true">↗</span></a>
            <a href={siteConfig.supportUrl}>Support <span aria-hidden="true">↗</span></a>
          </div>
          <div className={styles.group}>
            <h2>Stoatmod</h2>
            <a href="/about">About</a>
            <a href="/security">Security</a>
            <a href="/privacy">Privacy</a>
          </div>
        </nav>
      </div>
    </footer>
  );
}
