import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize images
  images: {
    unoptimized: true
  },
  // Reduce bundle size
  productionBrowserSourceMaps: false,
  // Disable type checking during build (check separately)
  typescript: {
    ignoreBuildErrors: true
  },
  // Disable ESLint during build
  eslint: {
    ignoreDuringBuilds: true
  }
};

export default nextConfig;
