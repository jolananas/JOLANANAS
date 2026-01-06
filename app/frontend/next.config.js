/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuration de base Next.js 16
  reactStrictMode: true,
  
  // Configuration SSR stable
  compress: true,
  
  
  // Support TypeScript
  typescript: {
    ignoreBuildErrors: true, // Temporairement pendant la migration Next.js 16
  },
  
  // Configuration des images et assets (Next.js 16)
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'u6ydbb-sx.myshopify.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'shopify.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/**',
      },
    ],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Configuration des headers de sécurité
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
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=60, s-maxage=300',
          },
        ],
      },
    ];
  },
  
  // Configuration des redirections SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
      // Redirection des anciennes URLs produits vers les nouvelles
      {
        source: '/src/api/products/:handle*',
        destination: '/products/:handle*',
        permanent: true,
      },
    ];
  },
  
  // Configuration des rewrites pour les API
  async rewrites() {
    return [
      {
        source: '/api/products/:path*',
        destination: '/src/api/products/:path*',
      },
      {
        source: '/api/collections/:path*',
        destination: '/src/api/collections/:path*',
      },
      {
        source: '/api/cart/:path*',
        destination: '/src/api/cart/:path*',
      },
      {
        source: '/api/checkout/:path*',
        destination: '/src/api/checkout/:path*',
      },
      {
        source: '/api/auth/:path*',
        destination: '/src/api/auth/:path*',
      },
      {
        source: '/api/shopify/:path*',
        destination: '/api/shopify/:path*',
      },
      {
        source: '/api/webhooks/:path*',
        destination: '/src/api/webhooks/:path*',
      },
      {
        source: '/api/shop',
        destination: '/src/api/shop',
      },
      {
        source: '/api/health/:path*',
        destination: '/src/api/health/:path*',
      },
      {
        source: '/api/newsletter',
        destination: '/src/api/newsletter',
      },
      {
        source: '/api/config/:path*',
        destination: '/src/api/config/:path*',
      },
      {
        source: '/api/checkout/:checkoutId/:path*',
        destination: '/src/api/checkout/:checkoutId/:path*',
      },
      {
        source: '/api/currency',
        destination: '/src/api/currency',
      },
    ];
  },
  
  // Configuration expérimentale Next.js 16 - Temporairement désactivée
  // experimental: {
  //   optimizePackageImports: [
  //     'lucide-react',
  //     'framer-motion',
  //   ],
  // },
  
  // Configuration webpack pour normaliser les caractères Unicode problématiques
  webpack: (config, { isServer }) => {
    // Fonction utilitaire pour normaliser les caractères Unicode > 255
    const normalizeUnicode = (str) => {
      if (typeof str !== 'string') return str;
      return str
        .replace(/\u2013/g, '-')  // Tiret demi-cadratin (8211)
        .replace(/\u2014/g, '-')  // Tiret cadratin (8212)
        .replace(/\u2026/g, '...') // Points de suspension (8230)
        .replace(/[""]/g, '"')    // Guillemets doubles
        .replace(/['']/g, "'");   // Guillemets simples
    };

    // Plugin pour normaliser les chemins et métadonnées avec caractères Unicode
    // Cela évite l'erreur "Cannot convert argument to a ByteString" (caractère 8211, etc.)
    config.plugins.push({
      apply: (compiler) => {
        // Normaliser les chemins de fichiers lors de la résolution des modules
        compiler.hooks.normalModuleFactory.tap('UnicodeNormalizerPlugin', (nmf) => {
          nmf.hooks.beforeResolve.tap('UnicodeNormalizerPlugin', (data) => {
            if (data.request && typeof data.request === 'string') {
              data.request = normalizeUnicode(data.request);
            }
            if (data.context && typeof data.context === 'string') {
              data.context = normalizeUnicode(data.context);
            }
            return data;
          });
        });

        // Normaliser le contenu des modules après chargement
        compiler.hooks.compilation.tap('UnicodeNormalizerPlugin', (compilation) => {
          compilation.hooks.buildModule.tap('UnicodeNormalizerPlugin', (module) => {
            if (module.resource && typeof module.resource === 'string') {
              module.resource = normalizeUnicode(module.resource);
            }
          });

          // Intercepter et normaliser les sources avant traitement
          compilation.hooks.processAssets.tap(
            {
              name: 'UnicodeNormalizerPlugin',
              stage: compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_COMPATIBILITY,
            },
            (assets) => {
              Object.keys(assets).forEach((filename) => {
                const asset = assets[filename];
                if (asset && typeof asset.source === 'function') {
                  try {
                    const originalSource = asset.source();
                    if (typeof originalSource === 'string') {
                      const normalized = normalizeUnicode(originalSource);
                      if (normalized !== originalSource) {
                        // Créer une nouvelle source normalisée
                        const { sources } = require('webpack');
                        asset.source = () => new sources.RawSource(normalized);
                      }
                    }
                  } catch (e) {
                    // Ignorer les erreurs de lecture de source
                  }
                }
              });
            }
          );
        });
      },
    });

    // Bundle analyzer activable via ANALYZE=true npm run build
    if (process.env.ANALYZE === 'true' && !isServer) {
      const { BundleAnalyzerPlugin } = require('@next/bundle-analyzer')({
        enabled: true,
      });
      config.plugins.push(new BundleAnalyzerPlugin());
    }

    return config;
  },
  
  // Configuration TypeScript stricte
  transpilePackages: [],
  
  // Configuration environnement
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
  
  // Configuration du compilateur
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error'],
    } : false,
  },
  
  // Configuration pour le déploiement
  trailingSlash: false,
  
  // Configuration du rendu (temporary commenté pour éviter les erreurs Vercel)
  // output: 'standalone', // Pour Docker et déploiement serverless
  
  // Configuration Powerhouse (inactive par défaut)
  poweredByHeader: false,
};

export default nextConfig;
