import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const locales = ["fr", "pt", "es"];
const placeholders = (text) => (text.match(/\{=?\d+\}/g) || []).sort().join(",");
const dictionaries = Object.fromEntries(await Promise.all(locales.map(async (locale) => [locale, JSON.parse(await readFile(path.join(root, "public", "i18n", `${locale}.json`), "utf8"))])));

test("every language ships the same phrases with intact placeholders", () => {
  const reference = Object.keys(dictionaries.fr).sort();
  assert.ok(reference.length > 3000, "the dictionaries should cover the whole site");
  for (const locale of locales) {
    assert.deepEqual(Object.keys(dictionaries[locale]).sort(), reference, `${locale} must contain the same phrases as fr`);
    for (const [source, target] of Object.entries(dictionaries[locale])) {
      assert.equal(typeof target, "string", `${locale}: ${source}`);
      assert.ok(target.trim(), `${locale} has an empty translation for: ${source}`);
      assert.equal(placeholders(target), placeholders(source), `${locale} changes the placeholders of: ${source}`);
    }
  }
});

test("long English sentences are never copied into a translation unchanged", () => {
  // Identifiers, file paths, ULIDs and the official names/addresses of the regulators stay as published.
  const code = /^[\w./#-]+$|^0[0-9A-Z]{25}$|^stoat\+\+ [\w./#-]+$|Information Commissioner|^P\.O\. Box/;
  for (const locale of locales) {
    const copied = Object.entries(dictionaries[locale]).filter(([source, target]) => source === target && source.length > 24 && /\s/.test(source) && !code.test(source));
    assert.deepEqual(copied.map(([source]) => source), [], `${locale} leaves English sentences untranslated`);
  }
});

test("every user-visible string found in the source is translated", () => {
  const audit = spawnSync(process.execPath, [path.join(root, "i18n", "audit.cjs")], { cwd: root, encoding: "utf8" });
  assert.equal(audit.status, 0, `i18n/audit.cjs reports untranslated strings (run \`node i18n/tools.cjs export\`):\n${audit.stdout}${audit.stderr}`);
});

test("user-facing API messages from the Python services are translated", async () => {
  const cache = mkdtempSync(path.join(tmpdir(), "stoatmod-i18n-"));
  const list = path.join(cache, "server-strings.json");
  const extract = spawnSync(process.execPath, [path.join(root, "i18n", "server-strings.cjs"), "--json", list], { cwd: root, encoding: "utf8" });
  assert.equal(extract.status, 0, extract.stderr);
  assert.ok(JSON.parse(await readFile(list, 'utf8')).length > 100, 'the API message check must not be empty');
  const check = spawnSync(process.execPath, [path.join(root, "i18n", "coverage.cjs"), "--strings", list], { cwd: root, encoding: "utf8" });
  assert.equal(check.status, 0, check.stderr);
  const missing = /not in dictionary: (\d+)/.exec(check.stdout);
  assert.ok(missing, check.stdout);
  assert.equal(Number(missing[1]), 0, `untranslated server messages:\n${check.stdout}`);
});
