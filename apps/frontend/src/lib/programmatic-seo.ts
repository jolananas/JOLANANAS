import { getAllProducts } from "./shopify";

// Configuration des "Collections Virtuelles" pour le SEO
// Ces pages n'existent pas dans Shopify mais sont générées à la volée
const VIRTUAL_COLLECTIONS: Record<string, {
  title: string;
  description: string;
  keywords: string[]; // Mots-clés pour filtrer les produits
}> = {
  "idees-cadeaux-femme": {
    title: "Idées Cadeaux Bijoux Femme",
    description: "Trouvez le cadeau parfait pour elle parmi nos créations artisanales uniques.",
    keywords: ["bague", "collier", "boucles"],
  },
  "bijoux-tendance-ete": {
    title: "Bijoux Tendance Été",
    description: "Les indispensables de l'été : coquillages, couleurs vives et dorures.",
    keywords: ["été", "coloré", "plage"],
  },
  "creations-minimalistes": {
    title: "Bijoux Minimalistes & Fins",
    description: "L'élégance de la discrétion. Nos bijoux fins pour le quotidien.",
    keywords: ["fin", "simple", "minimaliste"],
  },
};

export async function getProgrammaticCollection(handle: string) {
  const config = VIRTUAL_COLLECTIONS[handle];

  if (!config) {
    return null;
  }

  // On récupère tous les produits (dans la limite du fetch shopify)
  // Pour une vraie prod, il faudrait une stratégie de cache ou de recherche plus robuste
  const allProducts = await getAllProducts();

  // Filtrage basique (MVP)
  // On garde les produits dont le titre ou la description contient un des mots-clés
  const filteredProducts = allProducts.filter((product: any) => {
    const text = (product.title + " " + product.description).toLowerCase();
    return config.keywords.some((keyword) => text.includes(keyword.toLowerCase()));
  });

  // On retourne un objet structuré comme une Collection Shopify
  return {
    id: `virtual-${handle}`,
    handle,
    title: config.title,
    description: config.description,
    products: filteredProducts,
    updatedAt: new Date().toISOString(),
  };
}
