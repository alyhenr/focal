import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Optimize for faster navigation
    optimizePackageImports: ['lucide-react', 'date-fns', 'react-day-picker'],
  },
};

export default nextConfig;
