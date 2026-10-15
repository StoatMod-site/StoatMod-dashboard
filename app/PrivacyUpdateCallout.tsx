import { privacyUpdate } from "./lib/privacy-update";
import styles from "./PrivacyUpdate.module.css";

export function PrivacyUpdateCallout({ inset = false }: { inset?: boolean }) {
  return (
    <div className={`${styles.wrap}${inset ? ` ${styles.inset}` : ""}`}>
      <aside className={styles.callout} aria-label="Privacy update">
        <span className={styles.badge}>Privacy update</span>
        <div className={styles.text}>
          <strong>We&apos;ve changed how Stoatmod handles your data.</strong>
          <p>No more outside AI, IP checks or per-person stats, and every piece of data now has a deletion deadline. See exactly what changed, and read our full correspondence with Stoat.</p>
        </div>
        <a className={styles.link} href={privacyUpdate.href}>Read what changed <span aria-hidden="true">→</span></a>
      </aside>
    </div>
  );
}
