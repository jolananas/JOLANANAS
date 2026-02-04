# Assets de Paiement — JOLANANAS

## Logo Shop Pay

### Téléchargement

Les logos officiels Shop Pay doivent être téléchargés depuis les archives ZIP suivantes :

1. **Logos couleur** : https://help.shopify.com/zip/shop-pay/shop-pay-logos-color.zip
2. **Logos monochrome** : https://help.shopify.com/zip/shop-pay/shop-pay-logos-monotone.zip
3. **Boutons de paiement** : https://help.shopify.com/zip/shop-pay/shop-pay-payment-buttons.zip

### Instructions

1. Télécharger l'archive `shop-pay-logos-color.zip`
2. Extraire le fichier SVG du logo principal
3. Renommer le fichier en `shop-pay-logo.svg`
4. Placer le fichier dans ce dossier : `public/assets/images/payment/shop-pay-logo.svg`

### Spécifications

- **Nom du fichier** : `shop-pay-logo.svg`
- **Format recommandé** : SVG (pour la scalabilité)
- **Format alternatif** : PNG haute résolution
- **Taille minimale** : 105 x 25 pixels
- **Version** : Logo principal en couleur

### Placement

Placer le logo téléchargé dans ce dossier avec le nom exact : `shop-pay-logo.svg`

Une fois le fichier placé, modifier `ShopPayPaymentSection.tsx` pour utiliser :
```tsx
<img
  src="/assets/images/payment/shop-pay-logo.svg"
  alt="Shop Pay"
  width={105}
  height={25}
  className="h-6 w-auto"
  loading="eager"
/>
```

### Directives de marque Shopify

- ✅ Utiliser le logo en couleur sur fond violet (#5A31F4)
- ✅ Respecter la taille minimale (105 x 25 pixels)
- ✅ Respecter l'espacement autour du logo
- ❌ Ne pas modifier les couleurs, proportions ou ajouter des effets
- ❌ Ne pas placer sur des arrière-plans à faible contraste

