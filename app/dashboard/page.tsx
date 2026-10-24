import type { Metadata } from "next";
import { DashboardApp } from "../DashboardApp";
// Dashboard-only styles, kept out of the public pages' stylesheet.
import "../dashboard.css";

export const metadata: Metadata = { title: "Control room — Stoatmod", robots: { index: false, follow: false } };
export default function DashboardPage() { return <DashboardApp />; }
