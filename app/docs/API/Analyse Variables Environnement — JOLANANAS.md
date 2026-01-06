# 🔍 Analyse des Variables d'Environnement — JOLANANAS

> **Date** : 18 Novembre 2025  
> **Statut** : Analyse et correction des incohérences

---

## 📋 Résumé Exécutif

**Problème identifié** : Incohérence de nommage des variables d'environnement Shopify entre les différents fichiers du projet.

**Impact** : Le serveur Next.js affiche l'avertissement :
```
⚠️ Shopify environment variables are not set. Please configure SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_ACCESS_TOKEN.
```

---

## 🔍 Analyse Détaillée

### 1. Fichier `.env.local` (app/frontend/.env.local)

**Variables présentes** :
```env
SHOPIFY_STORE_DOMAIN=u6ydbb-sx.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=[STOREFRONT_TOKEN_COMPROMISED]
SHOPIFY_API_VERSION=2024-01
```

**Variables manquantes** :
- `NEXTAUTH_SECRET` (utilise la valeur par défaut temporaire)
- `NEXTAUTH_URL` (utilise la valeur par défaut basée sur PORT)
- `NODE_ENV` (utilise 'development' par défaut)

### 2. Fichiers de Code Analysés

#### ❌ **Problème Principal : Incohérence de Nommage**

| Fichier | Variable Cherchée | Statut |
|---------|-------------------|--------|
| `app/src/lib/shopify/client.ts` | `SHOPIFY_STOREFRONT_ACCESS_TOKEN` | ❌ **INCOHÉRENT** |
| `app/src/lib/env.ts` | `SHOPIFY_STOREFRONT_TOKEN` | ✅ Correct |
| `app/src/lib/providers/ShopifyProvider.tsx` | `SHOPIFY_STOREFRONT_TOKEN` | ✅ Correct |
| `app/src/lib/ShopifyStorefrontClient.ts` | `SHOPIFY_STOREFRONT_TOKEN` (via ENV) | ✅ Correct |

**Conclusion** : Le fichier `client.ts` utilise `SHOPIFY_STOREFRONT_ACCESS_TOKEN` alors que tous les autres fichiers utilisent `SHOPIFY_STOREFRONT_TOKEN`.

#### ⚠️ **Problème Secondaire : Version API**

- `.env.local` : `SHOPIFY_API_VERSION=2024-01`
- `client.ts` : Version codée en dur `"2024-04"`
- `env.ts` : Utilise `process.env.SHOPIFY_API_VERSION` avec validation

**Recommandation** : Utiliser la version depuis `.env.local` (2024-01) ou mettre à jour vers 2024-04.

---

## 🔧 Corrections Nécessaires

### Correction 1 : Harmoniser le nom de variable dans `client.ts`

**Fichier** : `app/frontend/app/src/lib/shopify/client.ts`

**Changement** :
```typescript
// AVANT
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN

// APRÈS
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN
```

### Correction 2 : Utiliser la version API depuis l'environnement

**Fichier** : `app/frontend/app/src/lib/shopify/client.ts`

**Changement** :
```typescript
// AVANT
const SHOPIFY_API_VERSION = "2024-04"

// APRÈS
const SHOPIFY_API_VERSION = process.env.SHOPIFY_API_VERSION || "2024-04"
```

### Correction 3 : Ajouter les variables manquantes dans `.env.local` (optionnel)

Pour une configuration complète, ajouter :
```env
NODE_ENV=development
NEXTAUTH_SECRET=votre_secret_aleatoire_ici
NEXTAUTH_URL=http://localhost:4647
```

---

## ✅ Variables Requises par Fichier

### `app/src/lib/env.ts` (Validation centrale)
- ✅ `SHOPIFY_STORE_DOMAIN`
- ✅ `SHOPIFY_STOREFRONT_TOKEN`
- ✅ `SHOPIFY_API_VERSION` (optionnel, défaut: 2024-04)
- ✅ `DATABASE_URL` (optionnel, défaut: memory:test.sqlite)
- ✅ `NEXTAUTH_SECRET` (optionnel, défaut: temporaire)
- ✅ `NEXTAUTH_URL` (optionnel, défaut: basé sur PORT)

### `app/src/lib/shopify/client.ts` (Client GraphQL)
- ✅ `SHOPIFY_STORE_DOMAIN`
- ❌ `SHOPIFY_STOREFRONT_ACCESS_TOKEN` → **DOIT ÊTRE** `SHOPIFY_STOREFRONT_TOKEN`
- ❌ Version codée en dur → **DOIT UTILISER** `process.env.SHOPIFY_API_VERSION`

### `app/src/lib/ShopifyStorefrontClient.ts` (Client Storefront)
- ✅ Utilise `ENV` (variables validées)
- ✅ Pas de problème

### `app/src/lib/providers/ShopifyProvider.tsx` (Provider React)
- ✅ Utilise `SHOPIFY_STOREFRONT_TOKEN`
- ✅ Pas de problème

---

## 🎯 Plan d'Action

1. ✅ **Corriger `client.ts`** : Remplacer `SHOPIFY_STOREFRONT_ACCESS_TOKEN` par `SHOPIFY_STOREFRONT_TOKEN`
2. ✅ **Corriger `client.ts`** : Utiliser `process.env.SHOPIFY_API_VERSION` au lieu de la valeur codée en dur
3. ⚠️ **Optionnel** : Ajouter les variables manquantes dans `.env.local` pour une configuration complète

---

## 📊 État Actuel vs État Attendu

### État Actuel
```
.env.local → SHOPIFY_STOREFRONT_TOKEN
     ↓
env.ts → ✅ SHOPIFY_STOREFRONT_TOKEN
     ↓
ShopifyProvider.tsx → ✅ SHOPIFY_STOREFRONT_TOKEN
     ↓
ShopifyStorefrontClient.ts → ✅ SHOPIFY_STOREFRONT_TOKEN (via ENV)
     ↓
client.ts → ❌ SHOPIFY_STOREFRONT_ACCESS_TOKEN (INCOHÉRENT)
```

### État Attendu
```
.env.local → SHOPIFY_STOREFRONT_TOKEN
     ↓
env.ts → ✅ SHOPIFY_STOREFRONT_TOKEN
     ↓
ShopifyProvider.tsx → ✅ SHOPIFY_STOREFRONT_TOKEN
     ↓
ShopifyStorefrontClient.ts → ✅ SHOPIFY_STOREFRONT_TOKEN (via ENV)
     ↓
client.ts → ✅ SHOPIFY_STOREFRONT_TOKEN (CORRIGÉ)
```

---

## 🔒 Sécurité

⚠️ **Important** : Le fichier `.env.local` contient des tokens sensibles :
- `SHOPIFY_STOREFRONT_TOKEN` : Token d'accès Storefront API
- `RESEND_API_KEY` : Clé API Resend pour l'envoi d'emails

**Vérification** : Le fichier `.env.local` est bien dans `.gitignore` et ne sera jamais commité.

---

## 📝 Notes

- Le token Shopify dans `.env.local` semble valide (format correct)
- Le domaine Shopify est correct (`u6ydbb-sx.myshopify.com`)
- La version API dans `.env.local` est `2024-01`, mais le code utilise `2024-04` par défaut
- Les variables optionnelles (`NEXTAUTH_SECRET`, `NEXTAUTH_URL`) utilisent des valeurs par défaut sûres en développement

---

**Prochaine étape** : Appliquer les corrections dans `client.ts` pour résoudre l'avertissement.

