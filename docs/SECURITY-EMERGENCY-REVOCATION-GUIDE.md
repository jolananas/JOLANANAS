# 🚨 GUIDE D'URGENCE - Révocation des Credentials Compromis

> **Date** : 13 Janvier 2026  
> **Niveau** : CRITIQUE (Niveau 0)  
> **Ticket Shopify** : cf946ad7-231e-4ec8-a354-4f1bf012391f

---

## 📋 RÉSUMÉ EXÉCUTIF

**Problème** : Le fichier `app/frontend/env.backup` contenant des credentials API a été exposé publiquement sur GitHub.

**Credentials compromis identifiés** :
- ✅ `SHOPIFY_STOREFRONT_TOKEN=[STOREFRONT_TOKEN_COMPROMISED]` ⚠️ **RÉVOQUÉ** (Storefront API)
- ✅ `SHOPIFY_ADMIN_TOKEN=shpat_[TOKEN_COMPROMISED]` ⚠️ **RÉVOQUÉ** (Admin API)
- ✅ `RESEND_API_KEY=re_9tnawTCv_K3Pm6HQZ5bN4uTCppgNyHH92` (Service email Resend)
- ✅ `DATABASE_URL=file:./app/src/prisma/dev.db` (Base de données locale)

**Action requise** : Révoquer **IMMÉDIATEMENT** toutes ces clés et en générer de nouvelles.

---

## 🔥 ÉTAPE 1 : RÉVOCATION SHOPIFY (PRIORITÉ ABSOLUE)

### A. Révocation Storefront API Token

🔗 **Lien direct - Shopify Admin** : [https://u6ydbb-sx.myshopify.com/admin](https://u6ydbb-sx.myshopify.com/admin)

1. **Cliquez sur le lien ci-dessus** → Ouvre Shopify Admin
   - Connectez-vous avec vos identifiants

2. **Accédez aux Apps de développement**
   - Cliquez sur **Settings** (Paramètres) en bas à gauche
   - Cliquez sur **Apps and sales channels** (Apps et canaux de vente)
   - 🔗 **Lien direct - Develop Apps** : [https://u6ydbb-sx.myshopify.com/admin/settings/apps/develop](https://u6ydbb-sx.myshopify.com/admin/settings/apps/develop)

3. **Trouvez l'application "Jolananas Storefront API"**
   - Recherchez l'app dans la liste
   - Cliquez sur l'app pour ouvrir ses paramètres

4. **Désinstallez l'application**
   - Cliquez sur **Uninstall** (Désinstaller)
   - Confirmez la désinstallation
   - ⚠️ **Cela révoque immédiatement le token compromis**

5. **Créez une NOUVELLE application**
   - Cliquez sur **Create an app** (Créer une app)
   - Nom : `Jolananas Web 2026` (ou similaire)
   - Cliquez sur **Create app**

6. **Configurez Storefront API**
   - Dans votre nouvelle app, cliquez sur **Configure Admin API scopes**
   - Activez les permissions Storefront API :
     - ✅ `unauthenticated_read_product_listings`
     - ✅ `unauthenticated_read_product_inventory`
     - ✅ `unauthenticated_read_collection_listings`
     - ✅ `unauthenticated_read_checkouts`
     - ✅ `unauthenticated_write_checkouts`
     - ✅ `unauthenticated_write_customers`
     - ✅ `unauthenticated_read_customers`

7. **Installez l'application**
   - Cliquez sur **Install app**
   - Autorisez toutes les permissions

8. **Récupérez le NOUVEAU token**
   - Allez dans **API credentials** (Identifiants API)
   - Faites défiler jusqu'à **Storefront API access token**
   - Cliquez sur **Reveal token once** (Révéler le token une fois)
   - **COPIEZ LE NOUVEAU TOKEN** (commence par `shpat_` ou `shpca_`)
   - ⚠️ **Ne le partagez JAMAIS publiquement**

### B. Révocation Admin API Token (si utilisé)

Si vous utilisez l'Admin API pour des webhooks ou des opérations backend :

1. **Dans la même application** (ou créez-en une nouvelle pour Admin API)
2. **Configurez Admin API scopes**
   - Activez uniquement les permissions nécessaires
   - ⚠️ **Principe du moindre privilège**
3. **Récupérez le nouveau Admin API token**
4. **Mettez à jour les variables d'environnement**

---

## 🔥 ÉTAPE 2 : RÉVOCATION RESEND API KEY

### A. Connectez-vous à Resend

1. **Accédez au dashboard Resend**
   - URL : https://resend.com/dashboard
   - Connectez-vous avec vos identifiants

2. **Accédez aux API Keys**
   - Cliquez sur **API Keys** dans le menu
   - Trouvez la clé : `re_9tnawTCv_K3Pm6HQZ5bN4uTCppgNyHH92`

3. **Révoquez l'ancienne clé**
   - Cliquez sur **Delete** (Supprimer) ou **Revoke** (Révoquer)
   - Confirmez la révocation

4. **Créez une nouvelle API Key**
   - Cliquez sur **Create API Key**
   - Donnez un nom : `Jolananas Production 2026`
   - **COPIEZ LA NOUVELLE CLÉ** immédiatement
   - ⚠️ **Vous ne pourrez plus la voir après**

---

## 🔥 ÉTAPE 3 : MISE À JOUR DES VARIABLES D'ENVIRONNEMENT

### A. Variables locales (`.env.local`)

1. **Ouvrez le fichier** `app/frontend/.env.local`
2. **Remplacez les anciennes valeurs** par les nouvelles :

```env
# 🔑 NOUVELLES CREDENTIALS (Générées le 13/01/2026)

# Shopify Storefront API (NOUVEAU TOKEN)
SHOPIFY_STOREFRONT_TOKEN=votre_nouveau_token_ici
SHOPIFY_STORE_DOMAIN=u6ydbb-sx.myshopify.com
SHOPIFY_API_VERSION=2026-04

# Shopify Admin API (si utilisé)
SHOPIFY_ADMIN_TOKEN=votre_nouveau_admin_token_ici

# Resend API (NOUVELLE CLÉ)
RESEND_API_KEY=votre_nouvelle_resend_key_ici
NEWSLETTER_FROM_EMAIL=newsletter@jolananas.com
NEWSLETTER_TO_EMAIL=contact@jolananas.com

# Application
PORT=4647
NODE_ENV=production
```

3. **Sauvegardez le fichier**

### B. Variables Vercel (Production)

🔗 **Lien direct - Vercel Dashboard** : [https://vercel.com/dashboard](https://vercel.com/dashboard)

1. **Cliquez sur le lien ci-dessus** → Ouvre Vercel Dashboard
   - Sélectionnez le projet **Jolananas**

2. **Accédez aux Environment Variables**
   - 🔗 **Lien direct - Environment Variables** : [https://vercel.com/jolananas/settings/environment-variables](https://vercel.com/jolananas/settings/environment-variables)

3. **Mettez à jour chaque variable** :
   - `SHOPIFY_STOREFRONT_TOKEN` → Nouveau token
   - `SHOPIFY_ADMIN_TOKEN` → Nouveau token (si utilisé)
   - `RESEND_API_KEY` → Nouvelle clé

4. **Redeploy l'application**
   - 🔗 **Lien direct - Deployments** : [https://vercel.com/jolananas/deployments](https://vercel.com/jolananas/deployments)
   - Cliquez sur **Redeploy** sur le dernier déploiement (menu ⋮ à droite)
   - ⚠️ **Cela applique immédiatement les nouvelles clés**

---

## 🔥 ÉTAPE 4 : VÉRIFICATION POST-RÉVOCATION

### A. Test Storefront API

```bash
# Test avec curl (remplacez par votre nouveau token)
curl -X POST https://u6ydbb-sx.myshopify.com/api/2026-04/graphql.json \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Storefront-Access-Token: VOTRE_NOUVEAU_TOKEN" \
  -d '{"query": "{ shop { name } }"}'

# ✅ Succès = Réponse avec le nom de la boutique
# ❌ Erreur 401 = Token invalide (vérifiez la nouvelle clé)
```

### B. Test Resend API

```bash
# Test avec curl (remplacez par votre nouvelle clé)
curl -X POST https://api.resend.com/emails \
  -H "Authorization: Bearer VOTRE_NOUVELLE_CLE" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "newsletter@jolananas.com",
    "to": "contact@jolananas.com",
    "subject": "Test sécurité",
    "html": "<p>Test après révocation</p>"
  }'

# ✅ Succès = Email envoyé
# ❌ Erreur 401 = Clé invalide (vérifiez la nouvelle clé)
```

### C. Test du site en production

1. **Visitez** https://jolananas.com (ou votre domaine)
2. **Vérifiez** que les produits s'affichent correctement
3. **Testez** le processus de checkout
4. **Vérifiez** l'envoi d'emails (newsletter, commandes)

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
4. ✅ Suppression du fichier compromis de notre dépôt Git
5. ✅ Renforcement du .gitignore pour prévenir de futurs incidents
6. ✅ Tests de validation post-révocation réussis

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

## 🛡️ MESURES PRÉVENTIVES

### A. .gitignore renforcé

Le fichier `.gitignore` a été mis à jour pour bloquer :
- ✅ Tous les fichiers `.env*` (toutes variantes)
- ✅ Tous les fichiers `*backup*` et `*.backup`
- ✅ Tous les fichiers contenant `secret`, `credential`, `key`

### B. Vérification pré-commit

**Recommandation** : Installer un hook Git pour vérifier les fichiers sensibles avant chaque commit :

```bash
# Créer .git/hooks/pre-commit
#!/bin/bash
if git diff --cached --name-only | grep -E '\.(env|backup|secret|key|pem)$'; then
  echo "❌ ERREUR : Tentative de commit de fichiers sensibles !"
  echo "Les fichiers d'environnement et secrets ne peuvent pas être commités."
  exit 1
fi
```

### C. Audit régulier

**Recommandation** : Effectuer un audit mensuel :

```bash
# Vérifier les fichiers sensibles dans l'historique Git
git log --all --full-history --source -- "*env*" "*backup*" "*secret*"

# Vérifier les fichiers sensibles actuellement trackés
git ls-files | grep -E '\.(env|backup|secret|key|pem)$'
```

---

## 📞 SUPPORT

Si vous rencontrez des difficultés :

1. **Shopify Support** : Répondez à l'email de Shopify
2. **Documentation Shopify** : https://shopify.dev/docs/apps/tools/cli
3. **Resend Support** : https://resend.com/support

---

## ✅ CHECKLIST DE VALIDATION

Avant de considérer l'incident comme résolu, vérifiez :

- [ ] Ancien Storefront Token révoqué (app désinstallée)
- [ ] Nouvelle app Shopify créée avec nouveau token
- [ ] Ancien Admin Token révoqué (si utilisé)
- [ ] Nouveau Admin Token créé (si nécessaire)
- [ ] Ancienne clé Resend révoquée
- [ ] Nouvelle clé Resend créée
- [ ] Variables `.env.local` mises à jour
- [ ] Variables Vercel mises à jour
- [ ] Application Vercel redéployée
- [ ] Tests Storefront API réussis
- [ ] Tests Resend API réussis
- [ ] Site en production fonctionnel
- [ ] Fichier compromis supprimé de Git
- [ ] .gitignore renforcé
- [ ] Email de réponse à Shopify envoyé

---

**Date de création** : 13 Janvier 2026  
**Dernière mise à jour** : 13 Janvier 2026  
**Statut** : 🔴 URGENT - Action requise avant le 13 Janvier 2026
