// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,     // 👈 important line
  },
};

export default nextConfig;
