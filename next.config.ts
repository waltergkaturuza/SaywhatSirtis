import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ['@prisma/client'],
  // Skip static optimization for API routes during build
  trailingSlash: false,
  generateBuildId: async () => {
    // Use a simple build ID to avoid issues
    return 'build-id'
  },
  /* config options here */
};

export default nextConfig;
