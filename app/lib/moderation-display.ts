const policyNames: Record<string, string> = {
  credentials: "Live credentials of your own account",
  "suicidal-thoughts": "Suicidal thoughts",
  "violent-extremism": "Violent extremism",
  hate: "Hate speech",
  "hateful-conduct": "Hateful conduct",
  "self-harm/promotion": "Encouraging or promoting self harm",
  illicit: "Illegal content",
  violence: "Violent or graphic image content",
  "violence/graphic": "Graphic violence",
  "animal-violence": "Animal violence",
  scams: "Financial scams / scams",
  "unsolicited-advertising": "Unsolicited advertising",
  "sexual/minors": "Sexual content involving minors",
  sexual: "Adult sexual content",
};

export function policyName(category: string, label?: string) {
  return policyNames[category] || (label || category)
    .replace(/^(?:stoat\s+tos|support)\s*[-–—:]\s*/i, "")
    .replaceAll("_", " ");
}

export function isSupportOnly(details: Record<string, unknown>) {
  if (details.warning_added === true || details.warning_id) return false;
  if (typeof details.support_only === "boolean") return details.support_only;
  // Older logs have no explicit purpose. Use active labels, never low scores.
  const categories = Array.isArray(details.matched_categories)
    ? details.matched_categories
    : Array.isArray(details.categories)
      ? details.categories
      : details.categories && typeof details.categories === "object"
        ? Object.entries(details.categories).filter(([, active]) => active === true).map(([key]) => key)
        : [];
  return categories.length > 0 && categories.every((category) => category === "credentials" || category === "suicidal-thoughts");
}

export function categoryScores(value: unknown): [string, number][] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return [];
  return Object.entries(value)
    .filter((entry): entry is [string, number] => typeof entry[1] === "number" && Number.isFinite(entry[1]))
    .map(([category, score]): [string, number] => [category, Math.max(0, Math.min(1, score))])
    .sort(([, a], [, b]) => b - a);
}
