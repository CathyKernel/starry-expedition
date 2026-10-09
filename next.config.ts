import type { NextConfig } from "next";

/**
 * Base path for static deployments served from a sub-path — most commonly a
 * GitHub Pages project site at https://<user>.github.io/<repo>/.
 *
 * Leave UNSET (empty) for root deployments: Vercel, Netlify, Cloudflare
 * Pages, a `<user>.github.io` root repository, or any custom domain.
 *
 * Example (GitHub Pages project site):
 *   NEXT_PUBLIC_BASE_PATH=/starry-expedition npm run build
 *
 * The included GitHub Actions workflow (`.github/workflows/deploy.yml`)
 * sets this automatically from the repository name — no manual step needed.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  // Fully static export (`out/`) — deployable on GitHub Pages or any
  // static file host. There is no server component: the whole experience
  // runs client-side.
  output: "export",
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  reactStrictMode: false,
};

export default nextConfig;
