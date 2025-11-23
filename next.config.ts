import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimize for low-memory environments
  experimental: {
    // Reduce memory usage in development
    turbopack: {
      memoryLimit: 256
    }
  },
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
