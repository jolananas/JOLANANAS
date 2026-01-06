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
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'u6ydbb-sx.myshopify.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
      {
        protocol: 'https',
        hostname: 'shopify.com',
      },
    ],
    dangerouslyAllowSVG: true,
  },
  
  // Redirections SEO
  async redirects() {
    return [
      {
        source: '/home',
        destination: '/',
        permanent: true,
      },
    ];
  },
  
  // Configuration des rewrites - MIS À JOUR pour pointer vers /api/
  async rewrites() {
    return [
      {
        source: '/src/api/:path*',
        destination: '/api/:path*',
      },
    ];
  },
  
  // Configuration environnement
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || process.env.AUTH_SECRET,
  },
  
  poweredByHeader: false,
};

export default nextConfig;
