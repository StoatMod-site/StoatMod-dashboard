import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Put every page's metadata (title, description, canonical, robots, icons) in <head> for every visitor.
  // By default it is streamed into <body> for browsers and for Googlebot, where Google ignores
  // rel=canonical. Our pages already wait for their data before rendering, so this costs nothing.
  htmlLimitedBots: /.*/,
};

export default nextConfig;
