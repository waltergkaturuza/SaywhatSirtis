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
  // Enable standalone output for Docker and Render deployment
  output: 'standalone',
  // Configure standalone server
  env: {
    PORT: process.env.PORT || '10000',
  },
  // Compress images for better performance
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 60,
  },
  // Optimize build for Render's resource limits
  poweredByHeader: false,
  reactStrictMode: true,
  // Ensure proper port and host binding for production
  experimental: {
    // Optimize for production builds
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Webpack optimizations for smaller bundle
  webpack: (config, { dev, isServer, webpack }) => {
    if (!dev && !isServer) {
      // Reduce client bundle size
      config.resolve.alias = {
        ...config.resolve.alias,
        '@': __dirname + '/src',
      };
    }

    // Exclude pdf-parse test files from bundling
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
    };

    // Ignore test files that cause build issues
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /test\/data\/.*\.pdf$/,
        contextRegExp: /pdf-parse/,
      })
    );

    return config;
  },
};

export default nextConfig;
