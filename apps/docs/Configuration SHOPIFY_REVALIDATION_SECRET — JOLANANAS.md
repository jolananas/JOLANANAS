# 🍍 JOLANANAS - Configuration SHOPIFY_REVALIDATION_SECRET

## 📋 Vue d'Ensemble

`SHOPIFY_REVALIDATION_SECRET` est un secret personnalisé que vous définissez pour sécuriser les endpoints de revalidation manuelle. Il permet de vérifier que les requêtes de revalidation proviennent bien de sources autorisées.

> **Note :** Ce n'est **PAS** un secret Shopify natif. C'est une variable que vous créez vous-même pour sécuriser vos endpoints.

---

## 🔐 Génération du Secret

Un secret aléatoire sécurisé a été généré pour vous :

```
fb279f760f376bbfb164a919dc2403b7079141815eba0c97c886035d57c03162
```

### Générer un Nouveau Secret

Si vous voulez générer un nouveau secret :

```bash
# Avec Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Avec OpenSSL
openssl rand -hex 32

# Avec Python
python3 -c "import secrets; print(secrets.token_hex(32))"
```

---

## ⚙️ Configuration

### 1. Variables d'Environnement Locales

**Fichier :** `apps/frontend/variables/.env.local`

```env
SHOPIFY_REVALIDATION_SECRET=fb279f760f376bbfb164a919dc2403b7079141815eba0c97c886035d57c03162
```

### 2. Variables d'Environnement Vercel

**Dans Vercel Dashboard :**

1. Allez dans **Settings** → **Environment Variables**
2. Ajoutez :
   - **Name :** `SHOPIFY_REVALIDATION_SECRET`
   - **Value :** `fb279f760f376bbfb164a919dc2403b7079141815eba0c97c886035d57c03162`
   - **Environments :** Production, Preview, Development

---

## 🔒 Utilisation

### Endpoint de Revalidation Manuelle

**URL :** `https://jolananas.vercel.apps/api/revalidate`

#### Authentification

Envoyez le secret dans l'un des headers suivants :

**Option 1 : Authorization Bearer**

```bash
curl -X POST https://jolananas.vercel.apps/api/revalidate \
  -H "Authorization: Bearer fb279f760f376bbfb164a919dc2403b7079141815eba0c97c886035d57c03162" \
  -H "Content-Type: application/json" \
  -d '{"tag": "products"}'
```

**Option 2 : Header personnalisé**

```bash
curl -X POST https://jolananas.vercel.apps/api/revalidate \
  -H "X-Revalidation-Secret: fb279f760f376bbfb164a919dc2403b7079141815eba0c97c886035d57c03162" \
  -H "Content-Type: application/json" \
  -d '{"tag": "products"}'
```

#### Exemples d'Utilisation

**1. Revalider un tag spécifique :**

```json
{
  "tag": "products"
}
```

**2. Revalider plusieurs tags :**

```json
{
  "tags": ["products", "collections"]
}
```

**3. Revalider un path :**

```json
{
  "path": "/products"
}
```

**4. Revalider plusieurs paths :**

```json
{
  "path": ["/products", "/collections"]
}
```

**5. Revalider tous les tags par défaut (products + collections) :**

```json
{}
```

---

## 🔄 Webhooks Shopify

### Comportement Actuel

La route `/api/webhooks/revalidate` accepte **deux méthodes d'authentification** :

1. **HMAC Shopify** (pour les webhooks Shopify) - Vérifie la signature HMAC-SHA256
2. **SHOPIFY_REVALIDATION_SECRET** (pour les revalidations manuelles) - Vérifie le secret personnalisé

### Priorité

- Si `SHOPIFY_REVALIDATION_SECRET` est configuré et fourni dans la requête, il est vérifié en premier
- Si le secret de revalidation n'est pas fourni, la vérification HMAC Shopify est utilisée
- Si aucune des deux méthodes n'est valide, la requête est rejetée (401)

---

## 🛡️ Sécurité

### Bonnes Pratiques

1. **Ne jamais commiter le secret** dans le code source
2. **Utiliser des secrets différents** pour chaque environnement (dev, staging, prod)
3. **Régénérer le secret** si compromis
4. **Utiliser HTTPS** uniquement pour les requêtes de revalidation
5. **Limiter l'accès** aux endpoints de revalidation (rate limiting, IP whitelist si possible)

### Rotation du Secret

Si vous devez changer le secret :

1. Générer un nouveau secret
2. Mettre à jour dans Vercel (Production)
3. Mettre à jour dans `.env.local` (Développement)
4. Mettre à jour les scripts/applications qui utilisent ce secret
5. Tester que tout fonctionne

---

## 📝 Tags Disponibles

Les tags suivants sont disponibles pour la revalidation :

| Tag           | Description           | Utilisé pour                                     |
| ------------- | --------------------- | ------------------------------------------------ |
| `products`    | Cache des produits    | `getAllProducts()`, `getProductByHandle()`       |
| `collections` | Cache des collections | `getAllCollections()`, `getCollectionByHandle()` |
| `cart`        | Cache du panier       | `getCart()`                                      |

---

## 🧪 Tests

### Test de l'Endpoint de Revalidation

```bash
# Test avec curl
curl -X POST https://jolananas.vercel.apps/api/revalidate \
  -H "Authorization: Bearer fb279f760f376bbfb164a919dc2403b7079141815eba0c97c886035d57c03162" \
  -H "Content-Type: application/json" \
  -d '{"tag": "products"}'
```

**Réponse attendue :**

```json
{
  "revalidated": true,
  "items": ["tag:products"],
  "now": 1767748403113
}
```

### Test avec le Script de Test

Le script `test-webhooks.ts` utilise toujours la vérification HMAC Shopify (pour simuler les vrais webhooks Shopify).

Pour tester la revalidation manuelle, utilisez directement l'endpoint `/api/revalidate`.

---

## 🔍 Dépannage

### Erreur : "Secret de revalidation invalide"

**Causes possibles :**

1. Le secret n'est pas configuré dans les variables d'environnement
2. Le secret fourni ne correspond pas au secret configuré
3. Le header n'est pas correctement formaté

**Solution :**

1. Vérifiez que `SHOPIFY_REVALIDATION_SECRET` est dans `.env.local` ou Vercel
2. Vérifiez que le secret dans la requête correspond exactement
3. Vérifiez le format du header (`Bearer ` ou `X-Revalidation-Secret`)

### Erreur : "Revalidation secret non configuré"

**Cause :** `SHOPIFY_REVALIDATION_SECRET` n'est pas défini dans les variables d'environnement.

**Solution :** Ajoutez le secret dans `.env.local` ou dans Vercel Dashboard.

---

## 📚 Références

- [Next.js On-Demand Revalidation](https://nextjs.org/docs/apps/building-your-application/data-fetching/revalidating#on-demand-revalidation)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## ✅ Checklist de Configuration

- [ ] Secret généré et ajouté dans `.env.local`
- [ ] Secret ajouté dans Vercel Dashboard (Production)
- [ ] Secret ajouté dans Vercel Dashboard (Preview/Development si nécessaire)
- [ ] Test de l'endpoint `/api/revalidate` réussi
- [ ] Documentation partagée avec l'équipe
- [ ] Secrets différents pour chaque environnement (recommandé)

---

**🍍 Configuration SHOPIFY_REVALIDATION_SECRET - Sécurisation des endpoints de revalidation**
