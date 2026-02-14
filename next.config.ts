import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Vos autres options ici */
  experimental: {
    reactCompiler: true,
  },
};

export default nextConfig;