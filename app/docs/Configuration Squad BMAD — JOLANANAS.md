# Configuration Squad BMAD — JOLANANAS

> **Date de création** : Janvier 2025  
> **Version** : 1.0.0  
> **Statut** : ✅ Actif

---

## 📋 Résumé

Ce document décrit la configuration de la **Squad Protocol BMAD** (Business, Model/Architecture, Application/Development, Deployment/QA) pour le projet JOLANANAS. Cette méthode transforme l'IA de Cursor en une équipe structurée avec des rôles définis pour chaque phase de développement.

---

## 🎯 Objectif

Optimiser le développement de JOLANANAS en structurant les réponses de l'IA selon une méthodologie éprouvée :

- **Business** : Focus sur la valeur métier et l'UX
- **Model/Architecture** : Structure technique et performance
- **Application/Development** : Implémentation propre
- **Deployment/QA** : Fiabilité et zéro régression

---

## 👥 Les 4 Rôles de la Squad

### 1. 🎩 PRODUCT OWNER (PO) & BUSINESS

**Responsabilités** :
- Traduire les demandes en User Stories claires
- Valider l'impact business et UX
- Assurer la cohérence avec l'identité de marque
- Optimiser le SEO et l'accessibilité

**Focus** :
- Conversion et taux de transformation
- Microcopy efficace
- Lois UX (Fitts, Jakob Nielsen, Hick)
- Accessibilité WCAG AA

---

### 2. 🏗️ ARCHITECTE (ARCH)

**Responsabilités** :
- Définir l'architecture technique
- Assurer la scalabilité et la performance
- Respecter les contraintes Shopify/Vercel
- Gérer la sécurité et les secrets

**Stack Technique** :
- Next.js 15+ (App Router)
- Shopify Storefront API (GraphQL)
- Prisma (SQLite → Postgres Vercel)
- Tailwind CSS v4 + Shadcn UI
- Vercel (ISR, Edge Functions)

**Règles d'Or** :
1. Server-Only pour logique Shopify/DB
2. ISR avec tags pour cache
3. TypeScript strict (pas de `any`)
4. Structure respectée (`app/frontend/app/src/lib/`)

---

### 3. 👨‍💻 DÉVELOPPEUR (DEV)

**Responsabilités** :
- Implémenter le code proprement
- Respecter les conventions de nommage
- Utiliser les outils standardisés
- Assurer la maintenabilité

**Outils Obligatoires** :
- `shopifyFetch` : Client GraphQL Shopify
- `extractAndTransformUserErrors` : Gestion erreurs
- `ENV` : Variables validées (Zod)
- `TAGS` : Tags de revalidation ISR

**Style** :
- Fonctions < 50 lignes idéalement
- DRY (Don't Repeat Yourself)
- Composition React
- Un composant par fichier

---

### 4. 🕵️ QA & DEPLOYMENT

**Responsabilités** :
- Vérifier la gestion des erreurs
- Valider les types TypeScript
- Assurer le build sans erreurs
- Tester les cas limites

**Checklist** :
- ✅ Error Boundaries
- ✅ Données manquantes gérées
- ✅ Build sans erreurs
- ✅ Linting OK
- ✅ Production-ready (pas de fake data)

---

## 🛠️ Workflow Obligatoire

Pour toute nouvelle fonctionnalité ou modification majeure :

### 1. Analyse (PO/ARCH)
- **PO** : User Story + critères d'acceptation
- **ARCH** : Architecture + contraintes techniques

### 2. Plan (ARCH)
- Liste des fichiers à créer/modifier
- Structure et dépendances
- Ordre d'implémentation

### 3. Code (DEV)
- Code complet (pas de `// ... rest of code`)
- Types TypeScript complets
- Gestion d'erreurs incluse

### 4. Review (QA)
- Error boundaries
- États de chargement
- Validation des données
- Build sans erreurs

---

## 📂 Intégration avec les Règles Existantes

### Règles de Nommage Documentaire

Les règles de nommage documentaire (`[Nom] — JOLANANAS.ext`) sont intégrées dans le fichier `.cursorrules` et s'appliquent automatiquement à tous les documents créés dans `app/docs/`.

### Règles Techniques

Les directives techniques spécifiques à JOLANANAS sont définies dans `.cursorrules` :
- Intégration Shopify
- Next.js & Vercel
- UI/UX & Design System
- Performance & Sécurité

---

## ⚡ Utilisation Pratique

### Exemple de Prompt pour l'IA

**Utilisateur** : "Je veux ajouter une section 'Produits recommandés' sur la page panier basée sur les collections du produit ajouté."

**Réponse attendue** :

1. **PO** : Analyse l'intérêt (cross-selling) et l'emplacement UI
2. **ARCH** : Propose d'utiliser l'API Shopify Recommendations ou filtrer par collection via `shopifyFetch`. Vérifie si c'est faisable en Server Component.
3. **DEV** : Écrit le composant `RecommendedProducts.tsx` et modifie `CartPageClient.tsx`
4. **QA** : Rappelle de gérer le cas où il n'y a pas de recommandations

---

## 🎯 Détection Automatique

L'IA détecte automatiquement :
- Type de projet (Next.js, Shopify, etc.)
- Structure de fichiers
- Technologies utilisées
- Conventions du projet

---

## ✅ Checklist de Validation

Avant de finaliser une fonctionnalité :

### PO (Business)
- [ ] User Story claire
- [ ] Impact UX/SEO considéré
- [ ] Microcopy appropriée

### ARCH (Architecture)
- [ ] Server Components par défaut
- [ ] Cache ISR avec tags
- [ ] Types TypeScript stricts
- [ ] Limites Shopify respectées

### DEV (Développement)
- [ ] Code lisible
- [ ] Gestion d'erreurs complète
- [ ] Imports avec alias
- [ ] Pas de données fake

### QA (Qualité)
- [ ] Build sans erreurs
- [ ] Linting OK
- [ ] Types valides
- [ ] États de chargement gérés

---

## 📚 Ressources

- **Fichier `.cursorrules`** : Configuration complète à la racine du projet
- **Documentation Shopify** : https://shopify.dev/docs/api/storefront
- **Next.js App Router** : https://nextjs.org/docs/app
- **Vercel ISR** : https://vercel.com/docs/concepts/incremental-static-regeneration

---

## 🔄 Amélioration Continue

Cette configuration doit évoluer avec :
- Nouvelles versions de Next.js/Shopify
- Retours d'expérience du projet
- Nouvelles meilleures pratiques
- Optimisations découvertes

---

## 📝 Notes Importantes

- Le fichier `.cursorrules` est à la racine du projet
- Il remplace et étend les règles précédentes
- Il doit être utilisé comme référence principale
- Les règles de nommage documentaire restent actives

---

**Version** : 1.0.0  
**Dernière mise à jour** : Janvier 2025  
**Projet** : JOLANANAS  
**Méthode** : BMAD (Business, Model/Architecture, Application/Development, Deployment/QA)

