import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import test from "node:test";
import ts from "typescript";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const source = await readFile(new URL("../app/ApplicationsPanel.tsx", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: {
  target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
} });
const compiled = { exports: {} };
runInNewContext(`(function(require,module,exports){${outputText}\n})`)(
  (id) => id.endsWith(".css") ? new Proxy({}, { get: (_, key) => key === "__esModule" ? false : String(key) })
    : id === "./lib/api" ? {}
    : id === "./lib/plural" ? { pluralize: (count, one, other) => `${count} ${count === 1 ? one : other}` }
    : require(id), compiled, compiled.exports);
const { ApplicantChannelPicker, ApplicationEmbedPreview } = compiled.exports;
const channels = [
  { channel_id: "rules", channel_name: "Rules", category_id: "important" },
  { channel_id: "announcements", channel_name: "Announcements", category_id: "important" },
  { channel_id: "chat", channel_name: "General", category_id: null },
];
const categories = [{ category_id: "important", category_name: "Important" }];
function render(selected = [], onChange = () => {}, disabled = false) {
  return ApplicantChannelPicker({ channels, categories, selected, onChange, disabled });
}
function elements(element, type) {
  if (!element || typeof element !== "object") return [];
  if (Array.isArray(element)) return element.flatMap((child) => elements(child, type));
  return [...(element.type === type ? [element] : []), ...elements(element.props?.children, type)];
}

test("category checkbox selects its channels and preserves other selections", () => {
  let selected;
  const tree = render(["chat"], (ids) => { selected = Array.from(ids); });
  elements(tree, "input")[0].props.onChange({ target: { checked: true } });
  assert.deepEqual(selected.sort(), ["announcements", "chat", "rules"]);
  const checkedTree = render(selected, (ids) => { selected = Array.from(ids); });
  const inputs = elements(checkedTree, "input");
  assert.equal(inputs[0].props.checked, true);
  assert.equal(inputs[1].props.disabled, true);
  assert.equal(inputs[2].props.disabled, true);
  inputs[0].props.onChange({ target: { checked: false } });
  assert.deepEqual(selected, ["chat"]);
});

test("partial category permits individual choices and exposes mixed state", () => {
  let selected;
  const inputs = elements(render(["rules"], (ids) => { selected = Array.from(ids); }), "input");
  assert.equal(inputs[0].props["aria-checked"], "mixed");
  assert.equal(inputs[1].props.checked, true);
  assert.equal(inputs[1].props.disabled, false);
  assert.equal(inputs[2].props.checked, false);
  inputs[2].props.onChange({ target: { checked: true } });
  assert.deepEqual(selected.sort(), ["announcements", "rules"]);
});

test("clear selection hides all channels and setup disables the picker", () => {
  let selected;
  const tree = render(["rules", "chat"], (ids) => { selected = Array.from(ids); });
  elements(tree, "button")[0].props.onClick();
  assert.deepEqual(selected, []);
  const html = renderToStaticMarkup(render());
  assert.match(html, /All channels hidden/);
  assert.match(html, /Important/);
  assert.match(html, /Uncategorised/);
  assert.match(html, /Selected channels are read-only/);
  assert.equal(render([], () => {}, true).props.disabled, true);
});

test("unavailable saved channels can be removed without losing current choices", () => {
  let selected;
  const tree = render(["rules", "deleted"], (ids) => { selected = Array.from(ids); });
  assert.match(renderToStaticMarkup(tree), /no longer in the channel list/);
  elements(tree, "button")[1].props.onClick();
  assert.deepEqual(selected, ["rules"]);
});

test("DM preview renders custom accents, emojis and safe Markdown across split messages", () => {
  const html = renderToStaticMarkup(ApplicationEmbedPreview({ embeds: [
    { title: "🦦 Welcome", color: "#123456", description: "**Bold** and *italic* with `code`\n[Rules](https://example.test/rules)" },
    { title: "Next", color: "#112233", description: "<script>alert(1)</script> [bad](javascript:alert(1))" },
  ] }));
  assert.match(html, /🦦 Welcome/);
  assert.match(html, /border-left-color:#123456/);
  assert.match(html, /<strong>Bold<\/strong>/);
  assert.match(html, /<em>italic<\/em>/);
  assert.match(html, /href="https:\/\/example.test\/rules"/);
  assert.match(html, /2 messages will be sent/);
  assert.doesNotMatch(html, /<script>|href="javascript:/);
});
