import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../app/lib/discovery-media.ts", import.meta.url), "utf8");
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
const { createDiscoveryMediaStore, safeServerMediaUrl } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

test("rejects unsafe media URLs without rejecting real Stoat CDN assets", () => {
  assert.equal(safeServerMediaUrl("https://cdn.stoatusercontent.com/icons/one"), "https://cdn.stoatusercontent.com/icons/one");
  for (const value of ["javascript:alert(1)", "http://cdn.stoatusercontent.com/a", "https://evil.test/a", "https://cdn.stoatusercontent.com.evil.test/a", "https://token@cdn.stoatusercontent.com/a"]) assert.equal(safeServerMediaUrl(value), "");
});

test("one shared refresh updates and removes images, preserves them during outages, and stops while hidden or unmounted", async (t) => {
  const originalDocument = globalThis.document;
  const originalWindow = globalThis.window;
  globalThis.document = Object.assign(new EventTarget(), { visibilityState: "visible" });
  globalThis.window = new EventTarget();
  t.after(() => { globalThis.document = originalDocument; globalThis.window = originalWindow; });
  t.mock.timers.enable({ apis: ["Date", "setInterval", "setTimeout"], now: 100_000 });
  let payload = { servers: [{ server_id: "a", server_name: "A", server_icon_url: "https://cdn.stoatusercontent.com/icons/one", server_banner_url: "https://cdn.stoatusercontent.com/banners/one" }] };
  let failure = false;
  let calls = 0;
  const store = createDiscoveryMediaStore(async (_url, init) => {
    calls++;
    assert.equal(init.cache, "no-store");
    if (failure) throw new Error("offline");
    return Response.json(payload);
  });
  const settle = () => new Promise((resolve) => setImmediate(resolve));
  assert.equal(store.getServerSnapshot(), undefined);
  const stop1 = store.subscribe(() => {});
  const stop2 = store.subscribe(() => {});
  await settle();
  assert.equal(calls, 1);
  assert.equal(store.getSnapshot("a").icon, payload.servers[0].server_icon_url);

  payload.servers[0].server_icon_url = "https://cdn.stoatusercontent.com/icons/two";
  payload.servers[0].server_banner_url = null;
  t.mock.timers.tick(60_000);
  await settle();
  assert.ok(store.getSnapshot("a").icon.endsWith("/two"));
  assert.equal(store.getSnapshot("a").banner, "");
  const previous = store.getSnapshot("a");
  failure = true;
  t.mock.timers.tick(60_000);
  await settle();
  assert.equal(store.getSnapshot("a"), previous);

  document.visibilityState = "hidden";
  t.mock.timers.tick(60_000);
  await settle();
  assert.equal(calls, 3);
  failure = false;
  payload = { servers: [] };
  document.visibilityState = "visible";
  document.dispatchEvent(new Event("visibilitychange"));
  await settle();
  assert.deepEqual(store.getSnapshot("a"), { name: "", icon: "", banner: "" });
  stop1(); stop2();
  t.mock.timers.tick(120_000);
  await settle();
  assert.equal(calls, 4);
});
