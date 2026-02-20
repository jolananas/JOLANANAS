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

  // Redirections permanentes
  async redirects() {
    return [
      // Ancienne page d'accueil
      { source: "/home", destination: "/", permanent: true },

      // Compte client → Shopify Customer Accounts
      { source: "/account",          destination: "https://accounts.jolananas.com", permanent: false },
      { source: "/account/:path*",   destination: "https://accounts.jolananas.com", permanent: false },
      { source: "/auth/login",       destination: "https://accounts.jolananas.com", permanent: false },
      { source: "/auth/register",    destination: "https://accounts.jolananas.com", permanent: false },
      { source: "/auth/:path*",      destination: "https://accounts.jolananas.com", permanent: false },
    ];
  },

  // Rewrites : alias d'URLs françaises → dossiers anglais (masquage transparent)
  async rewrites() {
    return [
      { source: "/a-propos",                          destination: "/about" },
      { source: "/mentions-legales",                  destination: "/legal" },
      { source: "/mentions-legales/confidentialite",  destination: "/legal/privacy" },
      { source: "/mentions-legales/CGU",              destination: "/legal/terms" },
      { source: "/mentions-legales/CGV",              destination: "/legal/cgv" },
      { source: "/mentions-legales/cookies",          destination: "/legal/cookies" },
      { source: "/mentions-legales/retours",          destination: "/legal/retours" },
    ];
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          }
        ],
      },
    ];
  },

  // Configuration environnement
  env: {
    AUTH_SECRET: process.env.AUTH_SECRET,
  },

  poweredByHeader: false,
};

export default nextConfig;
