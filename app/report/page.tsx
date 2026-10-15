import type { Metadata } from "next";
import { ReportApp } from "../ReportApp";

export const metadata: Metadata = { title: "File a Report — Stoatmod", robots: { index: false, follow: false } };
export default async function ReportPage({ searchParams }: { searchParams: Promise<{ token?: string; receipt?: string; target?: string }> }) {
  const { token = "", receipt = "", target = "" } = await searchParams;
  return <ReportApp token={token} receipt={receipt} initialTarget={target} />;
}
