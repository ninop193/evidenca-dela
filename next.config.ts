import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ne izdajaj, s čim je stran zgrajena.
  poweredByHeader: false,
  // Varnostne glave za vse strani.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Prepreči vstavljanje strani v tuj okvir (clickjacking).
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  // Koren projekta je ta mapa (sicer Next.js zazna tujo lockfile datoteko v domači mapi).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
