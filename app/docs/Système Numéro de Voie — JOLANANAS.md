# Système de Numéro de Voie — JOLANANAS

> **Objectif** : Améliorer l'expérience utilisateur pour la saisie d'adresses avec un système intelligent en deux étapes

---

## 🎯 Concept

Système hybride qui permet de :

1. **Sélectionner une rue** (avec ou sans numéro) via l'autocomplétion
2. **Ajouter/modifier le numéro** après la sélection de la rue

---

## 📋 Deux Modes Disponibles

### **Mode 1 : Champ Séparé (`separate`)** ⭐ Recommandé

**Fonctionnement** :

- L'utilisateur tape le nom de la rue (ex: "avenue de la République")
- Il sélectionne une rue dans les suggestions
- Un champ séparé apparaît pour saisir le numéro
- L'adresse finale est construite automatiquement : `"21 avenue de la République"`

**Avantages** :

- ✅ Interface claire et guidée
- ✅ Permet de voir la rue sélectionnée
- ✅ Facilite la modification du numéro
- ✅ Meilleure UX pour les utilisateurs moins expérimentés

**Exemple d'utilisation** :

```tsx
<AddressAutocompleteWithNumber
  numberMode="separate"
  onSelect={(address) => {
    console.log(address.finalAddress); // "21 avenue de la République"
  }}
/>
```

### **Mode 2 : Mode Inline (`inline`)**

**Fonctionnement** :

- L'utilisateur tape le nom de la rue
- Il sélectionne une rue dans les suggestions
- Le numéro peut être ajouté directement dans le même champ
- Un bouton "Modifier" permet d'éditer le numéro

**Avantages** :

- ✅ Plus compact
- ✅ Moins de champs visibles
- ✅ Idéal pour les interfaces minimalistes

---

## 🔄 Workflow Utilisateur

### **Scénario 1 : Rue avec numéro déjà présent**

1. Utilisateur tape : `"21 avenue"`
2. Suggestions affichent : `"21 avenue de la République, 75001 Paris"`
3. Utilisateur sélectionne → Adresse complète remplie automatiquement

### **Scénario 2 : Rue sans numéro (Mode Séparé)**

1. Utilisateur tape : `"avenue"`
2. Suggestions affichent : `"avenue de la République (vous pourrez ajouter le numéro après)"`
3. Utilisateur sélectionne la rue
4. **Nouveau** : Champ numéro apparaît avec placeholder `"Ex: 21, 21B"`
5. Utilisateur saisit `"21"` → Adresse finale : `"21 avenue de la République"`

### **Scénario 3 : Modification après sélection**

1. Rue sélectionnée : `"avenue de la République"`
2. Numéro saisi : `"21"`
3. Utilisateur peut :
   - Modifier le numéro dans le champ dédié
   - Changer de rue via le bouton ✕

---

## 🎨 Interface Utilisateur

### **État Initial**

```
┌─────────────────────────────────────┐
│ 🗺️ Adresse                          │
├─────────────────────────────────────┤
│ [Commencez à taper votre adresse...]│
└─────────────────────────────────────┘
```

### **Suggestions Affichées**

```
┌─────────────────────────────────────┐
│ 🗺️ Adresse                          │
├─────────────────────────────────────┤
│ [avenue]                            │
├─────────────────────────────────────┤
│ Suggestions:                        │
│ 🗺️ 21 avenue de la République...    │
│ 🗺️ avenue de la République          │
│     (vous pourrez ajouter le numéro)│
└─────────────────────────────────────┘
```

### **Rue Sélectionnée (Mode Séparé)**

```
┌─────────────────────────────────────┐
│ 🗺️ Adresse                          │
├─────────────────────────────────────┤
│ 🗺️ avenue de la République     [✕] │
│     75001 Paris                     │
├─────────────────────────────────────┤
│ Numéro de voie (optionnel)           │
│ [21] Adresse complète : 21 avenue...│
└─────────────────────────────────────┘
```

---

## 💻 Intégration

### **Dans CheckoutPage**

```tsx
import { AddressAutocompleteWithNumber } from '@/components/ui/AddressAutocompleteWithNumber';

// Remplacer AddressAutocomplete par :
<AddressAutocompleteWithNumber
  id="address"
  label="Adresse"
  value={shippingData.address}
  placeholder="Commencez à taper votre adresse..."
  required
  error={errors.address}
  country="FR"
  numberMode="separate" // ou "inline"
  onChange={(value) => setShippingData({ ...shippingData, address: value })}
  onSelect={(suggestion) => {
    setShippingData({
      ...shippingData,
      address: suggestion.finalAddress,
      city: suggestion.city,
      postalCode: suggestion.postcode,
      // ...
    });
  }}
  disabled={isRedirecting}
/>
```

---

## ✨ Fonctionnalités

### **1. Détection Intelligente**

- Détecte si la requête contient un numéro
- Priorise les résultats avec numéro si présent
- Accepte les rues sans numéro pour permettre l'ajout ultérieur

### **2. Validation**

- Numéro optionnel (peut être ajouté plus tard)
- Validation de format (ex: "21", "21B", "21 bis")
- Construction automatique de l'adresse finale

### **3. Expérience Utilisateur**

- Message d'aide contextuel
- Indicateur visuel pour les rues sans numéro
- Bouton de réinitialisation pour changer de rue
- Focus automatique sur le champ numéro après sélection

### **4. Accessibilité**

- Labels ARIA appropriés
- Navigation clavier complète
- Support des lecteurs d'écran

---

## 🔧 Configuration

### **Props Disponibles**

| Prop | Type | Défaut | Description |
|------|------|--------|-------------|
| `numberMode` | `'inline' \| 'separate'` | `'separate'` | Mode d'affichage du numéro |
| `onSelect` | `(address) => void` | - | Callback avec `finalAddress` |
| `onChange` | `(value: string) => void` | - | Callback à chaque changement |
| `value` | `string` | `''` | Valeur contrôlée |
| `country` | `string` | `'FR'` | Pays (désactive autocomplétion si ≠ FR) |

### **Type de Retour `onSelect`**

```typescript
{
  ...AddressSuggestion, // label, street, city, postcode, etc.
  housenumber?: string, // Numéro final (peut être ajouté après sélection)
  finalAddress: string, // Adresse complète formatée : "21 avenue de la République"
}
```

---

## 📊 Comparaison avec l'Ancien Système

| Aspect | Ancien Système | Nouveau Système |
|--------|----------------|-----------------|
| **Rue sans numéro** | ❌ Filtrée | ✅ Acceptée |
| **Ajout de numéro** | ❌ Impossible | ✅ Champ dédié |
| **Modification** | ❌ Difficile | ✅ Facile (bouton ✕) |
| **UX** | ⚠️ Limité | ✅ Guidée |
| **Flexibilité** | ⚠️ Rigide | ✅ Adaptable |

---

## 🚀 Avantages

1. **Meilleure Conversion** : Les utilisateurs peuvent compléter leur adresse même s'ils ne connaissent pas le numéro exact
2. **Moins de Friction** : Pas besoin de connaître le numéro avant de commencer
3. **Plus Flexible** : Permet de sélectionner la rue puis d'ajouter le numéro
4. **Meilleure UX** : Interface claire et guidée étape par étape
5. **Compatible** : Fonctionne avec l'API Adresse existante

---

## 📝 Notes d'Implémentation

- Le composant `AddressAutocompleteWithNumber` est une version améliorée de `AddressAutocomplete`
- Il peut être utilisé en remplacement progressif
- Compatible avec tous les formulaires existants
- Aucun changement requis dans le hook `useAddressAutocomplete`

---

## 🎯 Recommandation

**Utiliser le mode `separate`** pour :

- ✅ Formulaires de checkout (meilleure guidance)
- ✅ Formulaires d'inscription
- ✅ Interfaces où la clarté est prioritaire

**Utiliser le mode `inline`** pour :

- ✅ Interfaces minimalistes
- ✅ Espaces restreints
- ✅ Utilisateurs expérimentés

---

**Ce système améliore significativement l'expérience utilisateur en permettant une saisie d'adresse plus flexible et intuitive.**
