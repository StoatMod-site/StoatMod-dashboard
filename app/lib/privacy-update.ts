// The October 2026 privacy update, linked from the dashboard, changelog and public pages.
export const privacyUpdate = {
  href: "/privacy-changes",
  emailsHref: "/stoat-trust-and-safety-emails.pdf",
  publishedLabel: "2 October 2026",
  // The dashboard banner shows for seven days from publication (UK time).
  bannerStart: Date.parse("2026-10-02T00:00:00+01:00"),
  bannerEnd: Date.parse("2026-10-09T00:00:00+01:00"),
  dismissKey: "stoatmod:privacy-update-2026-10:dismissed",
} as const;
