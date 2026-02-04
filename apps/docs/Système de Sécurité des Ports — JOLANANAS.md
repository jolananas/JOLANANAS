# 🔒 Système de Sécurité des Ports JOLANANAS

## Vue d'ensemble

Le système de sécurité des ports JOLANANAS est un gestionnaire intelligent qui résout automatiquement les conflits de ports lors du développement. Il détecte les ports occupés, propose des alternatives intelligentes, et peut nettoyer automatiquement les ports de développement.

## Fonctionnalités Principales

### 🛡️ Détection Intelligente des Ports
- **Analyse en temps réel** : Détecte tous les ports TCP/UDP occupés
- **Identification des processus** : Affiche le PID, nom et commande du processus
- **Filtrage par service** : Peut filtrer par type de service (Node.js, PostgreSQL, etc.)

### 🎯 Sélection Intelligente de Ports
- **Port préféré** : Essaie d'abord le port demandé
- **Plages de développement** : Cherche dans les plages 3000-3100 et 8000-8100
- **Fallback étendu** : Si nécessaire, cherche dans toute la plage 3000-9999
- **Protocole flexible** : Support TCP et UDP

### 💥 Nettoyage Automatique
- **Kill intelligent** : Envoie d'abord SIGTERM, puis SIGKILL si nécessaire
- **Protection système** : Ne tue jamais les processus système critiques
- **Confirmation utilisateur** : Demande confirmation sauf en mode force
- **Vérification post-nettoyage** : Confirme que le port est bien libéré

### 🔍 Sécurité Avancée
- **Détection des ports sensibles** : Identifie les ports critiques (22, 80, 443, 3306, 5432, 6379, 27017)
- **Alertes de sécurité** : Avertit des services potentiellement non sécurisés
- **Recommandations** : Suggère des actions de sécurisation

## Utilisation

### Commandes Principales

```bash
# Lister tous les ports occupés
./start.sh ports check

# Lister les ports occupés par Node.js uniquement
./start.sh ports check node

# Trouver un port libre pour le frontend
./start.sh ports find 3000 Frontend

# Forcer la libération du port 3000
./start.sh ports kill 3000 true

# Nettoyer tous les ports de développement
./start.sh cleanup

# Vérifier la sécurité des ports
./start.sh check-ports
```

### Intégration Automatique

Le système est automatiquement intégré dans tous les modes de démarrage :

```bash
# Démarrage avec gestion automatique des ports
./start.sh dev          # Trouve automatiquement un port libre
./start.sh dev:fast     # Mode Turbopack avec port intelligent
./start.sh storybook    # Storybook avec port alternatif si nécessaire
./start.sh all          # Démarrage complet avec sécurité des ports
```

## Architecture Technique

### Fichiers Principaux

1. **`port-manager.sh`** : Gestionnaire de ports autonome
2. **`start.sh`** : Script principal avec intégration des ports
3. **Fonctions intégrées** :
   - `check_and_manage_ports()` : Vérification de sécurité
   - `get_service_port()` : Attribution intelligente de ports
   - `cleanup_ports_before_start()` : Préparation des ports

### Plages de Ports Configurées

```bash
# Ports par défaut pour les services JOLANANAS
DEFAULT_PORTS=(
    "3000:Frontend Next.js"
    "3001:Frontend Alternatif"
    "3002:Frontend Backup"
    "6006:Storybook"
    "6007:Storybook Alternatif"
    "8080:API Server"
    "8081:API Alternatif"
    "9000:Admin Panel"
    "9001:Admin Alternatif"
)

# Plages de recherche
DEV_PORT_RANGE_START=3000
DEV_PORT_RANGE_END=3100
SYSTEM_PORT_RANGE_START=8000
SYSTEM_PORT_RANGE_END=8100
```

## Exemples d'Utilisation

### Scénario 1 : Port 3000 Occupé
```bash
$ ./start.sh dev
ℹ️ 🛡️ Vérification de la sécurité des ports...
✅ Gestionnaire de ports sécurisé disponible
ℹ️ 🔒 Préparation des ports pour Frontend...
⚠️ Port 3000 occupé, tentative de libération...
✅ Port alternatif trouvé: 3001
⚙️ Frontend: http://localhost:3001
```

### Scénario 2 : Nettoyage des Ports de Développement
```bash
$ ./start.sh cleanup
ℹ️ 💥 Nettoyage des ports de développement...
ℹ️ Tentative de libération du port 3000...
✅ Port 3000 libéré avec succès
ℹ️ Tentative de libération du port 6006...
✅ Port 6006 libéré avec succès
✅ Ports nettoyés: 3000 6006
```

### Scénario 3 : Vérification de Sécurité
```bash
$ ./start.sh check-ports
🛡️ Ports TCP occupés:
┌─────────┬─────────────┬─────────────────────────────────────────┐
│ Port    │ Processus   │ Description                            │
├─────────┼─────────────┼─────────────────────────────────────────┤
│ 3000    │ node        │ node                                    │
│ 5432    │ postgres    │ postgres                                │
└─────────┴─────────────┴─────────────────────────────────────────┘

🛡️ Vérification de la sécurité des ports...
⚠️ Port sensible 5432 ouvert: postgres
⚠️ Ports sensibles détectés: 5432
ℹ️ Vérifiez que ces services sont sécurisés et nécessaires
```

## Sécurité et Protection

### Processus Protégés
Le système ne tuera jamais ces types de processus :
- `systemd`, `kernel`, `init`, `launchd`
- Processus système Apple (`com.apple.*`)
- Services critiques du système

### Ports Sensibles Surveillés
- **22** : SSH
- **80** : HTTP
- **443** : HTTPS
- **3306** : MySQL
- **5432** : PostgreSQL
- **6379** : Redis
- **27017** : MongoDB

### Mode Force
```bash
# Mode interactif (demande confirmation)
./start.sh ports kill 3000

# Mode force (pas de confirmation)
./start.sh ports kill 3000 true
```

## Dépannage

### Problèmes Courants

1. **Port toujours occupé après kill**
   - Le processus se reconnecte automatiquement
   - Utilisez un port alternatif : `./start.sh ports find 3000 Frontend`

2. **Permission refusée**
   - Le processus appartient à un autre utilisateur
   - Utilisez `sudo` si nécessaire : `sudo ./start.sh ports kill 3000 true`

3. **Gestionnaire de ports non trouvé**
   - Vérifiez que `port-manager.sh` est exécutable : `chmod +x port-manager.sh`

### Logs et Debug

```bash
# Mode verbose pour le gestionnaire de ports
bash -x ./port-manager.sh check

# Vérifier la syntaxe du script principal
bash -n ./start.sh
```

## Intégration avec Next.js

Le système passe automatiquement le port via la variable d'environnement `PORT` :

```bash
# Dans start.sh
PORT=$frontend_port pnpm run dev
PORT=$frontend_port npm run dev
```

Assurez-vous que votre `next.config.js` utilise cette variable :

```javascript
const nextConfig = {
  // ... autres configurations
  env: {
    PORT: process.env.PORT || 3000,
  },
}
```

## Performance

- **Détection rapide** : Utilise `lsof` pour une détection efficace
- **Cache intelligent** : Évite les vérifications répétées
- **Parallélisation** : Peut vérifier plusieurs ports simultanément
- **Optimisation mémoire** : Pas de processus persistants

## Maintenance

### Mise à Jour des Plages de Ports
Modifiez les variables dans `port-manager.sh` :
```bash
DEV_PORT_RANGE_START=3000
DEV_PORT_RANGE_END=3100
```

### Ajout de Nouveaux Services
Ajoutez dans `DEFAULT_PORTS` :
```bash
"4000:Nouveau Service"
```

## Support et Contribution

Ce système est développé spécifiquement pour l'architecture JOLANANAS et suit les règles de production strictes :
- ✅ Données réelles uniquement
- ✅ Aucun mock ou simulation
- ✅ Code prêt pour la production
- ✅ Tests en conditions réelles

Pour toute question ou amélioration, consultez la documentation technique dans `/docs/`.
