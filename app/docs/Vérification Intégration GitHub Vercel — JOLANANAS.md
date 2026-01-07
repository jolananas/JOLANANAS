# 🍍 JOLANANAS - Vérification Intégration GitHub ↔ Vercel

## 🎯 Objectif

Vérifier que les déploiements Vercel sont déclenchés automatiquement depuis GitHub (pas depuis Vercel CLI), et corriger la configuration Node.js.

---

## ✅ Vérification de l'Intégration GitHub

### 1. Vérifier le Repository GitHub

```bash
# À la racine du projet
git remote -v
```

**Résultat attendu** :
```
origin  https://github.com/jolananas/JOLANANAS.git (fetch)
origin  https://github.com/jolananas/JOLANANAS.git (push)
```

✅ **OK** : Le dépôt est bien connecté à GitHub.

### 2. Vérifier la Configuration Vercel

#### Via Vercel CLI

```bash
cd app/frontend
vercel project ls
```

**Résultat attendu** :
```
Project Name    Latest Production URL                                    Updated   Node Version   
jolananas       https://jolananas-aissa-belkoussas-projects.vercel.app   1m        20.x  ← DOIT être 20.x
```

⚠️ **Problème actuel** : Node Version affiche `24.x` au lieu de `20.x`

#### Via Vercel Dashboard

1. Aller sur https://vercel.com/dashboard
2. Sélectionner le projet **jolananas**
3. **Settings** → **General**
4. Vérifier :
   - **Git Repository** : `jolananas/JOLANANAS` ✅
   - **Production Branch** : `main` ✅
   - **Root Directory** : `app/frontend` ⚠️ À configurer
   - **Node.js Version** : `20.x` ⚠️ À configurer (actuellement 24.x)

---

## 🔧 Correction de la Configuration Node.js

### Méthode 1 : Via Vercel Dashboard (RECOMMANDÉ)

1. **Vercel Dashboard** → **Settings** → **General**
2. **Node.js Version** :
   - Cliquer sur **"Edit"**
   - Sélectionner **`20.x`** (pas Latest ou 24.x)
   - Cliquer sur **"Save"**
3. **Root Directory** :
   - Cliquer sur **"Edit"**
   - Entrer : `app/frontend`
   - Cliquer sur **"Save"**

### Méthode 2 : Via Vercel CLI (Alternative)

⚠️ **Note** : La configuration Node.js ne peut pas être changée directement via CLI. Utilisez le Dashboard.

Pour vérifier la configuration actuelle :

```bash
cd app/frontend
vercel project ls --json | grep -A 5 "jolananas"
```

---

## 🔍 Vérification des Déploiements GitHub

### Comment Vérifier que les Déploiements Viennent de GitHub

#### 1. Dans Vercel Dashboard

1. Aller dans **Deployments**
2. Cliquer sur un déploiement
3. Vérifier la section **"Source"** :
   - ✅ **GitHub** : `jolananas/JOLANANAS@main` → Déploiement depuis GitHub
   - ❌ **CLI** : `vercel --prod` → Déploiement depuis CLI (à éviter)

#### 2. Dans GitHub

1. Aller sur https://github.com/jolananas/JOLANANAS
2. Cliquer sur **"Actions"**
3. Vérifier qu'il y a des workflows Vercel qui se déclenchent à chaque push

#### 3. Test de Déploiement Automatique

1. **Faire un petit changement** dans le code (ex: commentaire)
2. **Commit et push** vers GitHub :
   ```bash
   git add .
   git commit -m "test: Vérification déploiement automatique"
   git push origin main
   ```
3. **Vérifier dans Vercel Dashboard** :
   - Un nouveau déploiement devrait apparaître automatiquement
   - Le déploiement devrait indiquer **"GitHub"** comme source
   - Pas besoin de lancer `vercel --prod` manuellement

---

## ⚠️ Problème Actuel Identifié

### Configuration Actuelle

- **Node.js Version** : `24.x` ❌ (devrait être `20.x`)
- **Root Directory** : Non configuré ❌ (devrait être `app/frontend`)
- **Source des déploiements** : À vérifier

### Impact

- ❌ Erreurs de compatibilité avec pnpm 10
- ❌ Erreurs `ERR_PNPM_UNSUPPORTED_ENGINE`
- ❌ Build échoue avant l'installation des dépendances

---

## ✅ Actions Requises

### Checklist Complète

- [ ] **Vercel Dashboard** → **Settings** → **General**
  - [ ] **Root Directory** : `app/frontend`
  - [ ] **Node.js Version** : `20.x` (pas 24.x)
- [ ] **Vérifier l'intégration GitHub** :
  - [ ] Repository GitHub connecté : `jolananas/JOLANANAS`
  - [ ] Production Branch : `main`
  - [ ] Déploiements automatiques activés
- [ ] **Tester un déploiement depuis GitHub** :
  - [ ] Faire un commit et push
  - [ ] Vérifier qu'un déploiement se déclenche automatiquement
  - [ ] Vérifier que la source est "GitHub" et non "CLI"
- [ ] **Vérifier les logs de build** :
  - [ ] Node.js version : `20.x`
  - [ ] pnpm version : `10.x`
  - [ ] Build réussi

---

## 🚫 Ne Plus Utiliser Vercel CLI pour Déployer

### ❌ À Éviter

```bash
# Ne pas faire ça pour les déploiements de production
vercel --prod
```

### ✅ Utiliser à la Place

1. **Faire des commits et push vers GitHub** :
   ```bash
   git add .
   git commit -m "feat: Nouvelle fonctionnalité"
   git push origin main
   ```

2. **Vercel déploie automatiquement** depuis GitHub

3. **Vercel CLI uniquement pour** :
   - Vérification de configuration (`vercel project ls`)
   - Inspection de déploiements (`vercel inspect`)
   - Développement local (`vercel dev`)

---

## 📊 Vérification Post-Configuration

### Commandes de Vérification

```bash
# 1. Vérifier la configuration du projet
cd app/frontend
vercel project ls

# 2. Vérifier le dernier déploiement
vercel inspect <deployment-url> --logs

# 3. Vérifier que GitHub est connecté
# Via Dashboard Vercel → Settings → Git
```

### Résultats Attendus

1. **`vercel project ls`** :
   ```
   Project Name    Node Version   
   jolananas       20.x  ← DOIT être 20.x
   ```

2. **Dans Vercel Dashboard** → **Deployments** :
   - Source : **GitHub** (`jolananas/JOLANANAS@main`)
   - Pas de source : **CLI**

3. **Logs de build** :
   ```
   ✅ Node.js version: 20.x
   ✅ Using pnpm@10.24.0
   ✅ Detected Next.js version: 16.1.0
   ✅ Build completed successfully
   ```

---

## 🔄 Workflow Recommandé

### Pour Déployer en Production

1. **Développer localement** :
   ```bash
   cd app/frontend
   pnpm dev
   ```

2. **Tester localement** :
   ```bash
   pnpm build
   pnpm start
   ```

3. **Commit et push vers GitHub** :
   ```bash
   git add .
   git commit -m "feat: Description de la fonctionnalité"
   git push origin main
   ```

4. **Vercel déploie automatiquement** depuis GitHub

5. **Vérifier le déploiement** :
   - Vercel Dashboard → Deployments
   - Vérifier les logs de build
   - Tester le site en production

### Pour Développement Local avec Vercel

```bash
# Utiliser Vercel CLI uniquement pour le dev local
cd app/frontend
vercel dev
```

---

## 📝 Notes Importantes

- **Déploiements automatiques** : Activés par défaut quand GitHub est connecté
- **Déploiements manuels** : Via `vercel --prod` uniquement si nécessaire (déconseillé)
- **Configuration Node.js** : Doit être faite dans le Dashboard Vercel (pas via CLI)
- **Root Directory** : Doit être configuré dans le Dashboard Vercel pour Next.js dans un sous-dossier

---

**Version** : 1.0.0  
**Date** : Janvier 2025  
**Projet** : JOLANANAS  
**Statut** : ⚠️ Configuration Requise dans Dashboard Vercel

