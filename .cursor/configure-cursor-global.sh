#!/bin/bash

# Script pour configurer Cursor globalement et désactiver le mode auto
# Ce script modifie le fichier de configuration global de Cursor

set -e

echo "🔧 Configuration de Cursor pour désactiver le mode auto..."

# Déterminer le chemin du fichier de configuration selon l'OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    CURSOR_SETTINGS="$HOME/Library/Application Support/Cursor/User/settings.json"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    CURSOR_SETTINGS="$HOME/.config/Cursor/User/settings.json"
elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" ]]; then
    # Windows (Git Bash)
    CURSOR_SETTINGS="$APPDATA/Cursor/User/settings.json"
else
    echo "❌ OS non supporté: $OSTYPE"
    exit 1
fi

echo "📁 Fichier de configuration: $CURSOR_SETTINGS"

# Créer le répertoire si nécessaire
mkdir -p "$(dirname "$CURSOR_SETTINGS")"

# Sauvegarder le fichier existant s'il existe
if [ -f "$CURSOR_SETTINGS" ]; then
    BACKUP_FILE="${CURSOR_SETTINGS}.backup.$(date +%Y%m%d_%H%M%S)"
    echo "💾 Sauvegarde du fichier existant vers: $BACKUP_FILE"
    cp "$CURSOR_SETTINGS" "$BACKUP_FILE"
fi

# Créer ou mettre à jour le fichier de configuration
if [ -f "$CURSOR_SETTINGS" ]; then
    # Le fichier existe, on le met à jour avec jq si disponible, sinon avec sed
    if command -v jq &> /dev/null; then
        echo "📝 Mise à jour du fichier avec jq..."
        # Lire le fichier existant
        EXISTING=$(cat "$CURSOR_SETTINGS")
        # Ajouter les paramètres Cursor
        echo "$EXISTING" | jq '. + {
            "cursor.ai.modelSelection": "manual",
            "cursor.ai.autoModelSelection": false,
            "cursor.chat.model": "claude-sonnet-3.5",
            "cursor.composer.model": "claude-sonnet-3.5",
            "cursor.cmdK.model": "claude-sonnet-3.5",
            "cursor.terminalCmdK.model": "claude-sonnet-3.5"
        }' > "$CURSOR_SETTINGS.tmp" && mv "$CURSOR_SETTINGS.tmp" "$CURSOR_SETTINGS"
    else
        echo "⚠️  jq n'est pas installé. Mise à jour manuelle nécessaire."
        echo ""
        echo "Ajoutez ces lignes dans $CURSOR_SETTINGS :"
        echo ""
        echo '  "cursor.ai.modelSelection": "manual",'
        echo '  "cursor.ai.autoModelSelection": false,'
        echo '  "cursor.chat.model": "claude-sonnet-3.5",'
        echo '  "cursor.composer.model": "claude-sonnet-3.5",'
        echo '  "cursor.cmdK.model": "claude-sonnet-3.5",'
        echo '  "cursor.terminalCmdK.model": "claude-sonnet-3.5"'
        exit 1
    fi
else
    # Le fichier n'existe pas, on le crée
    echo "📝 Création du nouveau fichier de configuration..."
    cat > "$CURSOR_SETTINGS" << 'JSON'
{
  "cursor.ai.modelSelection": "manual",
  "cursor.ai.autoModelSelection": false,
  "cursor.chat.model": "claude-sonnet-3.5",
  "cursor.composer.model": "claude-sonnet-3.5",
  "cursor.cmdK.model": "claude-sonnet-3.5",
  "cursor.terminalCmdK.model": "claude-sonnet-3.5"
}
JSON
fi

echo ""
echo "✅ Configuration terminée !"
echo ""
echo "📋 Paramètres appliqués :"
echo "   - Mode auto désactivé"
echo "   - Modèle manuel : claude-sonnet-3.5 (moins coûteux)"
echo ""
echo "🔄 Redémarrez Cursor pour que les changements prennent effet."
echo ""
echo "💡 Pour vérifier :"
echo "   1. Ouvrez Cursor"
echo "   2. Allez dans Settings > Models"
echo "   3. Vérifiez que 'Auto Model Selection' est désactivé"
