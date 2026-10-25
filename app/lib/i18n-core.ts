/**
 * Translation matching shared by the browser translator (WebsiteI18n) and server-rendered localised pages.
 * Both must translate a piece of text identically, so the rules live here once.
 */
export type AppLocale = "en" | "fr" | "pt" | "es";
export type Translation = { fr: string; pt: string; es: string };
export type PatternEntry = { regex: RegExp; target: string };
export type Dictionary = { exact: Map<string, string>; patterns: PatternEntry[] };
type Translated = "fr" | "pt" | "es";

export function compileDictionary(entries: Record<string, string>): Dictionary {
  const exact = new Map<string, string>();
  const patterns: PatternEntry[] = [];
  for (const [source, target] of Object.entries(entries)) {
    if (!/\{=?\d+\}/.test(source)) { exact.set(source, target); continue; }
    const body = source.split(/(\{=?\d+\})/).map((part) => /^\{=?\d+\}$/.test(part) ? "([\\s\\S]+?)" : part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("");
    patterns.push({ regex: new RegExp(`^${body}$`), target: target });
  }
  patterns.sort((a, b) => b.regex.source.length - a.regex.source.length);
  return { exact, patterns };
}

/** Looks text up in one language: the compiled dictionary first, then the hand-written `legacy` entries, then patterns. */
export function lookupIn(dictionary: Dictionary | undefined, legacy: Record<string, Translation>, locale: AppLocale, source: string, depth = 0): string | null {
  const hit = dictionary?.exact.get(source);
  if (hit !== undefined) return hit;
  const old = legacy[source]?.[locale as Translated];
  if (old) return old;
  if (dictionary && depth < 3) {
    for (const entry of dictionary.patterns) {
      const translated = applyPattern(dictionary, legacy, locale, entry, source, depth);
      if (translated !== null) return translated;
    }
    // "Protection / Automod" or "Reasons · Notes · Evidence": translate only when every segment is known.
    if (/ [/·] /.test(source)) {
      let complete = true;
      const joined = source.split(/( [/·] )/).map((part, index) => {
        if (index % 2) return part;
        const found = lookupIn(dictionary, legacy, locale, part, depth + 1);
        if (found === null && /[A-Za-z]{2}/.test(part)) complete = false;
        return found ?? part;
      }).join("");
      if (complete) return joined;
    }
  }
  return null;
}

/** Translates a pattern placeholder: the whole value if known, otherwise each "A / B", "A · B" or "A, B" segment on its own. */
function translateCapture(dictionary: Dictionary, legacy: Record<string, Translation>, locale: AppLocale, value: string, depth: number): string {
  const whole = lookupIn(dictionary, legacy, locale, value, depth + 1);
  if (whole !== null) return whole;
  if (depth > 2 || !/ [/·] |, /.test(value)) return value;
  return value.split(/( [/·] |, )/).map((part, index) => (index % 2 ? part : lookupIn(dictionary, legacy, locale, part, depth + 1) ?? part)).join("");
}

function applyPattern(dictionary: Dictionary, legacy: Record<string, Translation>, locale: AppLocale, entry: PatternEntry, source: string, depth: number): string | null {
  const match = entry.regex.exec(source);
  if (!match) return null;
  // {=0} placeholders carry user-supplied text (a server name, a tag) and are inserted verbatim.
  return entry.target.replace(/\{(=?)(\d+)\}/g, (_whole, verbatim: string, index: string) => { const value = match[Number(index) + 1] ?? ""; return verbatim ? value : translateCapture(dictionary, legacy, locale, value, depth); });
}

/* Dates are formatted in English by the pages (for example "3 Oct 2026" or "04 Oct, 14:05"); month names are localised here. */
const MONTH_KEYS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const MONTHS: Record<Translated, { long: string[]; short: string[] }> = {
  fr: { long: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"], short: ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."] },
  pt: { long: ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"], short: ["jan.", "fev.", "mar.", "abr.", "mai.", "jun.", "jul.", "ago.", "set.", "out.", "nov.", "dez."] },
  es: { long: ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"], short: ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"] },
};
const DATE_PATTERN = /\b(\d{1,2}) (Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\b(?: (\d{4})\b)?/g;

function localizeDates(locale: Translated, text: string): string {
  if (!/\d (?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/.test(text)) return text;
  return text.replace(DATE_PATTERN, (_whole, day: string, month: string, year: string | undefined) => {
    const index = MONTH_KEYS.indexOf(month.slice(0, 3).toLowerCase());
    if (index < 0) return _whole;
    const long = month.length > 3 && !(month === "Sept");
    const names = MONTHS[locale];
    const name = long ? names.long[index] : names.short[index];
    const joiner = locale === "fr" || !long ? " " : " de ";
    const yearJoiner = locale === "fr" || !long ? " " : " de ";
    return `${day}${joiner}${name}${year ? yearJoiner + year : ""}`;
  });
}

const UNITS: Record<Translated, { sec: string; min: string; hr: string; days: string; day: string }> = {
  fr: { sec: "s", min: "min", hr: "h", days: "jours", day: "jour" },
  pt: { sec: "s", min: "min", hr: "h", days: "dias", day: "dia" },
  es: { sec: "s", min: "min", hr: "h", days: "días", day: "día" },
};

/** Durations such as "2 hr 5 min" or "3 days 4 hr" are built by the pages in English. */
function localizeDurations(locale: Translated, text: string): string {
  if (!/\d (?:sec|min|hr|days?)\b/.test(text)) return text;
  const units = UNITS[locale];
  return text.replace(/(<?\d+) (sec|min|hr|days?)\b/g, (_whole, amount: string, unit: string) => {
    if (unit === "sec") return `${amount} ${units.sec}`;
    if (unit === "min") return `${amount} ${units.min}`;
    if (unit === "hr") return `${amount} ${units.hr}`;
    return `${amount} ${amount === "1" ? units.day : units.days}`;
  });
}

function finishText(locale: Translated, text: string): string { return localizeDurations(locale, localizeDates(locale, text)); }

/** One text node (or attribute value) as the browser translator would show it. */
export function translateTextIn(dictionary: Dictionary | undefined, legacy: Record<string, Translation>, locale: AppLocale, source: string): string {
  if (locale === "en") return source;
  const lookup = (value: string) => lookupIn(dictionary, legacy, locale, value);
  const normalized = source.replace(/\s+/g, " ");
  const direct = lookup(normalized);
  if (direct !== null) return finishText(locale, direct);
  // Sentence fragments often carry leading or trailing punctuation from the surrounding markup (". Membership totals…").
  const leading = /^[\s.,;:·•—–|/-]+/.exec(normalized)?.[0] ?? "";
  if (leading && leading.length < normalized.length) {
    const inner = lookup(normalized.slice(leading.length));
    if (inner !== null) return finishText(locale, leading + inner);
  }
  const edges = /^([\s.,;:·•—–|/-]*)([\s\S]*?)([\s.,;:·•—–|/-]*)$/.exec(normalized);
  if (edges && (edges[1] || edges[3]) && edges[2]) {
    const inner = lookup(edges[2]);
    if (inner !== null) return finishText(locale, edges[1] + inner + edges[3]);
  }
  return finishText(locale, source);
}
