# 🍍 JOLANANAS - Architecture API Finale

## 📂 Structure APIs Nettoyée

```
frontend/src/apps/api/
├── 🔐 auth/
│   ├── [...nextauth]/route.ts     # NextAuth handler principal
│   └── signup/route.ts            # Création compte utilisateur
├── 🛒 cart/
│   ├── create/route.ts            # Création panier Shopify (léger)
│   └── route.ts                   # Panier persisté (complet)
├── 📦 products/
│   └── route.ts                   # API Produits Shopify
├── 📂 collections/
│   └── route.ts                   # API Collections Shopify
└── 🔗 webhooks/
    ├── orders/create/route.ts     # Webhook nouvelles commandes
    ├── products/update/route.ts   # Webhook produits mis à jour
    └── inventory-levels/update/   # Webhook stocks mis à jour
```

## 🔄 APIs Publiques (Storefront)

### GET `/api/products`

- **Client**: `shopify-storefront-client.ts`
- **Usage**: Catalogue produits publics
- **Cache**: ISR + SWR (1 heure)
- **Paramètres**: `first`, `after` (pagination)

### GET `/api/collections`

- **Client**: `shopify-storefront-client.ts`
- **Usage**: Collections produits publics
- **Cache**: ISR + SWR (1 heure)
- **Paramètres**: `first`, `after` (pagination)

### POST `/api/cart/create`

- **Client**: `shopify-storefront-client.ts`
- **Usage**: Panier Shopify léger (redirect checkout)
- **Cache**: No-cache (temps réel)
- **Body**: `{ lines: [{ merchandiseId, quantity }] }`

## 🛒 APIs Panier Persisté

### GET `/api/cart`

- **Usage**: Récupérer panier utilisateur connecté/anonyme
- **Base**: SQLite via Prisma
- **Sync**: Shopify Storefront API
- **Headers**: Authentification NextAuth (optionnel)

### POST `/api/cart`

- **Usage**: Ajouter articles au panier persisté
- **Base**: SQLite via Prisma
- **Body**: `{ productId, variantId, quantity, sessionId? }`

### PUT `/api/cart`

- **Usage**: Mettre à jour quantité articles
- **Base**: SQLite via Prisma
- **Body**: `{ cartItemId, quantity }`

### DELETE `/api/cart`

- **Usage**: Supprimer article du panier
- **Base**: SQLite via Prisma
- **Query**: `?cartItemId=xxx`

## 🔐 Authentification

### POST `/api/auth/[...nextauth]` (NextAuth)

- **Usage**: Connexion/déconnexion
- **Provider**: Credentials (Email/Password)
- **Session**: JWT sécurisée
- **Pages**: `/auth/signin`, `/auth/signup`

### POST `/api/auth/signup`

- **Usage**: Création nouveau compte
- **Validation**: Zod + bcrypt
- **Base**: SQLite via Prisma
- **Response**: User sans password

## 🔗 Webhooks Shopify

### POST `/api/webhooks/orders/create`

- **Source**: Shopify commandes
- **Usage**: Traitement nouvelles commandes
- **Sécurité**: HMAC SHA256 validation
- **Base**: SQLite (Order, OrderItem, Address)
- **Actions**: Création compte auto + sauvegarde commande

### POST `/api/webhooks/products/update`

- **Source**: Shopify produits
- **Usage**: Cache produits temps réel
- **Sécurité**: HMAC SHA256 validation
- **Base**: SQLite (ProductCache)
- **Actions**: Update cache produit local

### POST `/api/webhooks/inventory-levels/update`

- **Source**: Shopify inventaire
- **Usage**: Synchronisation stocks temps réel
- **Sécurité**: HMAC SHA256 validation
- **Actions**: Notification stock mis à jour

## 🔧 Clients Intégrés

### Storefront Client (Public)

```typescript
// src/lib/shopify-storefront-client.ts
export class ShopifyStorefrontClient {
  async getProducts(first, after); // Catalogue public
  async getProduct(handle); // Produit spécifique
  async getCollections(first, after); // Collections publiques
  async searchProducts(query, first); // Recherche publique
  async createCart(lines?); // Panier Shopify
  async addToCart(cartId, lines); // Ajouter au panier
}
```

### Admin Client (Privé)

```typescript
// src/lib/shopify-admin-client.ts
export class ShopifyAdminClient {
  async getOrders(first, financialStatus?)    // Commandes admin
  async getCustomers(first)                   // Clients admin
  async getInventoryLevels(locationIds, ...) // Stocks admin
  async getProducts(first, publishedStatus?) // Produits admin
  async createWebhook(webhookData)           // Gestion webhooks
  async getRevenue(startDate, endDate)        // Analytics
}
```

## 🛡️ Sécurité

### Variables d'Environnement

```bash
# Obligatoires
SHOPIFY_STORE_DOMAIN=xxx.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=xxx
DATABASE_URL=file:./dev.db
NEXTAUTH_SECRET=xxx
NEXTAUTH_URL=http://localhost:3000

# Optionnelles (pour fonctionnalités avancées)
SHOPIFY_STOREFRONT_TOKEN=xxx
SHOPIFY_WEBHOOK_SECRET=xxx
```

### Validation & Sécurité

- ✅ Variables env validées au démarrage
- ✅ Tokens Shopify vérifiés contre patterns suspects
- ✅ Webhooks HMAC SHA256 obligatoire
- ✅ Sessions NextAuth sécurisées
- ✅ Headers sécurité automatiques
- ✅ Base de données SQLite locale sécurisée

## 🚀 Utilisation

### APIs Produits

```typescript
// Frontend React
const products = await fetch("/api/products?first=20").then((r) => r.json());
```

### APIs Panier

```typescript
// Hook personnalisé utilisable partout
const { cart, addToCart, updateCart } = useCart();
```

### Webhooks Shopify

Configurez dans Admin Shopify → Webhooks:

- `https://votre-domaine.com/api/webhooks/orders/create`
- `https://votre-domaine.com/api/webhooks/products/update`
- `https://votre-domaine.com/api/webhooks/inventory-levels/update/route.ts`

---

**Architecture simplifiée, performante et production-ready !** ✨
