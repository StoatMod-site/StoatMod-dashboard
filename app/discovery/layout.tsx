import type { ReactNode } from "react";
import { preconnect } from "react-dom";

// Server icons and profile banners come from Stoat's CDN: open that connection while the page loads.
export default function DiscoveryLayout({ children }: { children: ReactNode }) {
  preconnect("https://cdn.stoatusercontent.com");
  return children;
}
