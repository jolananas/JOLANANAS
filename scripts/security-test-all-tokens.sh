#!/bin/bash

# 🧪 Script de Test de Tous les Tokens Shopify
# Teste que tous les nouveaux tokens fonctionnent correctement

set -e

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

ENV_FILE="app/frontend/.env.local"

# Charger les variables d'environnement
if [ -f "${ENV_FILE}" ]; then
  export $(grep -v '^#' "${ENV_FILE}" | grep SHOPIFY | xargs)
else
  echo -e "${RED}❌ Fichier .env.local non trouvé${NC}"
  exit 1
fi

STORE_DOMAIN="${SHOPIFY_STORE_DOMAIN}"
API_VERSION="${SHOPIFY_API_VERSION:-2026-04}"

echo -e "${YELLOW}🧪 Test de tous les tokens Shopify${NC}"
echo ""

# Test 1 : Storefront API
echo -e "${YELLOW}Test 1 : Storefront API...${NC}"
if [ -n "${SHOPIFY_STOREFRONT_TOKEN}" ]; then
  RESPONSE=$(curl -s -X POST "https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json" \
    -H "Content-Type: application/json" \
    -H "X-Shopify-Storefront-Access-Token: ${SHOPIFY_STOREFRONT_TOKEN}" \
    -d '{"query": "{ shop { name } }"}')
  
  if echo "${RESPONSE}" | grep -q "errors"; then
    echo -e "${RED}❌ Storefront API Token invalide${NC}"
    echo "   Réponse: ${RESPONSE}"
  else
    echo -e "${GREEN}✅ Storefront API Token valide${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  SHOPIFY_STOREFRONT_TOKEN non défini${NC}"
fi
echo ""

# Test 2 : Admin API
echo -e "${YELLOW}Test 2 : Admin API...${NC}"
if [ -n "${SHOPIFY_ADMIN_TOKEN}" ]; then
  RESPONSE=$(curl -s -X POST "https://${STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json" \
    -H "Content-Type: application/json" \
    -H "X-Shopify-Access-Token: ${SHOPIFY_ADMIN_TOKEN}" \
    -d '{"query": "{ shop { name } }"}')
  
  if echo "${RESPONSE}" | grep -q "errors"; then
    echo -e "${RED}❌ Admin API Token invalide${NC}"
    echo "   Réponse: ${RESPONSE}"
  else
    echo -e "${GREEN}✅ Admin API Token valide${NC}"
  fi
else
  echo -e "${YELLOW}⚠️  SHOPIFY_ADMIN_TOKEN non défini${NC}"
fi
echo ""

# Test 3 : Client Secret (via OAuth)
echo -e "${YELLOW}Test 3 : Client Secret (OAuth)...${NC}"
if [ -n "${SHOPIFY_CLIENT_SECRET}" ]; then
  echo -e "${GREEN}✅ Client Secret défini${NC}"
  echo "   (Test OAuth nécessite un flow complet)"
else
  echo -e "${YELLOW}⚠️  SHOPIFY_CLIENT_SECRET non défini${NC}"
fi
echo ""

# Test 4 : Customer Account API
echo -e "${YELLOW}Test 4 : Customer Account API...${NC}"
if [ -n "${SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET}" ]; then
  echo -e "${GREEN}✅ Customer Account API Client Secret défini${NC}"
  echo "   (Test OAuth nécessite un flow complet)"
else
  echo -e "${YELLOW}⚠️  SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET non défini${NC}"
fi
echo ""

echo -e "${GREEN}✅ Tests terminés${NC}"
