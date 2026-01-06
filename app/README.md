# 🍍 JOLANANAS - Shopify Headless Storefront

[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org/)
[![Shopify](https://img.shields.io/badge/Shopify-Headless-green.svg)](https://shopify.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4+-06B6D4.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Architecture e-commerce professionnelle pour JOLANANAS - Créations manuelles hautes gammes**

Cette application React/TypeScript moderne utilise Next.js 14+ pour créer un storefront Shopify headless professionnel, optimisé pour les boutiques de luxe avec des exigences de performance et d'expérience utilisateur élevées.

## ✨ Fonctionnalités

### 🛍️ Commerce E-commerce

- **Shopify Storefront API** - Intégration GraphQL complète
- **Gestion de panier** - Cart optimiste avec synchronisation temps réel
- **Recherche avancée** - Suggestions, autocomplétion, filtres multi-critères
- **Multi-devises** - Support EUR, USD, CAD avec conversion automatique
- **Multi-langues** - Français et Anglais (i18n)
- **Inventaire en temps réel** - Synchronisation via webhooks

### ⚡ Performance & SEO

- **Lighthouse Score** - >90 desktop, >80 mobile ciblé
- **TTFB <200ms** - Optimisation Time To First Byte
- **Image Optimization** - Support AVIF, WebP, lazy loading
- **Cache Edge** - ISR + SWR + cache CDN intelligen
- **Structured Data** - Schema.org pour produits, organisation, breadcrumbs
- **Sitemap XML** - Génération automatique

### 🎨 Design & UX

- **Design System JOLANANAS** - Palettes couleurs et typographies personnalisées
- **Accessibilité WCAG AA** - Navigation clavier, lecteurs d'écran
- **Animations fluides** - Framer Motion, micro-interactions
- **Mobile-First** - Design responsive adaptatif
- **Dark Mode Ready** - Support thème sombre (futur)

### 🔧 Technologies

- **Framework** - Next.js 14+ avec App Router
- **Langage** - TypeScript strict mode
- **Styling** - Tailwind CSS 3.4+ avec design tokens
- **État global** - Zustand + SWR pour cache
- **Formulaires** - React Hook Form + validation
- **Tests** - Jest + React Testing Library + Playwrigh

### 🏗️ Architecture

- **Monorepo modulaire** - Separation claire des responsabilités
- **API Routes** - Serverless functions pour Shopify Admin
- **Webhooks sécurisés** - HMAC verification, gestion stock/commandes
- **Sécurité** - CSPheaders, rate limiting, CORS configuré
- **Monitoring** - Sentry ready, analytics performance

## 🚀 Démarrage Immédiat

### Installation & Configuration

```bash
# Installation & configuration
npm install
cp variables/.env.example variables/.env.local

# Démarrage développement
npm run dev

# Tester la connexion Shopify
npm run test:shopify

# Outils de développement
npm run dev:tools
```

→ **Application**: [http://localhost:3000](http://localhost:3000)

### Configuration Shopify

**variables/.env.local** (créé automatiquement) :

```env
SHOPIFY_STORE_DOMAIN=u6ydbb-sx.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=[STOREFRONT_TOKEN_COMPROMISED]
SHOPIFY_API_VERSION=2025-01
```

### URLs Importantes

- **App**: [http://localhost:3000](http://localhost:3000)
- **API Products**: [http://localhost:3000/api/products](http://localhost:3000/api/products)
- **API Cart**: [http://localhost:3000/api/cart/create](http://localhost:3000/api/cart/create)
- **Shopify Store**: [https://u6ydbb-sx.myshopify.com](https://u6ydbb-sx.myshopify.com)

## 📋 Scripts Disponibles

```bash
# Développemen
npm run dev          # Serveur de développement Next.js
npm run build        # Build de production
npm run start        # Serveur de production
npm run preview      # Aperçu du build

# Code Quality
npm run lint         # ESLint + Next.js lin
npm run lint:fix     # Auto-fix linting errors
npm run format       # Prettier formatting
npm run type-check   # TypeScript verification

# Tests
npm run test         # Jest unit tests
npm run test:watch   # Tests en mode watch
npm run test:coverage # Rapport de couverture
npm run test:e2e     # Playwright E2E tests
npm run test:e2e:ui  # Interface graphique Playwrigh

# Analyse & Optimisation
npm run build:analyze # Bundle analyzer
npm run health:check  # Verification santé app
npm run docs:dev      # Documentation locale
npm run docs:build    # Build documentation

# Déploiemen
npm run deploy:vercel    # Déploiement Vercel
npm run deploy:netlify   # Déploiement Netlify
```

## 📁 Structure Simplifiée

```text
src/
├── app/                        # Next.js 14 App Router
│   ├── page.tsx              # Page d'accueil avec données Shopify
│   ├── layout.tsx             # Layout principal
│   ├── globals.css            # Styles Tailwind
│   ├── cart/page.tsx          # Page panier
│   ├── products/[handle]/     # Pages produit dynamiques
│   └── api/                   # API Routes Shopify
│       ├── products/          # /api/products
│       └── cart/              # /api/cart/*
├── components/                # Composants React
│   ├── sections/              # HeroSection, ProductsGrid
│   ├── product/               # ProductInfo, ProductGallery
│   ├── layout/                # Navigation, Footer
│   └── ui/                    # LoadingSpinner, Button
├── lib/shopify/               # Intégration Shopify
│   ├── shopify-client.ts      # Client GraphQL
│   └── types.ts               # Types TypeScript
├── hooks/                     # React Hooks
│   └── useCart.ts             # Hook panier avec Shopify
└── styles/                    # Styles personnalisés

tools/
├── react-dev-tools.js         # Outil développement visuel
├── setup.js                   # Configuration automatique
└── test-shopify.js            # Tests connexion Shopify

tests/
└── integration/
    └── shopify-tests.ts       # Tests Shopify complets
```

## 🎨 Design System

### Palette Couleurs JOLANANAS

```css
/* Couleurs principales */
--jolananas-peach-light: #F4C0AC     /* Rose pêche clair */
--jolananas-pink-medium: #F38FA3     /* Rose moyen */
--jolananas-pink-deep: #EC7B9C       /* Rose profond */
--jolananas-peach-pink: #F4B4AB      /* Rose pêche */
--jolananas-peach-bright: #FCA4A4    /* Rose vif */
--jolananas-white-soft: #FEF7F0      /* Blanc doux */
--jolananas-gray-warm: #F3E8FF       /* Gris chaud */
--jolananas-black-ink: #141318       /* Noir encre */
--jolananas-gold: #FFD700            /* Or */
--jolananas-green: #228B22           /* Vert */

/* Gradients */
gradient-jolananas: linear-gradient(135deg, peach-light → pink-medium → pink-deep → peach-pink → peach-bright)
```

### Typographie

```css
/* Polices */
--font-logo: "weather sunday - personal use", cursive, Georgia
--font-heading: Poppins, Inter, system-ui
--font-body: Inter, system-ui
```

### Composants

#### Button Variants

- `btn--primary` - Bouton principal JOLANANAS
- `btn--secondary` - Bouton secondaire
- `btn--outline` - Bouton contour
- `btn--ghost` - Bouton transparen
- `btn--link` - Bouton lien

#### Sizes

- `btn--xs`, `btn--sm`, `btn--md`, `btn--lg`, `btn--xl`

#### ProductCard

- Layouts : `grid`, `list`, `featured`
- Badges automatiques : Promotion, Rupture, Exclusivité
- Animations hover fluides

## 🔧 Configuration Avancée

### Cache Configuration

```typescrip
// src/lib/cache/swr.ts
export const CACHE_DURATIONS = {
  PRODUCTS: 300,        // 5 minutes
  PRODUCT: 600,         // 10 minutes
  COLLECTIONS: 1800,    // 30 minutes
  CART: 60,             // 1 minute
  SEARCH: 300,          // 5 minutes
} as cons
```

### SEO Configuration

```typescrip
// src/variables/shopify.ts
export const seo = {
  defaultTitle: 'JOLANANAS - Créations Manuelles Hautes Gamme',
  defaultDescription: 'Découvrez les créations artisanales exclusives...',
  structuredData: true,
  sitemapGeneration: true,
} as cons
```

### Sécurité

```typescrip
// Headers automatiques configurés
{
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'Content-Security-Policy': 'default-src \'self\' ...',
  'HSTS': 'max-age=31536000; includeSubDomains'
}
```

## ✅ Fonctionnalités Validées

- ✅ **Page d'accueil** avec produits Shopify réels
- ✅ **Composants** avec données dynamiques (HeroSection, ProductsGrid)  
- ✅ **Pages produit** individuelles avec métadonnées SEO
- ✅ **Panière** intégré Shopify (add/update/remove)
- ✅ **API Routes** Next.js connectées Shopify
- ✅ **Tests** Shopify complets et automatisés
- ✅ **Design System** JOLANANAS appliqué
- ✅ **Outils de dev** React interactifs

## 🧪 Tests et Validation

```bash
# Tests complets
npm run test

# Tests Shopify uniquement  
npm run test:shopify

# Test connexion direct Shopify
node tools/test-shopify.js

# Outil développement interactif
npm run dev:tools
```

## 🚀 Déploiement

```bash
# Build production
npm run build

# Vercel (recommandé)
npm run deploy:vercel

# Netlify 
npm run deploy:netlify
```

## 📊 Monitoring & Analytics

### Performance Monitoring

Métriques automatiquement collectées :

- **Core Web Vitals** (FCP, LCP, CLS, FID)
- **TTFB** (Time To First Byte)
- **Conversion rate** optimisé

### Erreurs & Monitoring

- **Sentry** ready pour tracking erreurs production
- **Logs structurés** JSON pour debugging
- **Health checks** automatiques (`/api/health`)

## 🤝 Contribution

1. Fork le proje
2. Créer branche feature (`git checkout -b feature/nouvelle-feature`)
3. Commit changements (`git commit -m 'Add nouvelle feature'`)
4. Push branche (`git push origin feature/nouvelle-feature`)
5. Ouvrir Pull Reques

### Standards Code

- **TypeScript strict mode**
- **ESLint** + **Prettier** configurés
- **Conventional Commits** pour historiques clairs
- **Tests requis** pour nouvelles fonctionnalités

## 📞 Suppor

- 📧 **Email** : [contact@jolananas.com](mailto:contact@jolananas.com)
- 🌐 **Site** : [jolananas.com](https://jolananas.com)
- 🐛 **Issues** : [GitHub Issues](https://github.com/jolananas/serveur/issues)

## 📄 Licence

Ce projet est licencié sous la Licence MIT - voir le fichier [LICENSE](LICENSE) pour les détails.

---

> **Créé avec ❤️ par [AÏSSA BELKOUSSA](https://jolananas.com)** \
Architecture moderne pour boutiques Shopify de luxe
