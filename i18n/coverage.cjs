// Rendered-page translation coverage: crawl a running site, extract every text node and translatable attribute
// from the server-rendered HTML, and report the ones that have no entry in the fr/pt/es dictionaries.
// Usage: node i18n/coverage.cjs [baseUrl] [--max N] [--json out.json]
const fs = require('fs'), path = require('path');
const ts = require('../node_modules/typescript');

const args = process.argv.slice(2);
const base = (args.find((a) => /^https?:/.test(a)) || 'http://localhost:5179').replace(/\/$/, '');
const maxPages = args.includes('--max') ? Number(args[args.indexOf('--max') + 1]) : 400;
const jsonOut = args.includes('--json') ? args[args.indexOf('--json') + 1] : null;
const locales = ['fr', 'pt', 'es'];

const legacyKeys = new Map();
(function () {
  const file = path.resolve(__dirname, '..', 'app', 'WebsiteI18n.tsx');
  const sf = ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  (function walk(n) {
    if (ts.isVariableDeclaration(n) && n.name.getText() === 'P' && n.initializer && ts.isObjectLiteralExpression(n.initializer)) {
      for (const p of n.initializer.properties) if (ts.isPropertyAssignment(p)) { const k = p.name; legacyKeys.set(ts.isStringLiteral(k) || ts.isNoSubstitutionTemplateLiteral(k) ? k.text : k.getText(), true); }
    } else ts.forEachChild(n, walk);
  })(sf);
})();

function load(locale) {
  const entries = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'public', 'i18n', locale + '.json'), 'utf8'));
  const exact = new Set(), patterns = [];
  for (const k of Object.keys(entries)) {
    if (!/\{=?\d+\}/.test(k)) { exact.add(k); continue; }
    const tokens = k.match(/\{=?\d+\}/g);
    const body = k.split(/(\{=?\d+\})/).map((part) => /^\{=?\d+\}$/.test(part) ? '([\\s\\S]+?)' : part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('');
    const re = new RegExp('^' + body + '$'); re.verbatim = tokens.map((t) => t.includes('='));
    patterns.push(re);
  }
  patterns.sort((a, b) => b.source.length - a.source.length);
  return { exact, patterns };
}
const dict = Object.fromEntries(locales.map((l) => [l, load(l)]));

const prose = (t) => /[A-Za-z]{2}/.test(t) && !/^[~/#@]/.test(t) && !/^[\w.+-]+@[\w.-]+$/.test(t) && !/^https?:\/\//.test(t);

// Mirrors the runtime lookup: exact entry, then patterns whose placeholders are themselves translatable.
function known(locale, text, depth = 0) {
  const d = dict[locale];
  if (/^\d{1,2} [A-Za-z]+( \d{4})?(, \d\d:\d\d)?( UTC)?$/.test(text)) return true; // dates are localised by the runtime
  const variants = [text];
  const edges = /^([\s.,;:·•—–|/-]*)([\s\S]*?)([\s.,;:·•—–|/-]*)$/.exec(text);
  if (depth === 0 && edges && edges[2] && edges[2] !== text) variants.push(edges[2]);
  const leadingOnly = /^[\s.,;:·•—–|/-]+/.exec(text);
  if (depth === 0 && leadingOnly && leadingOnly[0].length < text.length) variants.push(text.slice(leadingOnly[0].length));
  return variants.some((v) => {
    if (d.exact.has(v) || legacyKeys.has(v)) return true;
    if (depth > 2) return false;
    return d.patterns.some((re) => {
      const m = re.exec(v);
      return m && m.slice(1).every((c, i) => re.verbatim[i] || captureOk(locale, c, depth + 1));
    }) || segmentsKnown(locale, v, depth);
  });
}
function segmentsKnown(locale, v, depth) {
  if (depth > 2 || !/ [/·] /.test(v)) return false;
  return v.split(/ [/·] /).every((part) => !/[A-Za-z]{2}/.test(part) || known(locale, part, depth + 1));
}
function captureOk(locale, value, depth) {
  if (!prose(value) || known(locale, value, depth)) return true;
  if (depth > 3 || !/ [/·] |, /.test(value)) return false;
  return value.split(/ [/·] |, /).every((part) => !prose(part) || known(locale, part, depth + 1));
}

const ENT = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ' };
const decode = (s) => s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (w, n) => n[0] === '#' ? String.fromCodePoint(n[1].toLowerCase() === 'x' ? parseInt(n.slice(2), 16) : parseInt(n.slice(1), 10)) : (ENT[n] ?? w));

function extract(html) {
  const out = [];
  // React separates adjacent text expressions with comment markers, so each marker is a text-node boundary at runtime.
  let body = html.replace(/<!--[\s\S]*?-->/g, '<br>');
  const title = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html.replace(/<!--[\s\S]*?-->/g, ''));
  if (title) out.push(['title', decode(title[1])]);
  body = body.replace(/<head[\s\S]*?<\/head>/i, '');
  for (const tag of ['script', 'style', 'noscript', 'svg', 'code', 'pre', 'kbd', 'samp', 'textarea']) body = body.replace(new RegExp('<' + tag + '\\b[\\s\\S]*?</' + tag + '>', 'gi'), '<br>');
  body = body.replace(/<[^>]*data-no-translate[^>]*>[\s\S]*?<\/[a-z0-9]+>/gi, '<br>');
  for (const m of body.matchAll(/<[a-z][^>]*>/gi)) {
    for (const a of ['placeholder', 'aria-label', 'title', 'alt']) {
      const r = new RegExp('\\s' + a + '="([^"]*)"').exec(m[0]);
      if (r) out.push([a, decode(r[1])]);
    }
  }
  for (const chunk of body.split(/<[^>]*>/)) {
    const t = decode(chunk).replace(/\s+/g, ' ').trim();
    if (t) out.push(['text', t]);
  }
  return out;
}

async function main() {
  const queue = ['/'], seen = new Set(['/']);
  const missing = new Map();
  let pages = 0;
  while (queue.length && pages < maxPages) {
    const url = queue.shift();
    let res; try { res = await fetch(base + url, { redirect: 'follow' }); } catch (e) { console.error('fetch failed', url, e.message); continue; }
    if (!res.ok || !/text\/html/.test(res.headers.get('content-type') || '')) continue;
    const html = await res.text(); pages += 1;
    for (const m of html.matchAll(/<a[^>]+href="(\/[^"#?]*)"/g)) {
      const href = m[1].replace(/\/$/, '') || '/';
      if (!seen.has(href) && !/\.(png|jpg|svg|ico|xml|txt|json|pdf|webp)$/i.test(href) && !href.startsWith('/api')) { seen.add(href); queue.push(href); }
    }
    for (const [kind, text] of extract(html)) {
      if (!prose(text) || text.length < 2) continue;
      if (known('fr', text)) continue;
      const entry = missing.get(text) || { text, kinds: new Set(), pages: new Set() };
      entry.kinds.add(kind); entry.pages.add(url); missing.set(text, entry);
    }
  }
  const list = [...missing.values()].map((e) => ({ text: e.text, kinds: [...e.kinds], pages: [...e.pages].slice(0, 3) }));
  console.log(`pages crawled: ${pages}  strings not in dictionary: ${list.length}`);
  for (const e of list) console.log(`- [${e.kinds.join(',')}] ${e.text.slice(0, 220)}   (${e.pages[0]})`);
  if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(list, null, 1));
}
if (args.includes('--strings')) {
  // Check an explicit list of strings (e.g. from i18n/server-strings.cjs) instead of crawling.
  const list = JSON.parse(fs.readFileSync(args[args.indexOf('--strings') + 1], 'utf8'));
  const missing = list.filter((e) => !known('fr', e.text) || !known('pt', e.text) || !known('es', e.text));
  console.log(`strings checked: ${list.length}  not in dictionary: ${missing.length}`);
  for (const e of missing) console.log(`- ${e.line ?? ''}\t${e.text.slice(0, 200)}`);
  if (jsonOut) fs.writeFileSync(jsonOut, JSON.stringify(missing, null, 1));
} else main();
