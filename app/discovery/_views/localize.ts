import type { ReactNode } from "react";
import type { AppLocale } from "../../lib/i18n-core";
import { localizePage, translatePhrase, translateText } from "../../lib/i18n-server";
import { localizedPath } from "../../lib/locale-routes";
import type { BreadcrumbItem } from "../../lib/schema";
import { absoluteUrl } from "../../lib/site-config";

/** Everything a Discovery page needs to publish itself in one language. */
export function pageLanguage(locale: AppLocale) {
  return {
    locale,
    /** `lang` for the page's <main> (the root layout is shared by every language). */
    lang: locale === "en" ? undefined : locale,
    /** One piece of interface text. */
    text: (value: string) => translateText(locale, value),
    /** A title or sentence, translated whole or by its parts. */
    phrase: (value: string) => translatePhrase(locale, value),
    /** The page's URL in this language. */
    path: (path: string) => localizedPath(path, locale),
    url: (path: string) => absoluteUrl(localizedPath(path, locale)),
    breadcrumbs: (items: BreadcrumbItem[]) => items.map((item) => ({ name: translateText(locale, item.name), path: localizedPath(item.path, locale) })),
    /** Renders and localises the page tree (no-op for English). */
    render: (page: ReactNode) => localizePage(page, locale),
  };
}

export type PageLanguage = ReturnType<typeof pageLanguage>;
