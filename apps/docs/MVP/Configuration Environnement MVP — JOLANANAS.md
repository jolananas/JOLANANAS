# 🔧 Configuration Variables Environnement MVP

## 📋 Variables Obligatoires

Créez le fichier `frontend/variables/.env.local` avec :

```bash
# SHOPIFY CONFIGURATION (OBLIGATOIRE)
SHOPIFY_STORE_DOMAIN=votre-boutique.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=votre_storefront_access_token_ici  
SHOPIFY_API_VERSION=2025-01
SHOPIFY_STORE_DOMAIN=votre-boutique.myshopify.com

# APP SETTINGS (OPTIONNEL)
NODE_ENV=development
DOMAIN_URL=https://jolananas.com
DEBUG_MODE=true
```

## 🔑 Comment Obtenir Vos Tokens Shopify

### 1. Accédez à votre Admin Shopify

➤ <https://votre-boutique.myshopify.com/admin>

### 2. Créez une App de Développement

➤ Apps → Develop apps → Create an app
➤ Nom: "JOLANANAS Storefront"
➤ Développeur: Vous

### 3. Configurez l'API Storefront

➤ Configuration → Storefront API access
➤ Activez les permissions:

- ✅ unauthenticated_read_product_listings
- ✅ unauthenticated_write_checkouts  
- ✅ unauthenticated_read_checkouts

### 4. Installez votre App

➤ Configuration → Install app
➤ Autorisez toutes les permissions

### 5. Récupérez le Token

```bash
# Dans Configuration → Storefront API access
# Copiez le "Storefront access token"
SHOPIFY_STOREFRONT_TOKEN=gid://shopify/AccessToken/votre_token_ici
```

## 🧪 Test de Configuration

```bash
# Test automatique avec curl  
curl -H "X-Shopify-Storefront-Access-Token: $SHOPIFY_STOREFRONT_TOKEN" \
     "https://$SHOPIFY_STORE_DOMAIN/api/2024-04/graphql.json" \
     -d '{"query": "query { products(first: 1) { edges { node { id title } } } }"}'

# ✅ Succès = Réponse avec données produits
# ❌ Erreur 401/403 = Token invalide
```

## 🚀 Démarrage MVP

```bash
# Une fois configuré :
cd app
./scripts/mvp-start.sh

# Ou manuellement :
cd frontend
npm install
npm run dev
```

## 📞 Support

Problèmes ? Contact: <contact@jolananas.com>
