import { Fragment, cloneElement, isValidElement, type ReactElement, type ReactNode } from "react";

/**
 * Localises a rendered React tree the way the browser translator (WebsiteI18n) localises the DOM:
 * each string child is one text node, the same attributes are translated, `data-no-translate`
 * subtrees and code-like elements keep their text, and links to localised pages gain the language prefix.
 * Pages render in English and are localised here, so every language shares one set of components.
 */
export type LocalizeOptions = {
  /** Translates one text node or attribute value (already without surrounding whitespace). */
  text: (value: string) => string;
  /** Rewrites a link, for example "/discovery/top" to "/pt/discovery/top". */
  href: (value: string) => string;
  /** Whether a function component may be rendered here so its output can be localised. */
  inline: (type: (props: Record<string, unknown>) => unknown) => boolean;
};

type Props = Record<string, unknown> & { children?: ReactNode };

const TEXT_ATTRIBUTES = ["alt", "title", "placeholder", "aria-label"] as const;
const RAW_ELEMENTS = new Set(["script", "style", "code", "pre", "kbd", "samp", "textarea", "noscript"]);
const CLIENT_REFERENCE = Symbol.for("react.client.reference");

function translateString(value: string, options: LocalizeOptions): string {
  const leading = value.match(/^\s*/)?.[0] ?? "";
  const trailing = value.match(/\s*$/)?.[0] ?? "";
  const core = value.slice(leading.length, value.length - trailing.length);
  return core ? leading + options.text(core) + trailing : value;
}

function attributeChanges(props: Props, options: LocalizeOptions, translate: boolean): Record<string, unknown> {
  const changes: Record<string, unknown> = {};
  if (translate) {
    for (const name of TEXT_ATTRIBUTES) {
      const value = props[name];
      if (typeof value === "string" && value.trim()) changes[name] = translateString(value, options);
    }
  }
  if (typeof props.href === "string") changes.href = options.href(props.href);
  return changes;
}

function isClientReference(type: unknown): boolean {
  return typeof type === "function" && (type as { $$typeof?: symbol }).$$typeof === CLIENT_REFERENCE;
}

/** An expanded component keeps its key, so lists stay keyed. */
function withKey(key: string | null, node: ReactNode): ReactNode {
  if (key === null || key === undefined) return node;
  return isValidElement(node) ? cloneElement(node, { key }) : <Fragment key={key}>{node}</Fragment>;
}

function keepsText(props: Props, translate: boolean): boolean {
  return translate && props["data-no-translate"] === undefined;
}

/** Server version: renders server components inline (awaiting async ones) and keeps client components as they are. */
export async function localizeTreeAsync(node: ReactNode, options: LocalizeOptions, translate = true): Promise<ReactNode> {
  if (typeof node === "string") return translate ? translateString(node, options) : node;
  if (Array.isArray(node)) return Promise.all(node.map((child) => localizeTreeAsync(child, options, translate)));
  if (!isValidElement(node)) return node;
  const element = node as ReactElement<Props>;
  const props = element.props;
  const text = keepsText(props, translate);
  const type = element.type as unknown;
  if (typeof type === "string") {
    const childText = text && !RAW_ELEMENTS.has(type);
    const children = props.children === undefined ? undefined : await localizeTreeAsync(props.children, options, childText);
    return cloneElement(element, { ...attributeChanges(props, options, childText), ...(children === undefined ? {} : { children }) });
  }
  if (typeof type === "function" && !isClientReference(type) && options.inline(type as (props: Record<string, unknown>) => unknown)) {
    const rendered = await (type as (props: Props) => ReactNode | Promise<ReactNode>)(props);
    return withKey(element.key, await localizeTreeAsync(rendered, options, text));
  }
  // Fragments, client components, Suspense and the like: localise what they were given.
  const children = props.children === undefined ? undefined : await localizeTreeAsync(props.children, options, text);
  return cloneElement(element, { ...(type === Fragment ? {} : attributeChanges(props, options, text)), ...(children === undefined ? {} : { children }) });
}

/** Client version: same rules, synchronous, and only components on the `inline` allowlist are rendered here (no hooks). */
export function localizeTree(node: ReactNode, options: LocalizeOptions, translate = true): ReactNode {
  if (typeof node === "string") return translate ? translateString(node, options) : node;
  if (Array.isArray(node)) return node.map((child) => localizeTree(child, options, translate));
  if (!isValidElement(node)) return node;
  const element = node as ReactElement<Props>;
  const props = element.props;
  const text = keepsText(props, translate);
  const type = element.type as unknown;
  if (typeof type === "string") {
    const childText = text && !RAW_ELEMENTS.has(type);
    const children = props.children === undefined ? undefined : localizeTree(props.children, options, childText);
    return cloneElement(element, { ...attributeChanges(props, options, childText), ...(children === undefined ? {} : { children }) });
  }
  if (typeof type === "function" && options.inline(type as (props: Record<string, unknown>) => unknown)) {
    return withKey(element.key, localizeTree((type as (props: Props) => ReactNode)(props), options, text));
  }
  const children = props.children === undefined ? undefined : localizeTree(props.children, options, text);
  return cloneElement(element, { ...(type === Fragment ? {} : attributeChanges(props, options, text)), ...(children === undefined ? {} : { children }) });
}
