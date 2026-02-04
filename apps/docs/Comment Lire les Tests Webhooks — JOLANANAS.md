# 🍍 JOLANANAS - Comment Lire les Tests Webhooks

## 📋 Vue d'Ensemble

Quand vous envoyez un test de webhook depuis Shopify Admin, voici comment voir les résultats et vérifier que tout fonctionne correctement.

---

## 🧪 Envoyer un Test depuis Shopify Admin

### Étapes

1. **Accédez à Shopify Admin** → **Settings** → **Notifications** → **Webhooks**
2. **Trouvez le webhook** que vous voulez tester (ex: "Mise à jour de produit")
3. **Cliquez sur les trois points** (⋯) à droite du webhook
4. **Sélectionnez "Envoyer un test"** (Send a test)

Shopify enverra alors un webhook de test à votre URL configurée.

---

## 📊 Où Voir les Résultats

### 1. Dans Vercel Dashboard (Production)

**C'est la méthode principale pour voir les résultats en production.**

#### Étapes

1. **Allez sur** [Vercel Dashboard](https://vercel.com/dashboard)
2. **Sélectionnez votre projet** "jolananas"
3. **Cliquez sur "Deployments"** dans le menu de gauche
4. **Sélectionnez le dernier déploiement**
5. **Cliquez sur "Functions"** dans le menu
6. **Trouvez** `/api/webhooks/revalidate`
7. **Cliquez dessus** pour voir les logs

#### Ce que vous verrez

```
⚡ Webhook reçu: products/update (ID: 123456). Revalidation en cours...
📝 Webhook enregistré dans la DB: clx1234567890 (products/update)
✅ Tag "products" revalidé pour products/update
✅ Webhook traité avec succès en 45ms
```

#### Logs d'erreur possibles

```
❌ Webhook revalidate: Signature invalide
⚠️ Topic non géré: products/unknown
❌ Erreur lors du traitement du webhook: [détails]
```

---

### 2. Dans la Base de Données (Tous les Webhooks)

**Tous les webhooks sont maintenant enregistrés dans la base de données.**

#### Via Prisma Studio

```bash
cd apps/frontend
npm run db:studio
```

1. **Ouvrez Prisma Studio** (généralement sur <http://localhost:5555>)
2. **Sélectionnez le modèle** `WebhookEvent`
3. **Vous verrez tous les webhooks** reçus avec :
   - `topic` : Le topic du webhook (ex: `products/update`)
   - `shopifyId` : L'ID Shopify de l'objet
   - `status` : `PROCESSING`, `PROCESSED`, ou `FAILED`
   - `payload` : Le contenu complet du webhook (JSON)
   - `createdAt` : Date de réception
   - `processedAt` : Date de traitement

#### Via SQL Direct

```sql
-- Voir les 10 derniers webhooks
SELECT * FROM webhook_events
ORDER BY createdAt DESC
LIMIT 10;

-- Voir les webhooks échoués
SELECT * FROM webhook_events
WHERE status = 'FAILED'
ORDER BY createdAt DESC;

-- Voir les webhooks par topic
SELECT topic, COUNT(*) as count,
       SUM(CASE WHEN status = 'PROCESSED' THEN 1 ELSE 0 END) as success,
       SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed
FROM webhook_events
GROUP BY topic;
```

---

### 3. Dans les Logs Locaux (Développement)

**Si vous testez en local avec un tunnel (ngrok, cloudflared) :**

#### Étapes

1. **Démarrez le serveur de développement :**

   ```bash
   cd apps/frontend
   npm run dev
   ```

2. **Les logs apparaîtront directement dans le terminal :**

   ```
   ⚡ Webhook reçu: products/update (ID: 123456). Revalidation en cours...
   📝 Webhook enregistré dans la DB: clx1234567890 (products/update)
   ✅ Tag "products" revalidé pour products/update
   ✅ Webhook traité avec succès en 45ms
   ```

---

### 4. Via l'API de Réponse

**Quand vous envoyez un test depuis Shopify, la réponse JSON contient :**

```json
{
  "status": 200,
  "revalidated": true,
  "topic": "products/update",
  "tag": "products",
  "webhookEventId": "clx1234567890",
  "duration": "45ms",
  "now": 1767748403113
}
```

**Si vous utilisez un outil comme Postman ou curl :**

```bash
# Tester manuellement
curl -X POST https://jolananas.vercel.apps/api/webhooks/revalidate \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Topic: products/update" \
  -H "X-Shopify-Hmac-Sha256: [signature]" \
  -d '{"id": 123456}'
```

---

## 🔍 Interpréter les Résultats

### ✅ Succès

**Indicateurs de succès :**

- Status `200` dans la réponse
- `revalidated: true` dans la réponse
- Logs montrent `✅ Tag "products" revalidé`
- `status: 'PROCESSED'` dans la base de données
- `processedAt` est défini dans la base de données

### ❌ Échec

**Indicateurs d'échec :**

- Status `401` : Signature HMAC invalide
- Status `500` : Erreur lors du traitement
- `status: 'FAILED'` dans la base de données
- Logs montrent `❌` ou `⚠️`

---

## 🛠️ Dépannage

### Problème : "Signature invalide" (401)

**Causes possibles :**

1. `SHOPIFY_WEBHOOK_SECRET` ne correspond pas au secret dans Shopify
2. Le secret n'est pas configuré dans Vercel (pour la production)

**Solution :**

1. Vérifiez le secret dans Shopify Admin → Settings → Notifications → Webhooks
2. Vérifiez que le même secret est dans Vercel → Settings → Environment Variables
3. Le secret doit être : `8c4598b6e47d26aeb3be09e2dbad7bdd4f0e9c8bf386d5f90ddce0450bc13744`

### Problème : "Topic non géré"

**Cause :** Le topic n'est pas dans la liste des topics gérés.

**Topics gérés actuellement :**

- `products/create`, `products/update`, `products/delete`
- `collections/create`, `collections/update`, `collections/delete`

**Solution :** Ajoutez le topic dans le switch de `apps/frontend/apps/api/webhooks/revalidate/route.ts`

### Problème : Webhook non enregistré dans la DB

**Cause :** Problème de connexion à la base de données.

**Solution :**

1. Vérifiez que la base de données est accessible
2. Vérifiez les logs Vercel pour les erreurs de connexion DB
3. Le webhook fonctionnera quand même (revalidation), mais ne sera pas enregistré

---

## 📈 Statistiques des Webhooks

### Requête SQL pour les Statistiques

```sql
-- Statistiques globales
SELECT
  topic,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'PROCESSED' THEN 1 ELSE 0 END) as success,
  SUM(CASE WHEN status = 'FAILED' THEN 1 ELSE 0 END) as failed,
  SUM(CASE WHEN status = 'PROCESSING' THEN 1 ELSE 0 END) as processing,
  AVG(CASE WHEN processedAt IS NOT NULL THEN
    (julianday(processedAt) - julianday(createdAt)) * 86400000
  END) as avg_duration_ms
FROM webhook_events
GROUP BY topic
ORDER BY total DESC;
```

---

## 🎯 Checklist de Vérification

Après avoir envoyé un test depuis Shopify :

- [ ] Vérifier les logs Vercel (si en production)
- [ ] Vérifier les logs locaux (si en développement)
- [ ] Vérifier la base de données (Prisma Studio)
- [ ] Vérifier la réponse JSON (status 200, revalidated: true)
- [ ] Vérifier que le tag est revalidé (logs montrent `✅ Tag "products" revalidé`)

---

## 💡 Astuces

### Filtrer les Logs Vercel

Dans Vercel Dashboard → Functions → Logs, vous pouvez :

- Filtrer par fonction : `/api/webhooks/revalidate`
- Filtrer par niveau : `error`, `warn`, `info`
- Rechercher des termes : `webhook`, `revalidate`, `products`

### Surveiller en Temps Réel

```bash
# Si vous avez accès aux logs Vercel via CLI
vercel logs --follow

# Ou utilisez le dashboard Vercel en temps réel
```

---

**🍍 Guide complet pour lire et interpréter les tests webhooks !**
