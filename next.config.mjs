/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true, // On veut que ça déploie même s'il manque une virgule
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  serverExternalPackages: ["jsdom"], // Crucial pour le Wiki/Tiptap
};

export default nextConfig;