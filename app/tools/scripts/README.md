# 🚀 Script de Démarrage JOLANANAS v2.0 Enhanced

Script professionnel pour démarrer votre serveur Shopify JOLANANAS avec toutes les vérifications et optimisations nécessaires.

## ✨ Fonctionnalités Principales

### 🔧 **Gestion Intelligente des Ports**

- **Détection automatique** des ports disponibles (3000, 3001, 3002...)
- **Gestion des conflits** avec services existants
- **Flexibilité** selon configuration projet

### 🏥 **Système de Santé**

- **Vérifications automatiques** des services après démarrage
- **Health checks** avec timeouts configurables
- **Diagnostic temps réel** des services

### 📊 **Logging Avancé**

- **Fichiers de logs** séparés (startup.log, error.log)
- **Rotation automatique** des logs anciens
- **Niveaux de log** configurables (INFO, WARNING, ERROR)

### 🛡️ **Vérifications Shopify**

- **Validation automatique** des variables d'environnement
- **Création assistée** de variables/.env.local depuis variables/.env.example
- **Vérification tokens** Storefront et Admin API

### 🏗️ **Support Multi-Architecture**

- **Turbo monorepo** optimisé
- **pnpm workspace** natif
- **npm standard** avec fallback
- **Détection automatique** du type projet

### 🧹 **Nettoyage Intelligent**

- **Arrêt processus** précédents automatique
- **Nettoyage cache** (.next, node_modules/.cache)
- **Gestion mémoire** optimisée

## 🎯 Modes de Démarrage

### Mode Interactif

```bash
./tools/scripts/start.sh
```

Menu interactif avec 6 options :

1. **Développement** - Serveur Next.js standard
2. **Développement parallèle** - Frontend + API simultanés
3. **Build production** - Construction optimisée
4. **Production** - Serveur de production
5. **Debug** - Mode surveillance avec auto-reload
6. **Simple** - Démarrage direct legacy

### Commandes Rapides

```bash
# Démarrage complet (recommandé)
./tools/scripts/start.sh all

# Mode développement parallèle (Frontend + API)
./tools/scripts/start.sh parallel

# Mode debug avec surveillance fichiers
./tools/scripts/start.sh debug

# Mode Turbo monorepo optimisé
./tools/scripts/start.sh turbo

# Build de production
./tools/scripts/start.sh build
```

### Commandes de Gestion

```bash
# Vérifier santé des services
./tools/scripts/start.sh health

# Lister ports utilisés
./tools/scripts/start.sh ports

# Afficher logs récents
./tools/scripts/start.sh logs

# Nettoyage complet
./tools/scripts/start.sh clean

# Aide complète
./tools/scripts/start.sh help
```

## ⚙️ Configuration

### Fichier `.jolananasrc`

Créez un fichier `variables/.jolananasrc` pour personnaliser :

```bash
# Ports personnalisés
DEFAULT_PORT=4000
DEFAULT_API_PORT=4001

# Logging
LOG_LEVEL=DEBUG
LOG_MAX_FILES=10

# Surveillance debug
DEBUG_WATCH_DIRS=(src components)
```

### Variables Environnement Shopify

Le script vérifie et vous aide à configurer :

```bash
SHOPIFY_STORE_DOMAIN=votre-boutique.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=votre_token_storefront
SHOPIFY_ADMIN_API_TOKEN=votre_token_admin  # Optionnel
```

## 🏛️ Architecture Détectée

Le script détecte automatiquement votre architecture :

### ✅ **Monorepo Turbo**$

```md
variables/turbo.json + app/frontend/ détecté
→ Démarrage optimisé avec pnpm workspace
→ Gestion des dépendances croisées
```

### ✅ **pnpm Workspace**

```md
pnpm-workspace.yaml détecté
→ Démarrage natif pnpm
→ Partage cache optimisé
```

### ✅ **npm Standard**

```md
variables/package.json simple détecté
→ Démarrage npm classique
→ Compatibilité maximale
```

## 📋 Flux de Vérification

1. **🔍 Prérequis Système**
   - Node.js >= 16.0.0
   - npm >= 8.0.0
   - Connectivité réseau

2. **🛡️ Configuration Shopify**
   - Variables d'environnement
   - Tokens de authentification
   - Création variables/.env.local assistée

3. **🏗️ Architecture Projet**
   - Détection type monorepo
   - Vérification répertoires clés
   - Validation configurations

4. **🧹 Préparation**
   - Nettoyage processus existants
   - Installation dépendances
   - Gestion ports disponibles

5. **🚀 Démarrage**
   - Mode choisi optimisé
   - Vérifications santé
   - Logging activités

6. **🏥 Supervision**
   - Health checks périodiques
   - Gestion erreurs
   - Logging événements

## 🎨 Interface Utilisateur

### 🌈 **Couleurs Professionnelles**

- **Cyan** - Informations principales
- **Vert** - Succès et validations
- **Jaune** - Avertissements
- **Rouge** - Erreurs critiques
- **Bleu** - Détails techniques

### 📊 **Émojis Expressifs**

- ✅ Succès
- ❌ Erreurs
- ⚠️ Avertissements
- ℹ️ Informations
- 🚀 Actions
- 🏥 Santé
- 🛡️ Sécurité
- ⚡ Performance

### 📋 **Logs Structurés**

```json
[2024-04-15 10:30:45] [INFO] "Démarrage script JOLANANAS"
[2024-04-15 10:30:46] [INFO] "Configuration Shopify validée"
[2024-04-15 10:30:47] [ERROR] "Port 3000 indisponible"
```

## 🔥 Cas d'Usage Recommandés

### 👩‍💻 **Développement Quotidien**

```bash
# Démarrage rapide avec auto-détection
./tools/scripts/start.sh

# Si problèmes cache
./tools/scripts/start.sh clean && ./tools/scripts/start.sh dev
```

### 🎯 **Développement Avancé**

```bash
# Mode debug avec surveillance fichiers
./tools/scripts/start.sh debug

# Frontend + API en parallèle
./tools/scripts/start.sh parallel
```

### 🏢 **Production & Preprod**

```bash
# Build optimisé
./tools/scripts/start.sh build

# Serveur production
./tools/scripts/start.sh start
```

### 📊 **Monitoring & Maintenance**

```bash
# Vérifier tout va bien
./tools/scripts/start.sh health

# Diagnostic problèmes
./tools/scripts/start.sh ports
./tools/scripts/start.sh logs
```

## 🆘 Résolution Problèmes

### ❌ **Erreur "Port occupé"**

```bash
# Trouver qui utilise le port
./tools/scripts/start.sh ports

# Nettoyer processus
./tools/scripts/start.sh clean
```

### ❌ **Configuration Shopify manquante**

```bash
# Le script propose automatiquement de créer variables/.env.local
# Depuis variables/.env.example avec valeurs par défaut JOLANANAS
```

### ❌ **Dépendances non installées**

```bash
# Le script installe automatiquement via pnpm ou npm
# Selon ce qui est disponible
```

## 🔄 Évolutions Futures

- [ ] **Mode Docker** avec containers
- [ ] **Surveillance performance** temps réel
- [ ] **Intégration CI/CD** automatique
- [ ] **Dashboard web** de monitoring
- [ ] **Plugins personnalisés** pour fonctionnalités métier

---

**Créé avec ❤️ par [AÏSSA BELKOUSSA](https://jolananas.com)**  
*Architecture Shopify professionnelle pour boutiques de luxe*
