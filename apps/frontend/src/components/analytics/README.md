# 📊 Configuration Vercel Analytics — JOLANANAS

## 🎯 Problème résolu

Les logs de débogage Vercel Analytics apparaissent en développement :

```console
[Vercel Web Analytics] Debug mode is enabled by default in development. No requests will be sent to the server.
[Vercel Web Analytics] Running queued event pageview
[Vercel Web Analytics] [pageview] http://localhost:4647/
```

Ces logs sont **normaux** en développement mais peuvent encombrer la console.

## ✅ Solution implémentée

Un composant `AnalyticsDebugFilter` filtre automatiquement ces logs en développement, tout en gardant Analytics actif.

### Configuration actuelle

Dans `apps/layout.tsx` :

```tsx
import { AnalyticsDebugFilter } from './src/components/analytics/AnalyticsDebugFilter'
import { Analytics } from "@vercel/analytics/next"

// ...
<AnalyticsDebugFilter />
<Analytics />
```

### Comportement

- ✅ **En développement** : Les logs de débogage sont filtrés, Analytics reste actif
- ✅ **En production** : Aucun log de débogage (comportement normal de Vercel Analytics)
- ✅ **Analytics fonctionne** : Les données sont collectées normalement, même si les logs sont filtrés

## 🔧 Réactiver les logs de débogage

Si vous avez besoin de voir les logs de débogage pour diagnostiquer un problème :

1. **Option 1** : Commenter ou supprimer `<AnalyticsDebugFilter />` dans `apps/layout.tsx`
2. **Option 2** : Modifier temporairement `AnalyticsDebugFilter.tsx` pour désactiver le filtrage

## 📝 Notes importantes

- Les logs de débogage **n'apparaissent jamais en production** (comportement par défaut de Vercel Analytics)
- Le filtrage n'affecte **pas** le fonctionnement d'Analytics
- Les données sont collectées normalement, même si les logs sont filtrés
- En développement, Analytics n'envoie **pas** de données aux serveurs Vercel (comportement normal)

## 🔍 Vérification

Pour vérifier qu'Analytics fonctionne correctement :

1. Ouvrir les DevTools → Network
2. Filtrer par "vercel" ou "analytics"
3. En production, vous devriez voir des requêtes vers les serveurs Vercel
4. En développement, aucune requête n'est envoyée (normal)

## 📚 Documentation

- [Vercel Analytics Documentation](https://vercel.com/docs/analytics)
- [Vercel Analytics Package](https://www.npmjs.com/package/@vercel/analytics)
