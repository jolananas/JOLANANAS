# 🚨 ROTATION IMMÉDIATE DES CREDENTIALS - Action Urgente

> **Date** : 13 Janvier 2026  
> **Niveau** : CRITIQUE (Niveau 0)  
> **Application** : JOLANANAS (ID: 309550710785)

---

## 🔑 CREDENTIALS COMPROMIS (À RÉVOQUER)

**Client ID** : `a7385bb4625e6185cea682446401dafb`  
**Secret** : `shpss_[SECRET_COMPROMISED]`  
**Date de création** : 9 Janvier 2026, 2:40 AM  
**URL Dev Dashboard** : https://dev.shopify.com/dashboard/175998111/apps/309550710785

---

## ⚡ ACTION IMMÉDIATE : Rotation du Secret

### **ÉTAPE 1 : Rotation du Secret (2 minutes)**

🔗 **Lien direct** : [https://dev.shopify.com/dashboard/175998111/apps/309550710785/settings](https://dev.shopify.com/dashboard/175998111/apps/309550710785/settings)

1. **Cliquez sur le lien ci-dessus** → Ouvre directement la page Settings avec les Credentials
2. **Section "Credentials"** : Vous verrez le Secret actuel
3. **Cliquez sur le bouton "Rotate"** à côté du Secret
4. **Confirmez la rotation** : Shopify va générer un nouveau Secret
5. **⚠️ COPIEZ IMMÉDIATEMENT LE NOUVEAU SECRET** : Vous ne pourrez plus le voir après
6. **Sauvegardez-le** dans un endroit sécurisé (temporairement)

**Résultat** : L'ancien Secret `shpss_[SECRET_COMPROMISED]` est **immédiatement révoqué** et ne fonctionne plus.

---

## 🔄 ALTERNATIVE : Créer une Nouvelle Application (Si Rotation Impossible)

Si le bouton "Rotate" n'est pas disponible ou si vous préférez créer une nouvelle application :

### **ÉTAPE 1 : Créer une Nouvelle Application**

🔗 **Lien direct** : [https://dev.shopify.com/dashboard/175998111/apps](https://dev.shopify.com/dashboard/175998111/apps)

1. **Cliquez sur le lien ci-dessus** → Ouvre la liste des apps
2. **Cliquez sur** : "Create app" (bouton en haut à droite)
3. **Nom de l'app** : `Jolananas Web 2026` (ou similaire)
4. **Cliquez sur** : "Create app"

### **ÉTAPE 2 : Configurer les Permissions**

1. **Dans votre nouvelle app**, allez dans **"Configuration"**
2. **Configurez Admin API scopes** :
   - Activez les permissions nécessaires pour votre application
   - ⚠️ **Principe du moindre privilège** : Activez uniquement ce dont vous avez besoin

3. **Configurez Storefront API** (si utilisé) :
   - Activez les permissions Storefront API :
     - ✅ `unauthenticated_read_product_listings`
     - ✅ `unauthenticated_read_product_inventory`
     - ✅ `unauthenticated_read_collection_listings`
     - ✅ `unauthenticated_read_checkouts`
     - ✅ `unauthenticated_write_checkouts`
     - ✅ `unauthenticated_write_customers`
     - ✅ `unauthenticated_read_customers`

### **ÉTAPE 3 : Installer l'Application**

1. **Cliquez sur** : "Install app" (Installer l'app)
2. **Autorisez** toutes les permissions demandées
3. **Confirmez** l'installation

### **ÉTAPE 4 : Récupérer les Nouveaux Credentials**

1. **Allez dans** : "Settings" > "Credentials"
2. **Client ID** : Copiez le nouveau Client ID
3. **Secret** : Cliquez sur "Reveal token once" (Révéler le token une fois)
4. **⚠️ COPIEZ IMMÉDIATEMENT LE NOUVEAU SECRET**
5. **Storefront Access Token** (si utilisé) :
   - Allez dans "API credentials"
   - Faites défiler jusqu'à "Storefront API access token"
   - Cliquez sur "Reveal token once"
   - **COPIEZ LE TOKEN** (commence par `shpat_` ou `shpca_`)

---

## 📝 MISE À JOUR DES VARIABLES D'ENVIRONNEMENT

### **A. Variables Locales (`.env.local`)**

1. **Ouvrez** : `app/frontend/.env.local`
2. **Remplacez** les anciennes valeurs :

```env
# 🔑 NOUVELLES CREDENTIALS (Générées le 13/01/2026)

# Shopify App Credentials (NOUVEAUX)
SHOPIFY_CLIENT_ID=votre_nouveau_client_id_ici
SHOPIFY_CLIENT_SECRET=votre_nouveau_secret_ici

# Shopify Storefront API (si utilisé)
SHOPIFY_STOREFRONT_TOKEN=votre_nouveau_storefront_token_ici
SHOPIFY_STORE_DOMAIN=u6ydbb-sx.myshopify.com
SHOPIFY_API_VERSION=2026-04

# Application
PORT=4647
NODE_ENV=production
```

3. **Sauvegardez** le fichier

### **B. Variables Vercel (Production)**

🔗 **Lien direct - Dashboard Vercel** : [https://vercel.com/dashboard](https://vercel.com/dashboard)

1. **Cliquez sur le lien ci-dessus** → Ouvre le dashboard Vercel
2. **Sélectionnez** : Projet "Jolananas"
3. **Allez dans** : Settings > Environment Variables
   - 🔗 **Lien direct (si vous connaissez le projet ID)** : [https://vercel.com/jolananas/settings/environment-variables](https://vercel.com/jolananas/settings/environment-variables)
4. **Mettez à jour** chaque variable :
   - `SHOPIFY_CLIENT_ID` → Nouveau Client ID
   - `SHOPIFY_CLIENT_SECRET` → Nouveau Secret
   - `SHOPIFY_STOREFRONT_TOKEN` → Nouveau Storefront Token (si utilisé)
5. **Sauvegardez** les modifications

### **C. Redeploy Vercel**

🔗 **Lien direct - Deployments** : [https://vercel.com/jolananas/deployments](https://vercel.com/jolananas/deployments)

1. **Cliquez sur le lien ci-dessus** → Ouvre la liste des déploiements
2. **Cliquez sur** : "Redeploy" sur le dernier déploiement (menu ⋮ à droite)
3. **Sélectionnez** : "Use existing Build Cache" (optionnel)
4. **Cliquez sur** : "Redeploy"
5. **⚠️ Cela applique immédiatement les nouvelles clés**

---

## ✅ VÉRIFICATION POST-ROTATION

### **Test 1 : Vérifier que l'Ancien Secret ne Fonctionne Plus**

```bash
# Test avec l'ancien secret (doit échouer)
curl -X POST https://u6ydbb-sx.myshopify.com/admin/api/2026-04/graphql.json \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Access-Token: shpss_[SECRET_COMPROMISED]" \
  -d '{"query": "{ shop { name } }"}'

# ❌ Doit retourner une erreur 401 (Unauthorized)
```

### **Test 2 : Vérifier que le Nouveau Secret Fonctionne**

```bash
# Test avec le nouveau secret (doit réussir)
curl -X POST https://u6ydbb-sx.myshopify.com/admin/api/2026-04/graphql.json \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Access-Token: VOTRE_NOUVEAU_SECRET" \
  -d '{"query": "{ shop { name } }"}'

# ✅ Doit retourner une réponse avec le nom de la boutique
```

### **Test 3 : Vérifier le Site en Production**

1. **Visitez** : https://jolananas.com (ou votre domaine)
2. **Vérifiez** : Les produits s'affichent correctement
3. **Testez** : Le processus de checkout
4. **Vérifiez** : Les webhooks fonctionnent (si configurés)

---

## 📧 RÉPONSE À SHOPIFY

Une fois la rotation effectuée, répondez à l'email de Shopify :

```
Subject: Re: Action required: Security risk involving your app [Ticket: cf946ad7-231e-4ec8-a354-4f1bf012391f]

Bonjour Shopify Ecosystem Governance,

Nous avons bien reçu votre notification de sécurité concernant l'exposition 
des credentials API de notre application Jolananas Storefront API.

Actions effectuées :
1. ✅ Rotation immédiate du Secret compromis (shpss_[SECRET_COMPROMISED])
2. ✅ Génération d'un nouveau Secret sécurisé
3. ✅ Mise à jour des variables d'environnement (local et production)
4. ✅ Redeploy de l'application avec les nouvelles clés
5. ✅ Suppression du fichier compromis de notre dépôt Git
6. ✅ Renforcement du .gitignore pour prévenir de futurs incidents
7. ✅ Tests de validation post-rotation réussis

L'ancien Secret a été immédiatement révoqué et ne fonctionne plus. 
Tous les credentials exposés ont été remplacés par de nouvelles clés sécurisées.

Nous avons également mis en place des mesures préventives pour éviter 
ce type d'incident à l'avenir.

Merci de nous avoir alertés rapidement.

Cordialement,
[Votre nom]
Jolananas Admin
```

---

## ✅ CHECKLIST DE VALIDATION

- [ ] **Secret révoqué** : Bouton "Rotate" cliqué, nouveau Secret généré
- [ ] **Nouveau Secret copié** : Sauvegardé dans un endroit sécurisé
- [ ] **Variables locales** : `.env.local` mis à jour avec nouveau Secret
- [ ] **Variables Vercel** : Variables d'environnement mises à jour
- [ ] **Redeploy Vercel** : Application redéployée avec nouvelles clés
- [ ] **Test ancien Secret** : L'ancien Secret retourne 401 (révoqué)
- [ ] **Test nouveau Secret** : Le nouveau Secret fonctionne correctement
- [ ] **Site fonctionnel** : Site en production fonctionne avec nouvelles clés
- [ ] **Email Shopify** : Réponse envoyée confirmant la rotation

---

**Date de création** : 13 Janvier 2026  
**Dernière mise à jour** : 13 Janvier 2026  
**Statut** : 🔴 URGENT - Action requise immédiatement
