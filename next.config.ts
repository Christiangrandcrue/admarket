import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize images
  images: {
    unoptimized: true
  },
  // Reduce bundle size
  productionBrowserSourceMaps: false
};

export default nextConfig;
