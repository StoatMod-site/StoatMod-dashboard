import type { Metadata } from "next";
import { LoginApp } from "../LoginApp";

export const metadata: Metadata = { title: "Moderator login — Stoatmod", robots: { index: false, follow: false } };
export default function LoginPage() { return <LoginApp />; }
