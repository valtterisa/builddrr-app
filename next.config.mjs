/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    webpackBuildWorker: true,
    parallelServerBuildTraces: true,
    parallelServerCompiles: true,
  },
  env: {
    // Set default value for Fly.io API base URL
    FLY_API_BASE: "https://api.machines.dev",
  },
  async redirects() {
    return [
      {
        source: "/dashboard/analytics",
        destination: "/dashboard",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
