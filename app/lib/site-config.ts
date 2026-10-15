export const siteConfig = {
  origin: "https://modstoat.site",
  name: "Stoatmod",
  legalName: "Stoatmod Limited",
  description:
    "Stoatmod is a moderation bot for Stoat servers with configurable automod, cases, appeals, automatic roles and live moderation statistics.",
  inviteUrl: "https://stoat.chat/bot/01KY6VVK6E7N1KFJVKK9YJ1KE1",
  supportUrl: "https://stt.gg/PCaYw69F",
  githubUrl: "https://github.com/StoatMod-site",
  botSourceUrl: "https://github.com/StoatMod-site/Stoatmod",
  websiteSourceUrl: "https://github.com/StoatMod-site/StoatMod-dashboard",
  contactEmail: "admin@modstoat.site",
  socialImage: "/og.png",
  botId: "01KY6VVK6E7N1KFJVKK9YJ1KE1",
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, `${siteConfig.origin}/`).toString();
}

export function canonicalPath(path: string) {
  if (!path || path === "/") return "/";
  return `/${path.replace(/^\/+|\/+$/g, "")}`;
}
