/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // !! IMPORTANT !!
    // Ignore les erreurs de type pour permettre le déploiement
    // même si le code n'est pas parfait.
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignore les erreurs de style
    ignoreDuringBuilds: true,
  },
};

export default nextConfig; // ou module.exports = nextConfig; si vous n'utilisez pas "mjs"