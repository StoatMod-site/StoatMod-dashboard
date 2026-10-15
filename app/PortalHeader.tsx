/* eslint-disable @next/next/no-html-link-for-pages -- Use normal browser navigation for public pages. */
import styles from "./PrivateForms.module.css";

export function PortalHeader() {
  return <header className={styles.header}><a className={styles.brand} href="/" aria-label="Stoatmod home"><img src="/brand-mark.png" alt="" width="36" height="36" /><strong>Stoatmod</strong></a><a className={styles.back} href="/">Back to website <span aria-hidden="true">↗</span></a></header>;
}
