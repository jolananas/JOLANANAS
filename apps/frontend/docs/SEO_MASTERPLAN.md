# 🦁 JOLANANAS SEO MASTERPLAN

> **Vision :** Dominer la SERP (Google) non seulement par le texte, mais par l'image, la vidéo et la structure de données. Transformer chaque pixel en point d'entrée.

---

## 1. TECHNICAL SEO (L'OS D'ACIER)

_La base doit être parfaite pour que Google "aime" crawler le site._

### A. Le "Gatekeeper" SEO Friendly (Soft 503)

Le système de Gatekeeper (Maintenance/Coming Soon) que nous avons créé doit renvoyer le bon signal aux robots pour ne pas détruire ton référencement futur.

- **Règle :** Si `SITE_MODE` est activé, le `layout.tsx` ou le `middleware.ts` doit renvoyer un header HTTP **503 (Service Unavailable)**.
- **Pourquoi ?** Cela dit à Google : _"Ne désindexe pas mon site, je reviens tout de suite."_

### B. Metadata Dynamique & OpenGraph (Next.js)

Chaque page produit doit générer ses métadonnées à la volée.

```tsx
// apps/frontend/app/products/[handle]/page.tsx
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct(params.handle);

  return {
    title: `${product.title} | JOLANANAS`,
    description: product.description.substring(0, 160),
    openGraph: {
      images: [{ url: product.featuredImage.url, width: 1200, height: 630 }],
      type: "website",
    },
    // Le secret pour le "Monster SEO" visuel :
    alternates: {
      canonical: `https://jolananas.com/products/${params.handle}`,
    },
  };
}
```

### C. JSON-LD Structuré (Le Langage des Robots)

C'est ici que tu gagnes les "Rich Snippets" (Étoiles, Prix, Stock) directement dans les résultats Google. Il faut injecter ce script dans chaque fiche produit.

```json
{
  "@context": "https://schema.org/",
  "@type": "Product",
  "name": "Collier Solar",
  "image": ["https://jolananas.com/img/solar-1.jpg"],
  "description": "Collier en or vermeil, design suisse...",
  "brand": {
    "@type": "Brand",
    "name": "JOLANANAS"
  },
  "offers": {
    "@type": "Offer",
    "url": "https://jolananas.com/products/collier-solar",
    "priceCurrency": "EUR",
    "price": "45.00",
    "availability": "https://schema.org/InStock"
  }
}
```

---

## 2. CONTENT STRATEGY (L'ATTAQUE SÉMANTIQUE)

### A. Programmatic SEO (Collections)

Au lieu de créer des collections à la main, nous allons générer des pages pour chaque **intention de recherche** spécifique, même si elles partagent les mêmes produits.

- **Structure d'URL cible :**
- `/collections/bijoux-tendance-2026`
- `/collections/cadeau-femme-original`
- `/collections/grosses-bagues-argent`
- `/collections/bijoux-style-suisse`

Ces pages sont générées dynamiquement par Next.js, chacune avec un H1 et une description introductive unique optimisée pour ces mots-clés précis.

### B. Le "Dictionnaire Jolananas" (Glossaire)

Pour capturer le trafic informatif (Haut de tunnel), crée une section `/editorials/dictionnaire`.

- **Exemples de pages :**
- _"Qu'est-ce que le Vermeil ?"_
- _"Comment nettoyer ses bijoux en argent ?"_
- _"La tendance Stacking expliquée"_

- Ces pages redirigent ensuite vers tes produits ("Pour tester le stacking, voir nos bagues...").

---

## 3. VIDEO SEO (L'ARME SECRÈTE)

_Inspiré de tes liens YouTube. Google met désormais en avant les vidéos TikTok/Shorts/YouTube dans les résultats de recherche mobile._

### A. Intégration Vidéo Produit

Sur la page produit, au lieu de juste une image, intègre une courte vidéo en boucle (`autoPlay muted loop`) du produit porté.

- **Boost SEO :** Augmente le "Dwell Time" (temps passé sur la page), un facteur de classement majeur.

### B. Video Object Schema

Enveloppe tes vidéos dans un Schema.org spécifique pour qu'elles apparaissent dans l'onglet "Vidéos" de Google avec un badge "Produit".

```json
{
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "Présentation Collier Solar",
  "description": "Vue à 360 degrés du collier Solar porté.",
  "thumbnailUrl": "https://jolananas.com/thumbs/solar.jpg",
  "uploadDate": "2026-02-01",
  "contentUrl": "https://jolananas.com/videos/solar.mp4"
}
```

---

## 4. L'EXPÉRIENCE UTILISATEUR (CORE WEB VITALS)

_Google punit les sites lents. Le style "Soft Swiss" doit être léger._

1. **Images Next-Gen :** Utilise `<Image />` de Next.js avec `format="avif"` ou `webp`. C'est impératif pour le score Lighthouse.
2. **Font Loading :** Ta police "Swiss" doit être chargée via `next/font` pour éviter le CLS (Content Layout Shift - quand le texte saute au chargement).
3. **Lazy Loading Hybride :** Charge les images du haut de page en priorité (`priority={true}`), et le reste (avis, produits similaires) uniquement au scroll.

---

## 5. LA STRATÉGIE DE MAILLAGE (INTERLINKING)

Ne laisse aucune page "orpheline". Crée un maillage interne intelligent :

- **Produits vers Collections :** "Ce produit fait partie de la collection _Summer 2026_."
- **Cross-Sell Sémantique :** Au lieu de "Produits similaires", utilise "Complétez le look" (ex: Bague -> Bracelet assorti).
- **Footer SEO (Mega Footer) :** Comme nous l'avons fait dans le Footer, liste les liens profonds ("Bagues Or", "Bagues Argent", "Bagues Pierre") pour donner du jus SEO à ces sous-catégories.

---

## 📝 CHECKLIST D'EXÉCUTION (Pour les Devs)

1. [ ] **Sitemap.xml :** Configurer `next-sitemap` pour générer automatiquement le plan du site à chaque build.
2. [ ] **Robots.txt :** Autoriser Googlebot, bloquer les pages `/account` et `/checkout`.
3. [ ] **Hreflang :** Si tu vends à l'international, balises indispensables (`fr-FR`, `en-US`).
4. [ ] **Alt Tags :** Forcer l'ajout de texte alternatif descriptif sur toutes les images via le CMS (Shopify/Payload). Pas de "image1.jpg", mais "Bague Jolananas argent forme organique".
5. [ ] **Performance :** Viser un score Lighthouse de 95+ sur Mobile (Vert).
