/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration Next.js 14 avec optimisations Shopify
  reactStrictMode: true,
  trailingSlash: false,
  
  // Optimisations images
  images: {
    domains: [
      'cdn.shopify.com',
      'u6ydbb-sx.myshopify.com',
      'images.unsplash.com'
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Variables d'environnement publiques
  env: {
    SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN,
    SHOPIFY_API_VERSION: process.env.SHOPIFY_API_VERSION,
  },

  // Headers de sécurité
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://cdn.shopify.com https://u6ydbb-sx.myshopify.com; connect-src 'self' https://u6ydbb-x.myshopify.com https://cdn.shopify.com;",
          },
        ],
      },
    ];
  },

  // Redirections
  async redirects() {
    return [
      {
        source: '/collection/:slug',
        destination: '/products?collection=:slug',
        permanent: true,
      },
      {
        source: '/product/:slug',
        destination: '/products/:slug',
        permanent: true,
      },
    ];
  },

  // Rewrites pour les API
  async rewrites() {
    return [
      {
        source: '/api/shopify/:path*',
        destination: '/api/:path*',
      },
    ];
  },

  // Configuration expérimentale
  experimental: {
    serverComponentsExternalPackages: ['graphql'],
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Webpack personnalisé
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  // Analyse du bundle en production
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        // Configuration pour analysis du bundle côté client seulement
      }
      return config;
    },
  }),

  // Configuration pour les builds
  output: 'standalone',
  
  // Optimisations supplémentaires
  compress: true,
  poweredByHeader: false,
};

module.exports = nextConfig;
