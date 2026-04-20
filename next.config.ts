import type { NextConfig } from "next";
import fs from "fs";
import path from "path";

try {
  const src = "C:\\Users\\ekaru\\.gemini\\antigravity\\brain\\e12bbfdf-7c41-4b8f-a8f2-11e9eae46ded\\media__1776647980616.png";
  const dest = path.join(process.cwd(), "public", "logo.png");
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
  }
} catch (e) {}

const BACKEND_URL = "https://db.hztapp.com/spakar";

const nextConfig: NextConfig = {
  // Compress output for smaller bundles
  compress: true,

  // ── Proxy all /api/ requests to the real backend ──────────────────────────
  // This runs server-side, so CORS is never an issue.
  // The browser always talks to localhost:3000 only.
  async rewrites() {
    return [
      {
        // Proxy /api/auth/* and /api/diagnose, /api/symptoms, /api/diseases
        source: "/api/:path*",
        destination: `${BACKEND_URL}/api/:path*`,
      },
    ];
  },

  // Optimize images
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'api.dicebear.com',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },

  // React strict mode for development
  reactStrictMode: true,
};

export default nextConfig;
