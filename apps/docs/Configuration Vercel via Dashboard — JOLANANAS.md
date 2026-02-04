# 🍍 JOLANANAS - Configuration Vercel via Dashboard (OBLIGATOIRE)

## ⚠️ IMPORTANT

**Les paramètres Node.js Version et Root Directory NE PEUVENT PAS être configurés via Vercel CLI ou l'API.**  
**Ils DOIVENT être configurés dans le Dashboard Vercel.**

---

## 🎯 Configuration Actuelle (Problématique)

### État Actuel du Projet "jolananas"

```
Project ID: prj_o1NyObC275pgb1YhnKfivNAKjMAz
Root Directory: .                    ❌ (devrait être apps/frontend)
Node.js Version: 24.x                ❌ (devrait être 20.x)
Framework: Next.js                   ✅
```

### Impact

- ❌ Vercel cherche le projet à la racine au lieu de `apps/frontend`
- ❌ Node.js 24.x cause des erreurs de compatibilité avec pnpm 10
- ❌ Erreurs `ERR_PNPM_UNSUPPORTED_ENGINE`
- ❌ Build échoue avant l'installation des dépendances

---

## ✅ Configuration via Dashboard Vercel (ÉTAPES DÉTAILLÉES)

### Étape 1 : Accéder au Dashboard

1. Aller sur **https://vercel.com/dashboard**
2. Se connecter avec le compte : `aissablk1`
3. Sélectionner le projet : **jolananas**

### Étape 2 : Configurer Root Directory

1. Cliquer sur **Settings** (en haut)
2. Section **General**
3. Chercher **"Root Directory"**
4. Cliquer sur **"Edit"** (icône crayon)
5. **Effacer** le contenu actuel (`.`)
6. Entrer : `apps/frontend`
7. Cliquer sur **"Save"**

**⚠️ Si vous voyez "Framework Settings" avec un avertissement** :

- L'avertissement "Configuration Settings in the current Production deployment differ from your current Project Settings" est normal
- Cela signifie que le déploiement actuel utilise des settings différents des Project Settings
- Vous devez mettre à jour les **Project Settings** pour que les futurs déploiements utilisent la bonne configuration

**Vérification** : Le champ doit afficher `apps/frontend` après sauvegarde.

### Étape 3 : Configurer Node.js Version ⚠️ CRITIQUE

1. Dans la même section **General**
2. Chercher **"Node.js Version"** (ou **"Node Version"**)
3. Cliquer sur **"Edit"** (icône crayon)
4. **Section "Project Settings"** (pas Production Overrides) :
   - **Sélectionner** : `20.x` (pas `Latest`, pas `24.x`)
   - ⚠️ **IMPORTANT** : Mettre à jour les **Project Settings**, pas seulement les Production Overrides
5. Cliquer sur **"Save"**

**⚠️ ATTENTION** :

- Si vous voyez un avertissement "Configuration Settings in the current Production deployment differ from your current Project Settings"
- Cela signifie que le déploiement actuel utilise Node.js 20.x (Production Overrides)
- Mais les **Project Settings** sont encore à 24.x
- **Vous DEVEZ mettre à jour les Project Settings à 20.x** pour que les futurs déploiements utilisent Node.js 20.x

**Vérification** :

- **Project Settings** doit afficher `20.x` après sauvegarde
- **Production Overrides** peut afficher `20.x` (c'est normal si vous avez déjà un déploiement avec 20.x)

### Étape 4 : Vérifier l'Intégration GitHub

1. Toujours dans **Settings** → **General**
2. Vérifier **"Git Repository"** :
   - Doit afficher : `jolananas/JOLANANAS` ✅
   - Si vide ou incorrect, cliquer sur **"Connect Git Repository"**
3. Vérifier **"Production Branch"** :
   - Doit afficher : `main` ✅
4. Vérifier **"Automatic Deployments"** :
   - Doit être **activé** ✅

### Étape 5 : Redéployer

1. Aller dans **Deployments** (en haut)
2. Cliquer sur le dernier déploiement (celui qui a échoué)
3. Cliquer sur **"Redeploy"** (icône refresh)
4. **IMPORTANT** : Désactiver **"Use existing Build Cache"**
5. Cliquer sur **"Redeploy"**

---

## 🔍 Vérification Post-Configuration

### Via Vercel CLI

```bash
cd apps/frontend
vercel project inspect jolananas
```

**Résultats attendus** :

```
Root Directory: apps/frontend        ✅
Node.js Version: 20.x              ✅
```

### Via Vercel Dashboard

1. **Settings** → **General**
2. Vérifier :
   - Root Directory : `apps/frontend` ✅
   - Node.js Version : `20.x` ✅
   - Git Repository : `jolananas/JOLANANAS` ✅
   - Production Branch : `main` ✅

### Via Logs de Build

Après redéploiement, vérifier dans les logs :

```
✅ Node.js version: 20.x (pas 24.x)
✅ Using pnpm@10.24.0 (pas 6.35.1)
✅ Detected Next.js version: 16.1.0
✅ Build completed successfully
```

---

## 📋 Checklist Complète

Avant de considérer le problème résolu :

- [ ] **Root Directory** configuré à `apps/frontend` dans Dashboard
- [ ] **Node.js Version** configurée à `20.x` dans Dashboard ⚠️ CRITIQUE
- [ ] **Git Repository** connecté : `jolananas/JOLANANAS`
- [ ] **Production Branch** : `main`
- [ ] **Automatic Deployments** activé
- [ ] **Redéploiement** effectué sans cache
- [ ] **Vérification CLI** : `vercel project inspect` confirme les changements
- [ ] **Logs de build** affichent Node.js 20.x et pnpm 10.x
- [ ] **Build réussi** sans erreurs
- [ ] **Site déployé** accessible et fonctionnel

---

## 🚨 Si la Configuration n'Est Pas Disponible

Si vous ne voyez pas les options "Root Directory" ou "Node.js Version" dans le Dashboard :

1. **Vérifier les permissions** : Assurez-vous d'être propriétaire/admin du projet
2. **Vérifier le plan Vercel** : Certaines options peuvent nécessiter un plan payant
3. **Contacter le support Vercel** : https://vercel.com/support

---

## 📝 Alternative : Utiliser `vercel.json` (Limité)

Si vous ne pouvez pas accéder au Dashboard, vous pouvez utiliser `vercel.json` à la racine :

```json
{
  "version": 2,
  "buildCommand": "cd apps/frontend && npm install -g pnpm@10.24.0 && pnpm install && pnpm build",
  "outputDirectory": "apps/frontend/.next",
  "installCommand": "cd apps/frontend && npm install -g pnpm@10.24.0 && pnpm install",
  "framework": "nextjs"
}
```

**⚠️ Limitations** :

- Node.js version ne peut pas être forcée via `vercel.json`
- Les commandes avec `cd` peuvent ne pas fonctionner
- Moins stable que la configuration Dashboard

**Recommandation** : Utilisez le Dashboard Vercel pour une configuration stable.

---

## 🔄 Workflow Recommandé Après Configuration

### Pour Déployer

1. **Faire des modifications** dans le code
2. **Commit et push** vers GitHub :
   ```bash
   git add .
   git commit -m "feat: Description"
   git push origin main
   ```
3. **Vercel déploie automatiquement** depuis GitHub ✅
4. **Vérifier** dans Vercel Dashboard → Deployments

### Ne Plus Utiliser `vercel --prod`

- ❌ Ne pas utiliser `vercel --prod` pour les déploiements de production
- ✅ Utiliser uniquement les push GitHub
- ✅ Vercel CLI uniquement pour : `vercel dev`, `vercel inspect`, `vercel project ls`

---

**Version** : 1.0.0  
**Date** : Janvier 2025  
**Projet** : JOLANANAS  
**Statut** : ⚠️ Configuration Dashboard Requise
