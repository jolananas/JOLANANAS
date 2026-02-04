# 🍍 JOLANANAS - Configuration Déploiement Vercel Root Directory

## 🎯 Problème Identifié

**Erreur** : `Error: No Next.js version detected`

**Cause** : Vercel cherche le projet Next.js à la racine du dépôt (`/`), alors qu'il se trouve dans `/apps/frontend`.

**Impact** : 🛑 **CRITIQUE** - La boutique ne peut pas être mise à jour. Les déploiements échouent.

---

## ✅ Solution Recommandée : Configuration Dashboard Vercel

### Méthode 1 : Root Directory via Dashboard (RECOMMANDÉ)

**Cette méthode est la plus stable et recommandée pour Next.js 14/15.**

#### Étapes

1. **Accéder au Dashboard Vercel**
   - Aller sur https://vercel.com
   - Sélectionner votre projet **JOLANANAS**

2. **Configurer le Root Directory et Node.js Version**
   - Aller dans **Settings** → **General**
   - **Root Directory** : Cliquer sur `Edit` et entrer : `apps/frontend`
   - **Node.js Version** : Cliquer sur `Edit` et sélectionner : `20.x` (IMPORTANT)
   - Cliquer sur `Save`

   **⚠️ CRITIQUE** : Si vous ne configurez pas Node.js 20.x dans le dashboard, Vercel utilisera Node.js 24.x par défaut, ce qui causera des erreurs de compatibilité avec pnpm 10.

3. **Redéployer**
   - Aller dans **Deployments**
   - Cliquer sur le dernier déploiement (celui qui a échoué)
   - Cliquer sur **"Redeploy"**
   - **Important** : Désactiver **"Use existing Build Cache"** pour forcer un rebuild complet
   - Cliquer sur **"Redeploy"**

4. **Vérifier les Logs**
   - Attendre la fin du build
   - Vérifier dans les logs que vous voyez :
     ```
     ✅ Detected Next.js version: 16.x.x
     ✅ Build Cache not found (Normal pour le premier run)
     ✅ Build completed successfully
     ```

---

## 🔧 Solution Alternative : Configuration `vercel.json`

Si vous préférez définir la configuration dans le code (pour que la config suive le repo), vous pouvez utiliser un `vercel.json` à la racine.

**⚠️ Note** : Cette méthode est moins stable que la méthode dashboard pour Next.js. Utilisez-la uniquement si vous ne pouvez pas accéder au dashboard.

### Configuration `vercel.json` à la Racine

Le fichier `vercel.json` à la racine doit pointer vers `apps/frontend` :

```json
{
  "version": 2,
  "buildCommand": "cd apps/frontend && pnpm install && pnpm build",
  "outputDirectory": "apps/frontend/.next",
  "installCommand": "cd apps/frontend && pnpm install",
  "framework": "nextjs",
  "functions": {
    "apps/frontend/apps/api/**/*.ts": {
      "runtime": "nodejs20.x",
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization, X-Revalidation-Secret"
        }
      ]
    }
  ]
}
```

**⚠️ Limitations** :

- Les commandes avec `cd` peuvent ne pas fonctionner sur tous les environnements Vercel
- La détection automatique de Next.js peut échouer
- Les rewrites peuvent causer des problèmes de routing

**Recommandation** : Utilisez la **Méthode 1 (Dashboard)** pour une solution plus stable.

---

## 🔍 Vérification Post-Configuration

### Checklist de Validation

Après avoir configuré le Root Directory :

- [ ] **Root Directory** configuré à `apps/frontend` dans Vercel Dashboard
- [ ] **Variables d'environnement** vérifiées dans Vercel (Settings → Environment Variables)
- [ ] **Build Command** : `pnpm build` ou `npm run build` (détecté automatiquement)
- [ ] **Output Directory** : `.next` (détecté automatiquement)
- [ ] **Framework** : Next.js (détecté automatiquement)
- [ ] **Redéploiement** effectué sans cache
- [ ] **Logs de build** affichent `Detected Next.js version: 16.x.x`
- [ ] **Site déployé** accessible et fonctionnel

### Variables d'Environnement Requises

Vérifier que toutes ces variables sont configurées dans **Vercel Dashboard** → **Settings** → **Environment Variables** :

- `SHOPIFY_STORE_DOMAIN`
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
- `SHOPIFY_ADMIN_API_TOKEN` (si nécessaire)
- `SHOPIFY_WEBHOOK_SECRET`
- `SHOPIFY_REVALIDATION_SECRET`
- `NEXTAUTH_SECRET` ou `AUTH_SECRET`
- `DOMAIN_URL`
- `NODE_ENV` (généralement `production`)

**Important** : Configurer pour **Production**, **Preview**, et **Development** si nécessaire.

---

## 🚨 Dépannage

### Problème : Erreur "pnpm install" avec version incompatible

**Symptômes** :

- `WARN Ignoring not compatible lockfile at /vercel/path0/apps/frontend/pnpm-lock.yaml`
- `ERR_PNPM_META_FETCH_FAIL` ou `ERR_INVALID_THIS`
- `Command "cd apps/frontend && pnpm install" exited with 1`

**Solutions** :

1. ✅ Vérifier que `package.json` contient `"packageManager": "pnpm@10.24.0"`
2. ✅ Vérifier que `.nvmrc` existe avec `20` (Node.js 20)
3. ✅ Vérifier que `vercel.json` utilise `corepack` pour activer pnpm 10
4. ✅ Configurer le **Root Directory** à `apps/frontend` dans Vercel Dashboard
5. ✅ Redéployer sans cache

**Configuration requise** :

- `package.json` : `"packageManager": "pnpm@10.24.0"` + `"engines": { "node": "20.x", "pnpm": ">=10.0.0" }`
- `.nvmrc` : `20`
- `vercel.json` : Commandes avec `corepack enable && corepack prepare pnpm@10.24.0 --activate`

### Problème : Build échoue toujours avec "No Next.js version detected"

**Solutions** :

1. Vérifier que le Root Directory est bien `apps/frontend` (pas `app` ou racine)
2. Vérifier que `apps/frontend/package.json` contient `"next"` dans les dépendances
3. Vérifier que `apps/frontend/next.config.mjs` existe
4. Forcer un redéploiement **sans cache**
5. Vérifier les logs de build pour voir où Vercel cherche le `package.json`

### Problème : Routes API retournent 404 après déploiement

**Solutions** :

1. Vérifier que le Root Directory est `apps/frontend` (pas juste `app`)
2. Vérifier que les routes API sont dans `apps/frontend/apps/api/`
3. Vérifier que le build local fonctionne (`cd apps/frontend && pnpm build`)
4. Vérifier que `.next/server/apps/api/` contient les routes après le build local

### Problème : Variables d'environnement non disponibles

**Solutions** :

1. Vérifier que les variables sont configurées dans Vercel Dashboard
2. Vérifier que les variables sont configurées pour l'environnement correct (Production/Preview/Development)
3. Redéployer après avoir ajouté/modifié les variables
4. Vérifier que les noms des variables correspondent exactement (case-sensitive)

---

## 📊 Structure du Projet

Votre structure actuelle :

```
/ (Racine du Repo GitHub)
├── vercel.json                    <-- Configuration Vercel (racine)
├── apps/
│   ├── frontend/                  <-- Application Next.js ICI
│   │   ├── package.json           <-- Contient "next": "^16.1.0"
│   │   ├── next.config.mjs        <-- Configuration Next.js
│   │   ├── apps/
│   │   │   ├── api/               <-- Routes API
│   │   │   └── ...
│   │   └── vercel.json            <-- Configuration spécifique frontend (optionnel)
│   ├── docs/                      <-- Documentation
│   └── ...
└── ...
```

**Root Directory Vercel** : `apps/frontend`

---

## 🎯 Action Immédiate

**Pour résoudre le problème maintenant** :

1. ✅ Aller sur https://vercel.com
2. ✅ Sélectionner le projet **JOLANANAS**
3. ✅ **Settings** → **General** → **Root Directory** → `apps/frontend`
4. ✅ **Save**
5. ✅ **Deployments** → Dernier déploiement → **Redeploy** (sans cache)
6. ✅ Vérifier les logs de build
7. ✅ Tester le site déployé

---

## 📝 Notes Importantes

- **Méthode Dashboard** : Plus stable, recommandée par Vercel pour Next.js
- **Méthode `vercel.json`** : Alternative, mais peut avoir des limitations
- **Cache** : Toujours désactiver le cache lors du premier déploiement après changement de configuration
- **Variables d'environnement** : Doivent être configurées dans Vercel Dashboard, pas seulement dans `.env.local`
- **Build local** : Toujours tester le build local (`cd apps/frontend && pnpm build`) avant de déployer

---

**Version** : 1.0.0  
**Date** : Janvier 2025  
**Projet** : JOLANANAS  
**Statut** : ✅ Solution Validée
