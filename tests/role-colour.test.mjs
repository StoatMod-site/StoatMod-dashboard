import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { runInNewContext } from "node:vm";
import test from "node:test";
import ts from "typescript";

// The same fixture drives tests/test_role_manager.py, so the browser and the server agree.
const fixture = JSON.parse(await readFile(new URL("./fixtures/role-colours.json", import.meta.url), "utf8"));
const source = await readFile(new URL("../app/lib/role-colour.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS } });
const compiled = { exports: {} };
runInNewContext(`(function(module,exports){${outputText}\n})`, {})(compiled, compiled.exports);
const exported = compiled.exports;
const plain = (value) => JSON.parse(JSON.stringify(value ?? null)); // the module runs in its own realm
const { MAX_COLOUR_LENGTH } = exported;
const canonicalColour = (input) => plain(exported.canonicalColour(input));
const parseColour = (css) => plain(exported.parseColour(css));
const buildColour = (model) => exported.buildColour(model);
const colourProblem = (model) => exported.colourProblem(model);
const nameStyle = (css) => plain(exported.nameStyle(css));
const swatch = (css) => exported.swatch(css);

test("valid colours are rewritten exactly as the server rewrites them", () => {
  for (const [input, expected] of Object.entries(fixture.valid)) {
    const result = canonicalColour(input);
    assert.deepEqual({ input, ...result }, { input, ok: true, value: expected });
    assert.ok(result.value.length <= MAX_COLOUR_LENGTH);
  }
});

test("invalid colours are refused with a message", () => {
  for (const input of fixture.invalid) {
    const result = canonicalColour(input);
    assert.equal(result.ok, false, `accepted ${JSON.stringify(input)}`);
    assert.ok(result.error.length > 10);
  }
});

test("a gradient the editor builds round-trips through parse and build", () => {
  const model = { mode: "gradient", kind: "linear", angle: 135, stops: [{ colour: "#ff512f", position: 0 }, { colour: "#f09819", position: null }, { colour: "#ffffff", position: 100 }] };
  const css = buildColour(model);
  assert.equal(css, "linear-gradient(135deg, #ff512f 0%, #f09819, #ffffff 100%)");
  assert.deepEqual(parseColour(css), model);
  assert.equal(canonicalColour(css).value, css);
  assert.equal(colourProblem(model), null);
});

test("existing colours open in the matching editor mode", () => {
  assert.deepEqual(parseColour(null), { mode: "none" });
  assert.deepEqual(parseColour("#00FF00"), { mode: "solid", colour: "#00ff00" });
  assert.equal(parseColour("radial-gradient(#fff 10%, #000)").mode, "custom"); // three-digit hex stops are edited as CSS
  assert.deepEqual(parseColour("rebeccapurple"), { mode: "custom", css: "rebeccapurple" });
  assert.deepEqual(parseColour("linear-gradient(to right, #ff0000, #0000ff)"), { mode: "gradient", kind: "linear", angle: 90, stops: [{ colour: "#ff0000", position: null }, { colour: "#0000ff", position: null }] });
  assert.deepEqual(parseColour("not a colour"), { mode: "custom", css: "not a colour" });
});

test("a model with too few or too many stops cannot be saved", () => {
  const stop = { colour: "#ffffff", position: null };
  assert.ok(colourProblem({ mode: "gradient", kind: "linear", angle: 90, stops: [stop] }));
  assert.ok(colourProblem({ mode: "gradient", kind: "linear", angle: 90, stops: Array(21).fill(stop) }));
  assert.ok(colourProblem({ mode: "custom", css: "url(x)" }));
  assert.equal(colourProblem({ mode: "none" }), null);
});

test("role names are painted like Stoat paints them and unsafe values paint nothing", () => {
  assert.deepEqual(nameStyle("#7c3aed"), { color: "#7c3aed" });
  const gradient = nameStyle("linear-gradient(90deg, #ff0000, #0000ff)");
  assert.equal(gradient.backgroundImage, "linear-gradient(90deg, #ff0000, #0000ff)");
  assert.equal(gradient.color, "transparent");
  assert.equal(gradient.backgroundClip, "text");
  assert.deepEqual(nameStyle("url(https://example.com/x.png)"), {});
  assert.deepEqual(nameStyle(null), {});
  assert.equal(swatch("red; background: url(x)"), undefined);
  assert.equal(swatch("RED"), "red");
});
