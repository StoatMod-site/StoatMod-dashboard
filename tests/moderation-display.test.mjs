import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../app/lib/moderation-display.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { policyName, isSupportOnly, categoryScores } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

test("support-only legacy deletions are distinguished from mixed violations", () => {
  assert.equal(isSupportOnly({ categories: { credentials: true, scams: false }, warning_added: false }), true);
  assert.equal(isSupportOnly({ categories: ["suicidal-thoughts"], warning_added: false }), true);
  assert.equal(isSupportOnly({ categories: { credentials: true, scams: true } }), false);
  assert.equal(isSupportOnly({ scores: { credentials: 1, scams: .0001 } }), false);
  assert.equal(isSupportOnly({ support_only: true, warning_added: true }), false);
  assert.equal(isSupportOnly({ support_only: true, warning_id: 4 }), false);
  assert.equal(isSupportOnly({ support_only: false, categories: ["credentials"] }), false);
  assert.equal(isSupportOnly({ matched_categories: ["credentials"], categories: { credentials: true, scams: true } }), true);
  assert.equal(isSupportOnly({}), false);
});

test("display labels accept older APIs without showing policy prefixes", () => {
  assert.equal(policyName("credentials", "STOAT TOS - Live credentials of your own account"), "Live credentials of your own account");
  assert.equal(policyName("suicidal-thoughts", "Support - Suicidal thoughts"), "Suicidal thoughts");
  assert.equal(policyName("new-category", "STOAT TOS - New policy"), "New policy");
});

test("category scores retain precision and safely exclude malformed values", () => {
  assert.deepEqual(categoryScores({ low: .0003, high: .9997, broken: "text", null: null, infinite: Infinity, over: 2 }), [["over", 1], ["high", .9997], ["low", .0003]]);
  assert.deepEqual(categoryScores(null), []);
});
