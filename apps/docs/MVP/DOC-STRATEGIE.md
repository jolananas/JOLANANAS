# 📄 DOC-STRATÉGIE : Le "Golden Path" (Chemin de Vente)

**Objectif :** Débloquer les ventes sous 48-72h.
**Philosophie :** "Sell First, Engineer Later."

---

## 1. Fonctionnalité Critique : Le Flux de Vente

Nous nous concentrons sur un unique parcours utilisateur sans friction. Tout ce qui ne sert pas directement ce parcours est éliminé pour la V1.

### Diagramme de Flux (Golden Path)

```mermaid
graph LR
    A[Landing / Produit] -->|Clic "Ajouter au panier"| B(API Shopify)
    B -->|Succès| C[Redirection Shopify Checkout]
    C -->|Paiement| D[Vente Confirmée]
```

**Pourquoi ce choix ?**

- Élimine toute la gestion de panier en local (state management complexe).
- Utilise le checkout natif Shopify (confiance utilisateur, pas de bugs de paiement).
- Réduit le code frontend de 60%.

---

## 2. Périmètre & Exclusions (Le "Non-Do")

Pour garantir la livraison rapide, nous marquons explicitement ce que nous **NE FAISONS PAS** maintenant.

### 🚫 EXCLUSIONS TEMPORAIRES (MVP)

- **Base de Données Locale** : Pas de Prisma, pas de stockage utilisateur sur notre serveur.
- **Authentification** : Pas de `NextAuth` ou comptes clients custom.
- **Wishlist** : Fonctionnalité non critique pour la première vente.
- **Recherche et Filtres Avancés** : Navigation par collections uniquement.
- **Blog / Contenu Riche** : Focus 100% E-commerce.

### ✅ INCLUSIONS (MVP)

- **Affichage Produits** : Liste et Détail (via Storefront API).
- **Collections** : Navigation simple.
- **Ajout Panier** : Action directe.
- **Marque** : Identité visuelle Jolananas respectée (mais simplifiée).

---

## 3. Structure Technique Simplifiée

Le projet abandonne l'architecture "Enterprise" pour une architecture "Site Vitrine Connecté".

- **Frontend** : Next.js (Visual Layer).
- **Backend** : Aucun (Délégué à Shopify API).
- **State** : Aucun ou React Context minimal (si besoin de persistance session).

---

## 4. Objectifs Chiffrés (KPIs)

- **Vitesse** : Page Load < 1.5s (grâce à la suppression du JS inutile).
- **Conversion** : 0 friction entre le produit et le paiement.
- **Stabilité** : 0 crashs liés à la BDD ou à l'Auth.
