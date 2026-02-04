#!/bin/bash

# 🚨 SCRIPT DE NETTOYAGE COMPLET - Suppression du Dépôt et Recréation
# ⚠️ ATTENTION : Ce script supprime complètement l'historique Git et recrée un dépôt propre
# ⚠️ À UTILISER UNIQUEMENT si vous voulez supprimer TOUT l'historique compromis

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${RED}🚨 SCRIPT DE NETTOYAGE COMPLET DU DÉPÔT GIT${NC}"
echo -e "${YELLOW}⚠️  Ce script va :${NC}"
echo "   1. Créer un backup complet du code (sans .git)"
echo "   2. Supprimer le dépôt Git local (.git)"
echo "   3. Initialiser un nouveau dépôt Git propre"
echo "   4. Créer un commit initial propre"
echo ""
echo -e "${RED}⚠️  ATTENTION : Cette action est IRRÉVERSIBLE${NC}"
echo ""

# Demander confirmation
read -p "Êtes-vous sûr de vouloir continuer ? (tapez 'OUI' en majuscules) : " confirmation

if [ "$confirmation" != "OUI" ]; then
  echo -e "${YELLOW}❌ Opération annulée${NC}"
  exit 1
fi

# Variables
PROJECT_DIR="/Volumes/Professionnel/CRÉATIVE AÏSSA/Entreprises/Jolananas/Site Web/Serveur"
BACKUP_DIR="${PROJECT_DIR}/_backup"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_CODE_DIR="${BACKUP_DIR}/code-clean-${TIMESTAMP}"

echo ""
echo -e "${GREEN}📦 Étape 1 : Création du backup du code...${NC}"

# Créer le dossier de backup
mkdir -p "${BACKUP_CODE_DIR}"

# Copier tous les fichiers sauf .git et fichiers sensibles
rsync -av --progress \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.next' \
  --exclude='out' \
  --exclude='dist' \
  --exclude='build' \
  --exclude='*.env*' \
  --exclude='*backup*' \
  --exclude='*.log' \
  --exclude='.pnpm-store' \
  --exclude='.DS_Store' \
  "${PROJECT_DIR}/" "${BACKUP_CODE_DIR}/"

echo -e "${GREEN}✅ Backup créé dans : ${BACKUP_CODE_DIR}${NC}"
echo ""

echo -e "${GREEN}🗑️  Étape 2 : Suppression du dépôt Git...${NC}"

# Supprimer le dépôt Git
cd "${PROJECT_DIR}"
rm -rf .git

echo -e "${GREEN}✅ Dépôt Git supprimé${NC}"
echo ""

echo -e "${GREEN}🆕 Étape 3 : Initialisation d'un nouveau dépôt Git...${NC}"

# Initialiser un nouveau dépôt Git
git init
git branch -M main

echo -e "${GREEN}✅ Nouveau dépôt Git initialisé${NC}"
echo ""

echo -e "${GREEN}🔍 Étape 4 : Vérification du .gitignore...${NC}"

# Vérifier que .gitignore contient les patterns de sécurité
if grep -q "env.backup\|\.env\|\.backup" .gitignore 2>/dev/null; then
  echo -e "${GREEN}✅ .gitignore contient les patterns de sécurité${NC}"
else
  echo -e "${YELLOW}⚠️  .gitignore ne contient pas tous les patterns de sécurité${NC}"
  echo "   Vérifiez manuellement le fichier .gitignore"
fi
echo ""

echo -e "${GREEN}📝 Étape 5 : Ajout des fichiers au nouveau dépôt...${NC}"

# Ajouter tous les fichiers (le .gitignore bloquera les fichiers sensibles)
git add .

echo -e "${GREEN}✅ Fichiers ajoutés${NC}"
echo ""

echo -e "${GREEN}💾 Étape 6 : Création du commit initial...${NC}"

# Créer le commit initial
git commit -m "chore: initial commit - security hardened repository

- Removed all sensitive files from history
- Hardened .gitignore to prevent credential exposure
- Clean repository start after security incident
- Ticket: cf946ad7-231e-4ec8-a354-4f1bf012391f"

echo -e "${GREEN}✅ Commit initial créé${NC}"
echo ""

echo -e "${YELLOW}📋 PROCHAINES ÉTAPES MANUELLES :${NC}"
echo ""
echo "1. ⚠️  SUPPRIMER L'ANCIEN DÉPÔT SUR GITHUB :"
echo "   - Allez sur https://github.com/jolananas/JOLANANAS/settings"
echo "   - Scroll jusqu'à 'Danger Zone'"
echo "   - Cliquez sur 'Delete this repository'"
echo "   - Confirmez la suppression"
echo ""
echo "2. 🆕 CRÉER UN NOUVEAU DÉPÔT SUR GITHUB :"
echo "   - Allez sur https://github.com/new"
echo "   - Nom : JOLANANAS"
echo "   - Visibilité : Private (recommandé) ou Public"
echo "   - Ne pas initialiser avec README, .gitignore, ou license"
echo ""
echo "3. 🔗 AJOUTER LE REMOTE ET PUSH :"
echo "   git remote add origin https://github.com/jolananas/JOLANANAS.git"
echo "   git push -u origin main --force"
echo ""
echo "4. ✅ VÉRIFICATION :"
echo "   - Le lien https://github.com/jolananas/JOLANANAS/blob/ac4d463a2f83b70f3fe5bf8d1eb8b6158b329c18/apps/frontend/env.backup"
echo "     doit maintenant retourner une erreur 404"
echo ""
echo -e "${GREEN}✅ Nettoyage local terminé !${NC}"
echo -e "${YELLOW}⚠️  N'oubliez pas de suivre les étapes manuelles ci-dessus${NC}"
