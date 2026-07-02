import type { NextConfig } from "next";

const isVercel = process.env.VERCEL === "1" || !!process.env.VERCEL_ENV;

const nextConfig: NextConfig = {
  // Standalone output is needed for the sandbox Docker deployment.
  // Vercel handles output automatically, so skip it there for faster builds.
  ...(isVercel ? {} : { output: "standalone" }),
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
};

export default nextConfig;
