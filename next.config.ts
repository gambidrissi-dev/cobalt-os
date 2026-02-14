import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Supprime la clé "eslint" directe ici
  // Elle est maintenant gérée via les fichiers de config ESLint séparés
  // ou via la CLI.
  
  experimental: {
    // Si tu veux utiliser Turbopack et le compiler
    // assure-tu d'avoir installé les plugins nécessaires
  },
};

export default nextConfig;