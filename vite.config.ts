import vinext from "vinext";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "STOATMOD_");
  const apiOrigin = process.env.STOATMOD_PUBLIC_API_ORIGIN?.trim()
    || env.STOATMOD_PUBLIC_API_ORIGIN?.trim() || "http://127.0.0.1:8081";
  process.env.STOATMOD_PUBLIC_API_ORIGIN = apiOrigin;
  // Keep Wrangler and Miniflare state inside the project.
  process.env.WRANGLER_WRITE_LOGS ??= "false";
  process.env.WRANGLER_LOG_PATH ??= ".wrangler/logs";
  process.env.MINIFLARE_REGISTRY_PATH ??= ".wrangler/registry";

  // Wrangler reads its log path when the Cloudflare plugin is imported.
  const { cloudflare } = await import("@cloudflare/vite-plugin");

  return {
    server: { proxy: { "/api": { target: apiOrigin, changeOrigin: true } } },
    plugins: [
      vinext(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
        config: { main: "./worker/index.ts", compatibility_flags: ["nodejs_compat"] },
      }),
    ],
  };
});
