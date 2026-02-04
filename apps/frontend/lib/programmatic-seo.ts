import { getAllProducts } from "@/lib/shopify";

export async function getProgrammaticCollection(handle: string) {
  // 1. Définition des règles de mapping (Intention de recherche -> Filtres)
  const rules: Record<
    string,
    { title: string; description: string; query: string }
  > = {
    "bijoux-tendance-2026": {
      title: "Bijoux Tendance 2026 | JOLANANAS",
      description:
        "Découvrez les pièces phares de la saison. Des designs audacieux pour une année éclatante.",
      query: "tag:tendance OR tag:new",
    },
    "cadeau-femme-original": {
      title: "Cadeau Femme Original | Idées Uniques",
      description:
        "Offrez un bijou qui a du sens. Une sélection de créations uniques pour elle.",
      query: "tag:cadeau",
    },
    "grosses-bagues-argent": {
      title: "Grosses Bagues en Argent Massif",
      description:
        "Affirmez votre style avec nos bagues XXL en argent. Design suisse, impact maximal.",
      query: "product_type:ring AND tag:argent",
    },
    "bijoux-style-suisse": {
      title: "Bijoux Style Suisse | Design Épuré",
      description:
        "L'élégance du design suisse dans chaque courbe. Minimalisme et précision.",
      query: "tag:swiss",
    },
  };

  const rule = rules[handle];

  if (!rule) return null;

  // 2. Récupération des produits (Simulation optimisée)
  // Dans une vraie app, on utiliserait une recherche avec filtres via l'API Shopify Storefront
  const allProducts = await getAllProducts(); // Attention: getAllProducts est potentiellement lourd, à optimiser

  // Filtrage simple en mémoire pour l'exemple (à remplacer par API search)
  // Ici on prends juste les 4 premiers pour simuler
  const products = allProducts.slice(0, 8);

  return {
    id: `prog-${handle}`,
    handle,
    title: rule.title,
    description: rule.description,
    products: {
      edges: products.map((p) => ({ node: p })),
    },
    image: products[0]?.featuredImage, // Utilise la première image comme cover
  };
}
