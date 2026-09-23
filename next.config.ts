import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // pdf-parse pulls in pdfjs-dist, which resolves its worker script relative to
  // its own module location at runtime. Bundling it through Turbopack/webpack
  // breaks that resolution, so it needs to run as a plain Node `require` instead.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
};

export default nextConfig;
