# Configuration Admin API — JOLANANAS

> **Date** : Janvier 2025  
> **Statut** : Guide de configuration Admin API Shopify  
> **Contexte** : Configuration des permissions Admin API pour le checkout personnalisé

---

## 🎯 Objectif

Ce guide explique comment configurer l'application Shopify avec les permissions Admin API nécessaires pour créer des draft orders (commandes brouillons) et gérer les clients dans le système de checkout personnalisé JOLANANAS.

---

## ⚠️ Problème Résolu

Si vous rencontrez l'erreur suivante lors de la création d'un checkout :

```
HTTP 403: Accès refusé. Vérifiez les permissions de l'app Shopify (scopes Admin API).
[API] This action requires merchant approval for write_draft_orders scope.
```

Cela signifie que votre application Shopify n'a pas les permissions Admin API nécessaires configurées et approuvées par le marchand.

---

## 📋 Scopes Admin API Requis

Pour que le système de checkout personnalisé fonctionne correctement, votre app Shopify doit avoir les permissions suivantes :

### Scopes Obligatoires

| Scope | Description | Utilisation |
|-------|-------------|-------------|
| `write_draft_orders` | Créer et modifier des commandes brouillons | Création de draft orders pour le checkout sécurisé |
| `read_customers` | Lire les informations des clients | Vérification de l'existence d'un client |
| `write_customers` | Créer et modifier des clients | Création/mise à jour des clients lors du checkout |

### Scopes Optionnels

| Scope | Description | Utilisation |
|-------|-------------|-------------|
| `read_orders` | Lire les commandes | Consultation des commandes après paiement |
| `read_draft_orders` | Lire les commandes brouillons | Consultation des draft orders |

---

## 🔧 Configuration Pas-à-Pas

### Étape 1 : Accéder à Shopify Admin

1. Connectez-vous à votre boutique Shopify Admin :
   - Allez sur https://admin.shopify.com
   - Connectez-vous avec vos identifiants

### Étape 2 : Accéder aux Apps de Développement

1. Dans le menu de gauche, cliquez sur **Settings** (Paramètres)
2. Faites défiler jusqu'à **Apps and sales channels** (Apps et canaux de vente)
3. Cliquez sur **Develop apps** (Développer des apps)

### Étape 3 : Créer ou Sélectionner une App

#### Option A : Créer une Nouvelle App

1. Cliquez sur **Create an app** (Créer une app)
2. Donnez un nom à votre app (ex: "JOLANANAS Admin API")
3. Cliquez sur **Create app**

#### Option B : Utiliser une App Existante

1. Sélectionnez l'app existante que vous souhaitez utiliser
2. Cliquez sur le nom de l'app pour l'ouvrir

### Étape 4 : Configurer les Permissions Admin API

1. Dans la page de configuration de l'app, cliquez sur **Configure Admin API scopes** (Configurer les scopes Admin API)

2. **Cochez les scopes suivants** :

   **Obligatoires** :
   - ✅ `write_draft_orders` - Créer et modifier des commandes brouillons
   - ✅ `read_customers` - Lire les informations des clients
   - ✅ `write_customers` - Créer et modifier des clients

   **Optionnels** (recommandés) :
   - ✅ `read_orders` - Lire les commandes
   - ✅ `read_draft_orders` - Lire les commandes brouillons

3. Cliquez sur **Save** (Enregistrer)

### Étape 5 : Installer/Réinstaller l'App

⚠️ **IMPORTANT** : Après avoir ajouté ou modifié les scopes, vous **DEVEZ** installer ou réinstaller l'app pour obtenir l'approbation du marchand (merchant approval).

1. Cliquez sur **API credentials** (Identifiants API) dans le menu de gauche
2. Faites défiler jusqu'à la section **Admin API access token** (Token d'accès Admin API)
3. Si l'app n'est pas encore installée :
   - Cliquez sur **Install app** (Installer l'app)
   - Autorisez toutes les permissions demandées
4. Si l'app est déjà installée :
   - Cliquez sur **Uninstall app** (Désinstaller l'app)
   - Puis cliquez sur **Install app** (Installer l'app) pour réinstaller avec les nouvelles permissions
   - Autorisez toutes les permissions demandées

### Étape 6 : Générer le Token Admin

1. Après l'installation, faites défiler jusqu'à **Admin API access token**
2. Cliquez sur **Reveal token once** (Révéler le token une fois)
3. **Copiez immédiatement le token** (il commence généralement par `shpat_` ou `shpca_`)
   - ⚠️ **ATTENTION** : Ce token ne sera affiché qu'une seule fois. Si vous le perdez, vous devrez en générer un nouveau.

### Étape 7 : Ajouter le Token dans `.env.local`

1. Ouvrez le fichier `.env.local` à la racine de `app/frontend/`
2. Ajoutez ou modifiez la variable `SHOPIFY_ADMIN_TOKEN` :

```env
# Token Admin API (OBLIGATOIRE pour le checkout personnalisé)
SHOPIFY_ADMIN_TOKEN=shpat_votre_token_admin_ici
```

3. Sauvegardez le fichier

### Étape 8 : Redémarrer le Serveur

Après avoir ajouté le token, **redémarrez le serveur de développement** :

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez-le
cd app/frontend
pnpm run dev
```

---

## ✅ Vérification de la Configuration

### Vérification 1 : Variables d'Environnement

Vérifiez que les variables suivantes sont définies dans `.env.local` :

```env
SHOPIFY_STORE_DOMAIN=votre-boutique.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=votre_token_storefront
SHOPIFY_ADMIN_TOKEN=votre_token_admin
SHOPIFY_API_VERSION=2024-10
```

### Vérification 2 : Logs de Démarrage

Au démarrage du serveur, vous devriez voir dans les logs :

```
✅ Shopify Admin API configuré: {
  domain: 'votre-boutique.myshopify.com',
  apiVersion: '2024-10',
  tokenPreview: 'shpat_xxxxx...'
}
✅ Shopify Admin Client initialisé: votre-boutique.myshopify.com
```

### Vérification 3 : Test de Création de Draft Order

1. Accédez à la page de checkout de votre site
2. Remplissez le formulaire de livraison
3. Cliquez sur "Continuer vers le paiement"
4. Si la configuration est correcte, vous ne devriez **PAS** voir l'erreur 403

### Vérification 4 : Test avec cURL (Optionnel)

Vous pouvez tester les permissions Admin API avec une requête cURL :

```bash
curl -X GET \
  "https://votre-boutique.myshopify.com/admin/api/2024-10/customers.json?limit=1" \
  -H "X-Shopify-Access-Token: shpat_votre_token_admin" \
  -H "Content-Type: application/json"
```

**Résultat attendu** :
- ✅ **200 OK** : Les permissions sont correctement configurées
- ❌ **403 Forbidden** : Les permissions ne sont pas correctement configurées ou l'app n'est pas installée

---

## 🔍 Troubleshooting

### Erreur 403 : "This action requires merchant approval for write_draft_orders scope"

**Cause** : L'app n'a pas les permissions nécessaires ou n'est pas installée.

**Solution** :
1. Vérifiez que les scopes sont bien cochés dans "Configure Admin API scopes"
2. **Réinstallez l'app** (Uninstall → Install) pour obtenir l'approbation du marchand
3. Vérifiez que vous utilisez le bon token (Admin API, pas Storefront API)
4. Vérifiez que le token est bien défini dans `.env.local` comme `SHOPIFY_ADMIN_TOKEN`

### Erreur 401 : "Token d'accès invalide ou expiré"

**Cause** : Le token Admin est invalide, expiré ou mal configuré.

**Solution** :
1. Vérifiez que le token commence par `shpat_` ou `shpca_`
2. Vérifiez qu'il n'y a pas d'espaces avant/après le token dans `.env.local`
3. Générez un nouveau token dans Shopify Admin si nécessaire
4. Redémarrez le serveur après avoir modifié `.env.local`

### L'app n'apparaît pas dans "Develop apps"

**Cause** : Vous n'avez pas les permissions pour développer des apps.

**Solution** :
1. Vérifiez que vous êtes connecté avec un compte ayant les permissions de développeur
2. Contactez le propriétaire de la boutique pour obtenir les permissions nécessaires

### Les scopes ne sont pas sauvegardés

**Cause** : Certains scopes nécessitent une approbation supplémentaire.

**Solution** :
1. Vérifiez que vous avez bien cliqué sur "Save" après avoir coché les scopes
2. Certains scopes peuvent nécessiter une vérification supplémentaire de Shopify
3. Attendez quelques minutes et réessayez

---

## 📚 Ressources Supplémentaires

### Documentation Shopify Officielle

- [Admin API Scopes](https://shopify.dev/docs/api/admin-graphql#scopes)
- [Draft Orders API](https://shopify.dev/docs/api/admin-graphql/latest/mutations/draftordercreate)
- [Customers API](https://shopify.dev/docs/api/admin-graphql/latest/objects/Customer)

### Fichiers de Configuration du Projet

- `app/frontend/.env.local` - Variables d'environnement
- `app/frontend/app/src/lib/env.ts` - Validation des variables
- `app/frontend/app/src/lib/ShopifyAdminClient.ts` - Client Admin API

---

## 🔒 Sécurité

⚠️ **IMPORTANT** : Le token Admin API donne un accès complet à votre boutique Shopify.

**Bonnes Pratiques** :
- ✅ Ne partagez **JAMAIS** votre token Admin publiquement
- ✅ Ne commitez **JAMAIS** le fichier `.env.local` (il est dans `.gitignore`)
- ✅ Utilisez des tokens différents pour le développement et la production
- ✅ Régénérez le token si vous pensez qu'il a été compromis
- ✅ Limitez les scopes au strict nécessaire

---

## 📝 Notes Importantes

1. **Différence entre Storefront API et Admin API** :
   - **Storefront API** : Pour les opérations publiques (lecture produits, création paniers)
   - **Admin API** : Pour les opérations administratives (création commandes, gestion clients)

2. **Merchant Approval** :
   - Les scopes Admin API nécessitent l'approbation du marchand
   - Vous devez installer/réinstaller l'app après avoir ajouté des scopes
   - L'approbation est automatique pour les apps de développement

3. **Tokens** :
   - Le token Admin (`SHOPIFY_ADMIN_TOKEN`) est différent du token Storefront (`SHOPIFY_STOREFRONT_TOKEN`)
   - Les deux tokens sont nécessaires pour le fonctionnement complet du système

4. **Version API** :
   - Utilisez la même version API (`SHOPIFY_API_VERSION`) pour Storefront et Admin API
   - La version actuelle recommandée est `2024-10` ou `2025-01`

---

## ✅ Checklist de Configuration

Avant de tester le checkout, vérifiez que :

- [ ] Les scopes Admin API sont configurés dans Shopify Admin
- [ ] L'app est installée/réinstallée avec les nouvelles permissions
- [ ] Le token Admin est généré et copié
- [ ] `SHOPIFY_ADMIN_TOKEN` est défini dans `.env.local`
- [ ] Le serveur a été redémarré après modification de `.env.local`
- [ ] Les logs de démarrage affichent "✅ Shopify Admin Client initialisé"
- [ ] Le test de création de draft order fonctionne sans erreur 403

---

**Dernière mise à jour** : Janvier 2025  
**Version** : 1.0.0

