import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep browser tests separate from an already-running local dev server.
  distDir: process.env.SHORTY_TEST_BUILD ? ".next-e2e" : ".next",
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
