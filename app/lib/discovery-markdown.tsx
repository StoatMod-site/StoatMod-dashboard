import type { ReactNode } from "react";

// A small, safe Markdown subset for Discovery listings. Everything renders as React text nodes (never raw HTML).
// Supported: # headings, paragraphs and line breaks, - / 1. lists, > quotes, **bold**, *italic* or _italic_,
// ~~strikethrough~~, `code`, [label](https://link) and bare https:// links. Links open in a new tab and carry
// rel="ugc nofollow" because owners, not Stoatmod, choose them.

type Block =
  | { type: "heading"; level: 1 | 2 | 3; text: string }
  | { type: "paragraph"; lines: string[] }
  | { type: "list"; ordered: boolean; items: string[] }
  | { type: "quote"; lines: string[] };

const heading = /^(#{1,3})\s+(.+)$/;
const bullet = /^\s*[-*•]\s+(.+)$/;
const numbered = /^\s*\d{1,3}[.)]\s+(.+)$/;
const quote = /^>\s?(.*)$/;

export function parseMarkdownBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];
  const flush = () => {
    if (paragraph.length) blocks.push({ type: "paragraph", lines: paragraph });
    paragraph = [];
  };
  for (const raw of source.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trimEnd();
    const last = blocks[blocks.length - 1];
    if (!line.trim()) {
      flush();
      continue;
    }
    const headingMatch = heading.exec(line);
    if (headingMatch) {
      flush();
      blocks.push({ type: "heading", level: headingMatch[1].length as 1 | 2 | 3, text: headingMatch[2].trim() });
      continue;
    }
    const bulletMatch = bullet.exec(line);
    const numberMatch = bulletMatch ? null : numbered.exec(line);
    if (bulletMatch || numberMatch) {
      flush();
      const ordered = Boolean(numberMatch);
      const text = (bulletMatch || numberMatch)![1];
      if (last?.type === "list" && last.ordered === ordered && !paragraph.length) last.items.push(text);
      else blocks.push({ type: "list", ordered, items: [text] });
      continue;
    }
    const quoteMatch = quote.exec(line);
    if (quoteMatch) {
      flush();
      if (last?.type === "quote") last.lines.push(quoteMatch[1]);
      else blocks.push({ type: "quote", lines: [quoteMatch[1]] });
      continue;
    }
    paragraph.push(line.trim());
  }
  flush();
  return blocks;
}

const inlineToken = /\*\*([^*\n]+?)\*\*|~~([^~\n]+?)~~|`([^`\n]+?)`|\[([^\]\n]{1,200})\]\((https:\/\/[^)\s]{1,500})\)|(https:\/\/[^\s<>()[\]]+[^\s<>()[\].,!?;:'"])|\*([^*\n]+?)\*|(?<![A-Za-z0-9])_([^_\n]+?)_(?![A-Za-z0-9])/;

function safeLink(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password ? url.toString() : "";
  } catch {
    return "";
  }
}

function MarkdownLink({ href, children }: { href: string; children: ReactNode }) {
  return <a href={href} target="_blank" rel="ugc nofollow noopener noreferrer">{children}</a>;
}

export function renderInline(text: string, key = "i", depth = 0): ReactNode[] {
  const nodes: ReactNode[] = [];
  let rest = text;
  let index = 0;
  while (rest) {
    const match = depth > 3 ? null : inlineToken.exec(rest);
    if (!match) {
      nodes.push(rest);
      break;
    }
    if (match.index > 0) nodes.push(rest.slice(0, match.index));
    const id = `${key}-${index++}`;
    const [, bold, strike, code, label, target, bare, italic, underscoreItalic] = match;
    if (bold !== undefined) nodes.push(<strong key={id}>{renderInline(bold, id, depth + 1)}</strong>);
    else if (strike !== undefined) nodes.push(<s key={id}>{renderInline(strike, id, depth + 1)}</s>);
    else if (code !== undefined) nodes.push(<code key={id}>{code}</code>);
    else if (label !== undefined) {
      const href = safeLink(target);
      nodes.push(href ? <MarkdownLink key={id} href={href}>{renderInline(label, id, depth + 1)}</MarkdownLink> : label);
    } else if (bare !== undefined) {
      const href = safeLink(bare);
      nodes.push(href ? <MarkdownLink key={id} href={href}>{bare.replace(/^https:\/\//, "")}</MarkdownLink> : bare);
    } else {
      nodes.push(<em key={id}>{renderInline(italic ?? underscoreItalic, id, depth + 1)}</em>);
    }
    rest = rest.slice(match.index + match[0].length);
  }
  return nodes;
}

function lines(values: string[], key: string) {
  return values.flatMap((line, index) => index ? [<br key={`${key}-br-${index}`} />, ...renderInline(line, `${key}-${index}`)] : renderInline(line, `${key}-${index}`));
}

/** Renders listing Markdown. `headingBase` keeps the page outline valid (h3 by default under an h2 section). */
export function DiscoveryMarkdown({ source, className, headingBase = 3 }: { source: string; className?: string; headingBase?: 3 | 4 }) {
  const blocks = parseMarkdownBlocks(source);
  if (!blocks.length) return null;
  return (
    <div className={className} data-no-translate>
      {blocks.map((block, index) => {
        const key = `b${index}`;
        if (block.type === "heading") {
          const Tag = (block.level === 1 ? `h${headingBase}` : `h${Math.min(headingBase + 1, 5)}`) as "h3" | "h4" | "h5";
          return <Tag key={key}>{renderInline(block.text, key)}</Tag>;
        }
        if (block.type === "list") {
          const items = block.items.map((item, itemIndex) => <li key={`${key}-${itemIndex}`}>{renderInline(item, `${key}-${itemIndex}`)}</li>);
          return block.ordered ? <ol key={key}>{items}</ol> : <ul key={key}>{items}</ul>;
        }
        if (block.type === "quote") return <blockquote key={key}>{lines(block.lines, key)}</blockquote>;
        return <p key={key}>{lines(block.lines, key)}</p>;
      })}
    </div>
  );
}

/** Plain text for meta descriptions and structured data. */
export function markdownToText(source: string) {
  return source
    .replace(/\[([^\]\n]+)\]\((https:\/\/[^)\s]+)\)/g, "$1")
    .replace(/[*_~`#>]+/g, "")
    .replace(/^\s*(?:[-•]|\d{1,3}[.)])\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}
