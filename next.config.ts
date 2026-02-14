import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Supprime la clé "eslint" si elle y est encore
  typescript: {
    // Si tu veux forcer le build malgré l'erreur TypeScript (déconseillé mais débloquant)
    ignoreBuildErrors: false, 
  }
};

export default nextConfig;