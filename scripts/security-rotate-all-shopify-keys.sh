#!/bin/bash

# 🚨 SCRIPT DE ROTATION COMPLÈTE - Toutes les clés Shopify
# ⚠️ Ce script révoque et recrée toutes les clés Shopify compromises

set -e

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PROJECT_DIR="/Volumes/Professionnel/CRÉATIVE AÏSSA/Entreprises/Jolananas/Site Web/Serveur"
ENV_FILE="${PROJECT_DIR}/app/frontend/.env.local"
BACKUP_DIR="${PROJECT_DIR}/_backup"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo -e "${RED}🚨 ROTATION COMPLÈTE DES CLÉS SHOPIFY${NC}"
echo -e "${YELLOW}⚠️  Ce script va :${NC}"
echo "   1. Créer un backup de .env.local"
echo "   2. Lister les apps Shopify existantes"
echo "   3. Révoquer les apps compromises"
echo "   4. Créer de nouvelles apps avec nouveaux tokens"
echo "   5. Mettre à jour .env.local avec les nouveaux tokens"
echo ""

# Vérifier que Shopify CLI est installé
if ! command -v shopify &> /dev/null; then
  echo -e "${RED}❌ Shopify CLI n'est pas installé${NC}"
  echo "Installation :"
  echo "  brew tap shopify/shopify"
  echo "  brew install shopify-cli"
  exit 1
fi

echo -e "${GREEN}✅ Shopify CLI trouvé${NC}"
echo ""

# Backup du .env.local
echo -e "${GREEN}📦 Étape 1 : Création du backup de .env.local...${NC}"
mkdir -p "${BACKUP_DIR}"
cp "${ENV_FILE}" "${BACKUP_DIR}/.env.local.backup-${TIMESTAMP}"
echo -e "${GREEN}✅ Backup créé : ${BACKUP_DIR}/.env.local.backup-${TIMESTAMP}${NC}"
echo ""

# Lire les clés actuelles
echo -e "${GREEN}🔍 Étape 2 : Analyse des clés compromises...${NC}"

# Extraire les clés Shopify du .env.local
SHOPIFY_STORE_DOMAIN=$(grep "^SHOPIFY_STORE_DOMAIN=" "${ENV_FILE}" | cut -d'=' -f2 | tr -d '"' | tr -d "'")
SHOPIFY_ADMIN_TOKEN=$(grep "^SHOPIFY_ADMIN_TOKEN=" "${ENV_FILE}" | cut -d'=' -f2 | tr -d '"' | tr -d "'")
SHOPIFY_STOREFRONT_TOKEN=$(grep "^SHOPIFY_STOREFRONT_TOKEN=" "${ENV_FILE}" | cut -d'=' -f2 | tr -d '"' | tr -d "'")
SHOPIFY_CLIENT_ID=$(grep "^SHOPIFY_CLIENT_ID=" "${ENV_FILE}" | cut -d'=' -f2 | tr -d '"' | tr -d "'")
SHOPIFY_CLIENT_SECRET=$(grep "^SHOPIFY_CLIENT_SECRET=" "${ENV_FILE}" | cut -d'=' -f2 | tr -d '"' | tr -d "'")
SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID=$(grep "^SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID=" "${ENV_FILE}" | cut -d'=' -f2 | tr -d '"' | tr -d "'")
SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET=$(grep "^SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET=" "${ENV_FILE}" | cut -d'=' -f2 | tr -d '"' | tr -d "'")

echo "Clés identifiées :"
echo "  - Store Domain: ${SHOPIFY_STORE_DOMAIN}"
echo "  - Admin Token: ${SHOPIFY_ADMIN_TOKEN:0:20}..."
echo "  - Storefront Token: ${SHOPIFY_STOREFRONT_TOKEN:0:20}..."
echo "  - Client ID: ${SHOPIFY_CLIENT_ID}"
echo "  - Client Secret: ${SHOPIFY_CLIENT_SECRET:0:20}..."
echo "  - Customer Account Client ID: ${SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID}"
echo "  - Customer Account Client Secret: ${SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET:0:20}..."
echo ""

# Vérifier la connexion Shopify CLI
echo -e "${GREEN}🔐 Étape 3 : Vérification de la connexion Shopify...${NC}"
if ! shopify auth status &> /dev/null; then
  echo -e "${YELLOW}⚠️  Non authentifié avec Shopify CLI${NC}"
  echo "Authentification requise..."
  shopify auth login
fi
echo -e "${GREEN}✅ Authentifié avec Shopify CLI${NC}"
echo ""

# Lister les apps existantes
echo -e "${GREEN}📋 Étape 4 : Liste des apps Shopify existantes...${NC}"
echo ""
echo -e "${BLUE}Apps dans le Dev Dashboard :${NC}"
shopify app list 2>&1 || echo "Impossible de lister les apps (peut nécessiter une authentification)"
echo ""

# Instructions pour la révocation manuelle
echo -e "${YELLOW}📝 ÉTAPES MANUELLES REQUISES :${NC}"
echo ""
echo "1. 🌐 Allez sur le Dev Dashboard :"
echo "   https://dev.shopify.com/dashboard/175998111/apps"
echo ""
echo "2. 🔄 Pour chaque app compromise, cliquez sur 'Rotate' dans Settings > Credentials"
echo ""
echo "3. 📋 Apps à révoquer/recréer :"
echo ""
echo "   a) App principale (Client ID: ${SHOPIFY_CLIENT_ID})"
echo "      → https://dev.shopify.com/dashboard/175998111/apps/309550710785/settings"
echo "      → Cliquez sur 'Rotate' pour le Secret"
echo ""
echo "   b) Customer Account API App (Client ID: ${SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID})"
echo "      → Trouvez l'app dans la liste et allez dans Settings > Credentials"
echo "      → Cliquez sur 'Rotate' pour le Secret"
echo ""
echo "4. 🆕 Créer de nouvelles apps si nécessaire :"
echo ""
echo "   Pour Storefront API :"
echo "   - Créez une nouvelle app 'Jolananas Storefront 2026'"
echo "   - Configurez Storefront API scopes"
echo "   - Installez l'app et récupérez le Storefront Access Token"
echo ""
echo "   Pour Admin API :"
echo "   - Créez une nouvelle app 'Jolananas Admin 2026'"
echo "   - Configurez Admin API scopes nécessaires"
echo "   - Installez l'app et récupérez l'Admin API Token"
echo ""
echo "5. 📝 Une fois les nouveaux tokens obtenus, exécutez :"
echo "   ./scripts/security-update-env-local.sh"
echo ""

# Créer un script de mise à jour
cat > "${PROJECT_DIR}/scripts/security-update-env-local.sh" << 'SCRIPT_EOF'
#!/bin/bash

# Script pour mettre à jour .env.local avec les nouveaux tokens
# Utilisez ce script après avoir obtenu les nouveaux tokens

set -e

ENV_FILE="app/frontend/.env.local"

echo "🔧 Mise à jour de .env.local avec les nouveaux tokens"
echo ""
read -p "Nouveau SHOPIFY_ADMIN_TOKEN: " NEW_ADMIN_TOKEN
read -p "Nouveau SHOPIFY_STOREFRONT_TOKEN: " NEW_STOREFRONT_TOKEN
read -p "Nouveau SHOPIFY_CLIENT_SECRET: " NEW_CLIENT_SECRET
read -p "Nouveau SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET: " NEW_CUSTOMER_SECRET

# Mettre à jour les tokens dans .env.local
sed -i.bak "s/^SHOPIFY_ADMIN_TOKEN=.*/SHOPIFY_ADMIN_TOKEN=${NEW_ADMIN_TOKEN}/" "${ENV_FILE}"
sed -i.bak "s/^SHOPIFY_STOREFRONT_TOKEN=.*/SHOPIFY_STOREFRONT_TOKEN=${NEW_STOREFRONT_TOKEN}/" "${ENV_FILE}"
sed -i.bak "s/^SHOPIFY_STOREFRONT_ACCESS_TOKEN=.*/SHOPIFY_STOREFRONT_ACCESS_TOKEN=${NEW_STOREFRONT_TOKEN}/" "${ENV_FILE}"
sed -i.bak "s/^SHOPIFY_CLIENT_SECRET=.*/SHOPIFY_CLIENT_SECRET=${NEW_CLIENT_SECRET}/" "${ENV_FILE}"
sed -i.bak "s/^SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET=.*/SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET=${NEW_CUSTOMER_SECRET}/" "${ENV_FILE}"

echo "✅ .env.local mis à jour"
echo "⚠️  N'oubliez pas de mettre à jour les variables Vercel également !"
SCRIPT_EOF

chmod +x "${PROJECT_DIR}/scripts/security-update-env-local.sh"

echo -e "${GREEN}✅ Script de mise à jour créé : scripts/security-update-env-local.sh${NC}"
echo ""
echo -e "${YELLOW}⚠️  IMPORTANT :${NC}"
echo "   - Les tokens doivent être révoqués manuellement via le Dev Dashboard"
echo "   - Shopify CLI ne peut pas révoquer directement les tokens"
echo "   - Utilisez le bouton 'Rotate' dans chaque app pour révoquer les secrets"
echo ""
echo -e "${GREEN}📖 Guide complet : docs/SECURITY-ROTATE-CREDENTIALS-NOW.md${NC}"
