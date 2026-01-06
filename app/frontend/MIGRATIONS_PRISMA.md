# 🍍 JOLANANAS - Migrations Prisma Requises

## ⚠️ IMPORTANT

Après les modifications du schéma Prisma, vous devez exécuter les migrations suivantes :

```bash
cd app/frontend
pnpm db:push
pnpm db:generate
```

## Modifications du Schéma

### 1. Modèle `Address`
- ✅ Ajout du champ `isDefault Boolean @default(false)`

### 2. Nouveau Modèle `UserPreferences`
- ✅ Création complète du modèle avec :
  - `language String @default("fr")`
  - `timezone String @default("Europe/Paris")`
  - `emailNotifications Boolean @default(true)`
  - `orderNotifications Boolean @default(true)`
  - `marketingEmails Boolean @default(false)`

### 3. Nouveau Modèle `ActivityLog`
- ✅ Création complète du modèle pour tracer les actions utilisateur :
  - `action String`
  - `ipAddress String?`
  - `userAgent String?`
  - `metadata String?` (JSON)

### 4. Modèle `User`
- ✅ Ajout des relations :
  - `preferences UserPreferences?`
  - `activityLogs ActivityLog[]`

## Commandes de Migration

```bash
# Option 1 : Push direct (développement)
pnpm db:push

# Option 2 : Migration nommée (production)
pnpm db:migrate --name add_user_preferences_and_activity_logs

# Générer le client Prisma
pnpm db:generate
```

## Notes

- Les migrations sont compatibles avec SQLite
- Les données existantes seront préservées
- Les nouveaux champs ont des valeurs par défaut appropriées

