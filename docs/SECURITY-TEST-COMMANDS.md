# 🧪 Commandes de Test pour Vérification Post-Rotation

> **Date** : 13 Janvier 2026  
> **Objectif** : Vérifier que l'ancien Secret est révoqué et que le nouveau fonctionne

---

## ❌ Test 1 : Vérifier que l'Ancien Secret est Révoqué

```bash
# Test avec l'ancien secret compromis (doit échouer avec 401)
curl -X POST https://u6ydbb-sx.myshopify.com/admin/api/2026-04/graphql.json \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Access-Token: shpss_[SECRET_COMPROMISED]" \
  -d '{"query": "{ shop { name } }"}'

# ✅ Résultat attendu : Erreur 401 (Unauthorized) ou 403 (Forbidden)
# ❌ Si ça fonctionne = Le secret n'a pas été révoqué (URGENT)
```

---

## ✅ Test 2 : Vérifier que le Nouveau Secret Fonctionne

```bash
# Test avec le nouveau secret (doit réussir)
curl -X POST https://u6ydbb-sx.myshopify.com/admin/api/2026-04/graphql.json \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Access-Token: VOTRE_NOUVEAU_SECRET_ICI" \
  -d '{"query": "{ shop { name } }"}'

# ✅ Résultat attendu : {"data":{"shop":{"name":"Jolananas"}}}
# ❌ Si erreur 401 = Vérifiez que vous avez bien copié le nouveau secret
```

---

## 🔍 Test 3 : Vérifier Storefront API (si utilisé)

```bash
# Test Storefront API avec le nouveau token
curl -X POST https://u6ydbb-sx.myshopify.com/api/2026-04/graphql.json \
  -H "Content-Type: application/json" \
  -H "X-Shopify-Storefront-Access-Token: VOTRE_NOUVEAU_STOREFRONT_TOKEN_ICI" \
  -d '{"query": "{ shop { name } }"}'

# ✅ Résultat attendu : {"data":{"shop":{"name":"Jolananas"}}}
```

---

## 📋 Notes Importantes

1. **Content-Type obligatoire** : Toujours inclure `-H "Content-Type: application/json"`
2. **Remplacez les tokens** : Remplacez `VOTRE_NOUVEAU_SECRET_ICI` par le vrai secret
3. **Version API** : Utilisez la version API configurée dans votre projet (2026-04 ou autre)

---

## 🐛 Dépannage

### Erreur "Unsupported Content-Type header"
- ✅ **Solution** : Ajoutez `-H "Content-Type: application/json"` à votre commande curl

### Erreur 401 (Unauthorized)
- ✅ **Ancien secret** : Normal, il est révoqué
- ❌ **Nouveau secret** : Vérifiez que vous avez bien copié le secret complet

### Erreur 403 (Forbidden)
- ⚠️ **Possible** : Les permissions de l'app ne sont pas correctement configurées
- ✅ **Solution** : Vérifiez les scopes dans le Dev Dashboard

---

**Date de création** : 13 Janvier 2026
