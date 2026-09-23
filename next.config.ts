import type { NextConfig } from "next";

// No external scripts, fonts, images, or iframes anywhere in this app (next/font
// self-hosts font files at build time), so the policy can stay tight. script-src
// and style-src need 'unsafe-inline' because Next.js injects its own hydration
// bootstrap script and next/font can inject inline font-face styles — avoiding
// that would require per-request nonces wired through middleware, which isn't
// worth it for an app with no user-supplied HTML rendering in the first place.
const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self' data:",
  "connect-src 'self' https://vitals.vercel-insights.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const nextConfig: NextConfig = {
  // pdf-parse pulls in pdfjs-dist, which resolves its worker script relative to
  // its own module location at runtime. Bundling it through Turbopack/webpack
  // breaks that resolution, so it needs to run as a plain Node `require` instead.
  serverExternalPackages: ["pdf-parse", "pdfjs-dist"],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: CONTENT_SECURITY_POLICY },
          // Vercel already forces HTTPS at the edge; this tells browsers to skip
          // the initial HTTP request entirely on repeat visits.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
