# 🍍 Configuration des Variables d'Environnement

## 📍 Emplacement du fichier `.env.local`

Créez ou modifiez le fichier `.env.local` à la racine de `app/frontend/` :

```bash
app/frontend/.env.local
```

## 🔑 Variables Shopify Requises

Ajoutez ces variables dans votre fichier `.env.local` :

```env
# Domaine de votre boutique Shopify
SHOPIFY_STORE_DOMAIN=votre-boutique.myshopify.com

# Token d'accès Storefront API
SHOPIFY_STOREFRONT_TOKEN=votre_token_storefront_ici
```

## 📝 Comment obtenir le token Shopify Storefront

1. **Connectez-vous à Shopify Admin**
   - Allez sur <https://admin.shopify.com>
   - Connectez-vous à votre boutique

2. **Accédez aux Apps de développement**
   - Cliquez sur **Settings** (Paramètres) en bas à gauche
   - Cliquez sur **Apps and sales channels** (Apps et canaux de vente)
   - Cliquez sur **Develop apps** (Développer des apps)

3. **Créez ou utilisez une app existante**
   - Cliquez sur **Create an app** (Créer une app)
   - Donnez un nom à votre app (ex: "JOLANANAS Storefront")
   - Cliquez sur **Create app**

4. **Configurez les permissions Storefront API**
   - Dans votre app, cliquez sur **Configure Admin API scopes**
   - Cochez les permissions nécessaires pour Storefront API :
     - `unauthenticated_read_product_listings`
     - `unauthenticated_read_product_inventory`
     - `unauthenticated_read_collection_listings`
     - `unauthenticated_read_checkouts`
     - `unauthenticated_write_checkouts`
     - `unauthenticated_write_customers`
     - `unauthenticated_read_customers`

5. **Générez le Storefront Access Token**
   - Cliquez sur **API credentials** (Identifiants API)
   - Faites défiler jusqu'à **Storefront API access token**
   - Cliquez sur **Install app** si nécessaire
   - Cliquez sur **Reveal token once** (Révéler le token une fois)
   - **Copiez le token** (il commence généralement par `shpat_` ou `shpca_`)

6. **Ajoutez le token dans `.env.local`**

   ```env
   SHOPIFY_STOREFRONT_TOKEN=shpat_votre_token_ici
   ```

## 🔑 Configuration Admin API (OBLIGATOIRE pour le Checkout)

Le système de checkout personnalisé nécessite l'Admin API pour créer des draft orders et gérer les clients.

### Variables Requises

```env
# Token Admin API (OBLIGATOIRE pour le checkout personnalisé)
SHOPIFY_ADMIN_TOKEN=votre_token_admin_ici
```

### Comment obtenir le token Admin API

1. **Accédez à Shopify Admin**
   - Allez sur <https://admin.shopify.com>
   - Settings → Apps and sales channels → Develop apps

2. **Sélectionnez ou créez votre app**
   - Cliquez sur votre app existante ou créez-en une nouvelle

3. **Configurez les permissions Admin API**
   - Cliquez sur **Configure Admin API scopes**
   - Cochez les scopes suivants (OBLIGATOIRES) :
     - ✅ `write_draft_orders` - Créer des commandes brouillons
     - ✅ `read_customers` - Lire les clients
     - ✅ `write_customers` - Créer/modifier les clients
   - Cliquez sur **Save**

4. **Installez/Réinstallez l'app**
   - ⚠️ **IMPORTANT** : Vous devez installer ou réinstaller l'app pour obtenir l'approbation du marchand
   - API credentials → Admin API access token → **Install app** (ou Uninstall puis Install)

5. **Générez le token Admin**
   - Après installation, cliquez sur **Reveal token once**
   - **Copiez le token** (commence par `shpat_` ou `shpca_`)
   - ⚠️ Le token ne sera affiché qu'une seule fois

6. **Ajoutez le token dans `.env.local`**

   ```env
   SHOPIFY_ADMIN_TOKEN=shpat_votre_token_admin_ici
   ```

📖 **Guide détaillé** : Voir [Configuration Admin API — JOLANANAS.md](../../docs/Configuration%20Admin%20API%20—%20JOLANANAS.md) pour les instructions complètes et le troubleshooting.

### Vérification

Après configuration, redémarrez le serveur et vérifiez les logs :

```console
✅ Shopify Admin API configuré: {
  domain: 'votre-boutique.myshopify.com',
  apiVersion: '2024-10',
  tokenPreview: 'shpat_xxxxx...'
}
✅ Shopify Admin Client initialisé: votre-boutique.myshopify.com
```

## ✅ Variables Optionnelles

```env
# Version de l'API Shopify (par défaut: 2025-10)
SHOPIFY_API_VERSION=2025-10

# Secret pour valider les webhooks (optionnel)
SHOPIFY_WEBHOOK_SECRET=
```

## 🔄 Redémarrer le serveur

Après avoir modifié `.env.local`, **redémarrez le serveur de développement** :

```bash
# Arrêtez le serveur (Ctrl+C)
# Puis relancez-le
pnpm run dev
```

## ⚠️ Important

- Le fichier `.env.local` est dans `.gitignore` et ne sera **jamais commité**
- Ne partagez **jamais** vos tokens Shopify publiquement
- Si vous perdez votre token, vous pouvez en générer un nouveau dans Shopify Admin

## 🔧 Dépannage

### Erreur : "Variables d'environnement manquantes"

Si vous voyez une erreur indiquant que des variables d'environnement sont manquantes :

#### 1. Vérifier que le fichier `.env.local` existe

```bash
# Depuis app/frontend/
ls -la .env.local
```

Le fichier doit exister à la racine de `app/frontend/`.

#### 2. Vérifier le contenu du fichier `.env.local`

```bash
# Vérifier que toutes les variables requises sont présentes
cat .env.local | grep -E "SHOPIFY_STORE_DOMAIN|SHOPIFY_STOREFRONT_TOKEN|SHOPIFY_API_VERSION|SHOPIFY_ADMIN_TOKEN"
```

Assurez-vous que toutes ces variables sont définies :

- `SHOPIFY_STORE_DOMAIN`
- `SHOPIFY_STOREFRONT_TOKEN`
- `SHOPIFY_API_VERSION`
- `SHOPIFY_ADMIN_TOKEN`

#### 3. ⚠️ **IMPORTANT : Redémarrer le serveur de développement**

**Les variables d'environnement ne sont pas rechargées à chaud dans Next.js.**

Après avoir créé ou modifié `.env.local`, vous **DEVEZ** redémarrer le serveur :

```bash
# 1. Arrêtez le serveur actuel (Ctrl+C dans le terminal où il tourne)

# 2. Relancez le serveur
cd app/frontend
pnpm run dev
```

#### 4. Vérifier que les variables sont chargées

Après le redémarrage, vous devriez voir dans les logs :

```console
✅ Variables d'environnement validées: {
  SHOPIFY_STORE_DOMAIN: 'u6ydbb-sx.myshopify.com',
  SHOPIFY_API_VERSION: '2025-10',
  NODE_ENV: 'development',
  ...
}
```

Si vous ne voyez pas ce message, les variables ne sont pas chargées correctement.

#### 5. Vérifier le format des variables

**SHOPIFY_STORE_DOMAIN** doit contenir `.myshopify.com` :

```env
✅ Correct: u6ydbb-sx.myshopify.com
❌ Incorrect: u6ydbb-sx.shopify.com
❌ Incorrect: https://u6ydbb-sx.myshopify.com
```

**SHOPIFY_API_VERSION** doit être au format `YYYY-MM` :

```env
✅ Correct: 2025-10
❌ Incorrect: 2025-10-01
❌ Incorrect: latest
```

**SHOPIFY_ADMIN_TOKEN** et **SHOPIFY_STOREFRONT_TOKEN** ne doivent pas contenir de placeholders :

```env
✅ Correct: shpat_[TOKEN_COMPROMISED]
❌ Incorrect: votre_token_ici
❌ Incorrect: your_token_here
❌ Incorrect: test-token-for-testing-only
```

### Erreur : "process.env n'est pas disponible"

Cette erreur indique que le code s'exécute dans un environnement où `process.env` n'est pas disponible (par exemple, côté client).

**Solution** : Assurez-vous que le fichier `env.ts` n'est importé que dans du code serveur (API routes, Server Components, etc.).

### Erreur : "Fichier .env.local non trouvé"

En développement, un avertissement peut apparaître si le fichier `.env.local` n'existe pas.

**Solution** :

1. Copiez le fichier `.env.example` vers `.env.local` :

   ```bash
   cp .env.example .env.local
   ```

2. Remplissez toutes les variables requises
3. Redémarrez le serveur

### Vérifier les variables chargées en temps réel

Pour déboguer, vous pouvez temporairement ajouter dans votre code :

```typescript
// Dans un fichier serveur uniquement (API route, Server Component)
console.log('Variables chargées:', {
  SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN,
  SHOPIFY_STOREFRONT_TOKEN: process.env.SHOPIFY_STOREFRONT_TOKEN ? '✅ Défini' : '❌ Manquant',
  SHOPIFY_API_VERSION: process.env.SHOPIFY_API_VERSION,
  SHOPIFY_ADMIN_TOKEN: process.env.SHOPIFY_ADMIN_TOKEN ? '✅ Défini' : '❌ Manquant',
});
```

### Checklist de dépannage rapide

- [ ] Le fichier `.env.local` existe dans `app/frontend/`
- [ ] Toutes les variables requises sont définies dans `.env.local`
- [ ] Les valeurs ne contiennent pas de placeholders (`votre_`, `your_`, etc.)
- [ ] Le format des variables est correct (domaine avec `.myshopify.com`, version `YYYY-MM`)
- [ ] Le serveur de développement a été **redémarré** après modification de `.env.local`
- [ ] Les logs de démarrage montrent "✅ Variables d'environnement validées"

### Besoin d'aide supplémentaire ?

Consultez la documentation complète dans :

- `CONFIGURATION_ENV.md` (ce fichier)
- `app/docs/Configuration Admin API — JOLANANAS.md` pour la configuration Admin API
