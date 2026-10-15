// Extract user-facing English messages from the Python sources (server.py API messages, bot.py permission texts).
// Usage: node i18n/server-strings.cjs [--json out.json] [--broad]
// Writes a JSON array of { text, line, file } where `text` uses {0},{1} for f-string expressions.
// Default mode only reads strings in message-bearing calls/keys; --broad also lists every sentence-like literal for review.
const fs = require('fs'), path = require('path');
const root = path.resolve(__dirname, '..');
const botRoot = process.env.STOATMOD_BOT_SOURCE || path.resolve(root, '..', 'stoatmod');
const files = [['api/server.py', path.join(botRoot, 'api', 'server.py')], ['bot.py', path.join(botRoot, 'bot.py')]];
const broad = process.argv.includes('--broad');

const CTX = [
  /json_error\(\s*(f?)("(?:[^"\\]|\\.)*")/g,
  /raise (?:ValueError|PermissionError|LookupError|HTTPException|ApiError)\(\s*(f?)("(?:[^"\\]|\\.)*")/g,
  /\b(?:error|message|detail|impact|reason|label|title|description|summary|hint|note|status_text)["']?\s*[:=]\s*(f?)("(?:[^"\\]|\\.)*")/g,
];
const LITERAL = /(?<![A-Za-z0-9_])(f?)("(?:[^"\\\n]|\\.)*")/g;

function unquote(literal, isF) {
  let body = literal.slice(1, -1).replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\n/g, ' ').replace(/\\\\/g, '\\');
  if (!isF) return body;
  let n = 0;
  body = body.replace(/\{\{/g, '\u0001').replace(/\}\}/g, '\u0002');
  body = body.replace(/\{[^{}]*\}/g, () => `{${n++}}`);
  return body.replace(/\u0001/g, '{').replace(/\u0002/g, '}');
}
function usable(text) {
  if (text.length < 4 || !/[A-Za-z]{3}/.test(text)) return false;
  if (!/\s/.test(text) && !/^[A-Z]/.test(text)) return false;
  if (/^[a-z_]+$/.test(text) || /^[a-z0-9_.:\/-]+$/.test(text)) return false;
  if (/\b[A-Z][A-Z0-9]+_[A-Z0-9_]+\b/.test(text)) return false; // environment-variable diagnostics are for operators, not the UI
  if (/^(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|PRAGMA|WITH|FROM)\b/i.test(text) || /\bFROM \w+ WHERE\b/.test(text)) return false;
  return true;
}

const found = new Map();
for (const [name, file] of files) {
  if (!fs.existsSync(file)) continue;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  let inDocstring = false;
  lines.forEach((line, i) => {
    if ((line.match(/"""/g) || []).length % 2 === 1) { inDocstring = !inDocstring; return; }
    if (inDocstring || /^\s*#/.test(line) || /\b(?:logger|logging|log|print)\.?\w*\(/.test(line)) return;
    const patterns = broad ? [LITERAL] : CTX;
    for (const re of patterns) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(line))) {
        const text = unquote(m[2], m[1] === 'f').replace(/\s+/g, ' ').trim();
        if (!usable(text)) continue;
        if (broad && !/^[A-Z]/.test(text)) continue;
        if (!found.has(text)) found.set(text, { text, line: i + 1, file: name });
      }
    }
  });
}
// Multi-line permission requirement tuples in bot.py: ("view_channel", "View Channels", "inspect and moderate ...")
const botFile = files[1][1];
if (fs.existsSync(botFile)) {
  const bot = fs.readFileSync(botFile, 'utf8');
  const block = /SERVER_PERMISSION_REQUIREMENTS\s*=\s*\(([\s\S]*?)\n\)/.exec(bot);
  if (block) for (const m of block[1].matchAll(/"[a-z_]+",\s*"([^"]+)",\s*"([^"]+)"/g)) { for (const t of [m[2]]) if (!found.has(t)) found.set(t, { text: t, line: 0, file: 'bot.py' }); }
}
const snapshot = path.join(__dirname, 'api-strings.json');
if (!found.size && fs.existsSync(snapshot)) {
  for (const row of JSON.parse(fs.readFileSync(snapshot, 'utf8'))) found.set(row.text, row);
}
const list = [...found.values()];
const out = process.argv.includes('--json') ? process.argv[process.argv.indexOf('--json') + 1] : null;
if (out) fs.writeFileSync(out, JSON.stringify(list, null, 1));
console.log('server strings:', list.length);
