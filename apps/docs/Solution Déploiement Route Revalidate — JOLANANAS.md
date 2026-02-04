# 🍍 JOLANANAS - Solution Déploiement Route `/api/revalidate`

## 🔍 Diagnostic

### Problème Identifié

La route `/api/revalidate` existe dans le code (`apps/frontend/apps/api/revalidate/route.ts`) mais n'est pas déployée sur Vercel, causant des échecs dans les tests.

### Causes Possibles

1. **Route non détectée lors du build Next.js**
2. **Configuration Vercel incorrecte** (répertoire de build)
3. **Route exclue par erreur** lors du déploiement
4. **Problème de cache** Vercel

---

## ✅ Solutions

### Solution 1 : Vérifier la Configuration Vercel

#### 1.1 Vérifier le Root Directory

Dans **Vercel Dashboard** → **Settings** → **General** :

- **Root Directory** : Doit être `apps/frontend` (pas `app` ou racine)
- **Build Command** : `npm run build` ou `next build`
- **Output Directory** : `.next` (par défaut pour Next.js)

#### 1.2 Vérifier les Variables d'Environnement

Assurez-vous que `SHOPIFY_REVALIDATION_SECRET` est configuré dans :

- **Vercel Dashboard** → **Settings** → **Environment Variables**
- Pour tous les environnements (Production, Preview, Development)

---

### Solution 2 : Créer un Fichier `vercel.json` (Recommandé)

Créer `apps/frontend/vercel.json` pour forcer l'inclusion de toutes les routes API :

```json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ],
  "functions": {
    "apps/api/**/*.ts": {
      "runtime": "nodejs20.x"
    }
  }
}
```

---

### Solution 3 : Vérifier le Build Local

Tester le build localement pour vérifier que la route est incluse :

```bash
cd apps/frontend
npm run build
```

Vérifier dans `.next/server/apps/api/revalidate/route.js` que le fichier existe.

---

### Solution 4 : Forcer le Redéploiement

#### 4.1 Via Vercel Dashboard

1. **Vercel Dashboard** → **Deployments**
2. Cliquer sur le dernier déploiement
3. **Redeploy** → **Use existing Build Cache** : **Désactivé**
4. Cliquer sur **Redeploy**

#### 4.2 Via CLI

```bash
cd apps/frontend
vercel --prod --force
```

#### 4.3 Via Git (Recommandé)

Créer un commit vide pour forcer le redéploiement :

```bash
git commit --allow-empty -m "chore: force redeploy to include /api/revalidate"
git push
```

---

### Solution 5 : Vérifier la Structure du Projet

La route doit être dans la structure suivante pour Next.js App Router :

```
apps/frontend/
├── apps/
│   └── api/
│       └── revalidate/
│           └── route.ts  ✅ Correct
```

**Vérification** :

```bash
cd apps/frontend
ls -la apps/api/revalidate/route.ts
# Doit afficher : apps/api/revalidate/route.ts
```

---

## 🧪 Tests de Vérification

### Test 1 : Vérifier Localement

```bash
# Terminal 1 : Démarrer le serveur
cd apps/frontend
npm run dev

# Terminal 2 : Tester l'endpoint
curl -X GET http://localhost:3000/api/revalidate
```

**Résultat attendu** : Réponse JSON avec la documentation de l'endpoint.

### Test 2 : Vérifier après Build

```bash
cd apps/frontend
npm run build
npm run start

# Dans un autre terminal
curl -X GET http://localhost:3000/api/revalidate
```

**Résultat attendu** : Réponse JSON avec la documentation de l'endpoint.

### Test 3 : Vérifier sur Vercel

```bash
curl -X GET https://jolananas.vercel.apps/api/revalidate
```

**Résultat attendu** : Réponse JSON avec la documentation de l'endpoint.

Si vous obtenez une erreur 404 ou "Redirecting...", la route n'est pas déployée.

---

## 🔧 Actions Immédiates

### Checklist de Déploiement

- [ ] Vérifier que `apps/frontend/apps/api/revalidate/route.ts` existe
- [ ] Vérifier la configuration Vercel (Root Directory = `apps/frontend`)
- [ ] Vérifier que `SHOPIFY_REVALIDATION_SECRET` est configuré dans Vercel
- [ ] Créer `apps/frontend/vercel.json` si nécessaire
- [ ] Tester le build local (`npm run build`)
- [ ] Vérifier que `.next/server/apps/api/revalidate/route.js` existe après le build
- [ ] Forcer le redéploiement sur Vercel
- [ ] Tester l'endpoint sur Vercel après déploiement

---

## 📝 Fichier `vercel.json` Recommandé

Créer `apps/frontend/vercel.json` :

```json
{
  "buildCommand": "next build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "functions": {
    "apps/api/**/*.ts": {
      "runtime": "nodejs20.x",
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        {
          "key": "Access-Control-Allow-Origin",
          "value": "*"
        },
        {
          "key": "Access-Control-Allow-Methods",
          "value": "GET, POST, PUT, DELETE, OPTIONS"
        },
        {
          "key": "Access-Control-Allow-Headers",
          "value": "Content-Type, Authorization, X-Revalidation-Secret"
        }
      ]
    }
  ]
}
```

---

## 🚨 Dépannage

### Problème : Route retourne 404

**Solutions** :

1. Vérifier que le Root Directory dans Vercel est `apps/frontend`
2. Vérifier que le fichier `route.ts` existe bien
3. Forcer un redéploiement sans cache
4. Vérifier les logs Vercel pour voir si la route est détectée

### Problème : Route retourne "Redirecting..."

**Solutions** :

1. Vérifier que `SHOPIFY_REVALIDATION_SECRET` est configuré dans Vercel
2. Vérifier que la variable d'environnement est disponible pour Production
3. Redéployer après avoir ajouté la variable

### Problème : Route non incluse dans le build

**Solutions** :

1. Vérifier que le fichier n'est pas dans `.gitignore`
2. Vérifier que le fichier n'est pas dans `.vercelignore`
3. Vérifier la structure du projet (doit être dans `apps/api/`)
4. Tester le build localement

---

## 📊 Vérification Post-Déploiement

### Commande de Test Complète

```bash
# Test GET (documentation)
curl -X GET https://jolananas.vercel.apps/api/revalidate

# Test POST (revalidation)
curl -X POST https://jolananas.vercel.apps/api/revalidate \
  -H "Authorization: Bearer YOUR_REVALIDATION_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"tag": "products"}'
```

### Résultats Attendus

**GET `/api/revalidate`** :

```json
{
  "message": "Endpoint de revalidation manuelle",
  "usage": { ... }
}
```

**POST `/api/revalidate`** (avec secret valide) :

```json
{
  "revalidated": true,
  "items": ["tag:products"],
  "now": 1234567890
}
```

---

## ✅ Validation Finale

Une fois le déploiement réussi :

1. ✅ L'endpoint GET `/api/revalidate` retourne la documentation
2. ✅ L'endpoint POST `/api/revalidate` fonctionne avec le secret
3. ✅ Les tests automatisés passent
4. ✅ Les logs Vercel montrent que la route est accessible

---

**🍍 Guide de résolution du problème de déploiement de la route `/api/revalidate`**
