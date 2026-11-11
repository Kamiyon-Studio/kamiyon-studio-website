import path from "node:path";
import { fileURLToPath } from "node:url";

import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

import { buildServiceRedirects } from "./lib/seo/service-redirects";

const dirname = path.dirname(fileURLToPath(import.meta.url));

const hostedStudioUrl = (
  process.env.NEXT_PUBLIC_SANITY_STUDIO_URL?.trim() ||
  "https://kamiyon.sanity.studio"
).replace(/\/$/, "");

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "Content-Security-Policy-Report-Only",
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; media-src 'self' https://media.kamiyonstudio.com https://media-staging.kamiyonstudio.com; font-src 'self'; connect-src 'self' https://*.sanity.io https://cloudflareinsights.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'",
          },
          ...(process.env.APP_ENV === "production"
            ? [{ key: "Strict-Transport-Security", value: "max-age=31536000" }]
            : []),
        ],
      },
    ];
  },
  // Studio is hosted separately (`sanity deploy`); only next-sanity client/GROQ stay in the Worker.
  transpilePackages: ["next-sanity"],
  // Config-level redirect avoids SSR `redirect()` (Workers crash on /studio).
  async redirects() {
    return [
      {
        source: "/studio",
        destination: hostedStudioUrl,
        permanent: false,
      },
      {
        source: "/studio/:path*",
        destination: hostedStudioUrl,
        permanent: false,
      },
      {
        source: "/products",
        destination: "/",
        permanent: true,
      },
      {
        source: "/products/:path*",
        destination: "/",
        permanent: true,
      },
      {
        source: "/community",
        destination: "/",
        permanent: true,
      },
      // Gate 0 / ADR-016 service remap (incl. Gate 1 live fold-in) — WS-G
      ...buildServiceRedirects(),
    ];
  },
  images: {
    localPatterns: [
      {
        pathname: "/assets/**",
      },
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "media.kamiyonstudio.com",
      },
      {
        protocol: "https",
        hostname: "media-staging.kamiyonstudio.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  webpack: (webpackConfig) => {
    webpackConfig.resolve.extensionAlias = {
      ".cjs": [".cts", ".cjs"],
      ".js": [".ts", ".tsx", ".js", ".jsx"],
      ".mjs": [".mts", ".mjs"],
    };

    // next/og ships Geist as `*.ttf.bin`; default webpack has no loader for `.bin`.
    webpackConfig.module.rules.push({
      test: /\.ttf\.bin$/,
      type: "asset/resource",
    });

    return webpackConfig;
  },
  turbopack: {
    root: path.resolve(dirname),
  },
};

export default nextConfig;

initOpenNextCloudflareForDev();
