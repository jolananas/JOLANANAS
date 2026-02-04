# APIs Open Source pour Autocomplétion Adresses — JOLANANAS

> **Objectif** : Utiliser des APIs open source pour enrichir l'autocomplétion d'adresses avec des lieux et enseignes

---

## 🌐 APIs Utilisées

### **1. API Adresse de la France (data.gouv.fr)** ✅ Actuelle

**URL** : `https://api-adresse.data.gouv.fr/search/`

**Caractéristiques** :

- ✅ **Open Source** : Données de la Base Adresse Nationale (BAN)
- ✅ **Gratuite** : Sans limite de requêtes
- ✅ **Spécialisée** : Adresses françaises précises
- ✅ **Données officielles** : Gérées par l'État français

**Utilisation** :

- Adresses avec numéro de voie
- Rues et voies
- Lieux-dits (locality)
- Points d'intérêt basiques (place)

**Limitations** :

- ⚠️ Peu de données sur les enseignes commerciales
- ⚠️ Points d'intérêt limités

---

### **2. Photon (Komoot/OpenStreetMap)** ✅ Nouvellement Intégrée

**URL** : `https://photon.komoot.io/api/`

**Caractéristiques** :

- ✅ **Open Source** : Basé sur OpenStreetMap
- ✅ **Gratuite** : Sans clé API requise
- ✅ **Enrichie** : Enseignes, commerces, points d'intérêt
- ✅ **Couverture mondiale** : Avec filtrage France

**Utilisation** :

- Enseignes commerciales (Carrefour, Leclerc, etc.)
- Points d'intérêt (Gare du Nord, aéroports, etc.)
- Lieux touristiques
- Commerces et services

**Avantages** :

- ✅ Complète l'API Adresse pour les lieux/enseignes
- ✅ Données communautaires OpenStreetMap
- ✅ Mise à jour régulière

---

## 🔄 Architecture du Système

### **Recherche Parallèle**

Le système effectue **deux recherches en parallèle** :

1. **API Adresse** → Adresses, rues, lieux-dits
2. **Photon** → Enseignes, commerces, points d'intérêt

### **Fusion Intelligente**

Les résultats sont :

1. **Fusionnés** : Adresses d'abord, puis lieux
2. **Dédupliqués** : Par label (évite les doublons)
3. **Triés** : Par pertinence (adresses > rues > lieux)
4. **Limités** : 10 résultats maximum

---

## 📊 Types de Résultats

| Type | Source | Exemples |
|------|--------|----------|
| `housenumber` | API Adresse | "21 avenue de la République" |
| `street` | API Adresse | "avenue de la République" |
| `locality` | API Adresse | "Le Village" |
| `place` | API Adresse + Photon | "Carrefour", "Gare du Nord" |

---

## 🎯 Exemples de Recherches

### **Recherche d'Adresse**

```
Requête : "21 avenue de la République"
→ API Adresse : "21 avenue de la République, 75001 Paris"
→ Photon : (aucun résultat pertinent)
→ Résultat : Adresse avec numéro
```

### **Recherche d'Enseigne**

```
Requête : "Carrefour"
→ API Adresse : (peu de résultats)
→ Photon : "Carrefour, 75001 Paris", "Carrefour, 33000 Bordeaux"
→ Résultat : Enseignes avec adresses
```

### **Recherche de Lieu**

```
Requête : "Gare du Nord"
→ API Adresse : (peu de résultats)
→ Photon : "Gare du Nord, 75010 Paris"
→ Résultat : Point d'intérêt avec adresse
```

---

## 🔧 Configuration Technique

### **Recherche Photon**

```typescript
const searchPlacesPhoton = async (searchQuery: string, signal: AbortSignal) => {
  const url = `https://photon.komoot.io/api/?q=${encodedQuery}&limit=5&lang=fr&lat=46.5&lon=2.2&zoom=6`;
  
  // Filtrage automatique : France uniquement
  // Transformation en AddressSuggestion
  // Gestion des erreurs non bloquantes
}
```

### **Recherche Parallèle**

```typescript
const [addressResponse, placesResults] = await Promise.allSettled([
  fetch('https://api-adresse.data.gouv.fr/search/...'),
  searchPlacesPhoton(searchQuery, signal),
]);
```

### **Fusion et Tri**

```typescript
// 1. Fusionner
const allSuggestions = [...addressSuggestions, ...placesSuggestions];

// 2. Dédupliquer
const uniqueSuggestions = Array.from(
  new Map(allSuggestions.map(item => [item.label, item])).values()
);

// 3. Trier par priorité
// housenumber > street > place > locality
```

---

## ✅ Avantages du Système Multi-API

1. **Couverture Complète** :
   - Adresses précises (API Adresse)
   - Enseignes et commerces (Photon)

2. **Résultats Enrichis** :
   - Plus de résultats pertinents
   - Meilleure expérience utilisateur

3. **Robustesse** :
   - Si une API échoue, l'autre continue
   - Gestion d'erreurs non bloquantes

4. **Performance** :
   - Recherches parallèles (plus rapide)
   - Déduplication automatique

5. **Open Source** :
   - Aucun coût
   - Pas de clé API requise
   - Données communautaires

---

## 🔒 Sécurité et Confidentialité

- ✅ **Pas de données personnelles** envoyées aux APIs
- ✅ **Requêtes publiques** uniquement (pas d'authentification)
- ✅ **CORS** géré par les APIs
- ✅ **Rate limiting** : Respect des limites des APIs

---

## 📈 Performance

- **Temps de réponse** : ~300-500ms (recherches parallèles)
- **Déduplication** : O(1) avec Map
- **Tri** : O(n log n) sur 10 résultats max
- **Limite résultats** : 10 suggestions maximum

---

## 🚀 Évolutions Possibles

### **APIs Supplémentaires (Optionnelles)**

1. **Nominatim (OpenStreetMap)** :
   - Alternative à Photon
   - Plus de détails sur les POI

2. **API IGN Géoplateforme** :
   - Données officielles françaises
   - Nécessite une clé API (gratuite)

3. **Addok** :
   - API française open source
   - Auto-hébergement possible

---

## 📝 Notes d'Implémentation

- Les erreurs Photon sont **non bloquantes** (warnings uniquement)
- Les résultats sont **filtrés pour la France** uniquement
- La **déduplication** évite les doublons entre APIs
- Le **tri** priorise toujours les adresses précises

---

## 🎯 Résultat Utilisateur

L'utilisateur peut maintenant rechercher :

- ✅ **Adresses** : "21 avenue de la République"
- ✅ **Rues** : "avenue de la République"
- ✅ **Enseignes** : "Carrefour", "Leclerc"
- ✅ **Points d'intérêt** : "Gare du Nord", "Aéroport CDG"
- ✅ **Lieux-dits** : "Le Village", "Les Hauts"

**Tous les résultats sont fusionnés, triés et présentés de manière cohérente !**

---

**Ce système utilise exclusivement des APIs open source et gratuites, garantissant une solution durable et sans coût.**
