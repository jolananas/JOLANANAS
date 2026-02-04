# 🍍 JOLANANAS - Configuration Webhooks ISR

## 📋 Informations de Déploiement

### 🌐 Domaine Vercel

D'après l'analyse du projet, le domaine de production principal est :

**URL de Production :** `https://jolananas.vercel.app`

> **Note :** Si vous avez configuré un domaine personnalisé (ex: `jolananas.com`), utilisez ce domaine à la place.

### 🔍 Vérification du Domaine

Pour vérifier votre domaine de production Vercel :

```bash
cd apps/frontend
vercel ls
# Cherchez l'URL sans hash (ex: jolananas.vercel.app)
```

---

## 🔗 Configuration des Webhooks Shopify

### URL de Base pour les Webhooks

**URL Unifiée de Revalidation :**

```
https://jolananas.vercel.apps/api/webhooks/revalidate
```

> ⚠️ **Important :** Cette URL unique gère TOUS les topics de webhooks (products et collections). Vous n'avez besoin de configurer qu'UNE SEULE URL dans Shopify Admin.

---

## 📝 Topics à Configurer dans Shopify Admin

### 1. Accéder à la Configuration des Webhooks

1. Connectez-vous à votre **Shopify Admin**
2. Allez dans **Settings** → **Notifications**
3. Cliquez sur **Webhooks** dans le menu de gauche
4. Cliquez sur **Create webhook**

### 2. Webhooks à Créer

Créez **UNE SEULE** webhook avec l'URL unifiée pour tous les topics suivants :

#### ✅ Webhook Unifié (Recommandé)

**URL :** `https://jolananas.vercel.apps/api/webhooks/revalidate`

**Topics à sélectionner :**

- ✅ `products/create`
- ✅ `products/update`
- ✅ `products/delete`
- ✅ `collections/create`
- ✅ `collections/update`
- ✅ `collections/delete`

**Format :** JSON  
**API version :** 2026-01

---

## 🔐 Configuration de la Sécurité

### Variable d'Environnement Requise

Assurez-vous que la variable `SHOPIFY_WEBHOOK_SECRET` est configurée dans Vercel :

```bash
# Dans Vercel Dashboard → Settings → Environment Variables
SHOPIFY_WEBHOOK_SECRET=votre_secret_webhook_shopify
```

### Génération du Secret

1. Dans Shopify Admin → **Settings** → **Notifications** → **Webhooks**
2. Lors de la création du webhook, Shopify génère automatiquement un secret
3. Copiez ce secret et ajoutez-le dans Vercel

---

## 🧪 Test des Webhooks

### 1. Test avec Shopify CLI (Développement Local)

Si vous testez en local avec un tunnel (ngrok, cloudflared) :

```bash
# Démarrer le serveur local
npm run dev

# Dans un autre terminal, créer un tunnel
ngrok http 3000
# ou
cloudflared tunnel --url http://localhost:3000

# Utiliser l'URL HTTPS du tunnel pour tester
shopify webhook trigger \
  --topic products/update \
  --address=https://votre-url-ngrok/api/webhooks/revalidate
```

### 2. Test en Production

```bash
# Tester depuis Shopify CLI
shopify webhook trigger \
  --topic products/update \
  --address=https://jolananas.vercel.apps/api/webhooks/revalidate
```

### 3. Vérification des Logs

Après avoir déclenché un webhook, vérifiez les logs Vercel :

1. Allez dans **Vercel Dashboard** → **Deployments** → Sélectionnez votre déploiement
2. Cliquez sur **Functions** → Trouvez `/api/webhooks/revalidate`
3. Vérifiez les logs pour voir :
   ```
   ⚡ Webhook reçu: products/update. Revalidation en cours...
   ✅ Tag "products" revalidé
   ```

---

## 📊 Fonctionnement du Système ISR

### 1. Cache Initial

- Les requêtes Shopify sont mises en cache **indéfiniment** avec des tags
- Tag `products` pour toutes les requêtes de produits
- Tag `collections` pour toutes les requêtes de collections

### 2. Revalidation à la Demande

Quand Shopify envoie un webhook :

1. ✅ La route `/api/webhooks/revalidate` reçoit le webhook
2. ✅ Vérifie la signature HMAC pour la sécurité
3. ✅ Identifie le topic (ex: `products/update`)
4. ✅ Appelle `revalidateTag('products')` ou `revalidateTag('collections')`
5. ✅ Le cache est invalidé et les prochaines requêtes récupèrent les données fraîches

### 3. Tags Utilisés

| Tag           | Utilisé pour                                     | Revalidé par                                                     |
| ------------- | ------------------------------------------------ | ---------------------------------------------------------------- |
| `products`    | `getAllProducts()`, `getProductByHandle()`       | `products/create`, `products/update`, `products/delete`          |
| `collections` | `getAllCollections()`, `getCollectionByHandle()` | `collections/create`, `collections/update`, `collections/delete` |
| `cart`        | `getCart()`                                      | (Pas de revalidation automatique)                                |

---

## 🔄 Configuration Alternative : Webhooks Individuels

## 🔄 Configuration Alternative : Webhooks Individuels

Si vous préférez créer des webhooks séparés (non recommandé, mais possible) :

### Webhook Produits

- **URL :** `https://jolananas.vercel.apps/api/webhooks/revalidate`
- **Topics :** `products/create`, `products/update`, `products/delete`

### Webhook Collections

- **URL :** `https://jolananas.vercel.apps/api/webhooks/revalidate`
- **Topics :** `collections/create`, `collections/update`, `collections/delete`

> 💡 **Recommandation :** Utilisez UNE SEULE webhook avec tous les topics pour simplifier la gestion.

---

## 🚨 Dépannage

## 🚨 Dépannage

### Problème : Webhooks non reçus

1. **Vérifier l'URL :** Assurez-vous que l'URL est correcte et accessible
2. **Vérifier le secret :** `SHOPIFY_WEBHOOK_SECRET` doit correspondre au secret dans Shopify
3. **Vérifier les logs Vercel :** Regardez les logs de la fonction pour voir les erreurs
4. **Tester manuellement :** Utilisez `shopify webhook trigger` pour tester

### Problème : Cache non revalidé

1. **Vérifier les logs :** Le webhook doit afficher `✅ Tag "products" revalidé`
2. **Vérifier les tags :** Assurez-vous que les requêtes utilisent les bons tags
3. **Vérifier le cache :** Les requêtes doivent utiliser `force-cache` avec des tags

### Problème : Erreur 401 Unauthorized

1. **Vérifier `SHOPIFY_WEBHOOK_SECRET`** dans Vercel
2. **Vérifier le secret dans Shopify** (il doit correspondre)
3. **Vérifier la signature HMAC** dans les logs

---

## 📚 Références

- [Documentation Shopify Webhooks](https://shopify.dev/docs/api/webhooks)
- [Next.js On-Demand Revalidation](https://nextjs.org/docs/apps/building-your-application/data-fetching/revalidating#on-demand-revalidation)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## ✅ Checklist de Configuration

- [ ] Domaine Vercel identifié : `https://jolananas.vercel.app`
- [ ] Variable `SHOPIFY_WEBHOOK_SECRET` configurée dans Vercel
- [ ] Webhook créé dans Shopify Admin avec l'URL : `https://jolananas.vercel.apps/api/webhooks/revalidate`
- [ ] Tous les topics sélectionnés (products/_ et collections/_)
- [ ] Webhook testé avec `shopify webhook trigger`
- [ ] Logs Vercel vérifiés pour confirmer la réception
- [ ] Cache revalidé après un test de mise à jour produit

---

**🍍 Créé pour JOLANANAS - Système ISR avec Revalidation à la Demande**
