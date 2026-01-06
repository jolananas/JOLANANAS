# Migration vers Shopify Customer Accounts — JOLANANAS

> **Date de migration** : Janvier 2025  
> **Statut** : ✅ Complété et Consolidé  
> **Version** : 2.0

---

## 📋 Résumé

Cette migration transfère la gestion complète des comptes clients de la base de données SQL locale vers **Shopify Customer Accounts**, en utilisant l'API native de Shopify pour l'authentification, les profils, les adresses et les commandes.

### Objectifs

- ✅ Déléguer la gestion des comptes clients à Shopify (de A à Z)
- ✅ Simplifier l'architecture en supprimant la gestion locale des utilisateurs
- ✅ Utiliser les fonctionnalités natives de Shopify pour l'authentification
- ✅ Conserver la base locale uniquement pour les données spécifiques (paniers, cache, logs)
- ✅ Implémenter Customer Account API GraphQL pour l'authentification frontend
- ✅ Automatiser l'envoi d'invitations de réinitialisation de mot de passe

---

## 🏗️ Architecture

### Avant la migration

```
┌─────────────────┐
│   NextAuth.js   │
│  (Credentials)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Base SQLite    │
│  - User         │
│  - Session      │
│  - Account      │
│  - Address      │
│  - Order        │
└─────────────────┘
```

### Après la migration (v2.0 - Consolidé)

```
┌─────────────────┐
│   Frontend      │
│   (Browser)     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Customer Account API   │
│  (GraphQL)              │
│  - customerAccessToken  │
│    Create               │
│  - customer query       │
└─────────────────────────┘
         │
         ▼
┌─────────────────┐
│   NextAuth.js   │
│  (Credentials)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  Admin API (REST)       │
│  - Envoi invitations    │
│  - Gestion clients      │
└─────────────────────────┘
         │
         ▼
┌─────────────────┐
│  Base SQLite    │
│  - User (lien)  │
│  - Cart         │
│  - Order (cache)│
│  - ActivityLog  │
└─────────────────┘
```

---

## 🔄 Changements du schéma Prisma

### Modèles supprimés

- ❌ `Session` - Géré par NextAuth.js
- ❌ `Account` - Géré par NextAuth.js
- ❌ `VerificationToken` - Géré par Shopify

### Modèles modifiés

#### `User`
- ✅ Ajout de `shopifyCustomerId String? @unique`
- ⚠️ `password` déprécié (géré par Shopify)
- ✅ Conservé uniquement pour la liaison locale

#### `Cart`
- ✅ `userId` → `shopifyCustomerId String?`

#### `Order`
- ✅ `userId` → `shopifyCustomerId String?`

#### `Address`
- ✅ `userId` → `shopifyCustomerId String?` (uniquement pour cache des commandes)
- ⚠️ Les adresses générales sont gérées par Shopify

#### `UserPreferences`
- ✅ `userId` → `shopifyCustomerId String? @unique`
- ⚠️ Optionnel pour migration

#### `ActivityLog`
- ✅ `userId` → `shopifyCustomerId String`

---

## 📁 Fichiers créés

### Nouveaux fichiers

1. **`app/src/lib/shopify/customer-accounts.ts`**
   - Gestion complète des comptes clients Shopify
   - Fonctions frontend : `createCustomerAccessTokenFrontend`, `getCustomerFrontend` (Customer Account API GraphQL)
   - Fonctions serveur : `createCustomerAccessToken`, `getCustomerFromToken` (Admin API fallback)
   - Fonctions : `getCustomerAddresses`, `getCustomerOrders`, etc.

2. **`app/src/lib/shopify/auth.ts`**
   - Authentification Shopify Customer Account
   - Utilise Customer Account API GraphQL si CLIENT_ID disponible, sinon Admin API (fallback)
   - Fonctions : `authenticateCustomer`, `createCustomer`, `checkEmailExists`

3. **`scripts/migrate-users-to-shopify.ts`**
   - Script de migration des utilisateurs existants vers Shopify
   - Usage : `pnpm tsx scripts/migrate-users-to-shopify.ts`

4. **`scripts/send-password-reset-invitations.ts`** (Nouveau v2.0)
   - Script pour envoyer automatiquement des invitations de réinitialisation
   - Usage : `pnpm tsx scripts/send-password-reset-invitations.ts [--dry-run] [--limit N]`

5. **`app/api/admin/send-invitations/route.ts`** (Nouveau v2.0)
   - Endpoint API pour envoyer des invitations en masse
   - Usage : `POST /api/admin/send-invitations` avec `{ customerIds: [...] }` ou `{ sendToAll: true }`

---

## 📝 Fichiers modifiés

### Routes API

#### Authentification
- ✅ `app/api/auth/signup/route.ts` - Utilise `createCustomer` (Admin API)
- ✅ `app/api/auth/verify-email/route.ts` - Vérifie via Shopify Customer Accounts
- ✅ `app/api/auth/forgot-password/route.ts` - Utilise Admin API `send_invite` (v2.0)
- ✅ `app/api/auth/reset-password/route.ts` - Désactivé, géré par Shopify (v2.0)

#### Utilisateur
- ✅ `app/api/user/profile/route.ts` - Utilise `updateCustomerProfile` (Shopify)
- ✅ `app/api/user/addresses/route.ts` - CRUD via Shopify Customer Accounts API
- ✅ `app/api/user/orders/route.ts` - Récupération via Shopify Admin API
- ✅ `app/api/user/password/route.ts` - Changement via Shopify
- ✅ `app/api/user/delete-account/route.ts` - Suppression via Shopify Admin API
- ✅ `app/api/user/dashboard/route.ts` - Données depuis Shopify
- ✅ `app/api/user/export-data/route.ts` - Export depuis Shopify
- ✅ `app/api/user/avatar/route.ts` - Retourne 501 (non supporté par Shopify)

#### Panier
- ✅ `app/src/api/cart/route.ts` - Utilise `shopifyCustomerId`
- ✅ `app/src/api/cart/create/route.ts` - Crée/met à jour client Shopify

### Configuration

- ✅ `app/src/lib/auth.ts` - Migration vers Shopify Customer Account API GraphQL (v2.0)
- ✅ `app/src/lib/ShopifyAdminClient.ts` - Ajout méthodes `sendCustomerInvite`, `sendCustomerPasswordResetInvite`, `findCustomerByEmail` (v2.0)
- ✅ `app/src/lib/env.ts` - Ajout variables `SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID` et `SHOPIFY_CUSTOMER_ACCOUNT_API_VERSION` (v2.0)
- ✅ `app/src/types/next-auth.d.ts` - Ajout propriétés Shopify
- ✅ `app/src/types/ecommerce.ts` - Ajout `shopifyCustomerId`

### Composants

- ✅ `app/src/components/account/PreferencesForm.tsx` - Utilise localStorage uniquement
- ✅ `app/account/page.tsx` - Retrait de `ActiveSessions`

### Scripts

- ✅ `scripts/create-test-user.ts` - Crée dans Shopify via Admin API
- ✅ `scripts/cleanup-test-users.ts` - Utilise `shopifyCustomerId`

---

## 🗑️ Fichiers supprimés

- ❌ `app/api/user/preferences/route.ts` - Préférences non gérées par Shopify
- ❌ `app/api/user/addresses/set-default/route.ts` - Géré par Shopify
- ❌ `app/src/components/account/ActiveSessions.tsx` - Géré par NextAuth/Shopify

---

## 🔐 Variables d'environnement

### Requises

```env
# Shopify Storefront API
SHOPIFY_STORE_DOMAIN=votre-boutique.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=shpat_...
SHOPIFY_API_VERSION=2024-01

# Shopify Customer Account API (requis pour authentification frontend)
SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID=votre_client_id
SHOPIFY_CUSTOMER_ACCOUNT_API_VERSION=2024-01

# Shopify Admin API (requis pour envoi d'invitations)
SHOPIFY_ADMIN_TOKEN=shpat_...
```

### Où trouver les credentials

1. **SHOPIFY_STOREFRONT_TOKEN** : 
   - Admin Shopify → Apps → Develop apps → Storefront API → Access token

2. **SHOPIFY_ADMIN_TOKEN** :
   - Admin Shopify → Apps → Develop apps → Admin API → Access token

3. **SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID** :
   - Admin Shopify → Settings → Customer accounts → Customer Account API → Client ID

---

## 🚀 Migration des utilisateurs existants

### Script de migration

```bash
cd app/frontend
pnpm tsx scripts/migrate-users-to-shopify.ts
```

### Processus

1. Lit tous les utilisateurs locaux sans `shopifyCustomerId`
2. Vérifie si le client existe déjà dans Shopify (par email)
3. Crée le client dans Shopify via Admin API si nécessaire
4. Met à jour l'utilisateur local avec `shopifyCustomerId`

### Notes importantes

- ⚠️ Les mots de passe ne peuvent pas être migrés directement
- ⚠️ Les clients devront réinitialiser leur mot de passe via Shopify
- ✅ **Envoi automatique d'invitations** : Utiliser le script `send-password-reset-invitations.ts` (v2.0)

---

## 📊 Données gérées par Shopify

### ✅ Gérées nativement

- **Authentification** : Login via Customer Account API GraphQL (v2.0), Register, Logout, Password Reset via invitations
- **Profil utilisateur** : Nom, Email, Téléphone, Accepte marketing
- **Adresses** : CRUD complet, adresse par défaut
- **Commandes** : Historique complet, statuts, détails
- **Vérification email** : Gérée automatiquement lors de l'inscription
- **Réinitialisation mot de passe** : Via invitations Shopify (v2.0)

### ⚠️ Non gérées par Shopify

- **Préférences utilisateur** : Stockées dans `localStorage` uniquement
- **Avatars** : Non supportés nativement
- **Sessions actives** : Gérées par NextAuth.js uniquement

---

## 🔧 Utilisation

### Créer un compte

```typescript
// Via l'API
POST /api/auth/signup
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"
}
```

### Se connecter

```typescript
// Via NextAuth (utilise Customer Account API GraphQL en arrière-plan)
POST /api/auth/signin
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Note** : L'authentification utilise maintenant Customer Account API GraphQL si `SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID` est configuré, sinon Admin API (fallback).

### Récupérer le profil

```typescript
// Via l'API
GET /api/user/profile
// Headers: Cookie avec session NextAuth
```

### Gérer les adresses

```typescript
// Créer
POST /api/user/addresses
{
  "firstName": "John",
  "lastName": "Doe",
  "address1": "123 Main St",
  "city": "Paris",
  "country": "FR",
  "zip": "75001"
}

// Lister
GET /api/user/addresses

// Mettre à jour
PUT /api/user/addresses?id=xxx

// Supprimer
DELETE /api/user/addresses?id=xxx
```

---

## 🧪 Tests

### Checklist de validation

- [ ] Créer un nouveau compte via `/account`
- [ ] Se connecter avec les identifiants Shopify
- [ ] Vérifier que le profil est récupéré depuis Shopify
- [ ] Créer/modifier/supprimer une adresse
- [ ] Vérifier que les commandes sont récupérées depuis Shopify
- [ ] Changer le mot de passe
- [ ] Exporter les données utilisateur
- [ ] Supprimer le compte

### Commandes de test

```bash
# Créer un utilisateur de test
pnpm tsx scripts/create-test-user.ts test@jolananas.com password123 "Test User"

# Envoyer des invitations de réinitialisation (dry-run)
pnpm tsx scripts/send-password-reset-invitations.ts --dry-run

# Envoyer des invitations de réinitialisation (réel)
pnpm tsx scripts/send-password-reset-invitations.ts --limit 50

# Nettoyer les utilisateurs de test
pnpm tsx scripts/cleanup-test-users.ts --dry-run
pnpm tsx scripts/cleanup-test-users.ts
```

### Envoi d'invitations via API

```typescript
// Envoyer à des clients spécifiques
POST /api/admin/send-invitations
{
  "customerIds": ["123456789", "987654321"]
}

// Envoyer à tous les clients (limite: 50 par défaut)
POST /api/admin/send-invitations
{
  "sendToAll": true,
  "limit": 100
}
```

---

## ⚠️ Points d'attention

### Limitations Shopify

1. **Mots de passe** : Ne peuvent pas être définis directement via Admin API
   - Solution : Utiliser le script `send-password-reset-invitations.ts` ou l'endpoint `/api/admin/send-invitations` (v2.0)

2. **Avatars** : Non supportés nativement
   - Solution : Stockage externe (Cloudinary, S3, etc.) si nécessaire

3. **Préférences** : Non gérées nativement
   - Solution : Utiliser Shopify Metafields ou localStorage

4. **Sessions** : Gérées par NextAuth.js uniquement
   - Les sessions Shopify sont indépendantes

### Migration des données

- ⚠️ Les utilisateurs existants doivent être migrés manuellement
- ⚠️ Les mots de passe ne peuvent pas être migrés
- ⚠️ Les préférences utilisateur sont perdues (stockées dans localStorage)

### Compatibilité

- ✅ NextAuth.js reste compatible
- ✅ Les sessions sont gérées par NextAuth.js
- ✅ Les tokens Shopify sont stockés dans la session JWT

---

## 🔐 Authentification Customer Account API (v2.0)

### Configuration

L'authentification utilise maintenant Customer Account API GraphQL si `SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID` est configuré.

**Variables d'environnement requises** :
```env
SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID=votre_client_id
SHOPIFY_CUSTOMER_ACCOUNT_API_VERSION=2024-01
```

**Pour exposer CLIENT_ID au frontend** (optionnel, pour appels directs depuis le client) :
```env
NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID=votre_client_id
```

### Fonctions disponibles

#### Côté serveur (NextAuth, API routes)
- `authenticateCustomer(email, password)` - Utilise Customer Account API GraphQL si CLIENT_ID disponible
- `createCustomerAccessToken(email, password)` - Fallback Admin API si CLIENT_ID non configuré

#### Côté client (browser)
- `createCustomerAccessTokenFrontend(email, password, clientId?)` - Appel direct Customer Account API GraphQL
- `getCustomerFrontend(accessToken, clientId?)` - Récupération données client via GraphQL

### Flux d'authentification

1. **Frontend → Customer Account API GraphQL** : `customerAccessTokenCreate` mutation
2. **Token reçu** : Stocké dans session NextAuth JWT
3. **Récupération client** : `customer` query avec le token d'accès

## 📧 Système d'invitations (v2.0)

### Envoi automatique d'invitations

#### Via script
```bash
# Dry-run (test)
pnpm tsx scripts/send-password-reset-invitations.ts --dry-run

# Envoi réel (limite: 50 par défaut)
pnpm tsx scripts/send-password-reset-invitations.ts --limit 100
```

#### Via API
```typescript
// Envoyer à des clients spécifiques
POST /api/admin/send-invitations
{
  "customerIds": ["123456789", "987654321"]
}

// Envoyer à tous les clients
POST /api/admin/send-invitations
{
  "sendToAll": true,
  "limit": 100
}
```

### Réinitialisation de mot de passe

1. **Client demande réinitialisation** : `POST /api/auth/forgot-password` avec email
2. **Serveur recherche client** : Via Admin API par email
3. **Envoi invitation** : `POST /customers/{id}/send_invite.json` via Admin API
4. **Client reçoit email** : Lien de réinitialisation Shopify
5. **Réinitialisation** : Gérée directement par Shopify (pas de route locale)

**Note** : La route `/api/auth/reset-password` est désactivée (410 Gone) car la réinitialisation est gérée par Shopify.

## 📚 Documentation supplémentaire

### Shopify Customer Account API

- [Documentation officielle](https://shopify.dev/docs/api/customer)
- [GraphQL Reference](https://shopify.dev/docs/api/customer#queries)
- [customerAccessTokenCreate mutation](https://shopify.dev/docs/api/customer#mutations)

### NextAuth.js

- [Documentation](https://next-auth.js.org/)
- [JWT Strategy](https://next-auth.js.org/configuration/options#jwt)

---

## 🔄 Rollback

En cas de problème, pour revenir à l'ancienne version :

1. Restaurer le schéma Prisma depuis un backup
2. Restaurer les routes API depuis un backup
3. Exécuter `pnpm prisma db push`
4. Régénérer Prisma Client : `pnpm prisma generate`

⚠️ **Attention** : Les données créées dans Shopify ne seront pas supprimées automatiquement.

---

## 📝 Notes de version

### v2.0 (Janvier 2025) - Consolidation

- ✅ Implémentation Customer Account API GraphQL (frontend)
- ✅ Authentification via `customerAccessTokenCreate` mutation
- ✅ Récupération client via `customer` query
- ✅ Remplacement système réinitialisation mot de passe par invitations Shopify
- ✅ Envoi automatique d'invitations via Admin API
- ✅ Script `send-password-reset-invitations.ts` pour envoi en masse
- ✅ Endpoint API `/api/admin/send-invitations` pour envoi programmatique
- ✅ Désactivation route `/api/auth/reset-password` (géré par Shopify)

### v1.0 (Janvier 2025)

- ✅ Migration complète vers Shopify Customer Accounts
- ✅ Suppression des modèles User, Session, Account, VerificationToken
- ✅ Migration des routes API utilisateur
- ✅ Mise à jour des composants frontend
- ✅ Scripts de migration et nettoyage

---

## 🆘 Support

En cas de problème :

1. Vérifier les variables d'environnement
2. Vérifier que Prisma Client est à jour : `pnpm prisma generate`
3. Vérifier les logs serveur pour les erreurs Shopify
4. Consulter la documentation Shopify Customer Account API

---

**Dernière mise à jour** : Janvier 2025  
**Auteur** : Équipe JOLANANAS


