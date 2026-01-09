# 🚨 PLAN D'ACTION IMMÉDIAT - Remédiation Sécurité

> **Date** : 13 Janvier 2026  
> **Niveau** : CRITIQUE (Niveau 0)  
> **Ticket Shopify** : cf946ad7-231e-4ec8-a354-4f1bf012391f  
> **Commit compromis** : ac4d463a2f83b70f3fe5bf8d1eb8b6158b329c18

---

## 📊 SITUATION ACTUELLE

### ✅ **Actions Déjà Effectuées**

1. ✅ **Backup créé** : `_backup/repo-backup-*.bundle`
2. ✅ **.gitignore renforcé** : Patterns de sécurité en place
3. ✅ **Documentation créée** : Guides de remédiation disponibles
4. ✅ **Script de nettoyage** : `scripts/security-cleanup-repo.sh` prêt

### ⚠️ **État du Dépôt**

- **Commit compromis** : `ac4d463a2f83b70f3fe5bf8d1eb8b6158b329c18` **N'EST PAS** dans l'historique local
- **Historique local** : 37 commits
- **Remote** : `https://github.com/jolananas/JOLANANAS.git`
- **Fichier compromis** : `app/frontend/env.backup` (potentiellement encore sur GitHub)

---

## 🎯 OPTION RECOMMANDÉE : Suppression Complète et Recréation

**Pourquoi cette option ?**
- ✅ **100% sûr** : Aucune trace du fichier compromis
- ✅ **Historique propre** : Nouveau départ sans compromission
- ✅ **Simple** : Pas de manipulation complexe de l'historique Git
- ✅ **Rapide** : Script automatisé disponible

---

## 🚀 EXÉCUTION DU PLAN

### **ÉTAPE 1 : Révocation Immédiate des Credentials Shopify**

**⚠️ À FAIRE MAINTENANT - AVANT TOUT AUTRE CHANGEMENT**

🔗 **Lien direct - Shopify Admin** : [https://u6ydbb-sx.myshopify.com/admin](https://u6ydbb-sx.myshopify.com/admin)

1. **Cliquez sur le lien ci-dessus** → Ouvre Shopify Admin
2. **Désinstallez l'application compromise**
   - Settings > Apps and sales channels > Develop apps
   - 🔗 **Lien direct - Apps** : [https://u6ydbb-sx.myshopify.com/admin/settings/apps](https://u6ydbb-sx.myshopify.com/admin/settings/apps)
   - Trouvez "Jolananas Storefront API"
   - Cliquez sur **Uninstall** (Désinstaller)

3. **Créez une NOUVELLE application**
   - 🔗 **Lien direct - Dev Dashboard** : [https://dev.shopify.com/dashboard/175998111/apps](https://dev.shopify.com/dashboard/175998111/apps)
   - Cliquez sur "Create app" > Nom : `Jolananas Web 2026`
   - Configurez Storefront API
   - Installez l'application
   - **COPIEZ LE NOUVEAU TOKEN**

4. **Mettez à jour les variables d'environnement**
   - Local : `app/frontend/.env.local`
   - Vercel : Dashboard > Settings > Environment Variables
   - **Redeploy** l'application Vercel

**📋 Voir le guide complet** : `docs/SECURITY-EMERGENCY-REVOCATION-GUIDE.md`

---

### **ÉTAPE 2 : Nettoyage Complet du Dépôt Git**

#### **Option A : Script Automatisé (Recommandé)**

```bash
# Exécuter le script de nettoyage
cd "/Volumes/Professionnel/CRÉATIVE AÏSSA/Entreprises/Jolananas/Site Web/Serveur"
./scripts/security-cleanup-repo.sh
```

Le script va :
1. ✅ Créer un backup complet du code
2. ✅ Supprimer le dépôt Git local
3. ✅ Initialiser un nouveau dépôt Git propre
4. ✅ Créer un commit initial sécurisé

#### **Option B : Commandes Manuelles**

Si vous préférez exécuter les commandes manuellement :

```bash
# 1. Backup du code (sans .git)
cd "/Volumes/Professionnel/CRÉATIVE AÏSSA/Entreprises/Jolananas/Site Web/Serveur"
mkdir -p _backup/code-clean-$(date +%Y%m%d-%H%M%S)
rsync -av --exclude='.git' --exclude='node_modules' --exclude='.next' \
  --exclude='*.env*' --exclude='*backup*' --exclude='*.log' \
  . _backup/code-clean-$(date +%Y%m%d-%H%M%S)/

# 2. Supprimer le dépôt Git
rm -rf .git

# 3. Initialiser un nouveau dépôt
git init
git branch -M main

# 4. Ajouter les fichiers
git add .

# 5. Commit initial
git commit -m "chore: initial commit - security hardened repository

- Removed all sensitive files from history
- Hardened .gitignore to prevent credential exposure
- Clean repository start after security incident
- Ticket: cf946ad7-231e-4ec8-a354-4f1bf012391f"
```

---

### **ÉTAPE 3 : Suppression et Recréation du Dépôt GitHub**

#### **3.1. Supprimer l'Ancien Dépôt sur GitHub**

🔗 **Lien direct - Settings GitHub** : [https://github.com/jolananas/JOLANANAS/settings](https://github.com/jolananas/JOLANANAS/settings)

1. **Cliquez sur le lien ci-dessus** → Ouvre les paramètres du dépôt
2. **Scroll jusqu'à** : "Danger Zone" (en bas de la page)
3. **Cliquez sur** : "Delete this repository"
4. **Tapez** : `jolananas/JOLANANAS` pour confirmer
5. **Cliquez sur** : "I understand the consequences, delete this repository"

#### **3.2. Créer un Nouveau Dépôt sur GitHub**

🔗 **Lien direct - Créer un nouveau dépôt** : [https://github.com/new](https://github.com/new)

1. **Cliquez sur le lien ci-dessus** → Ouvre le formulaire de création
2. **Nom du dépôt** : `JOLANANAS`
3. **Visibilité** : 
   - ✅ **Private** (recommandé pour éviter les expositions futures)
   - ⚠️ Public (si nécessaire pour la visibilité)
4. **Ne pas initialiser** avec :
   - ❌ README
   - ❌ .gitignore
   - ❌ License
5. **Cliquez sur** : "Create repository"

#### **3.3. Connecter et Pousser le Nouveau Dépôt**

```bash
# Ajouter le remote
git remote add origin https://github.com/jolananas/JOLANANAS.git

# Push du nouveau dépôt
git push -u origin main --force
```

---

### **ÉTAPE 4 : Vérification Post-Nettoyage**

#### **4.1. Vérifier que le Fichier Compromis n'est Plus Accessible**

```bash
# Vérifier localement
git log --all --full-history --source -- "app/frontend/env.backup"
# ✅ Doit retourner AUCUN résultat

# Vérifier sur GitHub
# Le lien https://github.com/jolananas/JOLANANAS/blob/ac4d463a2f83b70f3fe5bf8d1eb8b6158b329c18/app/frontend/env.backup
# doit maintenant retourner une erreur 404
```

#### **4.2. Vérifier que le Site Fonctionne**

1. **Visitez** : https://jolananas.com (ou votre domaine)
2. **Vérifiez** : Les produits s'affichent correctement
3. **Testez** : Le processus de checkout
4. **Vérifiez** : L'envoi d'emails (newsletter, commandes)

#### **4.3. Test de l'API Shopify**

```bash
# Test avec le nouveau token
curl -X POST https://u6ydbb-sx.myshopify.com/api/2026-04/graphql.json \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Storefront-Access-Token: VOTRE_NOUVEAU_TOKEN" \
  -d '{"query": "{ shop { name } }"}'

# ✅ Succès = Réponse avec le nom de la boutique
# ❌ Erreur 401 = Token invalide (vérifiez la nouvelle clé)
```

---

### **ÉTAPE 5 : Installation du Hook Pre-Commit**

Pour éviter de futurs incidents, installez un hook Git :

```bash
# Créer le hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
SENSITIVE_PATTERNS="\.(env|backup|secret|key|pem|credentials)$|\.env\.|env\.backup|secrets\.|credentials\."

if git diff --cached --name-only | grep -E "$SENSITIVE_PATTERNS"; then
  echo "❌ ERREUR : Tentative de commit de fichiers sensibles !"
  git diff --cached --name-only | grep -E "$SENSITIVE_PATTERNS"
  exit 1
fi
EOF

# Rendre exécutable
chmod +x .git/hooks/pre-commit
```

---

### **ÉTAPE 6 : Réponse à Shopify**

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
4. ✅ Suppression complète de l'ancien dépôt GitHub
5. ✅ Création d'un nouveau dépôt GitHub propre (sans historique compromis)
6. ✅ Renforcement du .gitignore pour prévenir de futurs incidents
7. ✅ Installation d'un hook pre-commit pour bloquer les fichiers sensibles
8. ✅ Tests de validation post-révocation réussis

Le fichier env.backup a été complètement supprimé de notre dépôt et ne sera 
plus accessible publiquement. Tous les credentials exposés ont été révoqués 
et remplacés par de nouvelles clés sécurisées.

Nous avons également mis en place des mesures préventives pour éviter 
ce type d'incident à l'avenir.

Merci de nous avoir alertés rapidement.

Cordialement,
[Votre nom]
Jolananas Admin
```

---

## ✅ CHECKLIST DE VALIDATION FINALE

Avant de considérer l'incident comme résolu :

- [ ] **Révocation Shopify** : Ancien token révoqué (app désinstallée)
- [ ] **Nouveau token Shopify** : Nouvelle app créée avec nouveau token
- [ ] **Variables locales** : `.env.local` mis à jour avec nouveau token
- [ ] **Variables Vercel** : Variables d'environnement mises à jour
- [ ] **Redeploy Vercel** : Application redéployée avec nouvelles clés
- [ ] **Tests API** : Storefront API fonctionne avec nouveau token
- [ ] **Backup créé** : Backup du code dans `_backup/`
- [ ] **Dépôt Git nettoyé** : Nouveau dépôt Git initialisé
- [ ] **Ancien dépôt GitHub supprimé** : Dépôt compromis supprimé
- [ ] **Nouveau dépôt GitHub créé** : Nouveau dépôt propre créé
- [ ] **Push effectué** : Nouveau dépôt poussé sur GitHub
- [ ] **Vérification 404** : Le lien Shopify retourne 404
- [ ] **.gitignore vérifié** : Patterns de sécurité en place
- [ ] **Hook pre-commit** : Installé et testé
- [ ] **Site fonctionnel** : Site en production fonctionne correctement
- [ ] **Email Shopify** : Réponse envoyée confirmant les actions

---

## 📚 DOCUMENTATION COMPLÉMENTAIRE

- **Guide de révocation** : `docs/SECURITY-EMERGENCY-REVOCATION-GUIDE.md`
- **Guide de nettoyage Git** : `docs/SECURITY-GIT-CLEANUP-COMPLETE.md`
- **Plan de remédiation complet** : `docs/SECURITY-REMEDIATION-COMPLETE.md`
- **Script de nettoyage** : `scripts/security-cleanup-repo.sh`

---

## 🛡️ MESURES PRÉVENTIVES

### 1. Dépôt Privé (Recommandé)

Si possible, configurez le dépôt GitHub en **Private** pour éviter les expositions publiques.

### 2. Audit Mensuel

Exécutez mensuellement un audit de sécurité :

```bash
# Vérifier les fichiers sensibles dans l'historique
git log --all --full-history --source -- "*env*" "*backup*" "*secret*"

# Vérifier les fichiers actuellement trackés
git ls-files | grep -E '\.(env|backup|secret|key|pem)$'
```

### 3. Formation de l'Équipe

- ✅ Ne jamais commiter de fichiers `.env*`
- ✅ Toujours vérifier `git status` avant de commit
- ✅ Utiliser des variables d'environnement, jamais de hardcoding
- ✅ Signaler immédiatement toute exposition de secret

---

**Date de création** : 13 Janvier 2026  
**Dernière mise à jour** : 13 Janvier 2026  
**Statut** : 🔴 URGENT - Action requise avant le 13 Janvier 2026
