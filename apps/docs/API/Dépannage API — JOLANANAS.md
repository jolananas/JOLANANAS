# 🍍 JOLANANAS - Guide Débogage APIs

## 🔧 Problèmes Courants

### ❌ Erreur 500 - Variables d'Environnement

**Symptômes:**

```bash
❌ Variable d'environnement manquante: SHOPIFY_STOREFRONT_TOKEN
❌ Variable d'environnement manquante: DATABASE_URL
```

**Solution:**

```bash
# Créer variables/.env.local dans frontend/
cd apps/frontend
cp variables/.env.example variables/.env.local

# Éditer avec vos vraies valeurs
SHOPIFY_STORE_DOMAIN=votre-boutique.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=votre_vrai_token_ici
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET=votre_secret_32_chars_min
NEXTAUTH_URL=http://localhost:3000
```

### ❌ Erreur 401 - Token Shopify Invalide

**Symptômes:**

```javascript
{
  "error": "401 Unauthorized",
  "details": "Invalid Shopify token"
}
```

**Solution:**

1. Vérifiez dans Shopify Admin → Apps → Develop apps
2. Régénérez le token Storefront Access Token
3. Mettez à jour `variables/.env.local`
4. Redémarrez le serveur

### ❌ Erreur 500 - Base de Données

**Symptômes:**

```bash
❌ Connection database failed
❌ Prisma schema not found
```

**Solution:**

```bash
cd apps/frontend
npm run db:push
npm run db:generate
```

### ❌ Webhooks Non Reçus

**Symptômes:**

- Aucune logique dans les webhooks
- Erreurs dans les logs Shopify Admin

**Solution:**

1. Vérifier `SHOPIFY_WEBHOOK_SECRET` dans `variables/.env.local`
2. URLs webhooks dans Shopify Admin:

   ```bash
   https://votre-domaine.com/api/webhooks/orders/create
   https://votre-domaine.com/api/webhooks/products/update
   ```

3. Tester avec ngrok en développement:

   ```bash
   ngrok http 3000
   # Utiliser l'URL HTTPS dans Shopify Admin
   ```

## 🔍 Debug Mode

### Activation Debug

```bash
# Dans variables/.env.local
DEBUG_MODE=true
```

### Logs Utiles

```bash
# Produits API
curl "http://localhost:3000/api/products?first=5"

# Base de données
cd apps/frontend
npm run db:studio

# Logs temps réel
npm run dev | grep "🍍\|❌\|✅"
```

### Tests Individuels

#### Test Produits

```bash
curl "http://localhost:3000/api/products" \
     -H "Accept: application/json"
```

#### Test Cart Persisté

```bash
# GET cart
curl "http://localhost:3000/api/cart" \
     -H "Content-Type: application/json"

# POST cart
curl "http://localhost:3000/api/cart" \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"productId":"gid://shopify/Product/123","variantId":"gid://shopify/ProductVariant/456","quantity":2}'
```

#### Test NextAuth

```bash
# Signup
curl "http://localhost:3000/api/auth/signup" \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"email":"test@jolananas.fr","password":"test123","name":"Test User"}'
```

## 📊 Monitoring APIs

### Health Check Endpoints

#### Produits Status

```javascript
GET /api/products?first=1
// Réponse: produits Shopify + Cache-Control headers
```

#### Database Status

```javascript
// Vérifier via Prisma Studio
npm run db:studio
// Ouvrir http://localhost:5555
```

#### Shopify Connection

```javascript
// Logs au démarrage:
✅ Connexion Shopify validée
✅ Variables d'environnement validées
```

### Métriques Performance

#### Cache Hit Rate

```javascript
// Logs APIs:
✅ Produits récupérés: 247 (cache hit)
➖ Cache miss Shopify (nouvelle data)
```

#### Response Times

```javascript
// Headers automatiques:
Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400
tracerId: products-1704123456789
```

## 🚨 Erreurs Critiques

### 1. Base de Données Corrompue

```bash
# Reset complet
rm -rf apps/frontend/dev.db
cd apps/frontend
npm run db:push
npm run db:generate
```

### 2. Shopify Rate Limits

```bash
# Attendre et réessayer
# Logs indiquent: "429 Too Many Requests"
```

### 3. Sessions Perdus (NextAuth)

```bash
# Nettoyer cookies navigateur
# Redémarrer serveur NextAuth
```

### 4. Webhooks HMAC Failures

```bash
# Vérifier secret dans Shopify Admin
# Comparer avec SHOPIFY_WEBHOOK_SECRET
```

## ✅ Checklist Démarrage

### Avant Premier Lancement

- [ ] `variables/.env.local` créé avec vraies valeurs
- [ ] Tokens Shopify valides testés
- [ ] Base de données initialisée (`db:push`)
- [ ] Dépendances installées (`npm install`)

### Après Démarrage

- [ ] Logs: "✅ Connexion Shopify validée"
- [ ] Logs: "✅ Variables d'environnement validées"
- [ ] API test: `curl http://localhost:3000/api/products`
- [ ] DB test: `npm run db:studio` accessible

### Production Checklist

- [ ] Variables env production configurées
- [ ] Domaine HTTPS configuré
- [ ] Webhooks URLs Shopify à jour
- [ ] Base de données production (PostgreSQL)
- [ ] Monitoring logs activation

---

> **Debugging méthodique = Debugging efficace ! 🔧**
