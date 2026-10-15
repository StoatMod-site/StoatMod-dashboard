// Extract user-visible English strings from TSX/TS sources and compare with the translation dictionaries.
// Usage: node i18n/audit.cjs [--list]   (writes i18n/.cache/strings.json and prints coverage; exits 1 while strings are untranslated)
const ts = require('../node_modules/typescript');
const fs = require('fs'), path = require('path');
const appRoot = path.resolve(__dirname, '..', 'app');
const i18nDir = path.resolve(__dirname, '..', 'i18n');

function parse(file) { return ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true, file.endsWith('x') ? ts.ScriptKind.TSX : ts.ScriptKind.TS); }

// ---- existing dictionary keys: P (WebsiteI18n.tsx) plus translated batches (i18n/batches/*.json) ----
const keys = new Set();
(function walk(n) {
  if (ts.isVariableDeclaration(n) && n.name.getText() === 'P' && n.initializer && ts.isObjectLiteralExpression(n.initializer)) {
    for (const p of n.initializer.properties) if (ts.isPropertyAssignment(p)) {
      const k = p.name; keys.add(ts.isStringLiteral(k) || ts.isNoSubstitutionTemplateLiteral(k) ? k.text : k.getText());
    }
  } else ts.forEachChild(n, walk);
})(parse(path.join(appRoot, 'WebsiteI18n.tsx')));
const translated = new Set();
const batchDir = path.join(i18nDir, 'batches');
if (fs.existsSync(batchDir)) for (const f of fs.readdirSync(batchDir)) { const m = /^(\d+)\.src\.json$/.exec(f); if (!m) continue; const trf = path.join(batchDir, m[1] + '.tr.json'); if (!fs.existsSync(trf)) continue; const src = JSON.parse(fs.readFileSync(path.join(batchDir, f), 'utf8')); const tr = JSON.parse(fs.readFileSync(trf, 'utf8')); if (tr.length === src.length) src.forEach((s) => translated.add(s)); }

const SKIP_ATTR = new Set(['className','href','id','type','key','name','htmlFor','style','src','rel','target','role','data-testid','autoComplete','inputMode','pattern','method','action','viewBox','d','fill','stroke','width','height','xmlns','cx','cy','r','x','y','points','transform','strokeLinecap','strokeLinejoin','strokeWidth','tabIndex','min','max','step','accept','sizes','media','charSet','lang','dir','as','variant','tone','size','icon','kind','status','mode','slug','value','defaultValue','to','path','data-theme','data-state','data-tone']);
const SKIP_PROP = new Set(['slug','updated','href','id','key','icon','kind','type','status','mode','className','tone','path','value','to','image','src','date','published','label_key','method','url','endpoint','color','background','font','fontFamily','width','height','position','display','cursor','transform','target','rel','as','locale','format','sort','filter','theme','variant','tag','tags','area','category_id','channelType','permission','scope','section','tab','view','action','event','event_type','key_name','name']);
const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', hellip: '…', middot: '·', mdash: '—', ndash: '–', times: '×', rarr: '→', larr: '←', copy: '©', bull: '•' };
function decodeEntities(s) { return s.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (whole, name) => { if (name[0] === '#') { const code = name[1].toLowerCase() === 'x' ? parseInt(name.slice(2), 16) : parseInt(name.slice(1), 10); return String.fromCodePoint(code); } return Object.prototype.hasOwnProperty.call(ENTITIES, name) ? ENTITIES[name] : whole; }); }
function normalize(s) { return decodeEntities(s).replace(/\s+/g, ' ').trim(); }
function looksProse(t, strict) {
  if (t.length < 2) return false;
  if (!/[A-Za-z]{2}/.test(t)) return false;
  if (/^(https?:|\/|#|\.|mailto:|[a-z0-9_-]+\.[a-z]{2,}(\/|$))/i.test(t)) return false;
  if (/^[a-z0-9_:.\-/\[\]@%$]+$/.test(t)) return false;
  if (/^[MmZzLlHhVvCcSsQqTtAa0-9\s.,\-]+$/.test(t) && /[MmLlHhVvCcZz]/.test(t) && /\d/.test(t)) return false;
  if (/^[A-Z][A-Z0-9_]+$/.test(t) && !t.includes(' ')) return strict ? false : t.length > 3 && /^[A-Z]+$/.test(t) && false;
  if (strict) { if (!/\s/.test(t)) return /^[A-Z][a-z]{3,}$/.test(t) && false; if (/[{}<>;=]|=>|\bfunction\b|\bconst\b/.test(t)) return false; if (/^[a-z]+[A-Z]/.test(t)) return false; }
  return true;
}
const parentOf = (n) => n.parent;
function isComparison(n) { const p = n.parent; return p && ts.isBinaryExpression(p) && ['===','!==','==','!='].includes(p.operatorToken.getText()); }
function collect(file) {
  const sf = parse(file); const out = [];
  function add(text, node, kind, strict) { const t = normalize(text); if (looksProse(t, strict)) out.push({ t, kind, line: sf.getLineAndCharacterOfPosition(node.getStart()).line + 1 }); }
  function templateText(n) {
    if (ts.isNoSubstitutionTemplateLiteral(n)) return n.text;
    let out2 = n.head.text; n.templateSpans.forEach((span, i) => { out2 += '{' + i + '}' + span.literal.text; }); return out2;
  }
  (function walk(n) {
    if (ts.isJsxText(n)) add(n.text, n, 'jsx', false);
    else if (ts.isJsxAttribute(n) && n.initializer && !SKIP_ATTR.has(n.name.getText())) {
      const init = n.initializer;
      if (ts.isStringLiteral(init)) add(init.text, init, 'attr:' + n.name.getText(), false);
      else if (ts.isJsxExpression(init) && init.expression) { const e = init.expression; if (ts.isStringLiteral(e) || ts.isNoSubstitutionTemplateLiteral(e)) add(e.text, init, 'attr:' + n.name.getText(), false); else if (ts.isTemplateExpression(e)) add(templateText(e), e, 'attr:' + n.name.getText(), true); }
    }
    else if (ts.isTemplateExpression(n) && !(n.parent && ts.isTaggedTemplateExpression(n.parent)) && !(n.parent && ts.isJsxAttribute(n.parent))) add(templateText(n), n, 'template', true);
    else if ((ts.isStringLiteral(n) || ts.isNoSubstitutionTemplateLiteral(n)) && n.parent && !ts.isJsxAttribute(n.parent) && !ts.isImportDeclaration(n.parent) && !ts.isExportDeclaration(n.parent) && !ts.isCaseClause(n.parent) && !ts.isLiteralTypeNode(n.parent) && !ts.isElementAccessExpression(n.parent) && !isComparison(n)) {
      const p = n.parent;
      if (ts.isPropertyAssignment(p) && p.initializer === n) { const nm = p.name.getText().replace(/["']/g, ''); if (!SKIP_PROP.has(nm)) add(n.text, n, 'prop:' + nm, false); }
      else if (ts.isJsxExpression(p)) add(n.text, n, 'jsxexpr', false);
      else if (ts.isArrayLiteralExpression(p)) add(n.text, n, 'array', false);
      else if (ts.isCallExpression(p) && p.arguments.includes(n) && p.expression.getText() === 'pluralize') { if (p.arguments.indexOf(n) > 0) add('{0} ' + n.text, n, 'plural', false); }
      else if (ts.isCallExpression(p) && p.arguments.includes(n)) { const callee = p.expression.getText(); if (!/^(fetch|api|require|import|JSON|Number|String|Object|Array|Math|Date|console|window\.(open|location)|document|new URL|encodeURIComponent|localStorage|sessionStorage|URLSearchParams|setTimeout|setInterval)\b/.test(callee) && !/\.(get|set|has|add|delete|includes|startsWith|endsWith|indexOf|split|join|replace|replaceAll|match|test|querySelector|querySelectorAll|getAttribute|setAttribute|append|push|toLowerCase|padStart|padEnd|localeCompare|fetch|formatToParts|toLocaleString|toLocaleDateString)$/.test(callee)) add(n.text, n, 'call:' + callee.split('.').pop(), true); }
      else if (ts.isNewExpression(p) && p.arguments && p.arguments.includes(n) && p.expression.getText() === 'Error') add(n.text, n, 'call:Error', false);
      else if (ts.isVariableDeclaration(p) && p.initializer === n) add(n.text, n, 'var', true);
      else if (ts.isReturnStatement(p)) add(n.text, n, 'return', true);
      else if (ts.isArrowFunction(p) && p.body === n) add(n.text, n, 'arrow', true);
      else if (ts.isConditionalExpression(p) || ts.isBinaryExpression(p) || ts.isParenthesizedExpression(p) || ts.isAsExpression(p)) add(n.text, n, 'expr', true);
    }
    ts.forEachChild(n, walk);
  })(sf);
  return out;
}
function files(dir) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(e => e.isDirectory() ? (['node_modules','_sites-preview'].includes(e.name) ? [] : files(path.join(dir, e.name))) : /\.(tsx|ts)$/.test(e.name) && !/\.d\.ts$/.test(e.name) ? [path.join(dir, e.name)] : []); }
const SKIP_FILES = new Set(['WebsiteI18n.tsx', 'lib/schema.ts', 'lib/seo.ts', 'lib/theme.ts', 'lib/preview.ts', 'lib/public-slugs.ts', 'lib/discovery-media.ts', 'lib/public-data.server.ts', 'lib/public-types.ts', 'lib/site-config.ts', 'lib/privacy-update.ts', 'content/types.ts', 'content/index.ts', 'JsonLd.tsx']);
const master = new Map(); const perFile = {};
for (const f of files(appRoot)) {
  const rel = path.relative(appRoot, f).split(path.sep).join('/');
  if (SKIP_FILES.has(rel)) continue;
  const items = collect(f); if (!items.length) continue;
  const uniq = new Map(); for (const i of items) if (!uniq.has(i.t)) uniq.set(i.t, i);
  let miss = 0;
  for (const i of uniq.values()) {
    const have = keys.has(i.t) || translated.has(i.t);
    if (!master.has(i.t)) master.set(i.t, { t: i.t, files: [], kinds: new Set(), have });
    const m = master.get(i.t); m.files.push(rel + ':' + i.line); m.kinds.add(i.kind);
    if (!have) miss++;
  }
  perFile[rel] = { strings: uniq.size, missing: miss };
}
const list = [...master.values()].map(m => ({ t: m.t, have: m.have, files: m.files.slice(0, 3), kinds: [...m.kinds] }));
fs.mkdirSync(path.join(__dirname, '.cache'), { recursive: true });
fs.writeFileSync(path.join(__dirname, '.cache', 'strings.json'), JSON.stringify(list, null, 1));
// Command syntax such as ~ban USER_ID REASON is intentionally identical in every language.
const missing = list.filter(x => !x.have && !/^~/.test(x.t));
console.log('dictionary keys (P):', keys.size, ' translated in batches:', translated.size, ' unique strings found:', list.length, ' still missing:', missing.length);
if (process.argv.includes('--list')) for (const [k, v] of Object.entries(perFile).sort((a, b) => b[1].missing - a[1].missing)) console.log(String(v.missing).padStart(5), '/', String(v.strings).padEnd(5), k);
process.exitCode = missing.length ? 1 : 0;
