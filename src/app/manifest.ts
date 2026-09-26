import type { MetadataRoute } from "next";

// Auto-served at /manifest.webmanifest and linked in <head> by Next.js —
// no changes needed elsewhere. Colors match the light theme's --background
// and --accent tokens in globals.css (a manifest can't respond to the
// app's own dark-mode toggle, so this picks the default/fallback theme).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Redrafted",
    short_name: "Redrafted",
    description: "Paste your .tex resume and a job posting to get an AI-tailored resume and cover letter.",
    start_url: "/",
    display: "standalone",
    background_color: "#f6f2ea",
    theme_color: "#f6f2ea",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
