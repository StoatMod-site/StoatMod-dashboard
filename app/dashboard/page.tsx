import type { Metadata } from "next";
import { DashboardApp } from "../DashboardApp";

export const metadata: Metadata = { title: "Control room — Stoatmod", robots: { index: false, follow: false } };
export default function DashboardPage() { return <DashboardApp />; }
