/**
 * Server-side translation for localised pages (/fr, /pt, /es). Uses the same dictionaries and matching rules
 * as the browser translator, so a page rendered here reads exactly as it would after translating in the browser.
 * Import only from server components: the dictionaries are large.
 */
import type { ReactNode } from "react";
import fr from "../../public/i18n/fr.json";
import pt from "../../public/i18n/pt.json";
import es from "../../public/i18n/es.json";
import websiteI18nSource from "../WebsiteI18n.tsx?raw";
import { compileDictionary, lookupIn, translateTextIn, type AppLocale, type Dictionary, type Translation } from "./i18n-core";
import { localizeTreeAsync, type LocalizeOptions } from "./localize-tree";
import { localizedPath } from "./locale-routes";

const SOURCES: Record<Exclude<AppLocale, "en">, Record<string, string>> = { fr, pt, es };
const compiled = new Map<AppLocale, Dictionary>();

function dictionary(locale: AppLocale): Dictionary | undefined {
  if (locale === "en") return undefined;
  let found = compiled.get(locale);
  if (!found) {
    found = compileDictionary(SOURCES[locale]);
    compiled.set(locale, found);
  }
  return found;
}

const QUOTED = String.raw`"(?:[^"\\]|\\.)*"`;
const LEGACY_ENTRY = new RegExp(`(${QUOTED})\\s*:\\s*\\{\\s*fr\\s*:\\s*(${QUOTED})\\s*,\\s*pt\\s*:\\s*(${QUOTED})\\s*,\\s*es\\s*:\\s*(${QUOTED})\\s*\\}`, "g");

/** The hand-written entries (`P`) kept in WebsiteI18n.tsx, read from its source so both sides use the same list. */
export function parseLegacyEntries(source: string): Record<string, Translation> {
  const start = source.indexOf("const P: Record<string, Translation> = {");
  const end = source.indexOf("\n};", start);
  const entries: Record<string, Translation> = {};
  if (start < 0 || end < 0) return entries;
  for (const match of source.slice(start, end).matchAll(LEGACY_ENTRY)) {
    entries[JSON.parse(match[1])] = { fr: JSON.parse(match[2]), pt: JSON.parse(match[3]), es: JSON.parse(match[4]) };
  }
  return entries;
}

export const LEGACY: Record<string, Translation> = parseLegacyEntries(websiteI18nSource);

/** Text as the browser translator would show it (one text node or attribute value). */
export function translateText(locale: AppLocale, value: string): string {
  return locale === "en" ? value : translateTextIn(dictionary(locale), LEGACY, locale, value);
}

/** A whole sentence or title; falls back to translating its " | ", " – " and ": " separated parts. */
export function translatePhrase(locale: AppLocale, value: string): string {
  if (locale === "en") return value;
  const whole = lookupIn(dictionary(locale), LEGACY, locale, value.replace(/\s+/g, " ").trim());
  if (whole !== null) return whole;
  return value.split(/( \| | – |: )/).map((part, index) => (index % 2 ? part : translateText(locale, part))).join("");
}

export function localizeOptions(locale: AppLocale): LocalizeOptions {
  return {
    text: (value) => translateText(locale, value),
    href: (value) => (value.startsWith("/") ? localizedPath(value, locale) : value),
    inline: () => true,
  };
}

/** Renders the page's server components and localises the result. English pages are returned untouched. */
export async function localizePage(node: ReactNode, locale: AppLocale): Promise<ReactNode> {
  return locale === "en" ? node : localizeTreeAsync(node, localizeOptions(locale));
}

/**
 * The dictionary entries a client component needs, chosen by searching its source for each entry's text.
 * Passed as props so the server render and the browser's hydration translate identically.
 */
export function clientMessages(locale: AppLocale, sources: string[]): Record<string, string> {
  if (locale === "en") return {};
  const haystack = sources.join("\n");
  const messages: Record<string, string> = {};
  for (const [key, value] of Object.entries(SOURCES[locale])) {
    const chunks = key.split(/\{=?\d+\}/).map((chunk) => chunk.trim()).filter((chunk) => chunk.length >= 3);
    const wanted = /\{=?\d+\}/.test(key) ? chunks.length > 0 && chunks.every((chunk) => haystack.includes(chunk)) : haystack.includes(key);
    if (wanted) messages[key] = value;
  }
  for (const [key, value] of Object.entries(LEGACY)) {
    if (!(key in messages) && haystack.includes(key)) messages[key] = value[locale];
  }
  return messages;
}
