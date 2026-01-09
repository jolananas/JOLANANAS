# 🚨 GUIDE COMPLET - Rotation de TOUTES les Clés Shopify Compromises

> **Date** : 13 Janvier 2026  
> **Niveau** : CRITIQUE (Niveau 0)  
> **Fichier compromis** : `app/frontend/.env.local`

---

## 📋 CLÉS COMPROMISES IDENTIFIÉES

D'après l'analyse de `.env.local`, les clés suivantes sont compromises et doivent être révoquées :

### **1. App Principale (Dev Dashboard)**
- **Client ID** : `a7385bb4625e6185cea682446401dafb`
- **Secret** : `shpss_[SECRET_COMPROMISED]`
- **URL** : https://dev.shopify.com/dashboard/175998111/apps/309550710785/settings

### **2. Admin API Token**
- **Token** : `shpat_[TOKEN_COMPROMISED]`
- **Source** : App principale ou app séparée

### **3. Storefront API Token**
- **Token** : `[STOREFRONT_TOKEN_COMPROMISED]`
- **Token alternatif** : `[STOREFRONT_TOKEN_COMPROMISED]` (même valeur)

### **4. Headless Tokens**
- **Public Token** : `shpat_[HEADLESS_PUBLIC_COMPROMISED]`
- **Private Token** : `[HEADLESS_PRIVATE_COMPROMISED]`

### **5. Customer Account API**
- **Client ID** : `427578ae-e7aa-486d-b31f-f291afa38815`
- **Client Secret** : `[CUSTOMER_ACCOUNT_SECRET_COMPROMISED]`

---

## 🔥 PLAN D'ACTION - Rotation Complète

### **ÉTAPE 1 : Révocation de l'App Principale**

🔗 **Lien direct** : [https://dev.shopify.com/dashboard/175998111/apps/309550710785/settings](https://dev.shopify.com/dashboard/175998111/apps/309550710785/settings)

1. **Cliquez sur le lien ci-dessus** → Ouvre directement la page Settings de l'app
2. **Section "Credentials"** :
   - **Client ID** : `a7385bb4625e6185cea682446401dafb` (ne change pas)
   - **Secret** : `shpss_[SECRET_COMPROMISED]` → **Cliquez sur "Rotate"**
3. **Copiez le nouveau Secret** immédiatement
4. **Sauvegardez-le** temporairement

---

### **ÉTAPE 2 : Révocation/Création Storefront API Token**

#### **Option A : Si le token vient de l'app principale**

🔗 **Lien direct** : [https://dev.shopify.com/dashboard/175998111/apps/309550710785](https://dev.shopify.com/dashboard/175998111/apps/309550710785)

1. **Cliquez sur le lien ci-dessus** → Ouvre l'app principale
2. **Allez dans** : "Configuration" > "Storefront API access"
3. **Si le token est là** :
   - Désinstallez l'app
   - Réinstallez l'app
   - Récupérez le nouveau Storefront Access Token

#### **Option B : Créer une nouvelle app dédiée (Recommandé)**

🔗 **Lien direct** : [https://dev.shopify.com/dashboard/175998111/apps](https://dev.shopify.com/dashboard/175998111/apps)

1. **Cliquez sur le lien ci-dessus** → Ouvre la liste des apps
2. **Cliquez sur** : "Create app" (bouton en haut à droite)
3. **Nom** : `Jolananas Storefront 2026`
4. **Configurez Storefront API** :
   - Activez les permissions :
     - ✅ `unauthenticated_read_product_listings`
     - ✅ `unauthenticated_read_product_inventory`
     - ✅ `unauthenticated_read_collection_listings`
     - ✅ `unauthenticated_read_checkouts`
     - ✅ `unauthenticated_write_checkouts`
     - ✅ `unauthenticated_write_customers`
     - ✅ `unauthenticated_read_customers`
4. **Installez l'app**
5. **Récupérez le Storefront Access Token** (commence par `shpat_` ou `shpca_`)

---

### **ÉTAPE 3 : Révocation/Création Admin API Token**

#### **Option A : Si le token vient de l'app principale**

🔗 **Lien direct** : [https://dev.shopify.com/dashboard/175998111/apps/309550710785](https://dev.shopify.com/dashboard/175998111/apps/309550710785)

1. **Cliquez sur le lien ci-dessus** → Ouvre l'app principale
2. **Allez dans** : "Configuration" > "Admin API access"
3. **Configurez les scopes** :
   - ✅ `write_draft_orders`
   - ✅ `read_customers`
   - ✅ `write_customers`
   - ✅ Autres permissions nécessaires
4. **Désinstallez puis réinstallez l'app**
5. **Récupérez le nouveau Admin API Token**

#### **Option B : Créer une nouvelle app dédiée (Recommandé)**

🔗 **Lien direct** : [https://dev.shopify.com/dashboard/175998111/apps](https://dev.shopify.com/dashboard/175998111/apps)

1. **Cliquez sur le lien ci-dessus** → Ouvre la liste des apps
2. **Cliquez sur** : "Create app" (bouton en haut à droite)
3. **Nom** : `Jolananas Admin 2026`
4. **Configurez Admin API** :
   - Activez les scopes nécessaires
4. **Installez l'app**
5. **Récupérez l'Admin API Token**

---

### **ÉTAPE 4 : Révocation Customer Account API**

🔗 **Lien direct - Liste des apps** : [https://dev.shopify.com/dashboard/175998111/apps](https://dev.shopify.com/dashboard/175998111/apps)

1. **Cliquez sur le lien ci-dessus** → Ouvre la liste des apps
2. **Trouvez l'app Customer Account** avec **Client ID** : `427578ae-e7aa-486d-b31f-f291afa38815`
3. **Cliquez sur l'app** → Ouvre la page de l'app
4. **Allez dans** : Settings > Credentials
5. **Cliquez sur "Rotate"** pour le Secret
6. **Copiez le nouveau Secret**

---

### **ÉTAPE 5 : Headless Tokens (Si utilisés)**

Si vous utilisez des tokens Headless séparés :

1. **Identifiez l'app source** de ces tokens
2. **Révoquez les tokens** via l'app correspondante
3. **Créez de nouveaux tokens** si nécessaire

---

## 🔧 MISE À JOUR AUTOMATIQUE DE .env.local

Une fois tous les nouveaux tokens obtenus, utilisez le script interactif :

```bash
cd "/Volumes/Professionnel/CRÉATIVE AÏSSA/Entreprises/Jolananas/Site Web/Serveur"
./scripts/security-update-env-local.sh
```

Le script vous demandera chaque nouveau token et mettra à jour automatiquement `.env.local`.

---

## 📝 MISE À JOUR MANUELLE (Alternative)

Si vous préférez mettre à jour manuellement, ouvrez `app/frontend/.env.local` et remplacez :

```env
# 🔑 NOUVELLES CREDENTIALS (Générées le 13/01/2026)

# App Principale
SHOPIFY_CLIENT_ID=a7385bb4625e6185cea682446401dafb
SHOPIFY_CLIENT_SECRET=votre_nouveau_secret_ici

# Storefront API
SHOPIFY_STOREFRONT_TOKEN=votre_nouveau_storefront_token_ici
SHOPIFY_STOREFRONT_ACCESS_TOKEN=votre_nouveau_storefront_token_ici

# Admin API
SHOPIFY_ADMIN_TOKEN=votre_nouveau_admin_token_ici

# Customer Account API
SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID=427578ae-e7aa-486d-b31f-f291afa38815
SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET=votre_nouveau_customer_secret_ici

# Headless (si utilisé)
SHOPIFY_HEADLESS_PUBLIC_ACCESS_TOKEN=votre_nouveau_headless_public_token_ici
SHOPIFY_HEADLESS_PRIVATE_ACCESS_TOKEN=votre_nouveau_headless_private_token_ici
```

---

## ✅ VÉRIFICATION POST-ROTATION

### Test 1 : Storefront API

```bash
curl -X POST https://u6ydbb-sx.myshopify.com/api/2026-04/graphql.json \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Storefront-Access-Token: VOTRE_NOUVEAU_STOREFRONT_TOKEN" \
  -d '{"query": "{ shop { name } }"}'
```

### Test 2 : Admin API

```bash
curl -X POST https://u6ydbb-sx.myshopify.com/admin/api/2026-04/graphql.json \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Access-Token: VOTRE_NOUVEAU_ADMIN_TOKEN" \
  -d '{"query": "{ shop { name } }"}'
```

### Test 3 : Customer Account API

```bash
# Test OAuth avec les nouveaux credentials
# (nécessite un flow OAuth complet)
```

---

## 📧 RÉPONSE À SHOPIFY

Une fois toutes les clés révoquées et remplacées :

```
Subject: Re: Action required: Security risk involving your app [Ticket: cf946ad7-231e-4ec8-a354-4f1bf012391f]

Bonjour Shopify Ecosystem Governance,

Nous avons bien reçu votre notification de sécurité concernant l'exposition 
des credentials API de notre application Jolananas Storefront API.

Actions effectuées :
1. ✅ Rotation de tous les secrets compromis (App principale, Customer Account API)
2. ✅ Création de nouvelles apps pour Storefront API et Admin API
3. ✅ Révocation de tous les tokens compromis
4. ✅ Mise à jour des variables d'environnement (local et production)
5. ✅ Suppression du fichier compromis de notre dépôt Git
6. ✅ Tests de validation post-rotation réussis

Tous les credentials exposés ont été révoqués et remplacés par de nouvelles 
clés sécurisées. Le fichier env.backup a été supprimé de notre dépôt.

Merci de nous avoir alertés rapidement.

Cordialement,
[Votre nom]
Jolananas Admin
```

---

**Date de création** : 13 Janvier 2026  
**Statut** : 🔴 URGENT - Action requise immédiatement
