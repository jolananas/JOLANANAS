/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration de base Next.js 16
  reactStrictMode: true,

  // Support TypeScript
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configuration des images
  images: {
    formats: ["image/avif", "image/webp"],
    // Laisse le temps à Shopify CDN de convertir les gros fichiers HEIC
    minimumCacheTTL: 60,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "u6ydbb-sx.myshopify.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "cdn.shopify.com",
        pathname: "/s/files/**",
      },
      {
        protocol: "https",
        hostname: "shopify.com",
        pathname: "/**",
      },
    ],
    dangerouslyAllowSVG: true,
  },

  // Redirections SEO
  async redirects() {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },

  // Configuration des rewrites - Supprimé car inutile avec la nouvelle structure src
  /* async rewrites() {
    return [
      {
        source: '/src/api/:path*',
        destination: '/api/:path*',
      },
    ];
  }, */

  // Configuration environnement
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  },

  poweredByHeader: false,
};

export default nextConfig;
