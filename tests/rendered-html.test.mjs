import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

test("every published moderation example includes its required reason", async () => {
  const loadContent = async (name) => {
    const source = await readFile(new URL(`../app/content/${name}.ts`, import.meta.url), "utf8");
    const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext } });
    return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
  };
  const [{ publicCommands }, { documentationPages }, { guidePages }, { featurePages }] = await Promise.all(
    ["commands", "docs", "guides", "features"].map(loadContent),
  );
  const examples = publicCommands.map(([command]) => command);
  for (const page of Object.values({ ...documentationPages, ...guidePages, ...featurePages })) {
    for (const section of page.sections) {
      examples.push(...(section.commands || []).map(({ command }) => command));
      examples.push(...(section.steps || []).flatMap(({ command }) => command ? [command] : []));
    }
  }
  const actions = new Set(["~approve", "~deny", "~warn", "~mute", "~unmute", "~kick", "~ban", "~unban", "~bypass"]);
  for (const command of examples) {
    if (!actions.has(command.split(" ")[0])) continue;
    assert.doesNotMatch(command, /\[REASON\]/, command);
    assert.ok(command.split(/\s+/).length >= 3, `Missing reason: ${command}`);
    assert.doesNotMatch(command, /\[DURATION\]$/, `Missing mute reason: ${command}`);
  }
  assert.ok(publicCommands.some(([command]) => command === "~unban USER_ID REASON"));
  assert.ok(publicCommands.some(([command]) => command === "~remove CASE_ID"));
  const actionsGuide = JSON.stringify(documentationPages["moderation-actions"]);
  assert.doesNotMatch(actionsGuide, /does not accept a reason|\[REASON\]/);
  assert.match(actionsGuide, /before or after|reason before|reason, or omit/);
});

test("new dashboard features include every supported translation", async () => {
  const source = await readFile(new URL("../app/WebsiteI18n.tsx", import.meta.url), "utf8");
  const required = [
    "You can now advertise your server using our Discovery page.",
    "Check your eligibility →",
    "Dismiss Discovery announcement",
    "Bump your server",
    "Save changes",
    "Changes are live on Discovery.",
    "Changes saved, but automatic checks held them for a quick review. Your current listing stays live.",
    "How people find your listing",
    "Custom logo and banner",
    "Get the verified tick",
    "Next bump available in",
    "Application checklist",
    "All required permissions",
    "Describe your community",
    "Public listing preview",
    "Apply for Discovery",
    "First page",
    "Previous page",
    "Next page",
    "Last page",
    "Loading all emojis…",
    "Search all emojis",
    "Choose emoji for option",
    "Move the Stoatmod role above this role before adding it.",
    "Allow GIFs",
    "user using TOR",
    "user using VPN",
    "user using proxy",
    "IP registered to Data Centre",
    "IP registered as abusive",
    "Owner controls",
    "Dashboard access",
    "Server owner only",
    "Grant access",
    "Remove access",
    "Revoke all sessions",
    "Manage Server permission",
    "Revoked by owner",
    "Restore default access",
    "Dashboard unavailable",
    "Try again",
    "Revoke every dashboard session for this server? Everyone, including you, will be signed out and must use a new login code.",
    "Protection centre",
    "Save all changes",
    "Choose what Stoatmod watches",
    "Set the intervention level",
    "Required confidence",
    "Required confidence to act",
    "Act on more matches",
    "Only high-confidence matches",
    "90% is the recommended minimum",
    "Lower certainty increases false positives. Tiny background category scores can cause harmless messages to be deleted and innocent members to receive warnings.",
    "Stoatmod recommends a 90% threshold. Lower values increase false positives and can delete harmless messages or warn innocent members. Continue?",
    "Final confirmation: lower the required confidence to",
    "Last 7 days",
    "Activity insights",
    "Aggregate counts only · message text is not stored",
    "Active channels",
    "Messages per member",
    "Net member growth",
    "Most active channels",
    "Most active words",
    "Channel activity will appear after new messages.",
    "Word trends will appear after new messages.",
    "Decide which risks count",
    "Included categories can trigger moderation when a match reaches the required confidence. Self-harm protections always remain active.",
    "Keep trusted spaces out of scope",
    "Language, warning expiry and visibility",
    "Control dashboard access",
    "Unsaved protection changes",
    "Go to case",
    "Case review",
    "Additional case evidence",
    "DM me when someone appeals",
    "Receive a private Stoat message when a new moderation appeal is submitted in this server.",
    "Your appeal notification preference was saved.",
    "Could not update your appeal notification preference.",
    "Poll results pagination",
    "Server reports",
    "Server reporting setup",
    "Instruction embed channel",
    "Enable server reports",
    "Server report inbox",
    "No server reports yet.",
    "Enforce",
    "Recommended",
    "Open Policy Studio",
    "Return to setup guide",
    "Add your server to Discovery",
    "Explore Discovery",
    "Report scammers and ToS violations",
    "See global reporting",
    "Global safety report",
    "Report a user to Stoatmod",
    "Continue to secure report",
    "Evidence attachments",
  ];
  for (const text of required) {
    const marker = `${JSON.stringify(text)}: {fr:`;
    const start = source.indexOf(marker);
    assert.notEqual(start, -1, `missing French translation entry for: ${text}`);
    const definition = source.slice(start, source.indexOf("},", start) + 2);
    assert.match(definition, /fr:"[^"]+"/u, `missing French translation for: ${text}`);
    assert.match(definition, /pt:"[^"]+"/u, `missing Portuguese translation for: ${text}`);
    assert.match(definition, /es:"[^"]+"/u, `missing Spanish translation for: ${text}`);
  }
});

// Site-wide rules live in globals.css; rules used only by the dashboards are split into dashboard.css.
async function allStylesheets() {
  const files = await Promise.all(["../app/globals.css", "../app/dashboard.css"].map((file) => readFile(new URL(file, import.meta.url), "utf8")));
  return files.join(String.fromCharCode(10));
}

async function render(path = "/", origin = "http://localhost", headers = {}) {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(new Request(`${origin}${path}`, { headers: { accept: "text/html", ...headers } }), {
    ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) },
  }, { waitUntil() {}, passThroughOnException() {} });
}

// Exercise the production renderer against a deterministic, public API snapshot.
async function withDiscoveryFixture(run, transform = (servers) => servers) {
  const originalFetch = globalThis.fetch;
  const originalOrigin = process.env.STOATMOD_PUBLIC_API_ORIGIN;
  const origin = `https://discovery-fixture-${crypto.randomUUID()}.example`;
  const servers = transform(Array.from({ length: 30 }, (_, index) => ({
    server_id: `01SEO${String(index).padStart(21, "0")}`,
    server_name: index === 0 ? "The Often Clan" : index === 29 ? "A Community With A Full Name Longer Than Thirty Two Characters" : `Community ${index}`,
    description: "A community for conversation, games and shared hobbies.",
    information: "Read our rules and introduce yourself when you join.",
    invite_url: "https://stt.gg/example",
    server_banner_url: index === 0 ? "https://cdn.stoatusercontent.com/banners/often" : index === 1 ? "https://untrusted.example/banner.png" : null,
    tags: index < 3 ? ["gaming"] : index === 3 ? ["rare", "rare"] : [],
    member_count: 100 - index,
    active_members: 10,
    daily_messages: 20,
    approved_at: "2026-09-01T12:00:00Z",
    updated_at: "2026-09-08T12:00:00Z",
  })));
  process.env.STOATMOD_PUBLIC_API_ORIGIN = origin;
  globalThis.fetch = async (input, init) => {
    if (String(input) === `${origin}/api/public/discovery`) return Response.json({ servers });
    return originalFetch(input, init);
  };
  try { return await run(servers); }
  finally {
    globalThis.fetch = originalFetch;
    if (originalOrigin === undefined) delete process.env.STOATMOD_PUBLIC_API_ORIGIN;
    else process.env.STOATMOD_PUBLIC_API_ORIGIN = originalOrigin;
  }
}

test("renders the Stoatmod public home page", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Stoatmod – Automod &amp; Moderation Bot for Stoat<\/title>/i);
  assert.match(html, /Automod and moderation/i);
  assert.match(html, /Built for Stoat servers/i);
  assert.match(html, /https:\/\/stoat\.chat\/bot\/01KY6VVK6E7N1KFJVKK9YJ1KE1/);
  assert.match(html, /href="\/features\/automod"/i);
  assert.match(html, /href="\/guides\/how-to-set-up-stoatmod"/i);
  assert.match(html, /open source under AGPL-3\.0/i);
  assert.doesNotMatch(html, /currently closed-source/i);
  assert.match(html, /Stoat automod, moderation statistics and accountable protection for healthier communities\./i);
  assert.match(html, /application\/ld\+json/i);
  assert.match(html, /SoftwareApplication/i);
  assert.match(html, /rel="canonical" href="https:\/\/modstoat\.site\/?"/i);
  assert.match(html, /og:image/i);
  assert.match(html, /name="robots" content="index, follow/i);
  assert.doesNotMatch(html, /saasbrowser/i);
  assert.doesNotMatch(html, /Your site is taking shape/i);
});

test("initializes the theme in the head before any page content", async () => {
  const html = await (await render("/discovery")).text();
  const head = html.slice(html.indexOf("<head>"), html.indexOf("</head>"));
  assert.match(head, /localStorage\.getItem\('stoatmod-theme'\)/);
  assert.match(head, /setAttribute\('data-theme',theme\)/);
});

test("emoji server initials survive HTML encoding on the homepage, Discovery and profiles", async () => {
  await withDiscoveryFixture(async (servers) => {
    const profile = `/discovery/servers/emoji-community-${servers[0].server_id.toLowerCase()}`;
    for (const path of ["/", "/discovery", profile]) {
      const response = await render(path);
      assert.equal(response.status, 200, path);
      const html = await response.text();
      assert.match(html, /<span aria-hidden="true">🎃<\/span>/u, path);
      assert.doesNotMatch(html, /<span aria-hidden="true">\uFFFD<\/span>/u, path);
    }
  }, (servers) => [{ ...servers[0], server_name: "🎃 Emoji Community", server_icon_url: "https://cdn.stoatusercontent.com/icons/emoji" }]);
});

test("keeps homepage motion, public breadcrumbs, and production routing wired", async () => {
  const [glowSource, marketingSource, breadcrumbSource, css, caddyConfig, webService] = await Promise.all([
    readFile(new URL("../app/PointerGlow.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/MarketingPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/Breadcrumbs.tsx", import.meta.url), "utf8"),
    allStylesheets(),
    readFile(new URL("../deploy/Caddyfile.example", import.meta.url), "utf8"),
    readFile(new URL("../deploy/stoat-dashboard-web.service", import.meta.url), "utf8"),
  ]);
  assert.match(glowSource, /addEventListener\("pointermove"/);
  assert.match(glowSource, /requestAnimationFrame/);
  assert.match(marketingSource, /<PointerGlow\s*\/>/);
  assert.match(css, /@keyframes rotateorbit/);
  assert.match(css, /\.hero-orbit\{[^}]*animation:rotateorbit/);
  assert.match(breadcrumbSource, /className="public-breadcrumbs"/);
  assert.match(css, /\.public-breadcrumbs\{/);
  assert.match(caddyConfig, /header_up Host localhost/);
  assert.match(webService, /EnvironmentFile=\/opt\/stoatmod-website\/\.env/);
});

test("publishes the privacy changes statement and links it from public pages", async () => {
  const [page, sitemap, changelog, privacy, features, docs] = await Promise.all([
    render("/privacy-changes"),
    withDiscoveryFixture(() => render("/sitemap.xml")),
    render("/changelog"),
    render("/privacy"),
    render("/features"),
    render("/docs"),
  ]);
  assert.equal(page.status, 200);
  const html = await page.text();
  assert.match(html, /Published 2 October 2026/i);
  assert.doesNotMatch(html, /Draft for review|Not published yet/i);
  assert.match(html, /We stopped sending messages to OpenAI/i);
  assert.match(html, /an appeal on day 29 could keep the message until day 39/i);
  assert.match(html, /Each bot service on the platform must comply with our policies independently/i);
  assert.match(html, /cannot contain message content or user-level records/i);
  assert.match(html, /01J4Q9DS6CV4DNCW6AZRMV349A/);
  assert.match(html, /01FHGJ3NPP7XANQQH8C2BE44ZY/);
  assert.match(html, /01FZB4GBHDVYY6KT8JH4RBX4KR/);
  assert.match(html, /href="\/stoat-trust-and-safety-emails\.pdf" target="_blank"/i);
  assert.doesNotMatch(html, /name="robots" content="noindex/i);
  assert.match(html, /rel="canonical" href="https:\/\/modstoat\.site\/privacy-changes"/i);
  assert.match(html, /og-privacy-changes\.png/);
  assert.doesNotMatch(html, /has violated|no action was taken|Stoat protects/i);
  assert.match(await sitemap.text(), /https:\/\/modstoat\.site\/privacy-changes</i);
  for (const [path, response] of [["/changelog", changelog], ["/privacy", privacy], ["/features", features], ["/docs", docs]]) {
    assert.equal(response.status, 200, "unexpected status for " + path);
    assert.match(await response.text(), /href="\/privacy-changes"/, "missing privacy update link on " + path);
  }
  const pdf = await readFile(new URL("../public/stoat-trust-and-safety-emails.pdf", import.meta.url));
  assert.equal(pdf.subarray(0, 5).toString(), "%PDF-");
});

test("every prepared public route renders a canonical indexable page", async () => {
  const paths = [
    "/", "/features", "/guides", "/docs", "/discovery", "/privacy", "/privacy-changes", "/status",
    "/features/automod", "/features/spam-protection", "/features/link-protection",
    "/features/image-moderation", "/features/join-protection", "/features/moderation-cases",
    "/features/automatic-roles", "/features/moderation-statistics",
    "/features/appeals", "/docs/getting-started", "/docs/install-stoatmod", "/docs/permissions",
    "/docs/commands", "/docs/automod", "/docs/warnings-and-cases", "/docs/moderation-actions",
    "/docs/appeals", "/docs/automatic-roles", "/docs/logging-and-exclusions", "/docs/dashboard",
    "/docs/discovery", "/docs/troubleshooting", "/docs/troubleshooting/role-hierarchy",
    "/docs/troubleshooting/bot-not-responding", "/guides/how-to-set-up-stoatmod",
    "/guides/how-to-moderate-a-stoat-server", "/guides/how-to-stop-spam-and-mass-mentions-on-stoat",
    "/guides/how-to-block-external-links-on-stoat", "/guides/how-to-protect-a-stoat-server-from-raids",
    "/guides/how-to-report-scams-and-appeal-global-bans-on-stoat",
    "/guides/how-to-configure-automatic-roles-on-stoat", "/guides/how-to-create-a-stoat-moderation-policy",
    "/guides/how-to-review-warnings-cases-and-appeals", "/guides/how-to-set-up-moderation-logs-on-stoat",
    "/guides/how-to-list-and-advertise-a-stoat-server", "/guides/stoat-server-moderation-checklist",
    "/about", "/security", "/changelog",
  ];
  const responses = await Promise.all(paths.map(async (path) => {
    const response = await render(path);
    return { path, response, html: await response.text() };
  }));
  const titles = new Set();
  const descriptions = new Set();
  for (const { path, response, html } of responses) {
    assert.equal(response.status, 200, "unexpected status for " + path);
    assert.match(html, /rel="canonical"/i, "missing canonical for " + path);
    assert.match(html, /name="robots" content="index, follow/i, "public route is not indexable at " + path);
    assert.equal(response.headers.get("x-robots-tag"), null);
    assert.equal([...html.matchAll(/<h1(?:\s[^>]*)?>/g)].length, 1, "expected one primary heading at " + path);
    const title = html.match(/<title>(.*?)<\/title>/)?.[1];
    const description = html.match(/<meta name="description" content="([^"]+)"/)?.[1];
    assert.ok(title && !titles.has(title), "missing or duplicate title at " + path);
    assert.ok(description && !descriptions.has(description), "missing or duplicate description at " + path);
    titles.add(title);
    descriptions.add(description);
    const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
    const graph = schemas.flatMap((schema) => schema["@graph"] || [schema]);
    assert.ok(graph.some((node) => ["WebPage", "AboutPage", "CollectionPage", "TechArticle"].includes(node["@type"])), "missing page schema at " + path);
    assert.ok(graph.some((node) => node["@id"] === "https://modstoat.site/#organization"), "missing publisher at " + path);
    for (const href of ["/discovery", "/about", "/changelog", "/security"]) assert.ok(html.includes(`href="${href}"`), "missing public navigation at " + path);
  }
});

test("keeps the private dashboard out of the public feature library", async () => {
  const [home, features, removed] = await Promise.all([render("/"), render("/features"), render("/features/dashboard")]);
  assert.equal(home.status, 200);
  assert.doesNotMatch(await home.text(), /Private moderator dashboard|Secure moderator dashboard/i);
  assert.equal(features.status, 200);
  const html = await features.text();
  assert.doesNotMatch(html, /Private moderator dashboard/i);
  assert.doesNotMatch(html, /href="\/features\/dashboard"/i);
  assert.equal(removed.status, 404);
});

test("documents scam reporting, global enforcement, and the email-only ban appeal route", async () => {
  const [guide, hub] = await Promise.all([
    render("/guides/how-to-report-scams-and-appeal-global-bans-on-stoat"),
    render("/guides"),
  ]);
  assert.equal(guide.status, 200);
  const html = await guide.text();
  assert.match(html, /Right-click the offending message/i);
  assert.match(html, /abuse@stoat\.chat/i);
  assert.match(html, /~global_report/i);
  assert.match(html, /before it can act there/i);
  assert.match(html, /Submitting a report never itself creates a global ban/i);
  assert.match(html, /one automatic global-ban rule/i);
  assert.match(html, /literal, case-insensitive match/i);
  assert.match(html, /applies only to the Stoat account username/i);
  assert.match(html, /server nickname never creates a global ban/i);
  assert.match(html, /Ordinary profanity is outside the zero-tolerance list/i);
  assert.match(html, /every global ban requires human approval/i);
  assert.doesNotMatch(html, /Planned zero-tolerance|not active in the current bot/i);
  assert.match(html, /only way to appeal a Stoatmod global ban is to email admin@modstoat\.site/i);
  assert.equal(guide.headers.get("x-robots-tag"), null);
  assert.match(await hub.text(), /href="\/guides\/how-to-report-scams-and-appeal-global-bans-on-stoat"/i);
});

test("renders server-first Discovery content with conservative metadata", async () => {
  const response = await render("/discovery");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /<title>Stoat Servers – Discover &amp; Join Stoat Communities \| Stoatmod<\/title>/i);
  assert.match(html, /rel="canonical" href="https:\/\/modstoat\.site\/discovery"/i);
  assert.match(html, /<h1 id="discovery-title">Discover the best <span[^>]*>Stoat servers<\/span><\/h1>/i);
  assert.match(html, /FAQPage/);
  assert.match(html, /property="og:image" content="https:\/\/modstoat\.site\/discovery\/og\/hub\.png"/);
  assert.match(html, /application\/ld\+json/i);
  assert.match(html, /CollectionPage/i);
  assert.match(html, /BreadcrumbList/i);
  assert.match(html, /og:title/i);
  assert.match(html, /name="robots" content="index, follow/i);
  assert.match(html, /Search names, topics and tags/i);
  assert.match(html, /href="\/discovery\/advertise"/i);
  assert.match(html, /listings require Stoatmod with its permissions, a server icon and public statistics/i);
  assert.match(html, /Directory temporarily unavailable/i);
  assert.match(html, /approval is a directory review, not a safety endorsement/i);
  assert.match(html, /edits go live straight away once automatic safety checks pass/i);
  assert.doesNotMatch(html, /bot-verified communities|guaranteed safe/i);
});

test("does not turn a cold Discovery API outage into a false profile 404", async () => {
  const response = await render("/discovery/servers/example-server-01EXAMPLE");
  assert.equal(response.status, 500);
  assert.notEqual(response.status, 404);
  assert.equal(response.headers.get("x-robots-tag"), null);
});

test("indexes exact server names, canonical profiles and every public listing", async () => {
  await withDiscoveryFixture(async (servers) => {
    const path = `/discovery/servers/the-often-clan-${servers[0].server_id.toLowerCase()}`;
    const profile = await render(path);
    assert.equal(profile.status, 200);
    const html = await profile.text();
    // The main category joins the title when it still fits a search result (about 60 characters).
    assert.match(html, /<title>The Often Clan – Gaming Stoat Server \| Stoatmod<\/title>/);
    assert.match(html, /name="description" content="Join The Often Clan on Stoat\./);
    assert.match(html, /name="robots" content="index, follow/);
    assert.match(html, /name="googlebot" content="index, follow/);
    assert.ok(html.includes(`rel="canonical" href="https://modstoat.site${path}"`));
    assert.match(html, /<h1><span data-no-translate="[^"]*">The Often Clan<\/span><\/h1>/);
    assert.match(html, /How to join/);
    assert.match(html, /src="https:\/\/cdn.stoatusercontent.com\/banners\/often"/);
    assert.match(html, /alt="The Often Clan server banner"/);
    // The social image is the generated server card (banner, icon, name and stats), not the raw banner.
    const card = `https://modstoat.site/api/public/discovery/og/${servers[0].server_id}.png?v=`;
    assert.ok(html.includes(`property="og:image" content="${card}`));
    assert.match(html, /property="og:image:alt" content="The Often Clan on Stoat"/);
    assert.match(html, /property="og:image:width" content="1200"/);
    assert.ok(html.includes(`name="twitter:image" content="${card}`));
    const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
    const page = schemas.flatMap((schema) => schema["@graph"] || [schema]).find((schema) => schema["@type"] === "WebPage");
    assert.equal(page.mainEntity.name, "The Often Clan");
    assert.ok(page.image[0].startsWith(card));
    assert.equal(page.image[1], "https://cdn.stoatusercontent.com/banners/often");
    assert.equal(page.url, `https://modstoat.site${path}`);

    const alias = await render(`/discovery/servers/old-name-${servers[0].server_id.toLowerCase()}`);
    assert.equal(alias.status, 308);
    assert.equal(alias.headers.get("location"), path);
    const uppercase = await render(path.toUpperCase().replace("/DISCOVERY/SERVERS/", "/discovery/servers/"));
    assert.equal(uppercase.status, 308);
    assert.equal(uppercase.headers.get("location"), path);
    assert.equal((await render("/discovery/servers/removed-community-01MISSING")).status, 404);

    const longPath = `/discovery/servers/a-community-with-a-full-name-longer-than-thirty-two-characters-${servers[29].server_id.toLowerCase()}`;
    assert.ok((await (await render(longPath)).text()).includes(`<title>${servers[29].server_name} – Stoat Server | Stoatmod</title>`));
    const directory = await (await render("/discovery")).text();
    // Inspect HTML before hydration: even listings beyond the featured feeds have links.
    assert.ok(directory.includes(`href="${longPath}"`));
    assert.ok(directory.includes(`href="${path}"`));
    assert.match(directory, /alt="The Often Clan server banner"/);
    assert.doesNotMatch(directory, /https:\/\/untrusted.example\/banner.png/);
    const noBanner = await (await render(`/discovery/servers/community-1-${servers[1].server_id.toLowerCase()}`)).text();
    assert.doesNotMatch(noBanner, /server banner|untrusted.example/);

    const sitemap = await render("/sitemap.xml");
    assert.equal(sitemap.status, 200);
    const xml = await sitemap.text();
    assert.equal([...xml.matchAll(/<loc>https:\/\/modstoat.site\/discovery\/servers\//g)].length, 30);
    assert.ok(xml.includes(`<loc>https://modstoat.site${path}</loc>`));
    assert.match(xml, /<image:loc>https:\/\/cdn.stoatusercontent.com\/banners\/often<\/image:loc>/);
    assert.match(xml, /<image:loc>https:\/\/modstoat.site\/discovery\/og\/hub.png<\/image:loc>/);
    assert.match(xml, /<image:loc>https:\/\/modstoat.site\/api\/public\/discovery\/og\/01SEO0+\.png/);
    assert.doesNotMatch(xml, /untrusted.example/);
    // #gaming duplicates the Gaming category, so the tag page redirects there and stays out of the sitemap.
    assert.doesNotMatch(xml, /\/discovery\/tags\/gaming/);
    const gamingTag = await render("/discovery/tags/gaming");
    assert.equal(gamingTag.status, 308);
    assert.match(gamingTag.headers.get("location"), /\/discovery\/categories\/gaming$/);
    assert.doesNotMatch(xml, /\/discovery\/tags\/rare/);
    assert.match(await (await render("/discovery/tags/rare")).text(), /name="robots" content="noindex/);
  });
});

test("tag pages without a matching category are indexed once three servers use them", async () => {
  await withDiscoveryFixture(async () => {
    const xml = await (await render("/sitemap.xml")).text();
    assert.match(xml, /<loc>https:\/\/modstoat.site\/discovery\/tags\/squad<\/loc>/);
    const html = await (await render("/discovery/tags/squad")).text();
    assert.match(html, /name="robots" content="index, follow/);
    assert.match(html, /<h2 id="tag-servers" class="sr-only">/);
  }, (servers) => servers.map((server, index) => (index < 3 ? { ...server, tags: [...server.tags, "squad"] } : server)));
});

test("every visitor gets each page's metadata in <head>, including Googlebot", async () => {
  await withDiscoveryFixture(async (servers) => {
    const profile = `/discovery/servers/community-1-${servers[1].server_id.toLowerCase()}`;
    for (const userAgent of ["Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)", "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)", "Mozilla/5.0 (compatible; GPTBot/1.2)", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36"]) {
      for (const path of [profile, "/discovery/categories/gaming"]) {
        const html = await (await render(path, "http://localhost", { "user-agent": userAgent })).text();
        const head = html.slice(0, html.indexOf("</head>"));
        for (const pattern of [/<title>/, /rel="canonical"/, /name="description"/, /name="robots"/, /property="og:image"/]) {
          assert.match(head, pattern, `${userAgent.slice(0, 40)} ${path} ${pattern}`);
        }
      }
    }
  });
});

test("does not publish an incomplete sitemap during a cold Discovery outage", async () => {
  // Metadata route errors propagate to the HTTP adapter instead of returning XML.
  await assert.rejects(render("/sitemap.xml"), { name: "PublicDataUnavailableError" });
});

test("discovery controls support tag search and a five-tag listing limit", async () => {
  const [discoverySource, dashboardSource] = await Promise.all([
    readFile(new URL("../app/DiscoveryPage.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/DiscoveryTab.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(discoverySource, /server\.tags/);
  assert.match(discoverySource, /searchScore/);
  assert.match(discoverySource, /initialServers/);
  assert.match(discoverySource, /Featured Stoat servers/);
  assert.match(discoverySource, /Recently bumped/);
  assert.match(discoverySource, /Most active today/);
  assert.match(discoverySource, /Filter by tag/);
  assert.doesNotMatch(discoverySource, /useEffect|\/api\/public\/discovery/);
  assert.match(dashboardSource, /tags\.length >= 5/);
  assert.match(dashboardSource, /Save changes/);
  assert.match(dashboardSource, /Changes are live on Discovery/);
});

function sectionServerNames(html, marker) {
  const at = html.indexOf(marker);
  assert.ok(at >= 0, `Missing Discovery section: ${marker}`);
  const section = html.slice(at, html.indexOf("</section>", at));
  return [...section.matchAll(/<h3><a[^>]*>([^<]+)<\/a><\/h3>/g)].map((match) => match[1]);
}

test("Discovery features recent bumps, then lists the whole directory by popularity", async () => {
  await withDiscoveryFixture(async (servers) => {
    const html = await (await render("/discovery")).text();
    const names = (items) => items.map((server) => server.server_name);
    // Servers 5 and 2 were bumped this week (most recent first); the third featured slot goes to the most popular.
    assert.deepEqual(sectionServerNames(html, 'id="featured"'), names([servers[5], servers[2], servers[0]]));
    assert.deepEqual(sectionServerNames(html, 'id="discovery-results"'), names(servers));
  }, (servers) => servers.map((server, index) => ({
    ...server,
    global_rank: index + 1,
    approved_at: index < 20 ? new Date(Date.UTC(2026, 8, index + 1)).toISOString() : index === 20 ? "invalid" : null,
    last_bumped_at: index === 5 ? new Date(Date.now() - 3_600_000).toISOString() : index === 2 ? new Date(Date.now() - 86_400_000).toISOString() : index === 7 ? "2026-01-01T00:00:00Z" : null,
  })));
});

test("top and new Stoat server pages rank every listing and link each profile", async () => {
  await withDiscoveryFixture(async (servers) => {
    const names = (items) => items.map((server) => server.server_name);
    const top = await render("/discovery/top");
    assert.equal(top.status, 200);
    const topHtml = await top.text();
    assert.match(topHtml, /<title>Top Stoat Servers – Most Active Communities \| Stoatmod<\/title>/);
    assert.deepEqual(sectionServerNames(topHtml, 'aria-labelledby="top-servers"'), names(servers));
    for (const server of servers) assert.ok(topHtml.includes(`href="/discovery/servers/${server.server_name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 72)}-${server.server_id.toLowerCase()}"`), server.server_name);
    const newest = await (await render("/discovery/new")).text();
    assert.deepEqual(sectionServerNames(newest, 'aria-labelledby="new-servers"').slice(0, 3), names([servers[19], servers[18], servers[17]]));
    assert.match(newest, /ItemList/);
  }, (servers) => servers.map((server, index) => ({
    ...server,
    global_rank: index + 1,
    approved_at: index < 20 ? new Date(Date.UTC(2026, 8, index + 1)).toISOString() : null,
  })));
});

test("advertise page targets Stoat server advertising with FAQ and HowTo data", async () => {
  await withDiscoveryFixture(async () => {
    const response = await render("/discovery/advertise");
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.match(html, /<title>Stoat Server Advertising – List Your Server Free \| Stoatmod<\/title>/);
    assert.match(html, /rel="canonical" href="https:\/\/modstoat\.site\/discovery\/advertise"/);
    assert.match(html, /name="robots" content="index, follow/);
    const schemas = [...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].flatMap((match) => JSON.parse(match[1])["@graph"] || []);
    assert.ok(schemas.some((schema) => schema["@type"] === "FAQPage" && schema.mainEntity.length >= 5));
    assert.ok(schemas.some((schema) => schema["@type"] === "HowTo" && schema.step.length === 4));
    assert.match(html, /edits go live straight away after automatic checks/);
    assert.match(html, /href="\/login"/);
  });
});

test("category pages match tags and descriptions and are indexed only with enough listings", async () => {
  await withDiscoveryFixture(async () => {
    const gaming = await render("/discovery/categories/gaming");
    assert.equal(gaming.status, 200);
    const gamingHtml = await gaming.text();
    assert.match(gamingHtml, /<title>Gaming Stoat Servers \| Stoatmod Discovery<\/title>/);
    assert.match(gamingHtml, /name="robots" content="index, follow/);
    assert.match(gamingHtml, /Community 1/);
    const music = await (await render("/discovery/categories/music")).text();
    assert.match(music, /name="robots" content="noindex/);
    assert.match(music, /No music servers are listed yet/);
    assert.equal((await render("/discovery/categories/not-a-category")).status, 404);
    const xml = await (await render("/sitemap.xml")).text();
    for (const path of ["/discovery/advertise", "/discovery/top", "/discovery/new", "/discovery/categories", "/discovery/categories/gaming"]) assert.ok(xml.includes(`<loc>https://modstoat.site${path}</loc>`), path);
    assert.doesNotMatch(xml, /\/discovery\/categories\/music/);
  });
});

test("renders the expanded feature, guide, documentation, and trust architecture", async () => {
  const [feature, guide, troubleshooting, about, security, changelog] = await Promise.all([
    render("/features/automod"),
    render("/guides/how-to-set-up-stoatmod"),
    render("/docs/troubleshooting/role-hierarchy"),
    render("/about"),
    render("/security"),
    render("/changelog"),
  ]);
  for (const response of [feature, guide, troubleshooting, about, security, changelog]) {
    assert.equal(response.status, 200);
  }
  const featureHtml = await feature.text();
  assert.match(featureHtml, /Automod for Stoat servers/i);
  assert.match(featureHtml, /Automatic does not mean uncontrolled/i);
  assert.match(featureHtml, /WebPage/i);
  assert.match(featureHtml, /rel="canonical" href="https:\/\/modstoat\.site\/features\/automod"/i);
  assert.match(await guide.text(), /Launch a Stoatmod moderation setup/i);
  assert.match(await troubleshooting.text(), /Fix role hierarchy failures/i);
  const aboutHtml = await about.text();
  assert.match(aboutHtml, /open-source moderation bot/i);
  assert.match(aboutHtml, /github\.com\/StoatMod-site\/Stoatmod/i);
  assert.match(aboutHtml, /github\.com\/StoatMod-site\/StoatMod-dashboard/i);
  assert.match(await security.text(), /outcome verification/i);
  const changelogHtml = await changelog.text();
  assert.match(changelogHtml, /30 September 2026/i);
  assert.match(changelogHtml, /phase 1 complete: replaced OpenAI API &amp; deployed local AI model \(StoatGuard 4B\)/i);
  assert.match(changelogHtml, /2 September 2026/i);
  assert.match(changelogHtml, /Fixed CAPTCHA issues/i);
  assert.match(changelogHtml, /spam adjustment settings, thanks to zaboo#2099/i);
  assert.match(changelogHtml, /31 August 2026/i);
  assert.match(changelogHtml, /30 August 2026/i);
  assert.match(changelogHtml, /deleted exempt channels, thanks to Yinysng#7220/i);
  assert.match(changelogHtml, /alt detection could accidentally globally ban people/i);
  assert.match(changelogHtml, /Polls 2\.0/i);
  assert.match(changelogHtml, /two GitHub repositories under AGPL-3\.0/i);
});

test("documents every per-server spam adjustment", async () => {
  const [feature, guide] = await Promise.all([
    render("/features/spam-protection"),
    render("/guides/how-to-stop-spam-and-mass-mentions-on-stoat"),
  ]);
  assert.equal(feature.status, 200);
  assert.equal(guide.status, 200);

  const featureHtml = await feature.text();
  for (const wording of ["repeated-message count", "rapid-message count", "trigger score", "score to halve", "mention limit", "timeout applied", "Restore defaults"]) {
    assert.match(featureHtml, new RegExp(wording, "i"));
  }
  assert.match(featureHtml, /Reviewed[\s\S]{0,30}2 September 2026/i);
  assert.match(featureHtml, /Changes apply only to that server/i);

  const guideHtml = await guide.text();
  assert.match(guideHtml, /three repeated messages in 30 seconds/i);
  assert.match(guideHtml, /five messages in 10 seconds/i);
  assert.match(guideHtml, /five-point trigger score with a 30-second half-life/i);
  assert.match(guideHtml, /five mentions and a 60-minute timeout/i);
  assert.match(guideHtml, /@everyone and @online always count as mass mentions/i);
});

test("keeps edits to approved Discovery listings behind automatic checks", async () => {
  const [profileSource, tagSource, extrasSource, dashboardSource] = await Promise.all([
    readFile(new URL("../app/discovery/servers/[slug]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/discovery/tags/[tag]/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/DiscoveryExtras.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/DiscoveryTab.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(profileSource, /findDiscoveryServer/);
  assert.match(profileSource, /ugc nofollow noopener noreferrer/);
  assert.match(tagSource, /result\.servers\.length >= 3/);
  // Approved listings stay live; a flagged edit is held while the previous version stays public
  // (the API has its own tests for the checks).
  assert.match(extrasSource, /Your current listing stays live/);
  assert.match(dashboardSource, /updated\.edit\?\.status === "held"/);
  assert.match(dashboardSource, /Save changes/);
});

test("contains moderator authentication and protected dashboard surfaces", async () => {
  const discoveryTabSource = await readFile(new URL("../app/DiscoveryTab.tsx", import.meta.url), "utf8");
  const [loginSource, dashboardSource, appealSource] = await Promise.all([
    readFile(new URL("../app/LoginApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/DashboardApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/AppealPage.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(loginSource, /~dashboard/);
  assert.match(dashboardSource, /Messages today/);
  assert.match(dashboardSource, /Moderation cases/);
  assert.match(dashboardSource, /Protection centre/);
  assert.match(dashboardSource, /protection-workspace/);
  assert.match(dashboardSource, /Spam detection/);
  assert.match(dashboardSource, /Save all changes/);
  assert.match(dashboardSource, /Choose what Stoatmod watches/);
  assert.match(dashboardSource, /Choose how detections become actions/);
  assert.match(dashboardSource, /Default model score/);
  assert.match(dashboardSource, /<CategoryScores scores=\{source.scores\|\|detail.scores\}/);
  assert.match(dashboardSource, /CaseReviewList/);
  assert.match(dashboardSource, /case-review-placeholder/);
  assert.match(dashboardSource, /Attach evidence images/);
  assert.match(dashboardSource, /formApi\(`\/api\/cases/);
  assert.match(dashboardSource, /Policy confidence/);
  assert.match(dashboardSource, /Scores are model label likelihoods, not calibrated confidence/);
  assert.match(dashboardSource, /type="range" min="0" max="100"/);
  assert.match(dashboardSource, /AggregateActivity/);
  assert.doesNotMatch(dashboardSource, /Most active channels/);
  assert.doesNotMatch(dashboardSource, /Most active words/);
  assert.match(dashboardSource, /policy-category-row/);
  assert.match(dashboardSource, /Language, warning expiry and visibility/);
  assert.match(dashboardSource, /Automatic roles for new members/);
  assert.match(dashboardSource, /Appeal decisions/);
  assert.match(dashboardSource, /DM me when someone appeals/);
  assert.match(dashboardSource, /\/api\/appeals\/notifications/);
  assert.match(dashboardSource, /requested==="applications"\|\|requested==="appeals"/);
  assert.match(dashboardSource, /Delete poll/);
  assert.match(dashboardSource, /\/api\/polls\/\$\{poll\.id\}/);
  assert.match(dashboardSource, /Choose emoji for option/);
  assert.match(dashboardSource, /Emoji selector for option/);
  assert.match(dashboardSource, /Search all emojis/);
  assert.match(dashboardSource, /emoji-picker-react/);
  assert.match(dashboardSource, /Activity log pagination/);
  assert.match(dashboardSource, /ACTIVITY_PAGE_SIZE=20/);
  assert.match(dashboardSource, /You can now advertise your server using our Discovery page/);
  assert.match(dashboardSource, /Check your eligibility/);
  assert.match(dashboardSource, /sessionStorage\.setItem\(DISCOVERY_NOTICE_SESSION_KEY/);
  assert.match(dashboardSource, /setView\("discovery"\)/);
  assert.match(dashboardSource, /hasConfirmedPermissionIssue/);
  assert.match(dashboardSource, /This check refreshes automatically whenever Stoatmod reconnects/);
  assert.doesNotMatch(dashboardSource, /run <code>~setup<\/code> to refresh this notice/i);
  assert.match(dashboardSource, /data\.discovery\.application\?\.status==="approved"&&data\.discovery\.eligibility\.eligible/);
  assert.match(dashboardSource, /dismissDiscoveryNotice\(\);setView\("discovery"\)/);
  assert.match(dashboardSource, /<DiscoveryTab /);
  assert.match(discoveryTabSource, /Bump server listing now/);
  assert.match(discoveryTabSource, /Next bump/);
  assert.match(discoveryTabSource, /Live preview/);
  assert.match(discoveryTabSource, /\/api\/discovery\/bump/);
  assert.doesNotMatch(dashboardSource, /1️⃣/);
  assert.match(dashboardSource, />Accept</);
  assert.match(dashboardSource, /Go to case/);
  assert.match(dashboardSource, /setView\("cases"\);void openCase\(reference\)/);
  assert.match(appealSource, /Additional case evidence/);
  assert.match(appealSource, /\/api\/appeals\/evidence\/\$\{attachment\.id\}/);
  assert.match(appealSource, /"X-Appeal-Code":code/);
  assert.doesNotMatch(dashboardSource, /Moderation history retention|History retention|retention_days/);
  assert.match(dashboardSource, /icon_url/);
  assert.match(dashboardSource, /accessControl&&/);
  assert.match(dashboardSource, /Control dashboard access/);
  assert.match(dashboardSource, /\/api\/dashboard\/access/);
  assert.match(dashboardSource, /\/api\/dashboard\/sessions\/revoke-all/);
  assert.match(dashboardSource, /access_source==="manage_server"/);
  assert.match(dashboardSource, /revoked_users/);
  assert.match(dashboardSource, /\/restore/);
  assert.match(dashboardSource, /Revoke all sessions/);
  assert.match(dashboardSource, /dashboardLoadError/);
  assert.match(dashboardSource, /We could not open the control room/);
  assert.doesNotMatch(dashboardSource, /then\(loadDashboard\)\.catch\(\(\)=>window\.location\.replace\("\/login"\)\)/);
});

test("owner case and appeal pagination has responsive controls", async () => {
  const stylesheet = await allStylesheets();
  assert.match(stylesheet, /\.owner-list-controls\{/);
  assert.match(stylesheet, /\.owner-pagination\{/);
  assert.match(stylesheet, /\.owner-pagination button\.active\{/);
  assert.match(stylesheet, /\.owner-report-signals\{/);
  assert.match(stylesheet, /\.owner-report-decision,/);
  assert.match(stylesheet, /\.owner-report-verdict\.risk\{/);
});

test("appeal preparation card keeps its steps below the headline", async () => {
  const stylesheet = await allStylesheets();
  assert.match(stylesheet, /\.appeal-ready-card\{[^}]*grid-template-columns:minmax\(0,1fr\)/);
  assert.doesNotMatch(stylesheet, /\.appeal-ready-card\{[^}]*grid-template-columns:[^}]*minmax\(250px/);
});

test("protection settings use one cohesive responsive workspace", async () => {
  const [dashboardSource, stylesheet] = await Promise.all([
    readFile(new URL("../app/DashboardApp.tsx", import.meta.url), "utf8"),
    allStylesheets(),
  ]);
  assert.match(stylesheet, /\.protection-workspace\{/);
  assert.match(stylesheet, /\.protection-sheet\{/);
  assert.match(stylesheet, /\.protection-section\+\.protection-section\{border-top:/);
  assert.match(stylesheet, /\.protection-footer\{display:grid/);
  assert.match(stylesheet, /\.protection-policy-lower\{display:grid;grid-column:1\/-1/);
  assert.match(stylesheet, /\.protection-policy-lower>fieldset\{min-width:0/);
  assert.match(stylesheet, /\.low-threshold-warning\{display:grid;grid-column:1\/-1/);
  assert.match(stylesheet, /\.moderation-category-choice input\{position:absolute;z-index:2;inset:0;width:100%;height:100%/);
  assert.match(stylesheet, /html\[data-theme="dark"\] \.moderation-category-choice input:checked\+i\{border-color:#a99cff;background:#a99cff\}/);
  assert.match(stylesheet, /@media\(max-width:620px\).*\.protection-toggle-grid/s);
  assert.match(dashboardSource, /id="protection-spam"[\s\S]*<SpamProtectionEditor/);
  assert.match(dashboardSource, /Repeated content[\s\S]*Rapid traffic[\s\S]*Behaviour score[\s\S]*Mentions and response/);
  assert.match(dashboardSource, /Rapid-message rule[\s\S]*messages in[\s\S]*seconds/);
  assert.doesNotMatch(dashboardSource, /label="Image scanning" badge=/);
  assert.match(dashboardSource, /graphic gore and explicit nudity only\. Swimwear, suggestive photos, costumes, minor injuries, games and cartoons are not flagged\. On by default/);
  assert.match(stylesheet, /\.experimental-warning\{[^}]*background:#fef3c7;[^}]*color:#8a4b08/);
  assert.match(stylesheet, /\.spam-protection-editor\{/);
  assert.match(stylesheet, /\.spam-editor-summary\{display:grid;grid-template-columns:minmax\(240px,1fr\) auto\}/);
  assert.match(stylesheet, /@media\(max-width:620px\).*\.spam-protection-editor>fieldset/s);
});

test("policy, automation actions, and onboarding use the integrated redesign", async () => {
  const [dashboardSource, stylesheet] = await Promise.all([
    readFile(new URL("../app/DashboardApp.tsx", import.meta.url), "utf8"),
    allStylesheets(),
  ]);
  assert.match(dashboardSource, /id="protection-policy"[\s\S]*<PolicyStudioPanel/);
  assert.match(dashboardSource, /id="protection-operations"/);
  assert.doesNotMatch(dashboardSource, /id="protection-ai"/);
  assert.match(stylesheet, /\.automation-list article\{grid-template-columns:repeat\(2,minmax\(0,1fr\)\)!important/);
  assert.match(stylesheet, /\.protection-section>\.policy-studio\{grid-column:2/);
  assert.match(dashboardSource, /const progress=Math\.round\(step\/Math\.max\(steps\.length-1,1\)\*100\)/);
  assert.match(dashboardSource, /role="progressbar"/);
  assert.match(stylesheet, /\.onboarding-dialog\{position:relative;inset:auto;display:grid/);
  assert.match(dashboardSource, /const reports=initialReports/);
  assert.match(dashboardSource, /onClick=\{step===3\?\(\)=>void openDestination\("policy"\)/);
  assert.match(dashboardSource, /value=\{mode\.id\}/);
  assert.match(dashboardSource, /mode\.id==="enforce"&&<em>Recommended<\/em>/);
  assert.doesNotMatch(dashboardSource, /mode\.id==="review"&&<em>Recommended<\/em>/);
  assert.match(dashboardSource, /Add your server to Discovery/);
  assert.match(dashboardSource, /Report scammers and ToS violations/);
  assert.match(dashboardSource, /~global_report/);
  assert.match(stylesheet, /\.onboarding-policy-coach\{display:grid/);
  assert.match(stylesheet, /\.onboarding-feature-grid\{display:grid/);
  assert.match(stylesheet, /\.onboarding-destination-active\{/);
});

test("global announcements refresh live and keep dismissals race-safe", async () => {
  const dashboardSource = await readFile(new URL("../app/DashboardApp.tsx", import.meta.url), "utf8");
  assert.match(dashboardSource, /announcements:DashboardAnnouncement\[\]/);
  assert.match(dashboardSource, /announcements:result\.announcements/);
  assert.match(dashboardSource, /className="dashboard-global-announcement"/);
  assert.match(dashboardSource, /notificationRevision\.current\+=1;notificationRequest\.current\+=1;try\{await api\(`\/api\/announcements/);
});

test("server reports, global reporting, and poll pages use the cohesive dashboard design", async () => {
  const [dashboardSource, reportSource, stylesheet] = await Promise.all([
    readFile(new URL("../app/DashboardApp.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/ReportApp.tsx", import.meta.url), "utf8"),
    allStylesheets(),
  ]);
  assert.match(dashboardSource, /Server reporting setup/);
  assert.match(dashboardSource, /Members can run <code>~report<\/code> in any channel in this server/);
  assert.match(dashboardSource, /Instruction embed channel/);
  assert.doesNotMatch(dashboardSource, /running <code>~report<\/code> in the selected channel/);
  assert.match(dashboardSource, /Enable server reports/);
  assert.match(dashboardSource, /Server report inbox/);
  assert.match(dashboardSource, /No server reports yet\./);
  assert.doesNotMatch(dashboardSource, />[^<]*local reports?[^<]*</i);
  assert.doesNotMatch(dashboardSource, /["'`]Local reports?["'`]/i);
  assert.match(dashboardSource, /id="support-global-report" className=\{`panel support-global-report/);
  assert.match(dashboardSource, /\/api\/global-reports\/access/);
  assert.match(dashboardSource, /minLength=\{26\} maxLength=\{26\}/);
  assert.match(dashboardSource, /~global_report/);
  assert.match(dashboardSource, /POLL_PAGE_SIZE=6/);
  assert.match(dashboardSource, /\/api\/polls\?page=\$\{page\}&page_size=\$\{POLL_PAGE_SIZE\}/);
  assert.match(dashboardSource, /label="Poll results pagination"/);
  assert.match(reportSource, /report\.reference_id/);
  assert.match(reportSource, /report\.report_scope==="server"\?"Server moderators":"Stoatmod global team"/);
  assert.match(reportSource, /Evidence attachments/);
  assert.match(reportSource, /Stoatmod will direct-message every information request and final result/);
  assert.match(stylesheet, /\.support-global-report\{/);
  assert.match(stylesheet, /\.report-global-note\{/);
});

test("every server dashboard view uses the cohesive surface system", async () => {
  const discoveryTabSource = await readFile(new URL("../app/DiscoveryTab.tsx", import.meta.url), "utf8");
  const [dashboardSource, stylesheet, automationSource] = await Promise.all([
    readFile(new URL("../app/DashboardApp.tsx", import.meta.url), "utf8"),
    allStylesheets(),
    readFile(new URL("../app/AutomationPanel.tsx", import.meta.url), "utf8"),
  ]);
  assert.match(dashboardSource, /page-grid dashboard-surface overview-surface/);
  assert.match(dashboardSource, /member-workspace dashboard-surface/);
  assert.match(dashboardSource, /case-workspace dashboard-surface/);
  assert.match(automationSource, /automation-layout dashboard-surface/);
  assert.match(dashboardSource, /poll-layout dashboard-surface/);
  assert.match(discoveryTabSource, /\$\{styles\.tab\} dashboard-surface/);
  assert.match(dashboardSource, /support-grid dashboard-surface/);
  assert.match(dashboardSource, /leaderboard-panel dashboard-surface standalone-surface/);
  assert.match(stylesheet, /\/\* Cohesive server dashboard surfaces \*\//);
  assert.match(stylesheet, /\.dashboard-surface\{[^}]*border-radius:24px/);
  assert.match(stylesheet, /\.overview-surface\{[^}]*gap:0/);
  assert.match(stylesheet, /\.case-workspace\{grid-template-columns:minmax\(270px,340px\) minmax\(0,1fr\)/);
  assert.match(stylesheet, /\.case-review-list\{[^}]*overflow:auto/);
  assert.match(stylesheet, /\.case-review-context\{display:grid;grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/);
  assert.match(stylesheet, /\.owner-overview\{[^}]*border-radius:24px/);
  assert.match(stylesheet, /\.owner-sidebar nav button\.active[^}]*background:#f5f5f0/);
  assert.match(stylesheet, /\.activity-insight-columns\{display:grid/);
  assert.match(stylesheet, /@media\(max-width:760px\).*\.support-grid\{grid-template-columns:1fr\}/s);
});

test("dark dashboard selection states keep contrasting row text", async () => {
  const stylesheet = await allStylesheets();
  assert.match(stylesheet, /\.member-list>button\.active,html\[data-theme="dark"\] \.owner-email-list>button\.active\{background:var\(--surface-inverse\);color:var\(--text-inverse\)\}/);
  assert.match(stylesheet, /\.owner-email-list>button\.active :where\(b,p,small\)\{color:color-mix/);
  assert.match(stylesheet, /html\[data-theme="dark"\] \.owner-appeals blockquote\{[^}]*background:var\(--surface-soft\);color:var\(--ink\)\}/);
  assert.match(stylesheet, /html\[data-theme="dark"\] \.discovery-hero aside\{[^}]*background:var\(--surface-inverse\);color:var\(--text-inverse\)\}/);
});

test("owner inbox recipient messages keep readable theme contrast", async () => {
  const stylesheet = await allStylesheets();
  assert.match(stylesheet, /\.owner-email-messages article\{[^}]*background:#ecece7;color:#111\}/);
  assert.match(stylesheet, /html\[data-theme="dark"\] \.owner-email-messages article:not\(\.outbound\)\{[^}]*background:var\(--surface-soft\);color:var\(--ink\)\}/);
});

test("public pages load only the public stylesheet; the server dashboard adds the dashboard rules", async () => {
  const [globals, dashboard, layout, dashboardPage] = await Promise.all([
    "../app/globals.css", "../app/dashboard.css", "../app/layout.tsx", "../app/dashboard/page.tsx",
  ].map((file) => readFile(new URL(file, import.meta.url), "utf8")));
  assert.ok(globals.length < 90_000, `globals.css grew to ${globals.length} bytes; dashboard-only rules belong in dashboard.css`);
  assert.match(layout, /import "\.\/globals\.css";/);
  assert.doesNotMatch(layout, /dashboard\.css/);
  assert.match(dashboardPage, /import "\.\.\/dashboard\.css";/);
  // The moderator login keeps its keyboard focus ring: this rule must stay ahead of input:focus-visible.
  assert.ok(globals.indexOf(".login-card input") >= 0 && globals.indexOf(".login-card input") < globals.lastIndexOf("input:focus-visible"));
  assert.ok(dashboard.length > 0);
});

