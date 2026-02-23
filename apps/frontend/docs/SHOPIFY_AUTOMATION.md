# 🤖 Automatisation de la Publication Headless (Shopify)

Ce document explique comment s'assurer que vos produits sont toujours visibles sur votre site Jolananas (Next.js/Vercel).

## 1. Pourquoi certains produits ne s'affichent pas ?

Votre boutique utilise une architecture **Headless**. Cela signifie que Shopify sert de base de données, mais l'affichage est géré par une application séparée sur Vercel.

Pour qu'un produit soit visible, il ne suffit pas qu'il soit "Actif", il doit être explicitement **publié sur le canal de vente de l'application Headless**.

## 2. Configuration par défaut des canaux de vente

Pour éviter d'avoir à cocher la case manuellement à chaque fois :

1. Allez dans votre **Admin Shopify**.
2. Allez dans **Paramètres** > **Applications et canaux de vente**.
3. Recherchez votre application (ex: "Headless" ou "Storefront API").
4. Vérifiez s'il existe une option pour "Inclure automatiquement les nouveaux produits" (selon la version de votre app).

## 3. Automatisation via Shopify Flow (Recommandé)

Si vous avez accès à l'application **Shopify Flow** (gratuite sur la plupart des forfaits), vous pouvez créer un automatisme :

### Étapes du workflow Flow :

1. **Trigger (Déclencheur)** : `Product added to store` (Produit ajouté à la boutique).
2. **Action** : `Publish product` (Publier le produit).
3. **Paramètres de l'action** : Sélectionnez le canal de vente Headless/Storefront.

_Cela garantira que 100% de vos nouveaux produits seront instantanément envoyés vers Vercel._

## 4. Outil de Diagnostic (Pour l'équipe technique)

Si un produit avec le handle `mon-produit` renvoie une erreur 404, l'équipe technique peut lancer cette commande pour confirmer le diagnostic :

```bash
# Dans le dossier app/frontend
npx tsx scripts/audit-shopify.ts mon-produit
```

- **Si l'outil dit "PRODUIT NON TROUVÉ"** : Le problème est dans Shopify (Canal de vente non coché).
- **Si l'outil dit "PRODUIT TROUVÉ"** : Le problème est le cache de Vercel (attendre 5 min ou forcer une revalidation).
