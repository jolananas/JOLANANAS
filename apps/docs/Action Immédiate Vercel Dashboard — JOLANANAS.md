# 🚨 ACTION IMMÉDIATE REQUISE - Configuration Vercel Dashboard

## ⚠️ CRITIQUE

**Le déploiement échoue car Vercel utilise Node.js 24.x et pnpm 6.35.1 par défaut, alors que le projet nécessite Node.js 20.x et pnpm 10.x.**

**Cette configuration DOIT être effectuée dans le Dashboard Vercel. Elle ne peut pas être corrigée uniquement via le code.**

---

## ✅ Étapes Obligatoires dans Vercel Dashboard

### 1. Accéder au Dashboard Vercel

- URL : https://vercel.com/dashboard
- Se connecter avec le compte : `aissablk1`
- Sélectionner le projet : **JOLANANAS**

### 2. Configurer les Paramètres Généraux

**Chemin** : **Settings** → **General**

#### 2.1 Root Directory

1. Chercher la section **"Root Directory"**
2. Cliquer sur **"Edit"**
3. Entrer : `apps/frontend`
4. Cliquer sur **"Save"**

#### 2.2 Node.js Version ⚠️ CRITIQUE

1. Chercher la section **"Node.js Version"** (ou **"Node Version"**)
2. Cliquer sur **"Edit"**
3. Sélectionner : **`20.x`** (pas 24.x ou Latest)
4. Cliquer sur **"Save"**

**Pourquoi c'est critique** :

- Sans cette configuration, Vercel utilisera Node.js 24.x par défaut
- Le projet nécessite Node.js 20.x (défini dans `package.json` engines et `.nvmrc`)
- Node.js 24.x cause des erreurs de compatibilité avec pnpm 10

### 3. Vérifier les Variables d'Environnement

**Chemin** : **Settings** → **Environment Variables**

Vérifier que toutes ces variables sont configurées pour **Production**, **Preview**, et **Development** :

- `SHOPIFY_STORE_DOMAIN`
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
- `SHOPIFY_ADMIN_API_TOKEN` (si nécessaire)
- `SHOPIFY_WEBHOOK_SECRET`
- `SHOPIFY_REVALIDATION_SECRET`
- `NEXTAUTH_SECRET` ou `AUTH_SECRET`
- `DOMAIN_URL`
- `NODE_ENV` (généralement `production`)

### 4. Redéployer

1. Aller dans **Deployments**
2. Cliquer sur le dernier déploiement (celui qui a échoué)
3. Cliquer sur **"Redeploy"**
4. **IMPORTANT** : Désactiver **"Use existing Build Cache"**
5. Cliquer sur **"Redeploy"**

### 5. Vérifier les Logs

Après le redéploiement, vérifier dans les logs que vous voyez :

```
✅ Node.js version: 20.x (pas 24.x)
✅ Using pnpm@10.24.0 (pas 6.35.1)
✅ Detected Next.js version: 16.1.0
✅ Build completed successfully
```

---

## 📋 Checklist de Validation

Avant de considérer le problème résolu, vérifier :

- [ ] **Root Directory** configuré à `apps/frontend` dans Vercel Dashboard
- [ ] **Node.js Version** configurée à `20.x` dans Vercel Dashboard ⚠️ CRITIQUE
- [ ] **Variables d'environnement** toutes configurées
- [ ] **Redéploiement** effectué sans cache
- [ ] **Logs de build** affichent Node.js 20.x et pnpm 10.x
- [ ] **Build réussi** sans erreurs
- [ ] **Site déployé** accessible et fonctionnel

---

## 🔍 Pourquoi cette Configuration est Nécessaire

### Problème Actuel

1. **Vercel utilise Node.js 24.x par défaut**
   - Le projet nécessite Node.js 20.x
   - Défini dans `package.json` : `"engines": { "node": "20.x" }`
   - Défini dans `.nvmrc` : `20`
   - Défini dans `.node-version` : `20`

2. **Vercel utilise pnpm 6.35.1 par défaut**
   - Le projet nécessite pnpm 10.x
   - Défini dans `package.json` : `"packageManager": "pnpm@10.24.0"`
   - Défini dans `package.json` : `"engines": { "pnpm": ">=10.0.0" }`

3. **Incompatibilité**
   - Node.js 24.x + pnpm 6.35.1 ne respectent pas les contraintes du projet
   - Les erreurs `ERR_PNPM_UNSUPPORTED_ENGINE` apparaissent
   - Le build échoue avant même d'installer les dépendances

### Solution

**Configuration dans Vercel Dashboard** :

- **Root Directory** : `apps/frontend` → Vercel sait où trouver le projet
- **Node.js Version** : `20.x` → Vercel utilise la bonne version de Node.js
- **pnpm** : Détecté automatiquement depuis `packageManager` dans `package.json` une fois Node.js 20 configuré

---

## 📝 Fichiers de Configuration Créés

Les fichiers suivants ont été créés/modifiés pour supporter cette configuration :

1. **`.node-version`** (racine) : Force Node.js 20
2. **`apps/frontend/.nvmrc`** : Force Node.js 20
3. **`apps/frontend/package.json`** :
   - `"packageManager": "pnpm@10.24.0"`
   - `"engines": { "node": "20.x", "pnpm": ">=10.0.0" }`
4. **`vercel.json`** (racine) : Commandes de build avec installation pnpm 10

**Mais** : Ces fichiers ne suffisent pas si le Root Directory et Node.js Version ne sont pas configurés dans le Dashboard Vercel.

---

## 🚨 Si le Problème Persiste

Si après avoir configuré le Dashboard Vercel, le problème persiste :

1. **Vérifier les logs de build** pour voir quelle version de Node.js est utilisée
2. **Vérifier que le Root Directory** est bien `apps/frontend` (pas `app` ou racine)
3. **Vérifier que Node.js Version** est bien `20.x` (pas `Latest` ou `24.x`)
4. **Forcer un redéploiement sans cache**
5. **Contacter le support Vercel** si nécessaire avec les logs d'erreur

---

**Version** : 1.0.0  
**Date** : Janvier 2025  
**Projet** : JOLANANAS  
**Statut** : ⚠️ Action Requise dans Dashboard Vercel
