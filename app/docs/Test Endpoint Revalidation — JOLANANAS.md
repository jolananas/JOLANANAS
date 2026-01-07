# 🍍 JOLANANAS - Test de l'Endpoint de Revalidation

## 🧪 Test de l'Endpoint `/api/revalidate`

### Commande de Test

```bash
curl -X POST https://jolananas.vercel.app/api/revalidate \
  -H "Authorization: Bearer fb279f760f376bbfb164a919dc2403b7079141815eba0c97c886035d57c03162" \
  -H "Content-Type: application/json" \
  -d '{"tag": "products"}'
```

### Réponse Attendue

```json
{
  "revalidated": true,
  "items": ["tag:products"],
  "now": 1767748403113
}
```

---

## ⚠️ Problème : "Redirecting..."

Si vous voyez "Redirecting..." au lieu d'une réponse JSON, cela peut être dû à :

### 1. Secret Non Configuré dans Vercel

**Solution :**
1. Allez dans **Vercel Dashboard** → **Settings** → **Environment Variables**
2. Ajoutez `SHOPIFY_REVALIDATION_SECRET` avec la valeur :
   ```
   fb279f760f376bbfb164a919dc2403b7079141815eba0c97c886035d57c03162
   ```
3. **Redéployez** l'application (ou attendez le prochain déploiement)

### 2. Route Non Déployée

**Vérification :**
- Vérifiez que le dernier commit a été déployé sur Vercel
- Attendez quelques minutes après le push pour que le déploiement se termine

### 3. Test en Local

Pour tester en local avant de déployer :

```bash
# Terminal 1 : Démarrer le serveur
cd app/frontend
npm run dev

# Terminal 2 : Tester l'endpoint
curl -X POST http://localhost:3000/api/revalidate \
  -H "Authorization: Bearer fb279f760f376bbfb164a919dc2403b7079141815eba0c97c886035d57c03162" \
  -H "Content-Type: application/json" \
  -d '{"tag": "products"}'
```

---

## ✅ Vérification du Secret dans Vercel

### Via Vercel CLI

```bash
cd app/frontend
vercel env ls
```

Cherchez `SHOPIFY_REVALIDATION_SECRET` dans la liste.

### Via Vercel Dashboard

1. Allez sur https://vercel.com/dashboard
2. Sélectionnez le projet "jolananas"
3. **Settings** → **Environment Variables**
4. Vérifiez que `SHOPIFY_REVALIDATION_SECRET` est présent

---

## 🔍 Debug

### Vérifier les Logs Vercel

1. **Vercel Dashboard** → **Deployments** → Dernier déploiement
2. **Functions** → `/api/revalidate`
3. Vérifiez les logs pour voir les erreurs

### Erreurs Possibles

**"Revalidation secret non configuré"**
- Le secret n'est pas dans les variables d'environnement Vercel
- Solution : Ajoutez-le et redéployez

**"Secret de revalidation invalide"**
- Le secret fourni ne correspond pas
- Solution : Vérifiez que vous utilisez le bon secret

**"Redirecting..."**
- Généralement dû au secret non configuré ou route non déployée
- Solution : Configurez le secret et attendez le déploiement

---

## 📝 Exemples d'Utilisation

### Revalider le Tag Products

```bash
curl -X POST https://jolananas.vercel.app/api/revalidate \
  -H "Authorization: Bearer fb279f760f376bbfb164a919dc2403b7079141815eba0c97c886035d57c03162" \
  -H "Content-Type: application/json" \
  -d '{"tag": "products"}'
```

### Revalider Plusieurs Tags

```bash
curl -X POST https://jolananas.vercel.app/api/revalidate \
  -H "Authorization: Bearer fb279f760f376bbfb164a919dc2403b7079141815eba0c97c886035d57c03162" \
  -H "Content-Type: application/json" \
  -d '{"tags": ["products", "collections"]}'
```

### Revalider un Path

```bash
curl -X POST https://jolananas.vercel.app/api/revalidate \
  -H "Authorization: Bearer fb279f760f376bbfb164a919dc2403b7079141815eba0c97c886035d57c03162" \
  -H "Content-Type: application/json" \
  -d '{"path": "/products"}'
```

### Revalider Tous les Tags par Défaut

```bash
curl -X POST https://jolananas.vercel.app/api/revalidate \
  -H "Authorization: Bearer fb279f760f376bbfb164a919dc2403b7079141815eba0c97c886035d57c03162" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## 🚀 Après Configuration

Une fois le secret configuré dans Vercel et l'application redéployée, l'endpoint devrait fonctionner correctement et retourner une réponse JSON au lieu de "Redirecting...".

---

**🍍 Guide de test de l'endpoint de revalidation**

