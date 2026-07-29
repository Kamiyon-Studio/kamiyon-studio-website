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
