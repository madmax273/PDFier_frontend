import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true, // ✅ Skip ESLint blocking on production builds
  },
  experimental: {
    // your experimental configs here
  },
};

export default nextConfig;
