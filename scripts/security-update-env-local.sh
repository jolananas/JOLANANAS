#!/bin/bash

# 🔧 Script de Mise à Jour Interactive de .env.local
# Utilisez ce script après avoir obtenu tous les nouveaux tokens Shopify

set -e

# Couleurs
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

PROJECT_DIR="/Volumes/Professionnel/CRÉATIVE AÏSSA/Entreprises/Jolananas/Site Web/Serveur"
ENV_FILE="${PROJECT_DIR}/app/frontend/.env.local"
BACKUP_DIR="${PROJECT_DIR}/_backup"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo -e "${BLUE}🔧 Mise à jour de .env.local avec les nouveaux tokens Shopify${NC}"
echo ""

# Backup
echo -e "${GREEN}📦 Création du backup...${NC}"
mkdir -p "${BACKUP_DIR}"
cp "${ENV_FILE}" "${BACKUP_DIR}/.env.local.backup-${TIMESTAMP}"
echo -e "${GREEN}✅ Backup créé : ${BACKUP_DIR}/.env.local.backup-${TIMESTAMP}${NC}"
echo ""

# Demander les nouveaux tokens
echo -e "${YELLOW}📝 Entrez les nouveaux tokens (appuyez sur Entrée pour garder l'ancien) :${NC}"
echo ""

read -p "Nouveau SHOPIFY_CLIENT_SECRET: " NEW_CLIENT_SECRET
if [ -n "$NEW_CLIENT_SECRET" ]; then
  sed -i.bak "s|^SHOPIFY_CLIENT_SECRET=.*|SHOPIFY_CLIENT_SECRET=${NEW_CLIENT_SECRET}|" "${ENV_FILE}"
  echo -e "${GREEN}✅ SHOPIFY_CLIENT_SECRET mis à jour${NC}"
fi

read -p "Nouveau SHOPIFY_STOREFRONT_TOKEN: " NEW_STOREFRONT_TOKEN
if [ -n "$NEW_STOREFRONT_TOKEN" ]; then
  sed -i.bak "s|^SHOPIFY_STOREFRONT_TOKEN=.*|SHOPIFY_STOREFRONT_TOKEN=${NEW_STOREFRONT_TOKEN}|" "${ENV_FILE}"
  sed -i.bak "s|^SHOPIFY_STOREFRONT_ACCESS_TOKEN=.*|SHOPIFY_STOREFRONT_ACCESS_TOKEN=${NEW_STOREFRONT_TOKEN}|" "${ENV_FILE}"
  echo -e "${GREEN}✅ SHOPIFY_STOREFRONT_TOKEN mis à jour${NC}"
fi

read -p "Nouveau SHOPIFY_ADMIN_TOKEN: " NEW_ADMIN_TOKEN
if [ -n "$NEW_ADMIN_TOKEN" ]; then
  sed -i.bak "s|^SHOPIFY_ADMIN_TOKEN=.*|SHOPIFY_ADMIN_TOKEN=${NEW_ADMIN_TOKEN}|" "${ENV_FILE}"
  echo -e "${GREEN}✅ SHOPIFY_ADMIN_TOKEN mis à jour${NC}"
fi

read -p "Nouveau SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET: " NEW_CUSTOMER_SECRET
if [ -n "$NEW_CUSTOMER_SECRET" ]; then
  sed -i.bak "s|^SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET=.*|SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET=${NEW_CUSTOMER_SECRET}|" "${ENV_FILE}"
  echo -e "${GREEN}✅ SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET mis à jour${NC}"
fi

read -p "Nouveau SHOPIFY_HEADLESS_PUBLIC_ACCESS_TOKEN (optionnel): " NEW_HEADLESS_PUBLIC
if [ -n "$NEW_HEADLESS_PUBLIC" ]; then
  sed -i.bak "s|^SHOPIFY_HEADLESS_PUBLIC_ACCESS_TOKEN=.*|SHOPIFY_HEADLESS_PUBLIC_ACCESS_TOKEN=${NEW_HEADLESS_PUBLIC}|" "${ENV_FILE}"
  echo -e "${GREEN}✅ SHOPIFY_HEADLESS_PUBLIC_ACCESS_TOKEN mis à jour${NC}"
fi

read -p "Nouveau SHOPIFY_HEADLESS_PRIVATE_ACCESS_TOKEN (optionnel): " NEW_HEADLESS_PRIVATE
if [ -n "$NEW_HEADLESS_PRIVATE" ]; then
  sed -i.bak "s|^SHOPIFY_HEADLESS_PRIVATE_ACCESS_TOKEN=.*|SHOPIFY_HEADLESS_PRIVATE_ACCESS_TOKEN=${NEW_HEADLESS_PRIVATE}|" "${ENV_FILE}"
  echo -e "${GREEN}✅ SHOPIFY_HEADLESS_PRIVATE_ACCESS_TOKEN mis à jour${NC}"
fi

# Nettoyer les fichiers .bak
rm -f "${ENV_FILE}.bak"

echo ""
echo -e "${GREEN}✅ .env.local mis à jour avec succès !${NC}"
echo ""
echo -e "${YELLOW}⚠️  PROCHAINES ÉTAPES :${NC}"
echo "   1. Mettez à jour les variables Vercel (Dashboard > Settings > Environment Variables)"
echo "   2. Redeploy l'application Vercel"
echo "   3. Testez que le site fonctionne avec les nouveaux tokens"
echo ""
