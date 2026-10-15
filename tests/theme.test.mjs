import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import vm from "node:vm";
import ts from "typescript";

const source = await readFile(new URL("../app/lib/theme.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const loadTheme = () => import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}#${crypto.randomUUID()}`);

function browser({ saved, systemDark = false, blocked = false, path = "/discovery" } = {}) {
  const original = { window: globalThis.window, document: globalThis.document, MutationObserver: globalThis.MutationObserver };
  const storage = new Map(saved === undefined ? [] : [["stoatmod-theme", saved]]);
  const media = Object.assign(new EventTarget(), { matches: systemDark });
  const observers = new Set();
  let writes = 0;
  const attributes = new Map();
  const changed = () => {
    writes++;
    for (const observer of observers) queueMicrotask(() => { if (observers.has(observer)) observer.callback(); });
  };
  const root = {
    getAttribute: (key) => attributes.get(key) ?? null,
    hasAttribute: (key) => attributes.has(key),
    setAttribute(key, value) { attributes.set(key, value); changed(); },
    removeAttribute(key) { if (attributes.delete(key)) changed(); },
  };
  const window = Object.assign(new EventTarget(), {
    location: { pathname: path },
    matchMedia: () => media,
    localStorage: {
      getItem(key) { if (blocked) throw new Error("Storage disabled"); return storage.get(key) ?? null; },
      setItem(key, value) { if (blocked) throw new Error("Storage disabled"); storage.set(key, value); },
    },
  });
  globalThis.window = window;
  globalThis.document = { documentElement: root };
  globalThis.MutationObserver = class {
    constructor(callback) { this.callback = callback; }
    observe(target, options) {
      assert.equal(target, root);
      assert.deepEqual(options, { attributes: true, attributeFilter: ["data-theme"] });
      observers.add(this);
    }
    disconnect() { observers.delete(this); }
  };
  return {
    window, root, media, storage,
    get writes() { return writes; },
    bootstrap(script) {
      vm.runInNewContext(script, { document: globalThis.document, location: window.location, localStorage: window.localStorage, matchMedia: window.matchMedia });
    },
    storageEvent(key) { window.dispatchEvent(Object.assign(new Event("storage"), { key })); },
    cleanup() { Object.assign(globalThis, original); },
  };
}

test("pre-paint initialization and the client agree on saved, system and unavailable-storage preferences", async () => {
  for (const [options, expected] of [
    [{ saved: "dark" }, "dark"],
    [{ saved: "light", systemDark: true }, "light"],
    [{ systemDark: true }, "dark"],
    [{ systemDark: false }, "light"],
    [{ saved: "invalid", systemDark: true }, "dark"],
    [{ saved: "invalid", systemDark: false }, "light"],
    [{ saved: "light", blocked: true, systemDark: true }, "dark"],
  ]) {
    const env = browser(options);
    try {
      const theme = await loadTheme();
      env.bootstrap(theme.themeBootstrap);
      assert.equal(env.root.getAttribute("data-theme"), expected);
      assert.equal(theme.getThemeSnapshot(), expected);
    } finally { env.cleanup(); }
  }
});

test("both saved themes survive page navigation and a homepage round trip", async () => {
  for (const saved of ["dark", "light"]) {
    const env = browser({ saved, systemDark: saved === "light" });
    try {
      const theme = await loadTheme();
      for (const path of ["/discovery", "/status", "/features", "/", "/discovery", "/discovery/servers/community", "/appeal"]) {
        env.window.location.pathname = path;
        env.bootstrap(theme.themeBootstrap);
        theme.restoreTheme();
        assert.equal(env.root.getAttribute("data-theme"), path === "/" ? null : saved, path);
        assert.equal(theme.getThemeSnapshot(), saved, path);
        assert.equal(env.storage.get("stoatmod-theme"), saved, path);
      }
    } finally { env.cleanup(); }
  }
});

test("rendering and history restoration cannot discard a saved theme, and subscriptions clean up", async (t) => {
  const env = browser({ saved: "dark" });
  const theme = await loadTheme();
  let notifications = 0;
  const stop = theme.subscribeTheme(() => { notifications++; });
  t.after(() => { stop(); env.cleanup(); });
  env.root.removeAttribute("data-theme");
  await new Promise(setImmediate);
  assert.equal(env.root.getAttribute("data-theme"), "dark");
  const settledWrites = env.writes;
  await new Promise(setImmediate);
  assert.equal(env.writes, settledWrites, "theme restoration must not create a mutation loop");
  env.root.setAttribute("data-theme", "light");
  env.window.dispatchEvent(new Event("pageshow"));
  assert.equal(env.root.getAttribute("data-theme"), "dark");
  await new Promise(setImmediate);
  stop();
  const stoppedNotifications = notifications;
  env.root.removeAttribute("data-theme");
  env.window.dispatchEvent(new Event("pageshow"));
  env.storageEvent("stoatmod-theme");
  env.media.dispatchEvent(new Event("change"));
  await new Promise(setImmediate);
  assert.equal(env.root.getAttribute("data-theme"), null);
  assert.equal(notifications, stoppedNotifications);
});

test("the toggle, other tabs and system changes keep the theme snapshot and page in sync", async (t) => {
  const env = browser();
  const theme = await loadTheme();
  const snapshots = [];
  const stop = theme.subscribeTheme(() => { snapshots.push(theme.getThemeSnapshot()); });
  t.after(() => { stop(); env.cleanup(); });
  theme.setTheme("dark");
  assert.equal(env.storage.get("stoatmod-theme"), "dark");
  assert.equal(env.root.getAttribute("data-theme"), "dark");
  assert.equal(snapshots.at(-1), "dark");
  env.media.dispatchEvent(new Event("change"));
  assert.equal(env.root.getAttribute("data-theme"), "dark", "explicit choice wins over the OS");
  env.storage.set("stoatmod-theme", "light");
  env.storageEvent("stoatmod-theme");
  assert.equal(env.root.getAttribute("data-theme"), "light");
  assert.equal(snapshots.at(-1), "light");
  env.media.matches = true;
  env.media.dispatchEvent(new Event("change"));
  assert.equal(env.root.getAttribute("data-theme"), "light");
  env.storage.clear();
  env.storageEvent(null);
  assert.equal(env.root.getAttribute("data-theme"), "dark");
  env.media.matches = false;
  env.media.dispatchEvent(new Event("change"));
  assert.equal(env.root.getAttribute("data-theme"), "light");
  await new Promise(setImmediate);
});

test("a blocked storage write does not break the theme toggle", async (t) => {
  const env = browser({ blocked: true });
  t.after(env.cleanup);
  const theme = await loadTheme();
  theme.restoreTheme();
  assert.equal(env.root.getAttribute("data-theme"), "light");
  assert.doesNotThrow(() => theme.setTheme("dark"));
  assert.equal(theme.getThemeSnapshot(), "dark");
  assert.equal(env.root.getAttribute("data-theme"), "dark");
  theme.restoreTheme();
  assert.equal(env.root.getAttribute("data-theme"), "dark");
});
