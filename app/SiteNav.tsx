/* eslint-disable @next/next/no-html-link-for-pages */
export function SiteNav({ active }: { active?: "home" | "features" | "guides" | "discovery" | "docs" | "appeal" | "privacy" | "status" | "login" }) {
  return (
    <header className="site-nav">
      <a className="site-logo" href="/" aria-label="Stoatmod home">
        <img src="/brand-mark.png" alt="" width="40" height="40" />
        <strong>Stoatmod</strong>
      </a>
      <nav aria-label="Main navigation">
        <a className={active === "home" ? "active" : ""} href="/">Home</a>
        <a className={active === "features" ? "active" : ""} href="/features">Features</a>
        <a className={active === "guides" ? "active" : ""} href="/guides">Guides</a>
        <a className={active === "discovery" ? "active" : ""} href="/discovery">Discovery</a>
        <a className={active === "docs" ? "active" : ""} href="/docs">Documentation</a>
        <a className={active === "status" ? "active" : ""} href="/status">Status</a>
        <a className={active === "appeal" ? "active" : ""} href="/appeal">Appeal</a>
      </nav>
      <a className="nav-login" href="/login">Moderator login <span aria-hidden="true">→</span></a>
    </header>
  );
}
