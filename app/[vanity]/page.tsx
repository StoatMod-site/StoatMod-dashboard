import { notFound, redirect } from "next/navigation";
import { buildMetadata } from "../lib/seo";

// Custom Discovery links: modstoat.site/<slug> forwards to the server's Stoat invite. Every real page is a
// static route and wins over this one; the API refuses slugs that match a site route.
const slugPattern = /^[a-z0-9](?:[a-z0-9-]{1,30})[a-z0-9]$/;

export const metadata = buildMetadata({
  title: "Stoat server invite | Stoatmod Discovery",
  description: "This custom Stoatmod Discovery link opens a Stoat server invite.",
  path: "/discovery",
  index: false,
});

async function lookup(slug: string): Promise<{ slug: string } | null> {
  const origin = (process.env.STOATMOD_PUBLIC_API_ORIGIN?.trim() || (process.env.NODE_ENV === "development" ? "https://modstoat.site" : "")).replace(/\/$/, "");
  if (!origin) return null;
  try {
    const response = await fetch(`${origin}/api/public/discovery/vanity/${encodeURIComponent(slug)}`, {
      cache: "no-store", headers: { accept: "application/json" }, signal: AbortSignal.timeout(2_500),
    });
    if (!response.ok) return null;
    const value: unknown = await response.json();
    return value && typeof value === "object" && typeof (value as { slug?: unknown }).slug === "string" ? value as { slug: string } : null;
  } catch {
    return null;
  }
}

export default async function CustomLink({ params }: { params: Promise<{ vanity: string }> }) {
  const slug = decodeURIComponent((await params).vanity).toLowerCase();
  if (!slugPattern.test(slug)) notFound();
  const vanity = await lookup(slug);
  if (!vanity) notFound();
  // The API counts the visit (as a daily total only) and redirects to the current invite.
  redirect(`/api/public/discovery/go/${encodeURIComponent(vanity.slug)}`);
}
