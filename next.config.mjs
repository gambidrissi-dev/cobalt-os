import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. On continue d'ignorer les erreurs de code
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  // 2. LA CORRECTION : On met ça à la racine, pas dans "experimental"
  serverExternalPackages: ["jsdom"],
};

export default nextConfig;