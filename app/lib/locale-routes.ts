import type { AppLocale } from "./i18n-core";

/** Languages with server-rendered pages. English pages live at the plain path; the others under /<locale>. */
export const LOCALIZED_LOCALES = ["fr", "pt", "es"] as const;
export type LocalizedLocale = (typeof LOCALIZED_LOCALES)[number];
export const PAGE_LOCALES: AppLocale[] = ["en", ...LOCALIZED_LOCALES];

/** Open Graph locale for each language (the Portuguese dictionary is written in European Portuguese). */
export const OG_LOCALES: Record<AppLocale, string> = { en: "en_GB", fr: "fr_FR", pt: "pt_PT", es: "es_ES" };

// Only Discovery has localised pages so far.
const LOCALIZABLE = /^\/discovery(?:\/|$)/;
const LOCALIZED = /^\/(fr|pt|es)(\/discovery(?:\/.*)?)$/;

/** The language a URL path is published in, or null for paths without localised versions. */
export function localeFromPathname(pathname: string): AppLocale | null {
  const match = LOCALIZED.exec(pathname);
  if (match) return match[1] as AppLocale;
  return LOCALIZABLE.test(pathname) ? "en" : null;
}

/** The same page in `locale`: "/discovery/top" becomes "/pt/discovery/top". Other paths are returned unchanged. */
export function localizedPath(path: string, locale: AppLocale): string {
  const [pathname, rest = ""] = splitSuffix(path);
  const base = LOCALIZED.exec(pathname)?.[2] ?? pathname;
  if (!LOCALIZABLE.test(base)) return path;
  return (locale === "en" ? base : `/${locale}${base}`) + rest;
}

/** hreflang alternates for a localisable path, including x-default (English). */
export function languageAlternates(path: string, absolute: (path: string) => string): Record<string, string> {
  const alternates: Record<string, string> = {};
  for (const locale of PAGE_LOCALES) alternates[locale] = absolute(localizedPath(path, locale));
  alternates["x-default"] = absolute(localizedPath(path, "en"));
  return alternates;
}

function splitSuffix(path: string): [string, string] {
  const index = path.search(/[?#]/);
  return index < 0 ? [path, ""] : [path.slice(0, index), path.slice(index)];
}
