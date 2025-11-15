// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",        // keep this if you're doing static export
  images: {
    unoptimized: true,     // 👈 important line
  },
};

export default nextConfig;
