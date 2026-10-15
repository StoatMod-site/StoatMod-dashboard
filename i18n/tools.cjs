// Translation tooling.
//   node i18n/tools.cjs export [size]   export the next batch of untranslated strings (i18n/batches/NNN.src.json) and print it
//   node i18n/tools.cjs validate        check every translated batch (alignment, placeholders, empties)
//   node i18n/tools.cjs build           write public/i18n/{fr,pt,es}.json from all batches
//   node i18n/tools.cjs status          coverage summary
// A batch NNN consists of NNN.src.json (English, exported) and NNN.tr.json (array of [fr, pt, es], same order).
const fs = require('fs'), path = require('path'), cp = require('child_process');
const root = path.resolve(__dirname, '..');
const batchDir = path.join(__dirname, 'batches');
const outDir = path.join(root, 'public', 'i18n');
const LOCALES = ['fr', 'pt', 'es'];
fs.mkdirSync(batchDir, { recursive: true });

const PRIORITY = [
  /^(DashboardApp|MemberPanel|ApplicationsPanel|AutomationPanel|ReactionRolesPanel|OperationsChrome|AggregateActivity|CategoryScores|DashboardIcon|lib\/moderation-display|lib\/api)/,
  /^content\/(docs|commands)/, /^DocsPage|^docs\//, /^content\/guides/, /^guides\//, /^content\/features|^content\/feature-library|^Feature|^features\//, /^content\/trust|^about|^security|^changelog/,
  /^(AppealPage|ReportApp|VerifyApp|LoginApp|AccessLayout|StatusPage|status\/)/, /^(PrivacyPage|privacy\/|privacy-changes|PrivacyUpdate)/,
  /^(MarketingPage|PublicFooter|PublicContentPage|PublicHubPage|ResourceLibrary|not-found|discovery|DiscoveryPage|PublicPageHeading|Breadcrumbs|SiteNav|PortalHeader|ThemeToggle)/,
  /^(OwnerDashboardApp|OwnerLoginApp|AdminDashboardApp|AdminLoginApp)/,
];
function rank(file) { const f = file.split(':')[0]; const i = PRIORITY.findIndex((re) => re.test(f)); return i < 0 ? PRIORITY.length : i; }

function loadBatches() {
  const batches = [];
  for (const f of fs.readdirSync(batchDir).sort()) {
    const m = /^(\d+)\.src\.json$/.exec(f); if (!m) continue;
    const src = JSON.parse(fs.readFileSync(path.join(batchDir, f), 'utf8'));
    const trFile = path.join(batchDir, m[1] + '.tr.json');
    const tr = fs.existsSync(trFile) ? JSON.parse(fs.readFileSync(trFile, 'utf8')) : null;
    batches.push({ id: m[1], src, tr });
  }
  return batches;
}
function placeholders(s) { return (s.match(/\{=?\d+\}/g) || []).sort().join(','); }

const cmd = process.argv[2];
if (cmd === 'export') {
  const size = Number(process.argv[3] || 120);
  const batches = loadBatches();
  const exported = new Set(batches.flatMap((b) => b.src));
  const audit = cp.spawnSync('node', [path.join(root, 'i18n', 'audit.cjs')], { encoding: 'utf8' });
  const strings = JSON.parse(fs.readFileSync(path.join(root, 'i18n', '.cache', 'strings.json'), 'utf8'));
  const todo = strings.filter((s) => !s.have && !exported.has(s.t) && !/^~/.test(s.t)).sort((a, b) => rank(a.files[0]) - rank(b.files[0]) || a.files[0].localeCompare(b.files[0], 'en', { numeric: true }));
  if (!todo.length) { console.log('nothing left to export'); process.exit(0); }
  const take = []; let chars = 0;
  for (const s of todo) { if (take.length >= size || chars > 13000) break; take.push(s); chars += s.t.length; }
  const id = String(Math.max(0, ...batches.map((b) => Number(b.id))) + 1).padStart(3, '0');
  fs.writeFileSync(path.join(batchDir, id + '.src.json'), JSON.stringify(take.map((s) => s.t), null, 1));
  console.log('batch', id, 'strings', take.length, ' remaining after this:', todo.length - take.length);
  take.forEach((s, i) => console.log(i + '\t' + s.t + (s.kinds[0].startsWith('attr') || s.kinds[0].startsWith('call') ? '   [' + s.kinds[0] + ']' : '')));
} else if (cmd === 'validate' || cmd === 'build' || cmd === 'status') {
  const batches = loadBatches(); let errors = 0, done = 0, total = 0;
  const maps = { fr: {}, pt: {}, es: {} };
  for (const b of batches) {
    total += b.src.length;
    if (!b.tr) { if (cmd !== 'status') console.log('batch', b.id, 'has no translations yet'); continue; }
    if (b.tr.length !== b.src.length) { console.log('batch', b.id, 'length mismatch', b.src.length, 'vs', b.tr.length); errors++; continue; }
    b.src.forEach((en, i) => {
      const row = b.tr[i];
      if (!Array.isArray(row) || row.length !== 3 || row.some((x) => typeof x !== 'string' || !x.trim())) { console.log('batch', b.id, 'row', i, 'invalid:', en.slice(0, 50)); errors++; return; }
      row.forEach((t, k) => {
        if (placeholders(en) !== placeholders(t)) { console.log('batch', b.id, 'row', i, LOCALES[k], 'placeholder mismatch:', en.slice(0, 50), '=>', t.slice(0, 50)); errors++; }
        maps[LOCALES[k]][en] = t;
      });
      done++;
    });
  }
  console.log('batches:', batches.length, ' strings exported:', total, ' translated:', done, ' errors:', errors);
  if (cmd === 'build') {
    if (errors) { console.log('build refused: fix errors first'); process.exit(1); }
    fs.mkdirSync(outDir, { recursive: true });
    for (const l of LOCALES) { fs.writeFileSync(path.join(outDir, l + '.json'), JSON.stringify(maps[l])); console.log('wrote public/i18n/' + l + '.json', Object.keys(maps[l]).length, 'entries', (fs.statSync(path.join(outDir, l + '.json')).size / 1024).toFixed(0) + ' KB'); }
    // The runtime requests /i18n/<locale>.json?v=<hash>, so a changed dictionary is never served from a stale browser cache.
    const hash = require('crypto').createHash('sha1').update(LOCALES.map((l) => JSON.stringify(maps[l])).join('\n')).digest('hex').slice(0, 10);
    const runtime = path.join(root, 'app', 'WebsiteI18n.tsx');
    const current = fs.readFileSync(runtime, 'utf8');
    const next = current.replace(/const DICTIONARY_VERSION = "[^"]*";/, `const DICTIONARY_VERSION = "${hash}";`);
    if (next !== current) fs.writeFileSync(runtime, next);
    console.log('dictionary version', hash);
  }
  process.exitCode = errors ? 1 : 0;
} else console.log('usage: export [size] | validate | build | status');
