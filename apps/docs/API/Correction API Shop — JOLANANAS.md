# 🔧 Correction API Shop — JOLANANAS

> **Date** : 18 Novembre 2025  
> **Statut** : Corrections appliquées

---

## 📋 Problème Identifié

La route `/api/shop` retournait une erreur GraphQL :

```
Field 'email' doesn't exist on type 'Shop'
```

**Cause** : Les champs `email` et `description` ne sont pas disponibles dans l'API Storefront, seulement dans l'API Admin.

---

## ✅ Corrections Appliquées

### 1. Requête GraphQL Mise à Jour

**Fichier** : `apps/frontend/app/src/lib/shopify/queries.ts`

**Avant** :

```graphql
query GetShopInfo {
  shop {
    name
    email # ❌ Non disponible dans Storefront API
    description # ❌ Non disponible dans Storefront API
    primaryDomain {
      url
    }
    paymentSettings {
      currencyCode
    }
  }
}
```

**Après** :

```graphql
query GetShopInfo {
  shop {
    name
    primaryDomain {
      url
    }
    paymentSettings {
      currencyCode
    }
    myshopifyDomain # ✅ Ajouté comme fallback pour l'URL
  }
}
```

### 2. Type TypeScript Mis à Jour

**Fichier** : `apps/frontend/app/src/lib/shopify/index.ts`

- Retrait de `email` et `description` du type de réponse GraphQL
- Ajout de `myshopifyDomain` dans le type
- Les valeurs `email` et `description` sont maintenant `null` dans le retour (commentées comme non disponibles via Storefront API)

### 3. Logging Amélioré

**Fichiers modifiés** :

- `apps/frontend/app/src/lib/shopify/client.ts`
- `apps/frontend/app/src/lib/shopify/index.ts`

**Améliorations** :

- Logs détaillés des requêtes Shopify
- Affichage des erreurs GraphQL en développement
- Logs des réponses complètes pour le débogage

### 4. Cache Next.js Supprimé

Le cache `.next` a été supprimé pour forcer la recompilation avec les nouvelles requêtes.

---

## 🔄 Prochaines Étapes

1. **Redémarrer le serveur Next.js** pour que les changements prennent effet
2. **Tester la route** `/api/shop` - elle devrait maintenant fonctionner correctement
3. **Vérifier les logs** - les nouveaux logs détaillés permettront de diagnostiquer tout problème restant

---

## 📝 Notes Importantes

### Champs Disponibles dans Storefront API

✅ **Disponibles** :

- `name` : Nom de la boutique
- `primaryDomain.url` : Domaine principal
- `myshopifyDomain` : Domaine myshopify.com
- `paymentSettings.currencyCode` : Code de devise

❌ **Non disponibles** (nécessitent Admin API) :

- `email` : Email de la boutique
- `description` : Description de la boutique
- `phone` : Numéro de téléphone

### Pour Obtenir Email et Description

Si vous avez besoin de `email` et `description`, vous devrez :

1. Créer une route API séparée utilisant l'API Admin
2. Utiliser `SHOPIFY_STOREFRONT_TOKEN` au lieu de `SHOPIFY_STOREFRONT_TOKEN`
3. Utiliser l'endpoint Admin : `https://{domain}/admin/api/{version}/graphql.json`

---

## ✅ Résultat Attendu

Après redémarrage, la route `/api/shop` devrait :

- ✅ Retourner les informations de la boutique (nom, URL, devise)
- ✅ Ne plus générer d'erreurs GraphQL
- ✅ Afficher des logs détaillés pour le débogage

---

**Status** : ✅ Corrections appliquées - Redémarrer le serveur pour appliquer les changements
