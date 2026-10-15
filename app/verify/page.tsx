import type { Metadata } from "next";
import { VerifyApp } from "../VerifyApp";

export const metadata: Metadata = { title: "Member verification — Stoatmod", robots: { index: false, follow: false } };
export default async function VerificationPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return <VerifyApp token={token} />;
}
