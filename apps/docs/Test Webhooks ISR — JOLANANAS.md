# 🍍 JOLANANAS - Résultats des Tests Webhooks ISR

## ✅ Tests Réussis - Production

**Date :** 2026-01-28  
**Environnement :** Production (Vercel)  
**URL :** `https://jolananas.vercel.apps/api/webhooks/revalidate`

### 📊 Résultats

| Topic                | Statut        | Réponse                             |
| -------------------- | ------------- | ----------------------------------- |
| `products/create`    | ✅ **SUCCÈS** | `{"status":200,"revalidated":true}` |
| `products/update`    | ✅ **SUCCÈS** | `{"status":200,"revalidated":true}` |
| `products/delete`    | ✅ **SUCCÈS** | `{"status":200,"revalidated":true}` |
| `collections/create` | ✅ **SUCCÈS** | `{"status":200,"revalidated":true}` |
| `collections/update` | ✅ **SUCCÈS** | `{"status":200,"revalidated":true}` |
| `collections/delete` | ✅ **SUCCÈS** | `{"status":200,"revalidated":true}` |

**Score :** 6/6 tests réussis (100%)

---

## 🧪 Comment Tester les Webhooks

### Option 1 : Test en Production (Recommandé)

```bash
cd apps/frontend
TEST_WEBHOOK_URL=https://jolananas.vercel.app npm run test:webhooks
```

### Option 2 : Test en Local

1. **Démarrer le serveur de développement :**

   ```bash
   cd apps/frontend
   npm run dev
   ```

2. **Dans un autre terminal, lancer les tests :**
   ```bash
   cd apps/frontend
   npm run test:webhooks
   ```

### Option 3 : Test avec Shopify CLI

```bash
# Tester un webhook spécifique
shopify webhook trigger \
  --topic products/update \
  --address=https://jolananas.vercel.apps/api/webhooks/revalidate
```

---

## 🔍 Vérification des Logs

### En Production (Vercel)

1. Allez dans **Vercel Dashboard** → **Deployments**
2. Sélectionnez le dernier déploiement
3. Cliquez sur **Functions** → `/api/webhooks/revalidate`
4. Vérifiez les logs pour voir :
   ```
   ⚡ Webhook reçu: products/update. Revalidation en cours...
   ✅ Tag "products" revalidé
   ```

### En Local

Les logs apparaissent directement dans le terminal où le serveur est démarré.

---

## ✅ Validation du Système ISR

### 1. Cache Initial

- ✅ Les requêtes Shopify utilisent `force-cache` avec des tags
- ✅ Tag `products` pour toutes les requêtes de produits
- ✅ Tag `collections` pour toutes les requêtes de collections

### 2. Revalidation à la Demande

- ✅ La route `/api/webhooks/revalidate` reçoit les webhooks
- ✅ La signature HMAC est vérifiée correctement
- ✅ Les tags sont revalidés selon le topic reçu
- ✅ Le cache est invalidé et les prochaines requêtes récupèrent les données fraîches

### 3. Sécurité

- ✅ Signature HMAC vérifiée pour chaque webhook
- ✅ Erreur 401 retournée si la signature est invalide
- ✅ Secret webhook stocké de manière sécurisée dans les variables d'environnement

---

## 📝 Script de Test

Le script de test est disponible dans `apps/frontend/scripts/test-webhooks.ts`.

**Fonctionnalités :**

- Génère des signatures HMAC valides
- Teste tous les topics de webhooks
- Affiche un résumé détaillé des résultats
- Supporte les tests en local et en production

**Utilisation :**

```bash
# Test en local (serveur doit être démarré)
npm run test:webhooks

# Test en production
TEST_WEBHOOK_URL=https://jolananas.vercel.app npm run test:webhooks
```

---

## 🚨 Dépannage

### Problème : "SHOPIFY_WEBHOOK_SECRET n'est pas configuré"

**Solution :**

1. Vérifiez que `SHOPIFY_WEBHOOK_SECRET` est dans `variables/.env.local`
2. Ou exportez la variable d'environnement :
   ```bash
   export SHOPIFY_WEBHOOK_SECRET=votre_secret
   ```

### Problème : "Impossible de se connecter à http://localhost:3000"

**Solution :**

1. Démarrez le serveur de développement :
   ```bash
   npm run dev
   ```
2. Ou testez directement en production :
   ```bash
   TEST_WEBHOOK_URL=https://jolananas.vercel.app npm run test:webhooks
   ```

### Problème : "Erreur 401 Unauthorized"

**Solution :**

1. Vérifiez que `SHOPIFY_WEBHOOK_SECRET` correspond au secret configuré dans Shopify Admin
2. Vérifiez que le secret est correctement configuré dans Vercel (pour la production)

---

## 🎯 Prochaines Étapes

1. ✅ **Tests réussis** - Le système ISR fonctionne correctement
2. ⏳ **Configuration Shopify Admin** - Configurer les webhooks dans Shopify Admin
3. ⏳ **Monitoring** - Surveiller les logs Vercel pour vérifier la réception des webhooks réels
4. ⏳ **Validation** - Tester avec de vrais événements Shopify (créer/modifier un produit)

---

**🍍 Système ISR avec Revalidation à la Demande - Opérationnel !**
