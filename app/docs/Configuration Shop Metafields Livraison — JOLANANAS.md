# Configuration Shop Metafields Livraison — JOLANANAS

> **Guide** : Configuration des metafields Shopify pour les informations de livraison du site JOLANANAS

---

## 🎯 Objectif

Configurer les **Shop metafields** dans Shopify Admin pour que l'application puisse récupérer les informations de livraison dynamiquement.

---

## ⚠️ Important : Metafields vs Métaobjets

- **Metafields** : Champs personnalisés attachés à une ressource (Shop, Produit, Commande, etc.)
- **Métaobjets** : Objets personnalisés indépendants avec plusieurs champs

**Pour ce cas d'usage, nous avons besoin de Shop metafields, pas de métaobjets.**

---

## 📋 Metafields Requis

Tous les metafields doivent être créés avec le **namespace** : `shipping`

### Metafields Obligatoires

| Clé | Type | Description | Exemple de valeur |
|-----|------|-------------|-------------------|
| `free_shipping_threshold` | **Number (integer)** | Seuil pour la livraison gratuite en EUR | `50` |
| `delivery_days_france` | **Single line text** | Délai de livraison en France | `3-5 jours ouvrés` |
| `delivery_days_international` | **Single line text** | Délai de livraison international | `7-14 jours ouvrés` |
| `standard_shipping_cost` | **Number (decimal)** | Coût de livraison standard en EUR | `5.99` |

### Metafields Optionnels

| Clé | Type | Description | Exemple de valeur |
|-----|------|-------------|-------------------|
| `express_shipping_cost` | **Number (decimal)** | Coût de livraison express en EUR | `12.99` |
| `express_delivery_days` | **Single line text** | Délai de livraison express | `1-2 jours ouvrés` |

---

## 🚀 Étapes de Configuration dans Shopify Admin

### Étape 1 : Accéder aux Shop Metafields

1. Connectez-vous à votre admin Shopify : `https://admin.shopify.com/store/u6ydbb-sx`
2. Allez dans **Settings** (Paramètres)
3. Cliquez sur **Custom data** (Données personnalisées)
4. Cliquez sur **Shop metafields** (Metafields de la boutique)

**URL directe** : `https://admin.shopify.com/store/u6ydbb-sx/settings/custom_data/shop_metafields`

### Étape 2 : Créer le Premier Metafield

1. Cliquez sur **Add definition** (Ajouter une définition)
2. Remplissez les champs suivants :

#### Metafield 1 : `free_shipping_threshold`

- **Name** (Nom) : `Seuil livraison gratuite`
- **Namespace and key** :
  - **Namespace** : `shipping`
  - **Key** : `free_shipping_threshold`
- **Type** : Sélectionnez **Number (integer)**
- **Description** (optionnel) : `Seuil en EUR pour activer la livraison gratuite`
- **Validation** (optionnel) : 
  - Minimum : `0`
  - Maximum : `1000`
- **Default value** (optionnel) : `50`
- Cliquez sur **Save** (Enregistrer)

#### Metafield 2 : `delivery_days_france`

- **Name** (Nom) : `Délai livraison France`
- **Namespace and key** :
  - **Namespace** : `shipping`
  - **Key** : `delivery_days_france`
- **Type** : Sélectionnez **Single line text**
- **Description** (optionnel) : `Délai de livraison pour la France métropolitaine`
- **Default value** (optionnel) : `3-5 jours ouvrés`
- Cliquez sur **Save** (Enregistrer)

#### Metafield 3 : `delivery_days_international`

- **Name** (Nom) : `Délai livraison international`
- **Namespace and key** :
  - **Namespace** : `shipping`
  - **Key** : `delivery_days_international`
- **Type** : Sélectionnez **Single line text**
- **Description** (optionnel) : `Délai de livraison pour les destinations internationales`
- **Default value** (optionnel) : `7-14 jours ouvrés`
- Cliquez sur **Save** (Enregistrer)

#### Metafield 4 : `standard_shipping_cost`

- **Name** (Nom) : `Coût livraison standard`
- **Namespace and key** :
  - **Namespace** : `shipping`
  - **Key** : `standard_shipping_cost`
- **Type** : Sélectionnez **Number (decimal)**
- **Description** (optionnel) : `Coût de la livraison standard en EUR`
- **Validation** (optionnel) :
  - Minimum : `0`
  - Maximum : `100`
- **Default value** (optionnel) : `5.99`
- Cliquez sur **Save** (Enregistrer)

#### Metafield 5 (Optionnel) : `express_shipping_cost`

- **Name** (Nom) : `Coût livraison express`
- **Namespace and key** :
  - **Namespace** : `shipping`
  - **Key** : `express_shipping_cost`
- **Type** : Sélectionnez **Number (decimal)**
- **Description** (optionnel) : `Coût de la livraison express en EUR`
- **Default value** (optionnel) : `12.99`
- Cliquez sur **Save** (Enregistrer)

#### Metafield 6 (Optionnel) : `express_delivery_days`

- **Name** (Nom) : `Délai livraison express`
- **Namespace and key** :
  - **Namespace** : `shipping`
  - **Key** : `express_delivery_days`
- **Type** : Sélectionnez **Single line text`
- **Description** (optionnel) : `Délai de livraison pour la livraison express`
- **Default value** (optionnel) : `1-2 jours ouvrés`
- Cliquez sur **Save** (Enregistrer)

### Étape 3 : Remplir les Valeurs

Une fois tous les metafields créés, vous devez remplir leurs valeurs :

1. Retournez dans **Settings > Custom data > Shop metafields**
2. Pour chaque metafield, cliquez dessus pour l'éditer
3. Dans la section **Values** (Valeurs), ajoutez la valeur appropriée
4. Cliquez sur **Save** (Enregistrer)

**Valeurs recommandées** :

- `free_shipping_threshold` : `50`
- `delivery_days_france` : `3-5 jours ouvrés`
- `delivery_days_international` : `7-14 jours ouvrés`
- `standard_shipping_cost` : `5.99`
- `express_shipping_cost` : `12.99` (optionnel)
- `express_delivery_days` : `1-2 jours ouvrés` (optionnel)

---

## ✅ Vérification

### Vérification dans Shopify Admin

1. Allez dans **Settings > Custom data > Shop metafields**
2. Vérifiez que tous les metafields sont présents avec le namespace `shipping`
3. Vérifiez que les valeurs sont correctement renseignées

### Vérification dans l'Application

1. Redémarrez le serveur de développement si nécessaire
2. Vérifiez les logs de la console pour voir si les metafields sont récupérés
3. Testez la page du panier pour voir si les informations de livraison s'affichent correctement

**Logs attendus** :
```
✅ Informations de livraison récupérées avec succès depuis Shopify
```

**Si les metafields ne sont pas trouvés** :
```
⚠️ Aucun metafield de livraison trouvé dans Shopify. Utilisation des valeurs par défaut.
```

---

## 🔍 Structure GraphQL Attendue

L'application interroge Shopify avec cette requête GraphQL :

```graphql
query GetShippingInfo {
  shop {
    metafields(identifiers: [
      { namespace: "shipping", key: "free_shipping_threshold" },
      { namespace: "shipping", key: "delivery_days_france" },
      { namespace: "shipping", key: "delivery_days_international" },
      { namespace: "shipping", key: "standard_shipping_cost" },
      { namespace: "shipping", key: "express_shipping_cost" },
      { namespace: "shipping", key: "express_delivery_days" }
    ]) {
      id
      namespace
      key
      value
      type
    }
  }
}
```

---

## 📝 Notes Importantes

### Namespace et Clés

- ⚠️ Le **namespace** doit être exactement : `shipping` (en minuscules)
- ⚠️ Les **clés** doivent correspondre exactement aux noms ci-dessus
- ⚠️ Les **types** doivent correspondre exactement (integer, decimal, single_line_text)

### Valeurs par Défaut

Si les metafields ne sont pas configurés, l'application utilise ces valeurs par défaut :

```typescript
{
  freeShippingThreshold: 50,
  deliveryDaysFrance: '3-5 jours ouvrés',
  deliveryDaysInternational: '7-14 jours ouvrés',
  standardShippingCost: 5.99,
  expressShippingCost: 12.99,
  expressDeliveryDays: '1-2 jours ouvrés'
}
```

### Permissions API

Assurez-vous que votre application Shopify a les permissions nécessaires pour lire les Shop metafields :

- `read_metaobjects` (si applicable)
- `read_metafields`

---

## 🐛 Dépannage

### Problème : Metafields non trouvés

**Solutions** :
1. Vérifiez que le namespace est exactement `shipping` (pas `Shipping` ou `SHIPPING`)
2. Vérifiez que les clés correspondent exactement (sensible à la casse)
3. Vérifiez que les valeurs sont renseignées dans Shopify Admin
4. Vérifiez les permissions de l'API Shopify

### Problème : Valeurs incorrectes

**Solutions** :
1. Vérifiez le type de chaque metafield (integer, decimal, text)
2. Pour les nombres décimaux, utilisez le point (`.`) comme séparateur
3. Pour les entiers, n'utilisez pas de décimales

### Problème : Erreur GraphQL

**Solutions** :
1. Vérifiez que tous les metafields obligatoires sont créés
2. Vérifiez les logs de l'application pour voir l'erreur exacte
3. Testez la requête GraphQL directement dans Shopify GraphQL App

---

## 📚 Références

- **Documentation Shopify Metafields** : https://shopify.dev/docs/apps/custom-data/metafields
- **Shop Metafields** : https://shopify.dev/docs/api/admin-graphql/latest/objects/ShopMetafield
- **GraphQL Query** : Voir `app/frontend/app/src/lib/shopify/queries.ts` (GET_SHIPPING_INFO_QUERY)

---

**Dernière mise à jour** : Janvier 2025

