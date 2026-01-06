import type React from "react"
import type { Metadata } from "next"
import { Inter, Poppins, Montserrat } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { AnalyticsDebugFilter } from './src/components/analytics/AnalyticsDebugFilter'
import { SessionProviderWrapper } from './src/components/providers/SessionProviderWrapper'
import { CartProvider } from "@/app/src/lib/CartContext"
import { SWRProvider } from './src/lib/providers/SWRProvider'
import { LayoutWrapper } from './src/components/layout/LayoutWrapper'
import { FacebookMetaTags } from './src/components/layout/FacebookMetaTags'
import { Preloader } from './src/components/preloader/Preloader'
import './globals.css'

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
})

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
})

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-montserrat",
  display: "swap",
})

export const metadata: Metadata = {
  // Configuration de base
  metadataBase: new URL(process.env.NODE_ENV === 'production' 
    ? 'https://jolananas.com' 
    : 'http://localhost:3000' || 'https://jolananas.com'
  ),
  
  // Métadonnées principales
  title: 'JOLANANAS - Créations Manuelles Hautes Gammes',
  description: 'Découvrez les créations artisanales exclusives de JOLANANAS. Bijoux personnalisés et accessoires haut de gamme.',
  
  // Icônes et manifeste - Configuration complète des favicons
  icons: {
    icon: [
      { url: '/assets/images/favicon/favicon-16.png', sizes: '16x16', type: 'image/png' },
      { url: '/assets/images/favicon/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/assets/images/favicon/favicon-48.png', sizes: '48x48', type: 'image/png' },
      { url: '/assets/images/favicon/favicon-96.png', sizes: '96x96', type: 'image/png' },
      { url: '/assets/images/favicon/favicon-128.png', sizes: '128x128', type: 'image/png' },
      { url: '/assets/images/favicon/favicon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/assets/images/favicon/favicon-256.png', sizes: '256x256', type: 'image/png' },
      { url: '/assets/images/favicon/favicon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/assets/images/favicon/favicon-180.png', sizes: '180x180', type: 'image/png' },
      { url: '/assets/images/favicon/favicon-167.png', sizes: '167x167', type: 'image/png' },
      { url: '/assets/images/favicon/favicon-152.png', sizes: '152x152', type: 'image/png' },
      { url: '/assets/images/favicon/favicon-144.png', sizes: '144x144', type: 'image/png' },
      { url: '/assets/images/favicon/favicon-120.png', sizes: '120x120', type: 'image/png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon',
        url: '/assets/images/favicon/favicon-180.png',
      },
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/assets/images/favicon/favicon-180.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        url: '/assets/images/favicon/favicon-32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        url: '/assets/images/favicon/favicon-16.png',
      },
    ],
  },
  manifest: '/site.webmanifest',
  
  // Configuration format detection
  formatDetection: {
    telephone: false,
    date: false,
    email: false,
    address: false,
    url: false,
  },
  
  // Open Graph (Facebook, LinkedIn, etc.)
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: 'https://jolananas.com',
    siteName: 'JOLANANAS',
    title: 'JOLANANAS - Créations Manuelles Hautes Gammes',
    description: 'Découvrez les créations artisanales exclusives de JOLANANAS. Bijoux personnalisés et accessoires haut de gamme fait main en France.',
    images: [
      {
        url: 'https://jolananas.com/assets/images/preview/Jolananas_preview.png',
        width: 1200,
        height: 630,
        alt: 'JOLANANAS - Créations artisanales girly et utiles',
        type: 'image/png',
      },
    ],
  },
  
  // Twitter Card
  twitter: {
    card: 'summary_large_image',
    title: 'JOLANANAS - Créations Manuelles Hautes Gammes',
    description: 'Découvrez les créations artisanales exclusives de JOLANANAS. Bijoux personnalisés et accessoires haut de gamme.',
    images: ['/assets/images/preview/Jolananas_preview.png'],
  },
  
  // Apple Web App
  appleWebApp: {
    title: 'JOLANANAS - Créations Manuelles Hautes Gammes',
    statusBarStyle: 'black-translucent',
    capable: true
  },
  
  // URLs alternatives et canoniques
  alternates: {
    canonical: '/',
    languages: {
      'fr-FR': '/fr',
      'en-US': '/en',
    },
  },
  
  // SEO et robots
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  
  // Vérification des moteurs de recherche
  verification: {
    google: 'your-google-verification-code',
  },
  
  // Balises meta Facebook supplémentaires
  other: {
    ...(process.env.FACEBOOK_APP_ID && { 'fb:app_id': process.env.FACEBOOK_APP_ID }),
    'article:author': 'https://www.facebook.com/jolananas.officiel',
    'article:publisher': 'https://www.facebook.com/jolananas.officiel',
    'og:image:secure_url': 'https://jolananas.com/assets/images/preview/Jolananas_preview.png',
    'og:image:type': 'image/png',
    'og:image:width': '1200',
    'og:image:height': '630',
    'og:locale:alternate': 'en_US',
  },
}

// Export viewport séparé (requis par Next.js 14+)
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#EF7C9E',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr" className={`${inter.variable} ${poppins.variable} ${montserrat.variable}`}>
      <body className={`min-h-screen font-sans antialiased ${inter.variable} ${poppins.variable} ${montserrat.variable}`}>
        <Preloader />
        <FacebookMetaTags />
        <SessionProviderWrapper>
          <SWRProvider>
            <CartProvider>
              <div className="relative min-h-screen">
                <div className="relative z-10">
                  <LayoutWrapper>
                    {children}
                  </LayoutWrapper>
                </div>
              </div>
            </CartProvider>
          </SWRProvider>
        </SessionProviderWrapper>
        {/* Filtre les logs de débogage Vercel Analytics en développement */}
        <AnalyticsDebugFilter />
        {/* Analytics : actif en production et développement */}
        {/* Les logs de débogage sont filtrés en dev par AnalyticsDebugFilter */}
        <Analytics />
      </body>
    </html>
  )
}
