import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize images
  images: {
    unoptimized: true
  },
  // Reduce bundle size
  productionBrowserSourceMaps: false,
  // Standalone output for production
  output: 'standalone'
};

export default nextConfig;
