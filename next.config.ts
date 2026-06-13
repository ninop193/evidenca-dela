import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Koren projekta je ta mapa (sicer Next.js zazna tujo lockfile datoteko v domači mapi).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
