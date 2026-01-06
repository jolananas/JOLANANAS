# Configuration Cursor — Désactivation du Mode Auto

Ce dossier contient les fichiers de configuration pour désactiver le mode auto dans Cursor et empêcher sa réactivation automatique.

## 🎯 Objectif

Éviter que le mode auto se réactive automatiquement et consomme vos crédits Cursor.

## 📁 Fichiers

- **`.cursor/settings.json`** : Configuration au niveau du projet (appliquée uniquement à ce projet)
- **`.cursor/configure-cursor-global.sh`** : Script pour configurer Cursor globalement

## 🚀 Utilisation

### Option 1 : Configuration Globale (Recommandée)

Exécutez le script pour configurer Cursor globalement :

```bash
./.cursor/configure-cursor-global.sh
```

**Avantages** :
- ✅ S'applique à tous vos projets
- ✅ Empêche la réactivation automatique
- ✅ Configuration persistante

**Note** : Le script nécessite `jq` pour modifier le fichier JSON existant. Si `jq` n'est pas installé, le script vous donnera les instructions manuelles.

### Option 2 : Configuration Manuelle Globale

Si le script ne fonctionne pas, modifiez manuellement le fichier de configuration global :

#### macOS
```bash
nano ~/Library/Application\ Support/Cursor/User/settings.json
```

#### Linux
```bash
nano ~/.config/Cursor/User/settings.json
```

#### Windows
```bash
# Dans PowerShell ou CMD
notepad %APPDATA%\Cursor\User\settings.json
```

Ajoutez ces paramètres dans le fichier JSON :

```json
{
  "cursor.ai.modelSelection": "manual",
  "cursor.ai.autoModelSelection": false,
  "cursor.chat.model": "claude-sonnet-3.5",
  "cursor.composer.model": "claude-sonnet-3.5",
  "cursor.cmdK.model": "claude-sonnet-3.5",
  "cursor.terminalCmdK.model": "claude-sonnet-3.5"
}
```

### Option 3 : Configuration au Niveau du Projet

Le fichier `.cursor/settings.json` est déjà configuré et sera automatiquement lu par Cursor pour ce projet uniquement.

## ✅ Vérification

Après configuration, vérifiez que le mode auto est bien désactivé :

1. Ouvrez Cursor
2. Allez dans **Settings** (`Cmd + ,` ou `Ctrl + ,`)
3. Recherchez **"Models"** ou **"Modèles"**
4. Vérifiez que **"Auto Model Selection"** est désactivé
5. Vérifiez que les modèles sont définis manuellement

## 🔄 Redémarrage

**Important** : Redémarrez Cursor après avoir modifié les paramètres pour que les changements prennent effet.

## 💰 Modèles Recommandés (Moins Coûteux)

- **Claude Sonnet 3.5** : Bon équilibre qualité/prix (recommandé)
- **GPT-4o-mini** : Très économique
- **Claude Haiku** : Rapide et économique

## 🛠️ Dépannage

### Le mode auto se réactive toujours

1. Vérifiez que vous avez bien redémarré Cursor
2. Vérifiez que le fichier de configuration global contient bien les paramètres
3. Vérifiez la version de Cursor (mettez à jour si nécessaire)
4. Essayez de supprimer le cache de Cursor :
   - macOS : `~/Library/Application Support/Cursor/Cache`
   - Linux : `~/.config/Cursor/Cache`
   - Windows : `%APPDATA%\Cursor\Cache`

### Le script ne fonctionne pas

Si le script échoue, utilisez l'option 2 (configuration manuelle) ou vérifiez que vous avez les permissions d'écriture sur le fichier de configuration.

## 📝 Notes

- Les paramètres dans `.cursor/settings.json` s'appliquent uniquement à ce projet
- Les paramètres dans le fichier global s'appliquent à tous les projets
- Les paramètres globaux ont la priorité sur les paramètres du projet

## 🔒 Sécurité

Le script crée automatiquement une sauvegarde du fichier de configuration existant avant de le modifier.

