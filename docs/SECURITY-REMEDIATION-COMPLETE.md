# 🚨 PLAN DE REMÉDIATION COMPLÈTE - Exposition de Credentials

> **Date** : 13 Janvier 2026  
> **Niveau** : CRITIQUE (Niveau 0)  
> **Ticket Shopify** : cf946ad7-231e-4ec8-a354-4f1bf012391f  
> **Commit compromis** : ac4d463a2f83b70f3fe5bf8d1eb8b6158b329c18

---

## 📋 SITUATION ACTUELLE

**Problème identifié** : Le fichier `app/frontend/env.backup` contenant des credentials API Shopify a été exposé publiquement sur GitHub dans le commit `ac4d463a2f83b70f3fe5bf8d1eb8b6158b329c18`.

**Credentials compromis** :
- `SHOPIFY_STOREFRONT_TOKEN` (Storefront API)
- Potentiellement d'autres secrets (Admin API, Resend, etc.)

**Impact** : 
- ⚠️ N'importe qui peut accéder à votre boutique Shopify
- ⚠️ Modification/vol de produits possible
- ⚠️ Accès aux données clients
- ⚠️ Risque de compromission complète de la boutique

---

## 🎯 OPTIONS DE REMÉDIATION

### **OPTION 1 : Nettoyage Complet de l'Historique Git (Recommandé si dépôt partagé)**

Cette option supprime le fichier compromis de tout l'historique Git tout en préservant le reste du code.

#### Avantages
- ✅ Préserve l'historique des commits (sauf le fichier compromis)
- ✅ Moins disruptif pour les collaborateurs
- ✅ Garde la traçabilité du code

#### Inconvénients
- ⚠️ Nécessite un push forcé (force push)
- ⚠️ Les SHA des commits changent
- ⚠️ Les collaborateurs devront réinitialiser leur branche locale

#### Commandes à exécuter :

```bash
# 1. Backup complet du dépôt
cd "/Volumes/Professionnel/CRÉATIVE AÏSSA/Entreprises/Jolananas/Site Web/Serveur"
mkdir -p _backup
git bundle create _backup/repo-backup-$(date +%Y%m%d-%H%M%S).bundle --all

# 2. Installation de git-filter-repo (si non installé)
# macOS
brew install git-filter-repo

# Ou via pip
pip install git-filter-repo

# 3. Suppression du fichier compromis de tout l'historique
git filter-repo --path app/frontend/env.backup --invert-paths

# 4. Vérification que le fichier n'est plus dans l'historique
git log --all --full-history --source -- "app/frontend/env.backup"
# ✅ Doit retourner AUCUN résultat

# 5. Push forcé vers GitHub
git push origin --force --all
git push origin --force --tags

# 6. Vérification finale
# Le lien https://github.com/jolananas/JOLANANAS/blob/ac4d463a2f83b70f3fe5bf8d1eb8b6158b329c18/app/frontend/env.backup
# doit maintenant retourner une erreur 404
```

---

### **OPTION 2 : Suppression et Recréation du Dépôt (Plus Radical)**

Cette option supprime complètement l'historique Git et crée un nouveau dépôt propre.

#### Avantages
- ✅ **100% sûr** : Aucune trace du fichier compromis
- ✅ Historique propre dès le départ
- ✅ Pas de risque de réexposition accidentelle

#### Inconvénients
- ⚠️ Perte complète de l'historique Git
- ⚠️ Perte des issues, pull requests, etc. sur GitHub
- ⚠️ Nécessite de recréer le dépôt sur GitHub

#### Commandes à exécuter :

```bash
# 1. Backup complet du code (sans .git)
cd "/Volumes/Professionnel/CRÉATIVE AÏSSA/Entreprises/Jolananas/Site Web/Serveur"
mkdir -p _backup/code-clean-$(date +%Y%m%d-%H%M%S)

# Copier tous les fichiers sauf .git et fichiers sensibles
rsync -av --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='*.env*' \
  --exclude='*backup*' \
  --exclude='*.log' \
  . _backup/code-clean-$(date +%Y%m%d-%H%M%S)/

# 2. Supprimer le dépôt Git local
rm -rf .git

# 3. Initialiser un nouveau dépôt Git
git init
git branch -M main

# 4. Vérifier que .gitignore est correct
cat .gitignore | grep -E "env|backup|secret"
# ✅ Doit contenir les patterns de blocage

# 5. Premier commit propre
git add .
git commit -m "chore: initial commit - security hardened"

# 6. Ajouter le remote GitHub
git remote add origin https://github.com/jolananas/JOLANANAS.git

# 7. ⚠️ SUPPRIMER L'ANCIEN DÉPÔT SUR GITHUB
# 🔗 Lien direct : https://github.com/jolananas/JOLANANAS/settings
# Scroll jusqu'à "Danger Zone"
# Cliquez sur "Delete this repository"
# Confirmez la suppression

# 8. Créer un nouveau dépôt sur GitHub
# 🔗 Lien direct : https://github.com/new
# Nom : JOLANANAS
# Visibilité : Private (recommandé) ou Public
# Ne pas initialiser avec README, .gitignore, ou license

# 9. Push du nouveau dépôt
git push -u origin main --force

# 10. Vérification
# Le lien https://github.com/jolananas/JOLANANAS/blob/ac4d463a2f83b70f3fe5bf8d1eb8b6158b329c18/app/frontend/env.backup
# doit maintenant retourner une erreur 404 (dépôt supprimé)
```

---

### **OPTION 3 : Vérification et Nettoyage Ciblé (Si le fichier n'existe plus)**

Si le fichier a déjà été supprimé mais que l'historique contient encore des traces :

```bash
# 1. Vérifier si le fichier existe encore dans l'historique
git log --all --full-history --source -- "app/frontend/env.backup"

# 2. Si aucun résultat, le fichier n'est plus dans l'historique
# Mais vérifier les autres fichiers sensibles
git log --all --full-history --source -- "*env*" "*backup*" "*secret*"

# 3. Vérifier les fichiers actuellement trackés
git ls-files | grep -E '\.(env|backup|secret|key|pem)$'

# 4. Si des fichiers sensibles sont trackés, les supprimer
git rm --cached app/frontend/env.backup 2>/dev/null || true
git commit -m "security: remove sensitive files from tracking"

# 5. Push normal (pas de force nécessaire)
git push origin main
```

---

## 🔥 ÉTAPES OBLIGATOIRES (Quelle que soit l'option choisie)

### **1. Révocation Immédiate des Credentials Shopify**

**⚠️ À FAIRE MAINTENANT - AVANT TOUT AUTRE CHANGEMENT**

🔗 **Lien direct - Shopify Admin** : [https://u6ydbb-sx.myshopify.com/admin](https://u6ydbb-sx.myshopify.com/admin)

1. **Cliquez sur le lien ci-dessus** → Ouvre Shopify Admin

2. **Désinstallez l'application compromise**
   - Settings > Apps and sales channels > Develop apps
   - 🔗 **Lien direct - Develop Apps** : [https://u6ydbb-sx.myshopify.com/admin/settings/apps/develop](https://u6ydbb-sx.myshopify.com/admin/settings/apps/develop)
   - Trouvez "Jolananas Storefront API"
   - Cliquez sur **Uninstall** (Désinstaller)
   - ⚠️ **Cela révoque immédiatement le token compromis**

3. **Créez une NOUVELLE application**
   - Create an app > Nom : `Jolananas Web 2026`
   - Configurez Storefront API avec les permissions nécessaires
   - Installez l'application
   - **COPIEZ LE NOUVEAU TOKEN** (commence par `shpat_` ou `shpca_`)

4. **Mettez à jour les variables d'environnement**
   - Local : `app/frontend/.env.local`
   - Vercel : Dashboard > Settings > Environment Variables
   - **Redeploy** l'application Vercel

### **2. Vérification Post-Révocation**

```bash
# Test avec le nouveau token
curl -X POST https://u6ydbb-sx.myshopify.com/api/2026-04/graphql.json \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Storefront-Access-Token: VOTRE_NOUVEAU_TOKEN" \
  -d '{"query": "{ shop { name } }"}'

# ✅ Succès = Réponse avec le nom de la boutique
# ❌ Erreur 401 = Token invalide (vérifiez la nouvelle clé)
```

### **3. Renforcement du .gitignore**

Les fichiers `.gitignore` sont déjà bien configurés, mais vérifiez qu'ils contiennent :

```gitignore
# Fichiers d'environnement (TOUTES variantes)
.env
.env.*
.env.local
.env.development
.env.production
.env.test
.env.staging
.env.backup
.env.old
env.backup
env.*
*.env
*.env.*

# Fichiers de backup
*.backup
*.bak
*.old
*_backup
*_backup.*
backup.*
*.backup.*

# Secrets
*.secret
*.secrets
secrets.*
credentials.*
*.pem
*.key
```

### **4. Installation d'un Hook Pre-Commit (Recommandé)**

Créez `.git/hooks/pre-commit` :

```bash
#!/bin/bash
# .git/hooks/pre-commit

# Vérifier les fichiers sensibles avant commit
SENSITIVE_PATTERNS="\.(env|backup|secret|key|pem|credentials)$|\.env\.|env\.backup|secrets\.|credentials\."

if git diff --cached --name-only | grep -E "$SENSITIVE_PATTERNS"; then
  echo "❌ ERREUR : Tentative de commit de fichiers sensibles !"
  echo ""
  echo "Les fichiers suivants ne peuvent pas être commités :"
  git diff --cached --name-only | grep -E "$SENSITIVE_PATTERNS"
  echo ""
  echo "Ces fichiers contiennent des secrets et doivent rester locaux."
  echo "Vérifiez votre .gitignore et retirez ces fichiers du staging."
  exit 1
fi

# Vérifier le contenu des fichiers pour des patterns de secrets
if git diff --cached | grep -E "(shpat_|shpca_|gid://shopify|API.*KEY|ACCESS.*TOKEN|SECRET.*KEY)" | grep -v "^\+.*#"; then
  echo "⚠️  ATTENTION : Détection de patterns de secrets dans les fichiers modifiés"
  echo "Vérifiez que vous ne commitez pas de credentials réels."
  read -p "Continuer quand même ? (y/N) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

exit 0
```

Rendez-le exécutable :

```bash
chmod +x .git/hooks/pre-commit
```

---

## 📧 RÉPONSE À SHOPIFY

Une fois toutes les étapes terminées, répondez à l'email de Shopify :

```
Subject: Re: Action required: Security risk involving your app [Ticket: cf946ad7-231e-4ec8-a354-4f1bf012391f]

Bonjour Shopify Ecosystem Governance,

Nous avons bien reçu votre notification de sécurité concernant l'exposition 
des credentials API de notre application Jolananas Storefront API.

Actions effectuées :
1. ✅ Révocation immédiate de tous les tokens compromis
2. ✅ Création de nouvelles applications avec nouveaux tokens
3. ✅ Mise à jour des variables d'environnement (local et production)
4. ✅ Suppression complète du fichier compromis de notre dépôt Git
5. ✅ Renforcement du .gitignore pour prévenir de futurs incidents
6. ✅ Installation d'un hook pre-commit pour bloquer les fichiers sensibles
7. ✅ Tests de validation post-révocation réussis

Le fichier env.backup a été supprimé de notre dépôt et ne sera plus 
accessible publiquement. Tous les credentials exposés ont été révoqués 
et remplacés par de nouvelles clés sécurisées.

Nous avons également mis en place des mesures préventives pour éviter 
ce type d'incident à l'avenir.

Merci de nous avoir alertés rapidement.

Cordialement,
[Votre nom]
Jolananas Admin
```

---

## ✅ CHECKLIST DE VALIDATION

Avant de considérer l'incident comme résolu :

- [ ] **Révocation Shopify** : Ancien token révoqué (app désinstallée)
- [ ] **Nouveau token Shopify** : Nouvelle app créée avec nouveau token
- [ ] **Variables locales** : `.env.local` mis à jour avec nouveau token
- [ ] **Variables Vercel** : Variables d'environnement mises à jour
- [ ] **Redeploy Vercel** : Application redéployée avec nouvelles clés
- [ ] **Tests API** : Storefront API fonctionne avec nouveau token
- [ ] **Nettoyage Git** : Fichier compromis supprimé de l'historique
- [ ] **Push GitHub** : Dépôt mis à jour (force push si nécessaire)
- [ ] **Vérification 404** : Le lien Shopify retourne 404
- [ ] **.gitignore** : Renforcé et vérifié
- [ ] **Hook pre-commit** : Installé et testé
- [ ] **Email Shopify** : Réponse envoyée confirmant les actions

---

## 🛡️ MESURES PRÉVENTIVES FUTURES

### 1. Audit Mensuel

```bash
# Script d'audit de sécurité (à exécuter mensuellement)
#!/bin/bash
echo "🔍 Audit de sécurité du dépôt Git..."

# Vérifier les fichiers sensibles dans l'historique
echo "📋 Vérification de l'historique Git..."
git log --all --full-history --source -- "*env*" "*backup*" "*secret*" "*credential*" "*token*" | head -20

# Vérifier les fichiers actuellement trackés
echo "📋 Vérification des fichiers trackés..."
git ls-files | grep -E '\.(env|backup|secret|key|pem|credential)$'

# Vérifier les patterns de secrets dans le code
echo "📋 Vérification des patterns de secrets..."
git grep -E "(shpat_|shpca_|gid://shopify|API.*KEY|ACCESS.*TOKEN|SECRET.*KEY)" -- "*.ts" "*.tsx" "*.js" "*.jsx" | grep -v "//\|#\|/\*" | head -20

echo "✅ Audit terminé"
```

### 2. Documentation des Secrets

Créer un fichier `docs/SECRETS-MANAGEMENT.md` documentant :
- Où sont stockés les secrets (local, Vercel, etc.)
- Comment les obtenir (Shopify Admin, Resend Dashboard, etc.)
- Qui a accès aux secrets
- Procédure de rotation des secrets

### 3. Formation de l'Équipe

- ✅ Ne jamais commiter de fichiers `.env*`
- ✅ Toujours vérifier `git status` avant de commit
- ✅ Utiliser des variables d'environnement, jamais de hardcoding
- ✅ Signaler immédiatement toute exposition de secret

---

**Date de création** : 13 Janvier 2026  
**Dernière mise à jour** : 13 Janvier 2026  
**Statut** : 🔴 URGENT - Action requise avant le 13 Janvier 2026  
**Prochaine révision** : 13 Février 2026 (audit mensuel)
