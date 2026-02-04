# 🍍 JOLANANAS - Configuration Vercel Root Directory

> **Rôle** : Architecte & Deployment  
> **Date** : Janvier 2025  
> **Statut** : Configuration Critique

---

## 🚨 Diagnostic

### Problème Identifié

**Erreur Vercel** : `Error: No Next.js version detected`

**Cause Racine** : Vercel cherche l'application Next.js à la **racine du dépôt** (`/`), mais le code se trouve dans un **sous-dossier** (`apps/frontend/`).

### Structure du Projet

```text
/ (Racine du repo GitHub)
├── apps/
│   ├── frontend/          <-- ✅ Application Next.js ICI
│   │   ├── package.json   <-- ✅ Contient "next": "^16.1.0"
│   │   ├── pnpm-lock.yaml
│   │   ├── vercel.json
│   │   └── apps/
│   ├── config/
│   └── docs/
├── vercel.json            <-- ⚠️ Configuration à la racine
└── .vercel/
    └── project.json
```

### Pourquoi l'Erreur ?

1. Vercel scanne la **racine** du dépôt lors du build
2. Il cherche un `package.json` avec la dépendance `"next"`
3. Il ne trouve **pas** cette dépendance à la racine
4. Il annule le build avec l'erreur `No Next.js version detected`

---

## ✅ Solution (Action Requise)

### 🎯 Étape 1 : Configurer le Root Directory dans Vercel

**Cette étape DOIT être effectuée dans l'interface Vercel. Elle ne peut pas être corrigée uniquement via le code.**

#### Instructions Détaillées

1. **Accéder au Dashboard Vercel**
   - URL : https://vercel.com/dashboard
   - Se connecter avec le compte associé au projet JOLANANAS

2. **Sélectionner le Projet**
   - Cliquer sur le projet **JOLANANAS** dans la liste

3. **Accéder aux Paramètres**
   - Cliquer sur l'onglet **Settings** (Paramètres) en haut
   - Ou URL directe : `https://vercel.com/[team]/[project]/settings`

4. **Configurer le Root Directory**
   - Dans la section **General** (Général)
   - Repérer le champ **Root Directory**
   - Cliquer sur **Edit** (Modifier)
   - Entrer la valeur : `apps/frontend`
   - Cliquer sur **Save** (Enregistrer)

5. **Vérifier la Configuration**
   - **Root Directory** : `apps/frontend` ✅
   - **Framework Preset** : Next.js (détecté automatiquement)
   - **Build Command** : `next build` (par défaut)
   - **Output Directory** : `.next` (par défaut)
   - **Install Command** : `pnpm install` (si configuré)

6. **Redéployer**
   - Aller dans l'onglet **Deployments**
   - Cliquer sur le dernier déploiement
   - Cliquer sur **Redeploy** (Redéployer)
   - Optionnel : Désactiver **Use existing Build Cache** pour un build propre

---

## 📋 Vérification Post-Configuration

### Checklist de Validation

Après avoir configuré le Root Directory, vérifier :

- [ ] **Root Directory** = `apps/frontend` dans Vercel Settings
- [ ] **Framework** = Next.js détecté automatiquement
- [ ] **Build Command** = `next build` (ou `pnpm run build`)
- [ ] **Output Directory** = `.next`
- [ ] **Install Command** = `pnpm install` (si pnpm utilisé)
- [ ] **Variables d'environnement** configurées pour Production/Preview/Development
- [ ] **Dernier déploiement** réussi (statut vert)

### Test du Build Local

Avant de déployer, tester le build localement :

```bash
cd apps/frontend
pnpm install
pnpm run build
```

**Résultat attendu** :

- ✅ Build réussi sans erreurs
- ✅ Dossier `.next/` créé
- ✅ Routes API détectées (vérifier `.next/server/apps/api/`)

---

## 🔧 Configuration des Fichiers

### Fichier `vercel.json` à la Racine

Le fichier `vercel.json` à la racine **peut rester** pour les configurations globales, mais Vercel utilisera principalement celui dans `apps/frontend/` une fois le Root Directory configuré.

**Fichier actuel** (`/vercel.json`) :

```json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "installCommand": "pnpm install",
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

### Fichier `vercel.json` dans `apps/frontend/`

**Fichier actuel** (`apps/frontend/vercel.json`) :

```json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "functions": {
    "apps/api/**/*.ts": {
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

**✅ Ce fichier est correct** et sera utilisé une fois le Root Directory configuré.

---

## 🚨 Dépannage

### Problème : Build échoue toujours après configuration

**Solutions** :

1. **Vérifier le Root Directory**
   - Aller dans Vercel Settings → General
   - Vérifier que `apps/frontend` est bien enregistré
   - Pas d'espace avant/après, pas de slash initial

2. **Vérifier les Variables d'Environnement**
   - Vercel Settings → Environment Variables
   - Vérifier que toutes les variables nécessaires sont configurées
   - Vérifier qu'elles sont disponibles pour **Production**

3. **Vérifier le Package Manager**
   - Si `pnpm-lock.yaml` existe dans `apps/frontend/`, Vercel utilisera `pnpm`
   - Si `package-lock.json` existe, Vercel utilisera `npm`
   - Si `yarn.lock` existe, Vercel utilisera `yarn`

4. **Forcer un Build Propre**
   - Vercel Dashboard → Deployments
   - Cliquer sur **Redeploy**
   - **Désactiver** "Use existing Build Cache"
   - Cliquer sur **Redeploy**

### Problème : Routes API non détectées

**Solutions** :

1. **Vérifier la Structure**
   - Les routes API doivent être dans `apps/frontend/apps/api/`
   - Format : `apps/api/[route]/route.ts`

2. **Vérifier le Build Local**

   ```bash
   cd apps/frontend
   pnpm run build
   ls -la .next/server/apps/api/
   ```

3. **Vérifier `vercel.json`**
   - Le fichier `apps/frontend/vercel.json` doit contenir la section `functions`

### Problème : Variables d'Environnement non disponibles

**Solutions** :

1. **Vérifier les Environnements**
   - Vercel Settings → Environment Variables
   - Vérifier que les variables sont configurées pour **Production**, **Preview**, et **Development**

2. **Redéployer après Ajout**
   - Après avoir ajouté une variable, **redéployer** le projet
   - Les variables ne sont pas injectées dans les builds existants

---

## 📊 Variables d'Environnement Requises

### Variables Critiques

Assurez-vous que ces variables sont configurées dans Vercel :

#### Shopify

- `SHOPIFY_STORE_DOMAIN`
- `SHOPIFY_STOREFRONT_ACCESS_TOKEN`
- `SHOPIFY_ADMIN_API_ACCESS_TOKEN` (si utilisé)
- `SHOPIFY_REVALIDATION_SECRET`

#### NextAuth

- `NEXTAUTH_URL`
- `NEXTAUTH_SECRET`

#### Base de Données (si applicable)

- `DATABASE_URL`

#### Autres

- `NODE_ENV` (généralement `production`)

### Configuration dans Vercel

1. **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Ajouter chaque variable avec :
   - **Key** : Nom de la variable
   - **Value** : Valeur de la variable
   - **Environments** : Production, Preview, Development (selon besoin)
3. **Sauvegarder**
4. **Redéployer** le projet

---

## ✅ Checklist Complète de Déploiement

Avant de considérer le déploiement comme réussi :

### Configuration Vercel

- [ ] Root Directory = `apps/frontend`
- [ ] Framework = Next.js détecté
- [ ] Build Command = `next build` ou `pnpm run build`
- [ ] Output Directory = `.next`
- [ ] Install Command = `pnpm install` (si pnpm utilisé)

### Variables d'Environnement

- [ ] Toutes les variables Shopify configurées
- [ ] Variables NextAuth configurées
- [ ] Variables disponibles pour Production
- [ ] Variables disponibles pour Preview (si nécessaire)

### Build

- [ ] Build local réussi (`pnpm run build`)
- [ ] Routes API détectées dans `.next/server/apps/api/`
- [ ] Aucune erreur TypeScript
- [ ] Aucune erreur ESLint critique

### Déploiement

- [ ] Dernier déploiement Vercel réussi (statut vert)
- [ ] Site accessible sur l'URL Vercel
- [ ] Routes API fonctionnelles
- [ ] Webhooks Shopify fonctionnels (si configurés)

---

## 📝 Notes Techniques

### Pourquoi le Root Directory est nécessaire ?

Vercel détecte automatiquement le framework en scannant le `package.json` à la racine du dépôt. Dans un monorepo ou une structure avec sous-dossiers, il faut indiquer explicitement où se trouve l'application.

### Alternative : Configuration via `vercel.json`

Il est possible de configurer le Root Directory via un fichier `vercel.json` à la racine, mais cette méthode est **moins fiable** et peut causer des conflits. La méthode recommandée est d'utiliser l'interface Vercel.

### Compatibilité Monorepo

Cette configuration fonctionne également pour les monorepos (pnpm workspaces, npm workspaces, etc.). Vercel détectera automatiquement le package manager utilisé.

---

## 🎯 Résultat Attendu

Après avoir configuré le Root Directory :

1. ✅ **Build Vercel réussi** (statut vert)
2. ✅ **Application déployée** et accessible
3. ✅ **Routes API fonctionnelles**
4. ✅ **Variables d'environnement disponibles**
5. ✅ **Déploiements automatiques** à chaque push sur la branche principale

---

## 📚 Références

- **Documentation Vercel** : https://vercel.com/docs/projects/overview/configuration
- **Vercel Root Directory** : https://vercel.com/docs/projects/overview/configuration#root-directory
- **Next.js on Vercel** : https://vercel.com/docs/frameworks/nextjs

---

**Version** : 1.0.0  
**Dernière mise à jour** : Janvier 2025  
**Rôle** : Architecte & Deployment  
**Projet** : JOLANANAS
