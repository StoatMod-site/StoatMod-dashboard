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
  icons: {
    icon: "/brand-favicon.png",
    shortcut: "/brand-favicon.png",
    apple: "/brand-favicon.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:themeBootstrap}}/></head><body>{children}<SiteTranslator /><LanguageToggle /><ThemeToggle /></body></html>;
}
