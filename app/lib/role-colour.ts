// Role colours for the dashboard's Roles tab. Stoat accepts a CSS colour or gradient string
// of at most 128 characters; the rules below match `validate_role_colour` in
// website/role_manager.py (both are tested against tests/fixtures/role-colours.json), and the
// server re-validates everything it receives.

export const MAX_COLOUR_LENGTH = 128;
export const MAX_GRADIENT_STOPS = 20; // a sanity cap; the 128 character limit is what really bounds a gradient

export type GradientKind = "linear" | "radial" | "conic";
export type GradientStop = { colour: string; position: number | null };
export type ColourModel =
  | { mode: "none" }
  | { mode: "solid"; colour: string }
  | { mode: "gradient"; kind: GradientKind; angle: number; stops: GradientStop[] }
  | { mode: "custom"; css: string };
export type ColourResult = { ok: true; value: string } | { ok: false; error: string };
export type TextStyle = {
  color?: string;
  backgroundImage?: string;
  WebkitBackgroundClip?: "text";
  backgroundClip?: "text";
};

// Single words, so the translation audit does not mistake the list for prose.
const NAMED = new Set([
  "aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque", "black", "blanchedalmond",
  "blue", "blueviolet", "brown", "burlywood", "cadetblue", "chartreuse", "chocolate", "coral",
  "cornflowerblue", "cornsilk", "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod", "darkgray",
  "darkgreen", "darkgrey", "darkkhaki", "darkmagenta", "darkolivegreen", "darkorange", "darkorchid",
  "darkred", "darksalmon", "darkseagreen", "darkslateblue", "darkslategray", "darkslategrey",
  "darkturquoise", "darkviolet", "deeppink", "deepskyblue", "dimgray", "dimgrey", "dodgerblue", "firebrick",
  "floralwhite", "forestgreen", "fuchsia", "gainsboro", "ghostwhite", "gold", "goldenrod", "gray", "green",
  "greenyellow", "grey", "honeydew", "hotpink", "indianred", "indigo", "ivory", "khaki", "lavender",
  "lavenderblush", "lawngreen", "lemonchiffon", "lightblue", "lightcoral", "lightcyan",
  "lightgoldenrodyellow", "lightgray", "lightgreen", "lightgrey", "lightpink", "lightsalmon",
  "lightseagreen", "lightskyblue", "lightslategray", "lightslategrey", "lightsteelblue", "lightyellow",
  "lime", "limegreen", "linen", "magenta", "maroon", "mediumaquamarine", "mediumblue", "mediumorchid",
  "mediumpurple", "mediumseagreen", "mediumslateblue", "mediumspringgreen", "mediumturquoise",
  "mediumvioletred", "midnightblue", "mintcream", "mistyrose", "moccasin", "navajowhite", "navy", "oldlace",
  "olive", "olivedrab", "orange", "orangered", "orchid", "palegoldenrod", "palegreen", "paleturquoise",
  "palevioletred", "papayawhip", "peachpuff", "peru", "pink", "plum", "powderblue", "purple",
  "rebeccapurple", "red", "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen",
  "seashell", "sienna", "silver", "skyblue", "slateblue", "slategray", "slategrey", "snow", "springgreen",
  "steelblue", "tan", "teal", "thistle", "tomato", "turquoise", "violet", "wheat", "white", "whitesmoke",
  "yellow", "yellowgreen",
]);
const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i;
const RGB = /^(rgba?)\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([01])\s*)?\)$/i;
const VAR = /^var\(--[a-z0-9-]{1,40}\)$/i;
const ANGLE = /^(\d{1,3})deg$/i;
const DIRECTION = /^to (top|bottom|left|right)(?: (top|bottom|left|right))?$/i;
const STOP = /^([\s\S]+?)(?:\s+(\d{1,3}%|0))?$/;
const GENERIC_ERROR = "Use a colour like #7c3aed, a CSS colour name, or a linear, radial or conic gradient of two or more colours.";

class ColourError extends Error {}

function term(text: string): string {
  const value = text.trim();
  if (HEX.test(value)) return value.toLowerCase();
  const rgb = RGB.exec(value);
  if (rgb) {
    const channels = [rgb[2], rgb[3], rgb[4]].map(Number);
    if (channels.some((channel) => channel > 255)) throw new ColourError("Colour channels go from 0 to 255.");
    if (rgb[1].toLowerCase() === "rgb" && rgb[5] !== undefined) throw new ColourError(GENERIC_ERROR);
    return `${rgb[1].toLowerCase()}(${channels.join(", ")}${rgb[5] !== undefined ? `, ${rgb[5]}` : ""})`;
  }
  if (VAR.test(value)) return value.toLowerCase();
  if (NAMED.has(value.toLowerCase())) return value.toLowerCase();
  throw new ColourError(GENERIC_ERROR);
}

function splitArguments(text: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let start = 0;
  for (let index = 0; index < text.length; index += 1) {
    const character = text[index];
    if (character === "(") depth += 1;
    else if (character === ")") {
      depth -= 1;
      if (depth < 0) throw new ColourError(GENERIC_ERROR);
    } else if (character === "," && depth === 0) {
      parts.push(text.slice(start, index));
      start = index + 1;
    }
  }
  if (depth) throw new ColourError(GENERIC_ERROR);
  parts.push(text.slice(start));
  return parts;
}

export function canonicalColour(input: string): ColourResult {
  try {
    const text = input.trim();
    if (!text || text.length > 400) throw new ColourError(GENERIC_ERROR);
    const gradient = /^(linear|radial|conic)-gradient\(([\s\S]*)\)$/i.exec(text);
    let result: string;
    if (!gradient) result = term(text);
    else {
      const kind = gradient[1].toLowerCase();
      let args = splitArguments(gradient[2]).map((part) => part.trim());
      let prefix = "";
      if (kind === "linear" && args.length) {
        const angle = ANGLE.exec(args[0]);
        const direction = DIRECTION.exec(args[0]);
        if (angle) {
          if (Number(angle[1]) > 360) throw new ColourError("A gradient angle goes from 0 to 360 degrees.");
          prefix = `${Number(angle[1])}deg`;
        } else if (direction) {
          prefix = ["to", ...direction.slice(1).filter(Boolean).map((side) => side.toLowerCase())].join(" ");
        }
        if (prefix) args = args.slice(1);
      }
      if (args.length < 2 || args.length > MAX_GRADIENT_STOPS) throw new ColourError(GENERIC_ERROR);
      const stops = args.map((argument) => {
        const stop = STOP.exec(argument);
        if (!stop) throw new ColourError(GENERIC_ERROR);
        const colour = term(stop[1]);
        const position = stop[2];
        if (position && position !== "0" && Number(position.slice(0, -1)) > 100) throw new ColourError("A gradient stop goes from 0% to 100%.");
        return position ? `${colour} ${position}` : colour;
      });
      const parts = [...(prefix ? [prefix] : []), ...stops];
      result = `${kind}-gradient(${parts.join(", ")})`;
      if (result.length > MAX_COLOUR_LENGTH) {
        // Stoat allows no space after the commas, which saves a few characters.
        const compact = `${kind}-gradient(${parts.join(",")})`;
        if (compact.length <= MAX_COLOUR_LENGTH) result = compact;
      }
    }
    if (result.length > MAX_COLOUR_LENGTH) throw new ColourError(`A role colour can be at most ${MAX_COLOUR_LENGTH} characters. Use fewer gradient stops.`);
    return { ok: true, value: result };
  } catch (error) {
    if (error instanceof ColourError) return { ok: false, error: error.message };
    throw error;
  }
}

const DIRECTION_ANGLES: Record<string, number> = {
  "to top": 0, "to top right": 45, "to right": 90, "to bottom right": 135, "to bottom": 180,
  "to bottom left": 225, "to left": 270, "to top left": 315,
};

export function parseColour(css: string | null | undefined): ColourModel {
  if (!css) return { mode: "none" };
  const canonical = canonicalColour(css);
  if (!canonical.ok) return { mode: "custom", css };
  const value = canonical.value;
  if (/^#[0-9a-f]{6}$/.test(value)) return { mode: "solid", colour: value };
  const gradient = /^(linear|radial|conic)-gradient\((.*)\)$/.exec(value);
  if (!gradient) return { mode: "custom", css: value };
  const kind = gradient[1] as GradientKind;
  let args = splitArguments(gradient[2]).map((part) => part.trim());
  let angle = kind === "linear" ? 180 : 0;
  const first = args[0];
  const explicit = ANGLE.exec(first);
  if (kind === "linear" && (explicit || DIRECTION.test(first))) {
    angle = explicit ? Number(explicit[1]) : DIRECTION_ANGLES[first] ?? 180;
    args = args.slice(1);
  }
  const stops: GradientStop[] = [];
  for (const argument of args) {
    const stop = /^(#[0-9a-f]{6})(?: (\d{1,3})%| (0))?$/.exec(argument);
    if (!stop) return { mode: "custom", css: value };
    stops.push({ colour: stop[1], position: stop[2] !== undefined ? Number(stop[2]) : stop[3] !== undefined ? 0 : null });
  }
  return { mode: "gradient", kind, angle, stops };
}

export function buildColour(model: ColourModel): string | null {
  if (model.mode === "none") return null;
  if (model.mode === "solid") return model.colour;
  if (model.mode === "custom") return model.css.trim();
  const stops = model.stops.map((stop) => (stop.position === null ? stop.colour : `${stop.colour} ${Math.round(stop.position)}%`));
  return `${model.kind}-gradient(${[...(model.kind === "linear" ? [`${Math.round(model.angle)}deg`] : []), ...stops].join(", ")})`;
}

/** The problem with a colour model, or null when it can be saved. */
export function colourProblem(model: ColourModel): string | null {
  if (model.mode === "none") return null;
  if (model.mode === "gradient" && (model.stops.length < 2 || model.stops.length > MAX_GRADIENT_STOPS)) return GENERIC_ERROR;
  const css = buildColour(model);
  const result = canonicalColour(css ?? "");
  return result.ok ? null : result.error;
}

/** Inline style that paints a role name the way Stoat does: solid text or gradient-clipped text. */
export function nameStyle(css: string | null | undefined): TextStyle {
  if (!css) return {};
  const result = canonicalColour(css);
  if (!result.ok) return {};
  if (result.value.includes("-gradient(")) {
    return { backgroundImage: result.value, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" };
  }
  return { color: result.value };
}

/** A CSS background (colour or gradient) for swatches, or undefined when the value is not a valid colour. */
export function swatch(css: string | null | undefined): string | undefined {
  if (!css) return undefined;
  const result = canonicalColour(css);
  return result.ok ? result.value : undefined;
}
