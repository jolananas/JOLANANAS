# Error Components System

## 📁 Structure

```
apps/frontend/app/
├── src/components/error/              ← Composants d'erreur centralisés
│   ├── index.ts                       → Exports centralisés
│   ├── ErrorLayout.tsx                → Composant master réutilisable
│   ├── NotFoundContent.tsx            → Contenu page 404
│   └── ErrorContent.tsx               → Contenu page 500
│
└── [Fichiers Next.js - Wrappers minimalistes]
    ├── not-found.tsx                  → Wrapper 404
    └── error.tsx                      → Wrapper 500
```

## 🎯 Principe

### Architecture en 2 Couches

1. **Couche Next.js (Racine `app/`)** : Wrappers minimalistes requis par Next.js
2. **Couche Composants (`src/components/error/`)** : Toute la logique et le contenu

### Pourquoi cette séparation ?

- ✅ **Respect des conventions Next.js** : Les fichiers spéciaux restent à la racine
- ✅ **Organisation propre** : Tout le code métier dans `src/components/error/`
- ✅ **Réutilisabilité** : ErrorLayout peut être utilisé ailleurs (empty states, maintenance)
- ✅ **Testabilité** : Les composants de contenu sont facilement testables

## 📦 Composants

### ErrorLayout

Composant master avec toutes les fonctionnalités v2.0 :

- Bouton retour intelligent (`router.back()`)
- Quick Links de secours (Footer flottant)
- Copy-to-clipboard avec Toast
- Micro-interactions tactiles

### NotFoundContent

Page 404 "L'art de s'égarer."

### ErrorContent

Page 500 "Caprice d'Atelier." avec error logging

## 🚀 Usage

### Import depuis index

```tsx
import { ErrorLayout, NotFoundContent } from "@/components/error";
```

### Exemple : Empty State

```tsx
import { ErrorLayout } from "@/components/error";

export function EmptyCart() {
  return (
    <ErrorLayout
      code="🛒"
      title="Le vide est chic."
      description="...mais un peu triste."
      actionLabel="DÉCOUVRIR"
      href="/collections"
    />
  );
}
```

## ✨ Fonctionnalités v2.0

1. **Navigation intelligente** : Bouton retour vers page précédente
2. **Quick Links** : Accueil, Collections, Aide
3. **Copy Code** : Click sur chiffre géant → Toast
4. **Micro-interactions** : `active:scale-95` sur tous les boutons
5. **Toast intégré** : Sonner inclus dans ErrorLayout

## 🎨 Personnalisation

Pour modifier le contenu d'une page d'erreur, éditer le fichier correspondant dans `src/components/error/` :

- **404** : `NotFoundContent.tsx`
- **500** : `ErrorContent.tsx`

Les wrappers racine n'ont jamais besoin d'être modifiés.
