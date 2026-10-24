import type { DiscoveryServer } from "./public-types";

// Words that are common in one language and rare in the others (and in English).
const LANGUAGE_MARKERS: Record<string, string[]> = {
  pt: ["você", "voce", "não", "nao", "com", "para", "uma", "seu", "sua", "servidor", "bem-vindo", "bem-vinda", "jogar", "amigos", "também", "aqui", "conversar", "comunidade", "brasileiro", "brasileira", "pra"],
  es: ["el", "los", "las", "para", "con", "una", "tu", "servidor", "bienvenido", "bienvenidos", "jugar", "amigos", "también", "aquí", "comunidad", "español", "nosotros"],
  fr: ["le", "les", "des", "et", "vous", "votre", "une", "pour", "avec", "rejoignez", "bienvenue", "communauté", "jeux", "serveur", "nous", "francophone", "à"],
  de: ["der", "die", "das", "und", "ist", "mit", "für", "ein", "eine", "willkommen", "spielen", "wir", "nicht", "deutsch"],
  it: ["il", "gli", "della", "per", "con", "una", "benvenuto", "giocare", "siamo", "comunità", "italiano"],
};
const ENGLISH_MARKERS = ["the", "and", "you", "your", "with", "for", "our", "welcome", "community", "server", "is", "are", "we", "to", "of"];

function markerScore(words: string[], markers: string[]) {
  const set = new Set(markers);
  return words.reduce((total, word) => total + (set.has(word) ? 1 : 0), 0);
}

/**
 * The language a listing is written in: the owner's choice, or a confident guess from its description
 * (most owners leave it blank). Used for `lang` on the owner's text and `inLanguage` in structured data.
 */
export function listingLanguage(server: Pick<DiscoveryServer, "language" | "description" | "information" | "server_name">): string {
  if (server.language && server.language !== "other") return server.language;
  const words = `${server.description} ${server.information || ""}`.toLowerCase().normalize("NFC").split(/[^\p{L}-]+/u).filter(Boolean);
  if (words.length < 6) return "";
  const english = markerScore(words, ENGLISH_MARKERS);
  const ranked = Object.entries(LANGUAGE_MARKERS).map(([code, markers]) => [code, markerScore(words, markers)] as const).sort((a, b) => b[1] - a[1]);
  const [best, second] = ranked;
  if (best[1] >= 3 && best[1] >= english * 1.5 && best[1] >= second[1] + 2) return best[0];
  if (english >= 3) return "en";
  return "";
}
