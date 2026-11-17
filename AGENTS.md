# JOLANANAS (site Next.js) — à savoir

- Entreprise : Joanna MOLY EI, SIREN 131 887 226. Plus de SARL.
- Déployer depuis la racine : `vercel deploy --prod` (projet `aissaa/jolananas`). `apps/frontend/.vercel` pointe vers un autre projet dont le build échoue. Le push GitHub ne déploie plus.
- Textes légaux : `apps/frontend/public/assets/documents/*.md`.
- Panier (`CartProvider.tsx`) : photo de la variante (`merchandise.image`), prix sans division par 0.
- Les avertissements du panier Shopify ne sont pas affichés : un article refusé apparaît en quantité 0.
- Stock vendable en ligne : emplacement « chez moi » uniquement (« La boutique d'M » ne vend pas en ligne).

**Auteur** : Aïssa BELKOUSSA
