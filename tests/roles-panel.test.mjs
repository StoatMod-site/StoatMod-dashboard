import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import test from "node:test";
import ts from "typescript";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

const require = createRequire(import.meta.url);
const options = { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } };
const compile = async (file) => ts.transpileModule(await readFile(new URL(file, import.meta.url), "utf8"), options).outputText;
const panelSource = await compile("../app/RolesPanel.tsx");
const colourSource = await compile("../app/lib/role-colour.ts");

const catalog = {
  groups: [{ id: "server", label: "Server" }, { id: "text", label: "Text channels" }],
  permissions: [
    { key: "manage_roles", group: "server", name: "Manage Roles", description: "Create, edit, reorder and delete roles below their own." },
    { key: "send_messages", group: "text", name: "Send Messages", description: "Send messages in text channels." },
    { key: "react", group: "text", name: "React", description: "Add reactions to messages." },
  ],
};
const role = (id, name, rank, extra = {}) => ({ id, name, colour: null, hoist: false, rank, allow: [], deny: [], editable: true, permissions_editable: true, locked_reason: null, locked_message: null, ...extra });
const locked = "Stoatmod's role is not above this role. Move the Stoatmod role higher in Stoat's role list to manage it.";
const snapshot = () => ({
  server: { id: "server", name: "Test" },
  limits: { max_roles: 200, name_max: 32, colour_max: 128, max_stops: 8 },
  catalog,
  bot: { in_server: true, rank: 1, can_manage_roles: true, can_manage_permissions: true },
  actor: { is_owner: true, can_manage_roles: true, can_manage_permissions: true },
  create_blocked: null,
  grantable: ["send_messages", "react"],
  default_permissions: ["view_channel"],
  roles: [
    role("ADMIN", "Admin", 0, { editable: false, permissions_editable: false, locked_reason: "above_bot", locked_message: locked }),
    role("MODS", "Mods", 2, { colour: "#00ff00", hoist: true, allow: ["send_messages"] }),
    role("MEMBERS", "Members", 3),
    role("VIP", "VIP", 4, { colour: "linear-gradient(90deg, #ff0000, #0000ff)" }),
  ],
});

class RateLimitedError extends Error {
  constructor(message, retryAfter, source) {
    super(message);
    this.retryAfter = retryAfter;
    this.source = source;
  }
}

function harness({ selected = "MODS", edit, response = {}, limited = 0 } = {}) {
  const data = snapshot();
  const found = data.roles.find((item) => item.id === selected);
  const draft = {
    name: found.name,
    colour: { mode: "none" },
    hoist: found.hoist,
    allow: [...found.allow],
    deny: [...found.deny],
  };
  const states = [data, selected, draft, null, false, "", "", "", "", "", ""];
  const requests = [];
  let cursor = 0;
  const hooks = {
    ...React,
    useEffect() {},
    useMemo: (factory) => factory(),
    useRef: (initial) => ({ current: initial }),
    useState(initial) {
      const index = cursor++;
      if (!(index in states)) states[index] = typeof initial === "function" ? initial() : initial;
      return [states[index], (next) => { states[index] = typeof next === "function" ? next(states[index]) : next; }];
    },
  };
  const colour = { exports: {} };
  runInNewContext(`(function(module,exports){${colourSource}\n})`, {})(colour, colour.exports);
  const compiled = { exports: {} };
  const api = async (path, init) => {
    requests.push({ path, init });
    if (requests.length <= limited) {
      throw new RateLimitedError("Stoat is ratelimiting us! We'll retry your request in 7 seconds and reflect the change here.", 7, "stoat");
    }
    return { ...snapshot(), ...response };
  };
  // Timers the panel starts are held until the test runs them, so a countdown can be inspected mid-wait.
  const timers = [];
  const window = { setTimeout: (fn) => timers.push(fn), clearTimeout() {}, setInterval: () => 0, clearInterval() {} };
  runInNewContext(`(function(require,module,exports){${panelSource}\n})`, { structuredClone, window })(
    (id) => id === "react" ? hooks : id.endsWith(".css") ? new Proxy({}, { get: (_, key) => key === "__esModule" ? false : String(key) }) : id === "./lib/api" ? { api, RateLimitedError } : id === "./lib/role-colour" ? colour.exports : require(id),
    compiled, compiled.exports);
  if (edit) edit(states);
  return {
    states, requests,
    runTimers() { timers.splice(0).forEach((fn) => fn()); },
    tree() { cursor = 0; return compiled.exports.RolesPanel(); },
    html() { cursor = 0; return renderToStaticMarkup(compiled.exports.RolesPanel()); },
  };
}
function elements(node, type) {
  if (!node || typeof node !== "object") return [];
  if (Array.isArray(node)) return node.flatMap((item) => elements(item, type));
  return [...(node.type === type ? [node] : []), ...elements(node.props?.children, type)];
}
const text = (node) => node == null || typeof node === "boolean" ? "" : Array.isArray(node) ? node.map(text).join("") : typeof node === "object" ? text(node.props?.children) : String(node);

test("every role is listed highest first and the ones Stoatmod cannot touch are marked read-only", () => {
  const html = harness().html();
  const names = [...html.matchAll(/class="roleName"[^>]*>([^<]+)</g)].map((match) => match[1]);
  assert.deepEqual(names, ["Admin", "Mods", "Members", "VIP", "Everyone"]);
  assert.match(html, /Read-only/);
  assert.match(html, /3 of 4 roles can be edited here/);
  assert.match(html, /Show members with this role separately/);
});

test("a role above Stoatmod opens read-only with the reason and cannot be saved", () => {
  const h = harness({ selected: "ADMIN" });
  const html = h.html();
  assert.ok(html.includes(locked.replaceAll("'", "&#x27;")));
  assert.equal([...html.matchAll(/<fieldset disabled=""/g)].length, 2);
  const save = elements(h.tree(), "button").find((button) => text(button).startsWith("Save changes"));
  assert.equal(save.props.disabled, true);
});

test("the preview and the list follow the colour being edited", () => {
  const h = harness({ edit: (states) => { states[2].colour = { mode: "gradient", kind: "linear", angle: 45, stops: [{ colour: "#ff512f", position: null }, { colour: "#f09819", position: 80 }] }; } });
  const html = h.html();
  assert.match(html, /background-image:linear-gradient\(45deg, #ff512f, #f09819 80%\)/);
  assert.match(html, /-webkit-background-clip:text/);
  assert.match(html, /linear-gradient\(45deg, #ff512f, #f09819 80%\)<\/code>/);
});

test("saving sends only the fields that changed", async () => {
  const h = harness({ edit: (states) => { states[2].name = "  Moderators  "; states[2].allow = ["send_messages", "react"]; states[2].deny = ["manage_roles"]; } });
  const save = elements(h.tree(), "button").find((button) => text(button).startsWith("Save changes"));
  assert.equal(save.props.disabled, false);
  await save.props.onClick();
  assert.equal(h.requests.length, 1);
  assert.equal(h.requests[0].path, "/api/roles/MODS");
  assert.equal(h.requests[0].init.method, "PUT");
  assert.deepEqual(JSON.parse(h.requests[0].init.body), { name: "Moderators", colour: null, allow: ["send_messages", "react"], deny: ["manage_roles"] });
});

test("an untouched role has nothing to save", () => {
  const h = harness({ edit: (states) => { states[2].colour = { mode: "solid", colour: "#00ff00" }; } });
  const save = elements(h.tree(), "button").find((button) => text(button).startsWith("Save changes"));
  assert.equal(save.props.disabled, true);
});

test("an invalid colour or empty name blocks saving and says why", () => {
  for (const edit of [(states) => { states[2].colour = { mode: "custom", css: "url(https://example.com/x.png)" }; }, (states) => { states[2].name = "   "; }]) {
    const h = harness({ edit });
    const save = elements(h.tree(), "button").find((button) => text(button).startsWith("Save changes"));
    assert.equal(save.props.disabled, true);
    assert.match(h.html(), /role="alert"/);
  }
});

test("reordering is saved as the complete order of the editable roles", async () => {
  const h = harness({ edit: (states) => { states[3] = ["MODS", "VIP", "MEMBERS"]; } });
  assert.match(h.html(), /The new order has not been saved yet/);
  const save = elements(h.tree(), "button").find((button) => text(button).startsWith("Save order"));
  await save.props.onClick();
  assert.equal(h.requests[0].path, "/api/roles/order");
  assert.deepEqual(JSON.parse(h.requests[0].init.body), { order: ["MODS", "VIP", "MEMBERS"] });
});

test("deleting needs the exact role name typed first", async () => {
  const h = harness();
  let button = elements(h.tree(), "button").find((item) => text(item) === "Delete role");
  assert.equal(button.props.disabled, true);
  h.states[10] = "mods";
  button = elements(h.tree(), "button").find((item) => text(item) === "Delete role");
  assert.equal(button.props.disabled, true);
  h.states[10] = "Mods";
  button = elements(h.tree(), "button").find((item) => text(item) === "Delete role");
  assert.equal(button.props.disabled, false);
  await button.props.onClick();
  assert.deepEqual(h.requests.map((request) => [request.init.method, request.path, JSON.parse(request.init.body)]), [["DELETE", "/api/roles/MODS", { confirm_name: "Mods" }]]);
});

test("a role the permissions of which Stoatmod cannot grant offers no Allow button for them", () => {
  const html = harness().html();
  assert.match(html, /aria-label="Manage Roles"/);
  const manageRoles = html.slice(html.indexOf('aria-label="Manage Roles"'), html.indexOf('aria-label="Send Messages"'));
  assert.match(manageRoles, /data-state="allow" disabled=""/);
  const sendMessages = html.slice(html.indexOf('aria-label="Send Messages"'), html.indexOf('aria-label="React"'));
  assert.doesNotMatch(sendMessages, /data-state="allow" disabled=""/);
});

test("the tab says whether role changes reach the moderation log channel", () => {
  const configured = harness({ edit: (states) => { states[0].log_channel = { configured: true }; } }).html();
  assert.match(configured, /Role changes are posted to your moderation log channel\./);
  const missing = harness({ edit: (states) => { states[0].log_channel = { configured: false }; } }).html();
  assert.match(missing, /No moderation log channel is set, so role changes are only kept in the Activity log\. Choose one in Policy Studio\./);
  assert.doesNotMatch(harness().html(), /moderation log channel/);
});

test("a save reports whether the change was posted to the log channel", async () => {
  const edit = (states) => { states[2].name = "Moderators"; };
  const saveAndWait = async (response) => {
    const h = harness({ edit, response });
    elements(h.tree(), "button").find((button) => text(button).startsWith("Save changes")).props.onClick();
    await new Promise((resolve) => setTimeout(resolve, 20));
    return h;
  };
  assert.equal((await saveAndWait({ log_status: "posted" })).states[11], "Posted to the moderation log channel.");
  assert.match((await saveAndWait({ log_status: "failed" })).states[11], /could not post this to the moderation log channel/);
  const none = await saveAndWait({ log_status: "no_channel" });
  assert.equal(none.states[11], "");
  assert.equal(none.states[6], "Saved. The change is live in Stoat.");
});

test("a save that Stoat rate limits counts down, locks saving, then sends the same request again by itself", async () => {
  const h = harness({ edit: (states) => { states[2].name = "Moderators"; }, limited: 1, response: { log_status: "posted" } });
  elements(h.tree(), "button").find((button) => text(button).startsWith("Save changes")).props.onClick();
  await new Promise((resolve) => setTimeout(resolve, 20));
  const waiting = h.html();
  assert.match(waiting, /Stoat is ratelimiting us! We&#x27;ll retry your request in 7 seconds and reflect the change here\./);
  assert.match(waiting, /Changes are paused until then/);
  const save = elements(h.tree(), "button").find((button) => text(button).startsWith("Waiting 7s"));
  assert.equal(save.props.disabled, true);
  assert.equal(h.states[6], "");  // nothing claims success yet
  assert.equal(h.requests.length, 1);

  h.runTimers();
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.equal(h.requests.length, 2);
  assert.equal(h.requests[1].path, h.requests[0].path);
  assert.equal(h.requests[1].init.body, h.requests[0].init.body);
  assert.equal(h.states[6], "Saved. The change is live in Stoat.");
  assert.equal(h.states[11], "Posted to the moderation log channel.");
  assert.doesNotMatch(h.html(), /ratelimiting/);
});

test("a change Stoat made whose refresh is rate limited is shown as saved, then the list is fetched again", async () => {
  const h = harness({ edit: (states) => { states[2].name = "Moderators"; }, response: { saved: true, needs_refresh: true, rate_limited: true, retry_after: 3 } });
  elements(h.tree(), "button").find((button) => text(button).startsWith("Save changes")).props.onClick();
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.match(h.html(), /Saved\. The change is live in Stoat\. Stoat is ratelimiting us, so this list will update in 3 seconds\./);
  assert.doesNotMatch(h.html(), /role="alert"/);
  h.runTimers();
  await new Promise((resolve) => setTimeout(resolve, 20));
  assert.deepEqual(h.requests.map((request) => request.path), ["/api/roles/MODS", "/api/roles"]);
});

test("a colour the role already has is never a reason to refuse a save, even when the editor cannot check it", () => {
  const odd = "hsl(120, 50%, 50%)";
  const h = harness({ edit: (states) => {
    states[0].roles.find((item) => item.id === "MODS").colour = odd;
    states[2].colour = { mode: "custom", css: odd };
    states[2].name = "Moderators";
  } });
  const save = elements(h.tree(), "button").find((button) => text(button).startsWith("Save changes"));
  assert.equal(save.props.disabled, false);
  // Touching the colour, though, means it has to be valid.
  const touched = harness({ edit: (states) => {
    states[0].roles.find((item) => item.id === "MODS").colour = odd;
    states[2].colour = { mode: "custom", css: odd + " " };
  } });
  assert.equal(elements(touched.tree(), "button").find((button) => text(button).startsWith("Save changes")).props.disabled, true);
});
