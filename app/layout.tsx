import type { Metadata } from "next";
import "./globals.css";
import { ThemeToggle } from "./ThemeToggle";
import { LanguageToggle, SiteTranslator } from "./WebsiteI18n";
import { siteConfig } from "./lib/site-config";
import { themeBootstrap } from "./lib/theme";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.origin),
  applicationName: siteConfig.name,
  title: siteConfig.name + " — moderation for Stoat servers",
  description: siteConfig.description,
  category: "technology",
  // Small icons: the original brand-favicon.png is 2000 px (200 KB) and every browser downloads its icon.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/brand-favicon-192.png", type: "image/png", sizes: "192x192" },
    ],
    shortcut: "/favicon.ico",
    apple: { url: "/apple-touch-icon.png", sizes: "180x180" },
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:themeBootstrap}}/></head><body>{children}<SiteTranslator /><LanguageToggle /><ThemeToggle /></body></html>;
}
