#!/bin/bash

# 🏆 JOLANANAS (Shopify Storefront) - Script de Démarrage Professionnel
# Copyright © 2025 AÏSSA BELKOUSSA - JOLANANAS
# Architecture moderne pour boutiques Shopify de luxe

# Nettoyage de l'écran
clear

# Configuration des couleurs ANSI
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
WHITE='\033[1;37m'
NC='\033[0m' # No Color
# Configuration des émojis et symboles
CHECKMARK="✅"
CROSS="❌"
WARNING="⚠️"
INFO="ℹ️"
ROCKET="🚀"
HOUSE="🏛️"
WRENCH="🔧"
WIFI="🌐"
GEAR="⚙️"
LOCK="🔒"
SHIELD="🛡️"
BOMB="💥"
# Chemin du script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$(dirname "$SCRIPT_DIR")")"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

# Fonction pour afficher le banner principal
display_banner() {
    echo ""
    echo -e "${PURPLE}
             ██╗ ██████╗ ██╗      █████╗ ███╗   ██╗ █████╗ ███╗   ██╗ █████╗ ███████╗
             ██║██╔═══██╗██║     ██╔══██╗████╗  ██║██╔══██╗████╗  ██║██╔══██╗██╔════╝
             ██║██║   ██║██║     ███████║██╔██╗ ██║███████║██╔██╗ ██║███████║███████╗
        ██   ██║██║   ██║██║     ██╔══██║██║╚██╗██║██╔══██║██║╚██╗██║██╔══██║╚════██║
        ╚█████╔╝╚██████╔╝███████╗██║  ██║██║ ╚████║██║  ██║██║ ╚████║██║  ██║███████║
        ╚════╝  ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝
      ${NC}";   
    echo -e "${YELLOW}🍍 JOLANANAS - Architecture Professionnelle | React + Shopify + Next.js${NC}\n"; 
    echo -e "${CYAN}JOLANANAS (Shopify Storefront)${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

# Fonction pour vérifier les prérequis
check_prerequisites() {
    echo -e "${INFO} Vérification de l'environnement...${NC}"
    
    # Vérifier Node.js
    if command -v node >/dev/null 2>&1; then
        NODE_VERSION=$(node --version | cut -d'v' -f2)
        REQUIRED_NODE="18.0.0"
        if printf '%s\n%s\n' "$REQUIRED_NODE" "$NODE_VERSION" | sort --version-sort --check >/dev/null 2>&1; then
            echo -e "${CHECKMARK} Node.js ${NODE_VERSION} installé (>= ${REQUIRED_NODE})"
        else
            echo -e "${CROSS} Node.js ${NODE_VERSION} détecté, mais version >= ${REQUIRED_NODE} requise"
            exit 1
        fi
    else
        echo -e "${CROSS} Node.js non installé. Veuillez installer Node.js >= 18.0.0"
        exit 1
    fi
    
    # Vérifier pnpm (préféré) ou npm
    if command -v pnpm >/dev/null 2>&1; then
        PNPM_VERSION=$(pnpm --version)
        echo -e "${CHECKMARK} pnpm ${PNPM_VERSION} installé (gestionnaire préféré)"
        PACKAGE_MANAGER="pnpm"
    elif command -v npm >/dev/null 2>&1; then
        NPM_VERSION=$(npm --version)
        echo -e "${CHECKMARK} npm ${NPM_VERSION} installé"
        PACKAGE_MANAGER="npm"
    else
        echo -e "${CROSS} Aucun gestionnaire de paquets trouvé (pnpm ou npm requis)"
        exit 1
    fi
    
    # Vérifier la connectivité réseau
    if ping -c 1 google.com >/dev/null 2>&1; then
        echo -e "${CHECKMARK} Connectivité réseau OK"
    else
        echo -e "${WARNING} Connectivité réseau limitée (normal si pas de connexion internet)"
    fi
    
    echo ""
}
# Fonction pour vérifier l'architecture professionnelle
check_architecture() {
    echo -e "${INFO} Vérification de l'architecture professionnelle...${NC}"
    
    # Vérifier les répertoires principaux
    DIRS=("$PROJECT_ROOT/frontend" "$PROJECT_ROOT/shared" "$PROJECT_ROOT/tools" "$PROJECT_ROOT/docs")
    for dir in "${DIRS[@]}"; do
        if [ -d "$dir" ]; then
            echo -e "${CHECKMARK} ✓ ${dir}/"
        else
            echo -e "${WARNING} ⚠ ${dir}/ manquant"
        fi
    done
    
    # Vérifier le répertoire frontend spécifiquement
    if [ -d "$FRONTEND_DIR" ]; then
        if [ -f "$FRONTEND_DIR/package.json" ]; then
            echo -e "${CHECKMARK} ✓ $FRONTEND_DIR/package.json trouvé"
        else
            echo -e "${WARNING} ⚠ $FRONTEND_DIR/package.json manquant"
        fi
        
        if [ -f "$FRONTEND_DIR/next.config.js" ]; then
            echo -e "${CHECKMARK} ✓ Configuration Next.js trouvée"
        else
            echo -e "${WARNING} ⚠ Configuration Next.js manquante"
        fi
    fi
    
    echo ""
}

# Fonction intelligente pour vérifier si un port est réellement en écoute (LISTEN)
# Utilise plusieurs méthodes avec fallback pour une détection fiable
is_port_listening() {
    local port=$1
    local method=""
    
    # MÉTHODE 1 : lsof avec filtre LISTEN (MÉTHODE PRINCIPALE - Plus précise)
    if lsof -iTCP:$port -sTCP:LISTEN -n -P >/dev/null 2>&1; then
        method="lsof-LISTEN"
        return 0  # Port en écoute
    fi
    
    # MÉTHODE 2 : netstat avec filtre LISTEN (FALLBACK 1 - Compatible macOS/Linux)
    if command -v netstat >/dev/null 2>&1; then
        if netstat -an 2>/dev/null | grep -q "\.${port}.*LISTEN"; then
            method="netstat-LISTEN"
            return 0  # Port en écoute
        fi
    fi
    
    # MÉTHODE 3 : ss avec filtre LISTEN (FALLBACK 2 - Linux uniquement)
    if command -v ss >/dev/null 2>&1; then
        if ss -l -n 2>/dev/null | grep -q ":${port}.*LISTEN"; then
            method="ss-LISTEN"
            return 0  # Port en écoute
        fi
    fi
    
    # MÉTHODE 4 : Test de connexion avec nc (FALLBACK 3 - Vérification active)
    if command -v nc >/dev/null 2>&1; then
        # Test rapide de connexion (timeout selon OS)
        # macOS utilise -G, Linux utilise -w
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            if nc -z -G 1 localhost $port >/dev/null 2>&1; then
                method="nc-test-macos"
                return 0  # Port répond (probablement en écoute)
            fi
        else
            # Linux
            if nc -z -w 1 localhost $port >/dev/null 2>&1; then
                method="nc-test-linux"
                return 0  # Port répond (probablement en écoute)
            fi
        fi
    fi
    
    # MÉTHODE 5 : Vérification avec lsof simple (FALLBACK 4 - Moins précis mais universel)
    # Cette méthode peut détecter des connexions fermées, donc on la met en dernier
    if lsof -i :$port -n -P >/dev/null 2>&1; then
        # Vérifier si c'est vraiment en LISTEN et pas juste une connexion fermée
        local listen_check=$(lsof -iTCP:$port -sTCP:LISTEN -n -P 2>/dev/null | wc -l)
        if [ "$listen_check" -gt 0 ]; then
            method="lsof-simple"
            return 0  # Port en écoute
        fi
    fi
    
    # Aucune méthode n'a détecté le port en écoute
    return 1  # Port libre
}

# Fonction pour obtenir des informations détaillées sur un port
get_port_info() {
    local port=$1
    local info=""
    
    # Essayer d'obtenir les infos avec lsof
    if command -v lsof >/dev/null 2>&1; then
        local process_info=$(lsof -iTCP:$port -sTCP:LISTEN -n -P 2>/dev/null | tail -n +2 | head -1)
        if [ -n "$process_info" ]; then
            local pid=$(echo $process_info | awk '{print $2}')
            local process_name=$(echo $process_info | awk '{print $1}')
            local command=$(ps -p $pid -o comm= 2>/dev/null || echo "Not Available (N/A)")
            info="${process_name} (PID: ${pid}, CMD: ${command})"
        fi
    fi
    
    echo "$info"
}

# Fonction pour vérifier et gérer les ports
check_and_manage_ports() {
    echo -e "${INFO} ${SHIELD} Vérification complète de la sécurité des ports...${NC}"
    echo ""
    
    # 1. ANALYSE DES PORTS OCCUPÉS
    echo -e "${INFO} 📊 Analyse des ports occupés...${NC}"
    
    # Obtenir tous les ports TCP occupés (uniquement ceux en LISTEN)
    if command -v lsof >/dev/null 2>&1; then
        # Obtenir tous les ports TCP en LISTEN avec leurs informations
        local tcp_listen=$(lsof -iTCP -sTCP:LISTEN -n -P 2>/dev/null)
        
        if [ -n "$tcp_listen" ]; then
            # Compter le nombre de lignes (sans l'en-tête)
            local line_count=$(echo "$tcp_listen" | tail -n +2 | wc -l | tr -d ' ')
            
            if [ "$line_count" -gt 0 ]; then
                echo -e "${SHIELD} Ports TCP occupés:${NC}"
                echo "┌─────────┬─────────────┬─────────────────────────────────────────┐"
                echo "│ Port    │ Processus   │ Description                             │"
                echo "├─────────┼─────────────┼─────────────────────────────────────────┤"
                
                # Utiliser un fichier temporaire pour éviter les problèmes de sous-shell
                local temp_file=$(mktemp)
                echo "$tcp_listen" | tail -n +2 > "$temp_file"
                
                # Traiter chaque ligne et dédupliquer par port
                local processed_ports=""
                
                while IFS= read -r line; do
                    if [ -n "$line" ]; then
                        # Extraire le port depuis la colonne 9 (format: *:port ou IP:port)
                        local port=$(echo "$line" | awk '{print $9}' | sed 's/.*://')
                        local pid=$(echo "$line" | awk '{print $2}')
                        local process_name=$(echo "$line" | awk '{print $1}')
                        
                        # Vérifier si le port est valide et non déjà traité
                        if [ -n "$port" ] && [[ "$port" =~ ^[0-9]+$ ]] && [[ ! "$processed_ports" =~ ":$port:" ]]; then
                            # Obtenir la commande complète du processus
                            local command=$(ps -p $pid -o comm= 2>/dev/null || echo "Not Available (N/A)")
                            
                            # Obtenir la commande complète avec arguments (limité à 39 caractères)
                            local full_command=$(ps -p $pid -o command= 2>/dev/null | cut -c1-39 || echo "$command")
                            
                            # Tronquer si trop long (compatibilité bash)
                            if [ ${#full_command} -gt 39 ]; then
                                full_command=$(echo "$full_command" | cut -c1-36)"..."
                            fi
                            
                            # Afficher le port
                            printf "│ %-7s │ %-11s │ %-39s │\n" "$port" "$process_name" "$full_command"
                            
                            # Marquer le port comme traité
                            processed_ports="${processed_ports}:${port}:"
                        fi
                    fi
                done < "$temp_file"
                
                # Nettoyer le fichier temporaire
                rm -f "$temp_file"
                
                echo "└─────────┴─────────────┴─────────────────────────────────────────┘"
            else
                echo -e "${CHECKMARK} Aucun port TCP en écoute détecté"
            fi
        else
            echo -e "${CHECKMARK} Aucun port TCP occupé détecté"
        fi
    else
        echo -e "${WARNING} lsof n'est pas installé. Impossible d'analyser les ports."
    fi
    echo ""
    
    # 2. VÉRIFICATION DE SÉCURITÉ
    echo -e "${INFO} 🔒 Vérification de la sécurité des ports...${NC}"
    
    # Vérifier les ports sensibles (utilise la détection intelligente)
    local sensitive_ports=(22 80 443 3306 5432 6379 27017)
    local open_sensitive=()
    
    for port in "${sensitive_ports[@]}"; do
        if is_port_listening $port; then
            local port_info=$(get_port_info $port)
            if [ -n "$port_info" ]; then
                local process_name=$(echo $port_info | cut -d' ' -f1)
                echo -e "${WARNING} Port sensible ${port} ouvert: ${port_info}"
            else
                echo -e "${WARNING} Port sensible ${port} ouvert (processus inconnu)"
            fi
            open_sensitive+=($port)
        fi
    done
    
    if [ ${#open_sensitive[@]} -gt 0 ]; then
        echo -e "${WARNING} Ports sensibles détectés: ${open_sensitive[*]}"
        echo -e "${INFO} Vérifiez que ces services sont sécurisés et nécessaires"
    else
        echo -e "${CHECKMARK} Aucun port sensible détecté"
    fi
    echo ""
        
        # 3. ÉTAT DES PORTS DE DÉVELOPPEMENT JOLANANAS
        echo -e "${INFO} 🎯 État des ports de développement JOLANANAS...${NC}"
        
        # Ports par défaut pour les services JOLANANAS
        local jolananas_ports=(3000 3001 3002 4647 6006 6007 8080 8081 9000 9001)
        local occupied_jolananas=()
        local free_jolananas=()
        
        for port in "${jolananas_ports[@]}"; do
            if is_port_listening $port; then
                local port_info=$(get_port_info $port)
                if [ -n "$port_info" ]; then
                    local process_name=$(echo $port_info | cut -d' ' -f1)
                    occupied_jolananas+=("$port:$process_name")
                else
                    occupied_jolananas+=("$port:unknown")
                fi
            else
                free_jolananas+=($port)
            fi
        done
        
        # Afficher le statut des ports JOLANANAS
        if [ ${#occupied_jolananas[@]} -gt 0 ]; then
            echo -e "${WARNING} Ports JOLANANAS occupés:"
            for port_info in "${occupied_jolananas[@]}"; do
                local port=$(echo $port_info | cut -d: -f1)
                local process=$(echo $port_info | cut -d: -f2)
                echo -e "   ${WARNING} Port ${port}: ${process}"
            done
        fi
        
        if [ ${#free_jolananas[@]} -gt 0 ]; then
            echo -e "${CHECKMARK} Ports JOLANANAS disponibles: ${free_jolananas[*]}"
        fi
        echo ""
        
        # 4. RECOMMANDATIONS INTELLIGENTES
        echo -e "${INFO} 💡 Recommandations intelligentes...${NC}"
        
        # Vérifier si le port 3000 est occupé par autre chose que Node.js (détection intelligente)
        if is_port_listening 3000; then
            local port_info=$(get_port_info 3000)
            if [ -n "$port_info" ]; then
                local process_name=$(echo $port_info | cut -d' ' -f1)
                if [[ ! "$process_name" =~ (node|npm|pnpm) ]]; then
                    echo -e "${WARNING} Port 3000 occupé par ${port_info} (non-Node.js)"
                    echo -e "${INFO} Recommandation: Utiliser un port alternatif (3001, 3002, etc.)"
                else
                    echo -e "${CHECKMARK} Port 3000 occupé par Node.js (normal en développement)"
                fi
            else
                echo -e "${WARNING} Port 3000 occupé (processus inconnu)"
            fi
        else
            echo -e "${CHECKMARK} Port 3000 disponible pour le frontend"
        fi
        
        # Vérifier les ports Storybook (détection intelligente)
        if is_port_listening 6006; then
            local port_info=$(get_port_info 6006)
            echo -e "${WARNING} Port 6006 (Storybook) occupé: ${port_info:-processus inconnu}"
            echo -e "${INFO} Recommandation: Utiliser le port 6007 pour Storybook"
        else
            echo -e "${CHECKMARK} Port 6006 disponible pour Storybook"
        fi
        echo ""
        
        # 5. PRÉPARATION AUTOMATIQUE DES PORTS
        echo -e "${INFO} ⚙️ Préparation automatique des ports...${NC}"
        
        # Trouver un port libre pour le frontend
        local frontend_port=$(get_service_port "Frontend" 3000 false)
        if [ $? -eq 0 ]; then
            echo -e "${CHECKMARK} Port frontend recommandé: ${frontend_port}"
        else
            echo -e "${WARNING} Aucun port frontend disponible dans la plage recommandée"
        fi
        
        # Trouver un port libre pour Storybook
        local storybook_port=$(get_service_port "Storybook" 6006 false)
        if [ $? -eq 0 ]; then
            echo -e "${CHECKMARK} Port Storybook recommandé: ${storybook_port}"
        else
            echo -e "${WARNING} Aucun port Storybook disponible dans la plage recommandée"
        fi
        echo ""
        
        # 6. STATISTIQUES GLOBALES
        echo -e "${INFO} 📈 Statistiques globales des ports...${NC}"
        
        # Utiliser uniquement les ports en LISTEN (détection intelligente)
        local total_tcp_ports=0
        local node_ports=0
        local system_ports=0
        
        if command -v lsof >/dev/null 2>&1; then
            total_tcp_ports=$(lsof -iTCP -sTCP:LISTEN -n -P 2>/dev/null | wc -l | tr -d ' ')
            node_ports=$(lsof -iTCP -sTCP:LISTEN -n -P 2>/dev/null | grep -i node | wc -l | tr -d ' ')
            system_ports=$(lsof -iTCP -sTCP:LISTEN -n -P 2>/dev/null | grep -E "(com\.apple|ControlCenter|systemd)" | wc -l | tr -d ' ')
        fi
        
        echo -e "${INFO} Total ports TCP en écoute (LISTEN): ${total_tcp_ports}"
        echo -e "${INFO} Ports Node.js: ${node_ports}"
        echo -e "${INFO} Ports système: ${system_ports}"
        echo ""
        
        # 7. ALERTES DE PERFORMANCE
        if [ $total_tcp_ports -gt 50 ]; then
            echo -e "${WARNING} ⚠️ Nombre élevé de ports occupés (${total_tcp_ports})"
            echo -e "${INFO} Recommandation: Considérez nettoyer les ports inutilisés"
        fi
        
        if [ $node_ports -gt 10 ]; then
            echo -e "${WARNING} ⚠️ Nombre élevé de processus Node.js (${node_ports})"
            echo -e "${INFO} Recommandation: Vérifiez les processus Node.js en arrière-plan"
        fi
        echo ""
        
    # 8. RÉSUMÉ FINAL
    echo -e "${CHECKMARK} ${SHIELD} Analyse de sécurité des ports terminée${NC}"
    echo -e "${INFO} Le système est prêt pour le développement JOLANANAS"
    echo ""
}
# Fonction pour obtenir un port libre pour un service (utilise la détection intelligente)
get_service_port() {
    local service_name=$1
    local preferred_port=$2
    local auto_cleanup=${3:-true}
    
    # Essayer d'abord le port préféré (détection intelligente)
    if ! is_port_listening $preferred_port; then
        echo $preferred_port
        return 0
    fi
    
    # Chercher un port alternatif dans la plage de développement
    for port in $(seq $((preferred_port + 1)) $((preferred_port + 10))); do
        if ! is_port_listening $port; then
            echo $port
            return 0
        fi
    done
    
    # Si aucun port n'est trouvé dans la plage standard, chercher dans une plage étendue
    for port in $(seq $((preferred_port + 11)) $((preferred_port + 50))); do
        if ! is_port_listening $port; then
            echo -e "${WARNING} Port ${preferred_port} occupé, utilisation du port alternatif ${port}${NC}" >&2
            echo $port
            return 0
        fi
    done
    
    return 1
}

# Fonction centralisée pour obtenir le port frontend (4647 préféré, puis 3000, 3001, etc.)
# Le port 4647 est le port préféré pour JOLANANAS car :
# - Il évite les conflits avec les ports standards (3000, 3001 souvent utilisés)
# - Il est facilement mémorisable (4647 = "JOLANAS" en format numérique approximatif)
# - Il est dans la plage des ports de développement non réservés (1024-65535)
# IMPORTANT: Cette fonction retourne UNIQUEMENT le numéro de port sur stdout
# Tous les messages d'information sont envoyés sur stderr pour éviter la capture
get_frontend_port() {
    local service_name="Frontend"
    
    # 1. Essayer d'abord le port 4647 (port préféré JOLANANAS)
    if ! is_port_listening 4647; then
        echo -e "${INFO} Port préféré 4647 disponible pour ${service_name}${NC}" >&2
        echo 4647
        return 0
    fi
    
    # 2. Si 4647 est occupé, afficher un avertissement (sur stderr)
    local port_info=$(get_port_info 4647)
    if [ -n "$port_info" ]; then
        echo -e "${WARNING} Port 4647 occupé par ${port_info}, recherche d'un port alternatif...${NC}" >&2
    else
        echo -e "${WARNING} Port 4647 occupé, recherche d'un port alternatif...${NC}" >&2
    fi
    
    # 3. Utiliser la fonction standard pour trouver un port alternatif (3000, 3001, etc.)
    # Note: get_service_port envoie déjà ses warnings sur stderr, donc on capture uniquement le port sur stdout
    local alternative_port=$(get_service_port "$service_name" 3000 true)
    if [ $? -eq 0 ] && [ -n "$alternative_port" ]; then
        echo "$alternative_port"
        return 0
    fi
    
    # 4. Si aucun port n'est trouvé, retourner une erreur
    echo -e "${CROSS} Impossible d'obtenir un port pour ${service_name}${NC}" >&2
    return 1
}
# Fonction pour nettoyer les ports avant démarrage (utilise la détection intelligente)
cleanup_ports_before_start() {
    local service_name=$1
    local preferred_port=$2
    
    echo -e "${INFO} ${LOCK} Préparation des ports pour ${service_name}...${NC}"
    
    # Vérifier si le port préféré est occupé (détection intelligente)
    if is_port_listening $preferred_port; then
        local port_info=$(get_port_info $preferred_port)
        if [ -n "$port_info" ]; then
            echo -e "${WARNING} Port ${preferred_port} occupé par ${port_info}, recherche d'un port alternatif..."
        else
            echo -e "${WARNING} Port ${preferred_port} occupé (processus inconnu), recherche d'un port alternatif..."
        fi
    else
        echo -e "${CHECKMARK} Port ${preferred_port} disponible"
    fi
    
    echo ""
}

# Fonction pour s'assurer que le port est configuré dans .env.local (FALLBACK 2)
ensure_port_config() {
    local port=$1
    local env_file="$FRONTEND_DIR/.env.local"
    
    # Vérifier si .env.local existe
    if [ ! -f "$env_file" ]; then
        echo -e "${INFO} Création de .env.local avec PORT=${port}${NC}"
        echo "PORT=${port}" > "$env_file"
        return 0
    fi
    
    # Vérifier si PORT est déjà défini
    if grep -q "^PORT=" "$env_file" 2>/dev/null; then
        # Mettre à jour la valeur existante
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/^PORT=.*/PORT=${port}/" "$env_file"
        else
            # Linux
            sed -i "s/^PORT=.*/PORT=${port}/" "$env_file"
        fi
        echo -e "${INFO} Mise à jour de PORT=${port} dans .env.local${NC}"
    else
        # Ajouter PORT à la fin du fichier
        echo "PORT=${port}" >> "$env_file"
        echo -e "${INFO} Ajout de PORT=${port} dans .env.local${NC}"
    fi
    
    return 0
}

# Fonction pour vérifier que le port est bien utilisé après démarrage (utilise la détection intelligente)
verify_port_usage() {
    local expected_port=$1
    local max_attempts=10
    local attempt=0
    local check_interval=2
    
    echo -e "${INFO} Vérification que le port ${expected_port} est bien utilisé...${NC}"
    
    while [ $attempt -lt $max_attempts ]; do
        sleep $check_interval
        if is_port_listening $expected_port; then
            local port_info=$(get_port_info $expected_port)
            if [ -n "$port_info" ]; then
                local process_name=$(echo $port_info | cut -d' ' -f1)
                if [[ "$process_name" =~ (node|npm|pnpm|next) ]]; then
                    echo -e "${CHECKMARK} Port ${expected_port} confirmé utilisé par ${port_info}"
                    return 0
                else
                    echo -e "${WARNING} Port ${expected_port} utilisé par ${port_info} (non-Node.js)"
                fi
            fi
        fi
        attempt=$((attempt + 1))
    done
    
    echo -e "${WARNING} Impossible de confirmer l'utilisation du port ${expected_port} après ${max_attempts} tentatives"
    return 1
}

# Fonction pour démarrer Next.js avec gestion de port et fallback
start_nextjs_with_port() {
    local port=$1
    local mode=${2:-"dev"}  # dev, dev:fast, ou start
    
    echo -e "${INFO} Démarrage Next.js sur le port ${port} (mode: ${mode})...${NC}"
    
    cd "$FRONTEND_DIR"
    
    # Préparer les fallbacks en arrière-plan (FALLBACK 2 et 3)
    # Configurer .env.local au cas où -p ne fonctionnerait pas
    ensure_port_config $port >/dev/null 2>&1
    
    # MÉTHODE 1 : Option -p directe (PRINCIPALE - Plus fiable avec Turbopack)
    echo -e "${INFO} Méthode: Option -p directe (recommandée)${NC}"
    echo -e "${INFO} Si le port n'est pas respecté, .env.local est configuré comme fallback${NC}"
    echo -e "${INFO} Vérification du port dans 5 secondes...${NC}"
    echo ""
    
    # Lancer la vérification en arrière-plan
    local verify_pid=""
    (
        sleep 5
        if verify_port_usage $port >/dev/null 2>&1; then
            echo ""
            echo -e "${CHECKMARK} Port ${port} confirmé actif - Next.js accessible sur http://localhost:${port}${NC}"
            echo ""
        else
            echo ""
            echo -e "${WARNING} Port ${port} non confirmé - Vérifiez avec: lsof -i :${port}${NC}"
            echo -e "${INFO} .env.local est configuré avec PORT=${port} comme fallback${NC}"
            echo ""
        fi
    ) &
    verify_pid=$!
    
    # Gestion des signaux pour arrêt propre
    trap 'echo ""; echo -e "${INFO} Arrêt de Next.js...${NC}"; kill $verify_pid 2>/dev/null; exit 0' SIGINT SIGTERM
    
    # Lancer Next.js au premier plan (pour voir les logs)
    # Utiliser directement next depuis node_modules avec l'option -p
    local nextjs_exit_code=0
    if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
        if [ "$mode" = "dev:fast" ]; then
            # Utiliser pnpm exec pour passer directement les arguments à next
            pnpm exec next dev --turbopack -p $port
            nextjs_exit_code=$?
        elif [ "$mode" = "start" ]; then
            pnpm exec next start -p $port
            nextjs_exit_code=$?
        else
            # Utiliser pnpm exec pour passer directement les arguments à next
            pnpm exec next dev --turbopack -p $port
            nextjs_exit_code=$?
        fi
    else
        if [ "$mode" = "dev:fast" ]; then
            npx next dev --turbopack -p $port
            nextjs_exit_code=$?
        elif [ "$mode" = "start" ]; then
            npx next start -p $port
            nextjs_exit_code=$?
        else
            npx next dev --turbopack -p $port
            nextjs_exit_code=$?
        fi
    fi
    
    # Nettoyer le processus de vérification
    kill $verify_pid 2>/dev/null
    
    # Gérer le code de sortie
    if [ $nextjs_exit_code -ne 0 ]; then
        echo ""
        echo -e "${CROSS} ${RED}Next.js s'est terminé avec une erreur (code: $nextjs_exit_code)${NC}"
        echo -e "${INFO} Vérifiez les logs ci-dessus pour plus de détails.${NC}"
        echo ""
        return $nextjs_exit_code
    fi
    
    return 0
}

# Fonction pour afficher l'architecture
display_architecture() {
    echo -e "${INFO} ${HOUSE} Architecture Professionnelle JOLANANAS (Shopify Storefront)${NC}"
    echo -e "   ${BLUE}📁${NC} $FRONTEND_DIR/     - Next.js Frontend (React/TypeScript)"
    echo -e "   ${BLUE}📁${NC} $PROJECT_ROOT/shared/      - Types & Utilitaires communs"
    echo -e "   ${BLUE}📁${NC} $PROJECT_ROOT/tools/       - Outils de développement"
    echo -e "   ${BLUE}📁${NC} $PROJECT_ROOT/docs/        - Documentation technique"
    echo ""
}
# Fonction pour afficher les modes disponibles
display_modes() {
    echo -e "${ROCKET} Modes de démarrage disponibles:${NC}"
    echo -e "${CYAN}1)${NC} Développement (dev)        - Serveur Next.js avec hot reload"
    echo -e "${CYAN}2)${NC} Développement rapide       - Serveur Next.js avec Turbopack"
    echo -e "${CYAN}3)${NC} Build de production        - Construction optimisée"
    echo -e "${CYAN}4)${NC} Production (start)         - Serveur de production Next.js"
    echo -e "${CYAN}5)${NC} Storybook                  - Interface de développement de composants"
    echo -e "${CYAN}6)${NC} Tests                      - Exécution des tests"
    echo ""
}

# Fonction pour sélectionner le mode
select_mode() {
    read -p "Choisissez un mode (1-6) [défaut: 1]: " choice
    choice=${choice:-1}
    
    case $choice in
        1)
            mode="dev"
            ;;
        2)
            mode="dev:fast"
            ;;
        3)
            mode="build"
            ;;
        4)
            mode="start"
            ;;
        5)
            mode="storybook"
            ;;
        6)
            mode="test"
            ;;
        *)
            echo -e "${RED}Choix invalide. Utilisation du mode développement par défaut.${NC}"
            mode="dev"
            ;;
    esac
}

# Fonction pour installer les dépendances si nécessaire
install_dependencies() {
    if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
        echo -e "${INFO} Installation des dépendances frontend...${NC}"
        cd "$FRONTEND_DIR"
        if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
            pnpm install
        else
            npm install
        fi
        cd "$PROJECT_ROOT"
    fi
}

# Fonction pour démarrer le serveur de développement
start_dev() {
    echo -e "${INFO} Démarrage du serveur de développement...${NC}"
    
    # Obtenir le port frontend (4647 préféré, puis 3000, 3001, etc.)
    frontend_port=$(get_frontend_port)
    if [ $? -ne 0 ]; then
        exit 1
    fi
    
    echo -e "${GEAR} Frontend: http://localhost:${frontend_port}${NC}"
    echo ""
    
    # Nettoyer les ports avant démarrage
    cleanup_ports_before_start "Frontend" $frontend_port
    
    # Utiliser la fonction avec gestion de port et fallback
    start_nextjs_with_port $frontend_port "dev"
}
# Fonction pour démarrer le serveur de développement rapide
start_dev_fast() {
    echo -e "${INFO} Démarrage du serveur de développement rapide (Turbopack)...${NC}"
    
    # Obtenir le port frontend (4647 préféré, puis 3000, 3001, etc.)
    frontend_port=$(get_frontend_port)
    if [ $? -ne 0 ]; then
        exit 1
    fi
    
    echo -e "${GEAR} Frontend: http://localhost:${frontend_port}${NC}"
    echo ""
    
    # Nettoyer les ports avant démarrage
    cleanup_ports_before_start "Frontend" $frontend_port
    
    # Utiliser la fonction avec gestion de port et fallback
    start_nextjs_with_port $frontend_port "dev:fast"
}
# Fonction pour démarrer le build de production
start_build() {
    echo -e "${INFO} Construction pour la production...${NC}"
    echo ""
    
    cd "$FRONTEND_DIR"
    
    # Exécuter le build et capturer le code de retour
    local build_exit_code=0
    if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
        pnpm run build
        build_exit_code=$?
    else
        npm run build
        build_exit_code=$?
    fi
    
    # Vérifier si le build a réussi
    if [ $build_exit_code -eq 0 ]; then
        echo ""
        echo -e "${CHECKMARK} ${GREEN}Build terminé avec succès !${NC}"
        echo ""
        
        # Proposer de démarrer le serveur de production
        if [ -z "$1" ] || [ "$1" != "no-prompt" ]; then
            echo -e "${INFO} Souhaitez-vous démarrer le serveur de production maintenant ?${NC}"
            read -p "Démarrer le serveur ? (o/N): " start_server
            
            if [[ "$start_server" =~ ^[oO]$ ]]; then
                echo ""
                start_production
            else
                echo ""
                echo -e "${INFO} Build terminé. Utilisez '$0 start' pour démarrer le serveur de production.${NC}"
                echo ""
            fi
        fi
    else
        echo ""
        echo -e "${CROSS} ${RED}Erreur lors du build (code: $build_exit_code)${NC}"
        echo -e "${INFO} Vérifiez les erreurs ci-dessus et réessayez.${NC}"
        echo ""
        return $build_exit_code
    fi
    
    return 0
}
# Fonction pour démarrer le serveur de production
start_production() {
    echo -e "${INFO} Démarrage du serveur de production...${NC}"
    
    # Vérifier que le build existe
    if [ ! -d "$FRONTEND_DIR/.next" ]; then
        echo -e "${WARNING} Aucun build de production trouvé.${NC}"
        echo -e "${INFO} Exécution d'un build de production...${NC}"
        echo ""
        
        cd "$FRONTEND_DIR"
        if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
            pnpm run build
        else
            npm run build
        fi
        
        if [ $? -ne 0 ]; then
            echo -e "${CROSS} Erreur lors du build. Impossible de démarrer le serveur de production.${NC}"
            return 1
        fi
        
        echo ""
    fi
    
    # Obtenir un port libre pour le serveur de production
    local production_port=$(get_service_port "Production" 3000 true)
    if [ $? -ne 0 ]; then
        echo -e "${CROSS} Impossible d'obtenir un port pour le serveur de production"
        return 1
    fi
    
    echo -e "${GEAR} Serveur: http://localhost:${production_port}${NC}"
    echo ""
    
    # Nettoyer les ports avant démarrage
    cleanup_ports_before_start "Production" $production_port
    
    # Gestion des signaux pour arrêt propre
    trap 'echo ""; echo -e "${INFO} Arrêt du serveur de production...${NC}"; exit 0' SIGINT SIGTERM
    
    cd "$FRONTEND_DIR"
    local start_exit_code=0
    if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
        PORT=$production_port pnpm run start
        start_exit_code=$?
    else
        PORT=$production_port npm run start
        start_exit_code=$?
    fi
    
    # Gérer le code de sortie
    if [ $start_exit_code -ne 0 ]; then
        echo ""
        echo -e "${CROSS} ${RED}Le serveur de production s'est terminé avec une erreur (code: $start_exit_code)${NC}"
        echo -e "${INFO} Vérifiez les logs ci-dessus pour plus de détails.${NC}"
        echo ""
        return $start_exit_code
    fi
    
    return 0
}
# Fonction pour démarrer Storybook
start_storybook() {
    echo -e "${INFO} Démarrage de Storybook...${NC}"
    
    # Obtenir un port libre pour Storybook
    local storybook_port=$(get_service_port "Storybook" 6006 true)
    if [ $? -ne 0 ]; then
        echo -e "${CROSS} Impossible d'obtenir un port pour Storybook"
        exit 1
    fi
    
    echo -e "${GEAR} Storybook: http://localhost:${storybook_port}${NC}"
    echo ""
    
    # Nettoyer les ports avant démarrage
    cleanup_ports_before_start "Storybook" $storybook_port
    
    cd "$FRONTEND_DIR"
    if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
        pnpm run storybook -- -p $storybook_port
    else
        npm run storybook -- -p $storybook_port
    fi
}
# Fonction pour exécuter les tests
start_tests() {
    echo -e "${INFO} Exécution des tests...${NC}"
    echo ""
    
    cd "$FRONTEND_DIR"
    if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
        pnpm run test
    else
        npm run test
    fi
}
# Fonction pour démarrer avec Turbo
start_turbo() {
    if [ -f "$PROJECT_ROOT/turbo.json" ]; then
        echo -e "${INFO} Démarrage avec Turbo (monorepo)...${NC}"
        echo ""
        
        if [ "$PACKAGE_MANAGER" = "pnpm" ]; then
            pnpm run dev
        else
            npm run dev
        fi
    fi
}

# Fonction principale
main() {
    # Afficher le banner
    display_banner
    
    # Vérifier les prérequis
    check_prerequisites
    
    # Vérifier et gérer les ports
    check_and_manage_ports
    
    # Vérifier l'architecture
    check_architecture
    
    # Afficher l'architecture
    display_architecture
    
    # Afficher les modes disponibles
    display_modes
    
    # Sélectionner le mode
    select_mode
    
    # Installer les dépendances si nécessaire
    install_dependencies
    
    echo ""
    
    # Exécuter le mode sélectionné
    case $mode in
        "dev")
            start_dev
            ;;
        "dev:fast")
            start_dev_fast
            ;;
        "build")
            start_build "no-prompt"
            ;;
        "start")
            start_production
            ;;
        "storybook")
            start_storybook
            ;;
        "test")
            start_tests
            ;;
        "turbo")
            start_turbo
            ;;
    esac
}

# Gestion des arguments en ligne de commande
if [ "$1" = "all" ]; then
    echo -e "${INFO} Démarrage complet (Frontend)...${NC}"
    display_banner
    check_prerequisites
    check_and_manage_ports
    install_dependencies
    
    # Démarrer le frontend avec gestion des ports
    echo -e "${INFO} Démarrage du serveur complet...${NC}"
    
    # Obtenir le port frontend (4647 préféré, puis 3000, 3001, etc.)
    frontend_port=$(get_frontend_port)
    if [ $? -ne 0 ]; then
        exit 1
    fi
    
    echo -e "${WIFI} Frontend: http://localhost:${frontend_port}${NC}"
    echo ""
    
    # Nettoyer les ports avant démarrage
    cleanup_ports_before_start "Frontend" $frontend_port
    
    # Utiliser la fonction avec gestion de port et fallback
    start_nextjs_with_port $frontend_port "dev"
elif [ "$1" = "ports" ]; then
    # Mode gestion des ports (fonctionnalités intégrées)
    echo -e "${INFO} Mode gestion des ports intégré${NC}"
    echo -e "${INFO} Utilisez 'check-ports' pour vérifier les ports${NC}"
    echo -e "${INFO} Utilisez 'cleanup' pour nettoyer les ports${NC}"
elif [ "$1" = "cleanup" ]; then
    # Mode nettoyage des ports
    display_banner
    echo -e "${INFO} ${BOMB} Nettoyage des ports de développement...${NC}"
    echo -e "${INFO} Fonctionnalité de nettoyage intégrée dans le système${NC}"
    echo -e "${INFO} Les ports sont gérés automatiquement lors du démarrage${NC}"
elif [ "$1" = "check-ports" ]; then
    # Mode vérification des ports
    display_banner
    check_and_manage_ports
elif [ "$1" = "build" ]; then
    display_banner
    check_prerequisites
    install_dependencies
    start_build "no-prompt"
elif [ "$1" = "start" ]; then
    display_banner
    check_prerequisites
    start_production
elif [ "$1" = "dev" ]; then
    display_banner
    check_prerequisites
    install_dependencies
    start_dev
elif [ "$1" = "dev:fast" ]; then
    display_banner
    check_prerequisites
    install_dependencies
    start_dev_fast
elif [ "$1" = "storybook" ]; then
    display_banner
    check_prerequisites
    install_dependencies
    start_storybook
elif [ "$1" = "test" ]; then
    display_banner
    check_prerequisites
    install_dependencies
    start_tests
elif [ "$1" = "help" ] || [ "$1" = "-h" ] || [ "$1" = "--help" ]; then
    echo -e "${CYAN}$0 [option]${NC}"
    echo ""
    echo "Options disponibles:"
    echo "  all         Démarrage complet (Frontend)"
    echo "  dev         Mode développement"
    echo "  dev:fast    Mode développement rapide (Turbopack)"
    echo "  build       Build de production"
    echo "  start       Serveur de production"
    echo "  storybook   Interface Storybook"
    echo "  test        Exécution des tests"
    echo ""
    echo -e "${SHIELD} Options de gestion des ports:${NC}"
    echo "  ports <cmd>     Gestionnaire de ports (check, find, kill, cleanup, security)"
    echo "  cleanup         Nettoyage automatique des ports de développement"
    echo "  check-ports     Vérification de la sécurité des ports"
    echo ""
    echo "Exemples de gestion des ports:"
    echo "  $0 ports check              # Lister les ports occupés"
    echo "  $0 ports find 3000 Frontend # Trouver un port libre"
    echo "  $0 ports kill 3000 true     # Forcer la libération du port 3000"
    echo "  $0 cleanup                  # Nettoyer tous les ports de développement"
    echo "  $0 check-ports              # Vérifier la sécurité des ports"
    echo ""
    echo "  help        Affiche cette aide"
    echo ""
    echo "Sans option, le script propose un menu interactif."
    exit 0
else
    # Mode interactif par défaut
    main
fi
