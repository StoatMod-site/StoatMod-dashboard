import type { ReactNode } from "react";
import styles from "./AccessLayout.module.css";
import { SiteNav } from "./SiteNav";
import { PublicFooter } from "./PublicFooter";
import { PublicPageHeading, PublicSummary } from "./PublicPageHeading";

export function AccessLayout({ eyebrow, title, accent, description, steps, children, utility }: {
  eyebrow: string; title: string; accent: string; description: string;
  steps: { title: string; text: string }[]; children: ReactNode; utility?: ReactNode;
}) {
  return <main className={styles.page}>
    <SiteNav />
    <PublicPageHeading eyebrow={eyebrow} title={eyebrow === "Moderator access" ? "Moderator login." : eyebrow === "Staff operations" ? "Staff login." : "Owner login."} description={description} action={{href:"/status",label:"Service status"}} />
    <PublicSummary title={`${title} ${accent}`} description="Continue with the credentials for this access level. Your account determines which servers and tools you can open." facts={["Private account access","Role-based permissions","Secure sign-in"]} />
    <div className={styles.layout}>
      <section className={styles.access}><div className={styles.panel}>{children}</div>{utility && <div className={styles.utility}>{utility}</div>}<nav className={styles.help} aria-label="Access help"><a href="/privacy">Privacy</a><a href="/docs">Documentation</a><a href="/status">Service status <span aria-hidden="true">↗</span></a></nav></section>
      <aside className={styles.intro}><p className={styles.eyebrow}>Before you continue</p><h2>Getting access</h2><ol className={styles.steps}>{steps.map((step, index) => <li key={step.title}><span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span><div><strong>{step.title}</strong><p>{step.text}</p></div></li>)}</ol><p className={styles.lede}>Keep your credentials private. If you need help, use the <a href="/docs/dashboard">dashboard access guide</a>.</p></aside>
    </div>
    <PublicFooter />
  </main>;
}
