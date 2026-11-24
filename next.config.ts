import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['better-sqlite3', 'bcryptjs'],
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
