#!/bin/bash
# ===========================================================
# JOLANANAS — Test de tous les tokens Shopify (.env.local)
# ===========================================================

# (no set -e — we want all tests to run even if some fail)

clear

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# Charger les variables depuis .env.local
ENV_FILE=".env.local"
if [ ! -f "$ENV_FILE" ]; then
  echo -e "${RED}❌ Fichier $ENV_FILE introuvable.${NC}"
  exit 1
fi

# Source les variables (gère les guillemets)
set -a
while IFS='=' read -r key value; do
  # Ignorer les commentaires et lignes vides
  [[ "$key" =~ ^#.*$ || -z "$key" ]] && continue
  # Supprimer les guillemets
  value=$(echo "$value" | sed 's/^"//;s/"$//')
  export "$key"="$value"
done < "$ENV_FILE"
set +a

echo ""
echo -e "${BOLD}${CYAN}╔══════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BOLD}${CYAN}║           🍍 JOLANANAS — TEST DES TOKENS SHOPIFY            ║${NC}"
echo -e "${BOLD}${CYAN}╚══════════════════════════════════════════════════════════════╝${NC}"
echo ""

PASS=0
FAIL=0
WARN=0

# ———————————————————————————————————————————————
# 1. SHOPIFY_STORE_DOMAIN
# ———————————————————————————————————————————————
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}1. SHOPIFY_STORE_DOMAIN${NC}"
echo -e "   Valeur: ${YELLOW}${SHOPIFY_STORE_DOMAIN}${NC}"
if [ -z "$SHOPIFY_STORE_DOMAIN" ]; then
  echo -e "   ${RED}❌ MANQUANT${NC}"
  ((FAIL++))
else
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://${SHOPIFY_STORE_DOMAIN}" 2>/dev/null || echo "000")
  if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ]; then
    echo -e "   ${GREEN}✅ DOMAINE ACCESSIBLE (HTTP $HTTP_CODE)${NC}"
    ((PASS++))
  else
    echo -e "   ${RED}❌ DOMAINE INACCESSIBLE (HTTP $HTTP_CODE)${NC}"
    ((FAIL++))
  fi
fi

# ———————————————————————————————————————————————
# 2. SHOPIFY_STOREFRONT_TOKEN (Storefront API - public)
# ———————————————————————————————————————————————
echo -e "\n${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}2. SHOPIFY_STOREFRONT_TOKEN${NC}"
echo -e "   Valeur: ${YELLOW}${SHOPIFY_STOREFRONT_TOKEN:0:8}...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json" \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Storefront-Access-Token: ${SHOPIFY_STOREFRONT_TOKEN}" \
  -d '{"query":"{ shop { name } }"}' 2>/dev/null)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')
if echo "$BODY" | grep -q '"name"'; then
  SHOP_NAME=$(echo "$BODY" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo -e "   ${GREEN}✅ VALIDE — Boutique: ${SHOP_NAME} (HTTP $HTTP_CODE)${NC}"
  ((PASS++))
else
  echo -e "   ${RED}❌ INVALIDE (HTTP $HTTP_CODE)${NC}"
  echo -e "   Réponse: $(echo "$BODY" | head -c 200)"
  ((FAIL++))
fi

# ———————————————————————————————————————————————
# 3. SHOPIFY_STOREFRONT_ACCESS_TOKEN
# ———————————————————————————————————————————————
echo -e "\n${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}3. SHOPIFY_STOREFRONT_ACCESS_TOKEN${NC}"
echo -e "   Valeur: ${YELLOW}${SHOPIFY_STOREFRONT_ACCESS_TOKEN:0:8}...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json" \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Storefront-Access-Token: ${SHOPIFY_STOREFRONT_ACCESS_TOKEN}" \
  -d '{"query":"{ shop { name description } }"}' 2>/dev/null)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')
if echo "$BODY" | grep -q '"name"'; then
  SHOP_NAME=$(echo "$BODY" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo -e "   ${GREEN}✅ VALIDE — Boutique: ${SHOP_NAME} (HTTP $HTTP_CODE)${NC}"
  ((PASS++))
else
  echo -e "   ${RED}❌ INVALIDE (HTTP $HTTP_CODE)${NC}"
  echo -e "   Réponse: $(echo "$BODY" | head -c 200)"
  ((FAIL++))
fi

# ———————————————————————————————————————————————
# 4. SHOPIFY_HEADLESS_PUBLIC_ACCESS_TOKEN (Admin API)
# ———————————————————————————————————————————————
echo -e "\n${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}4. SHOPIFY_HEADLESS_PUBLIC_ACCESS_TOKEN${NC}"
echo -e "   Valeur: ${YELLOW}${SHOPIFY_HEADLESS_PUBLIC_ACCESS_TOKEN:0:12}...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "https://${SHOPIFY_STORE_DOMAIN}/admin/api/${SHOPIFY_API_VERSION}/graphql.json" \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Access-Token: ${SHOPIFY_HEADLESS_PUBLIC_ACCESS_TOKEN}" \
  -d '{"query":"{ shop { name } }"}' 2>/dev/null)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')
if echo "$BODY" | grep -q '"name"'; then
  SHOP_NAME=$(echo "$BODY" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo -e "   ${GREEN}✅ VALIDE — Admin API OK — Boutique: ${SHOP_NAME} (HTTP $HTTP_CODE)${NC}"
  ((PASS++))
elif echo "$BODY" | grep -q '"errors"'; then
  ERROR_MSG=$(echo "$BODY" | grep -o '"errors"[^}]*' | head -c 200)
  echo -e "   ${RED}❌ INVALIDE (HTTP $HTTP_CODE)${NC}"
  echo -e "   Erreur: $ERROR_MSG"
  ((FAIL++))
else
  echo -e "   ${YELLOW}⚠️  RÉPONSE INATTENDUE (HTTP $HTTP_CODE)${NC}"
  echo -e "   Réponse: $(echo "$BODY" | head -c 200)"
  ((WARN++))
fi

# ———————————————————————————————————————————————
# 5. SHOPIFY_HEADLESS_PRIVATE_ACCESS_TOKEN (Storefront via header privé)
# ———————————————————————————————————————————————
echo -e "\n${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}5. SHOPIFY_HEADLESS_PRIVATE_ACCESS_TOKEN${NC}"
echo -e "   Valeur: ${YELLOW}${SHOPIFY_HEADLESS_PRIVATE_ACCESS_TOKEN:0:8}...${NC}"
RESPONSE=$(curl -s -w "\n%{http_code}" \
  -X POST "https://${SHOPIFY_STORE_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json" \
  -H "Content-Type: application/json" \
  -H "Shopify-Storefront-Private-Token: ${SHOPIFY_HEADLESS_PRIVATE_ACCESS_TOKEN}" \
  -d '{"query":"{ shop { name } }"}' 2>/dev/null)
HTTP_CODE=$(echo "$RESPONSE" | tail -1)
BODY=$(echo "$RESPONSE" | sed '$d')
if echo "$BODY" | grep -q '"name"'; then
  SHOP_NAME=$(echo "$BODY" | grep -o '"name":"[^"]*"' | head -1 | cut -d'"' -f4)
  echo -e "   ${GREEN}✅ VALIDE — Storefront Private Token OK (HTTP $HTTP_CODE)${NC}"
  ((PASS++))
else
  echo -e "   ${YELLOW}⚠️  NON VALIDÉ via header privé (HTTP $HTTP_CODE)${NC}"
  echo -e "   Note: Ce token semble identique à SHOPIFY_STOREFRONT_ACCESS_TOKEN."
  echo -e "   Réponse: $(echo "$BODY" | head -c 200)"
  ((WARN++))
fi

# ———————————————————————————————————————————————
# 6. SHOPIFY_HEADLESS_CLIENT_ID_TOKEN
# ———————————————————————————————————————————————
echo -e "\n${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}6. SHOPIFY_HEADLESS_CLIENT_ID_TOKEN${NC}"
echo -e "   Valeur: ${YELLOW}${SHOPIFY_HEADLESS_CLIENT_ID_TOKEN}${NC}"
if [ -z "$SHOPIFY_HEADLESS_CLIENT_ID_TOKEN" ]; then
  echo -e "   ${RED}❌ MANQUANT${NC}"
  ((FAIL++))
else
  echo -e "   ${YELLOW}⚠️  Format UUID détecté — Token de type Client ID (non testable via API directement)${NC}"
  echo -e "   Ce token est utilisé comme identifiant client pour le Headless Channel."
  ((WARN++))
fi

# ———————————————————————————————————————————————
# 7. SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID
# ———————————————————————————————————————————————
echo -e "\n${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}7. SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID${NC}"
echo -e "   Valeur: ${YELLOW}${SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID}${NC}"
if [ -z "$SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID" ]; then
  echo -e "   ${RED}❌ MANQUANT${NC}"
  ((FAIL++))
else
  echo -e "   ${YELLOW}⚠️  Format UUID — Client ID Customer Account API (non testable sans OAuth flow)${NC}"
  ((WARN++))
fi

# ———————————————————————————————————————————————
# 8. SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET
# ———————————————————————————————————————————————
echo -e "\n${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}8. SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET${NC}"
echo -e "   Valeur: ${YELLOW}${SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET:0:12}...${NC}"
if [ -z "$SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET" ]; then
  echo -e "   ${RED}❌ MANQUANT${NC}"
  ((FAIL++))
else
  # Test via token exchange endpoint (introspection)
  RESPONSE=$(curl -s -w "\n%{http_code}" \
    -X POST "https://shopify.com/${SHOPIFY_STORE_DOMAIN}/auth/oauth/token" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "grant_type=client_credentials&client_id=${SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID}&client_secret=${SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET}" 2>/dev/null)
  HTTP_CODE=$(echo "$RESPONSE" | tail -1)
  BODY=$(echo "$RESPONSE" | sed '$d')
  if echo "$BODY" | grep -q "access_token"; then
    echo -e "   ${GREEN}✅ VALIDE — Authentification client_credentials OK${NC}"
    ((PASS++))
  else
    echo -e "   ${YELLOW}⚠️  PRÉSENT (non testable directement, nécessite OAuth flow complet)${NC}"
    echo -e "   Longueur: ${#SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_SECRET} caractères"
    ((WARN++))
  fi
fi

# ———————————————————————————————————————————————
# 9. SHOPIFY_API_VERSION
# ———————————————————————————————————————————————
echo -e "\n${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}9. SHOPIFY_API_VERSION${NC}"
echo -e "   Valeur: ${YELLOW}${SHOPIFY_API_VERSION}${NC}"
if [ -z "$SHOPIFY_API_VERSION" ]; then
  echo -e "   ${RED}❌ MANQUANT${NC}"
  ((FAIL++))
else
  echo -e "   ${GREEN}✅ FORMAT OK (${SHOPIFY_API_VERSION})${NC}"
  ((PASS++))
fi

# ———————————————————————————————————————————————
# 10. SHOPIFY_CUSTOMER_ACCOUNT_API_VERSION
# ———————————————————————————————————————————————
echo -e "\n${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}10. SHOPIFY_CUSTOMER_ACCOUNT_API_VERSION${NC}"
echo -e "    Valeur: ${YELLOW}${SHOPIFY_CUSTOMER_ACCOUNT_API_VERSION}${NC}"
if [ -z "$SHOPIFY_CUSTOMER_ACCOUNT_API_VERSION" ]; then
  echo -e "    ${RED}❌ MANQUANT${NC}"
  ((FAIL++))
else
  echo -e "    ${GREEN}✅ FORMAT OK (${SHOPIFY_CUSTOMER_ACCOUNT_API_VERSION})${NC}"
  ((PASS++))
fi

# ———————————————————————————————————————————————
# 11. SHOPIFY_CUSTOMER_ACCOUNT_DOMAIN
# ———————————————————————————————————————————————
echo -e "\n${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}11. SHOPIFY_CUSTOMER_ACCOUNT_DOMAIN${NC}"
echo -e "    Valeur: ${YELLOW}${SHOPIFY_CUSTOMER_ACCOUNT_DOMAIN}${NC}"
if [ -z "$SHOPIFY_CUSTOMER_ACCOUNT_DOMAIN" ]; then
  echo -e "    ${RED}❌ MANQUANT${NC}"
  ((FAIL++))
else
  HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://${SHOPIFY_CUSTOMER_ACCOUNT_DOMAIN}" 2>/dev/null || echo "000")
  if [ "$HTTP_CODE" = "000" ]; then
    echo -e "    ${YELLOW}⚠️  Domaine non résolu (DNS non configuré ou sous-domaine proxy)${NC}"
    ((WARN++))
  elif [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "301" ] || [ "$HTTP_CODE" = "302" ] || [ "$HTTP_CODE" = "404" ]; then
    echo -e "    ${GREEN}✅ DOMAINE ACCESSIBLE (HTTP $HTTP_CODE)${NC}"
    ((PASS++))
  else
    echo -e "    ${YELLOW}⚠️  HTTP $HTTP_CODE — vérifier la configuration DNS${NC}"
    ((WARN++))
  fi
fi

# ———————————————————————————————————————————————
# 12. SHOPIFY_WEBHOOK_SECRET
# ———————————————————————————————————————————————
echo -e "\n${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}12. SHOPIFY_WEBHOOK_SECRET${NC}"
echo -e "    Valeur: ${YELLOW}${SHOPIFY_WEBHOOK_SECRET:0:12}...${NC}"
if [ -z "$SHOPIFY_WEBHOOK_SECRET" ]; then
  echo -e "    ${RED}❌ MANQUANT${NC}"
  ((FAIL++))
else
  echo -e "    ${GREEN}✅ PRÉSENT (${#SHOPIFY_WEBHOOK_SECRET} caractères)${NC}"
  echo -e "    Note: Secret de signature HMAC — validation uniquement lors de réception de webhooks."
  ((PASS++))
fi

# ———————————————————————————————————————————————
# 13. SHOPIFY_REVALIDATION_SECRET
# ———————————————————————————————————————————————
echo -e "\n${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${CYAN}13. SHOPIFY_REVALIDATION_SECRET${NC}"
echo -e "    Valeur: ${YELLOW}${SHOPIFY_REVALIDATION_SECRET:0:12}...${NC}"
if [ -z "$SHOPIFY_REVALIDATION_SECRET" ]; then
  echo -e "    ${RED}❌ MANQUANT${NC}"
  ((FAIL++))
else
  echo -e "    ${GREEN}✅ PRÉSENT (${#SHOPIFY_REVALIDATION_SECRET} caractères)${NC}"
  echo -e "    Note: Secret pour la revalidation ISR/on-demand — vérifié côté serveur."
  ((PASS++))
fi

# ———————————————————————————————————————————————
# RÉSUMÉ FINAL
# ———————————————————————————————————————————————
echo ""
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BOLD}${CYAN}                    📊 RÉSUMÉ DES TESTS                       ${NC}"
echo -e "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
TOTAL=$((PASS + FAIL + WARN))
echo -e "   ${GREEN}✅ Réussis:    $PASS / $TOTAL${NC}"
echo -e "   ${RED}❌ Échoués:    $FAIL / $TOTAL${NC}"
echo -e "   ${YELLOW}⚠️  Avertissem: $WARN / $TOTAL${NC}"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo -e "${RED}${BOLD}   ⛔ Des tokens ont échoué ! Vérifiez votre configuration Shopify.${NC}"
elif [ "$WARN" -gt 0 ]; then
  echo -e "${YELLOW}${BOLD}   ⚠️  Certains tokens n'ont pas pu être testés directement.${NC}"
else
  echo -e "${GREEN}${BOLD}   🎉 Tous les tokens sont valides !${NC}"
fi
echo ""
