import { getAllCollections, getAllProducts } from "@/lib/shopify";
import { MetadataRoute } from "next";

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.DOMAIN_URL;

  // 1. Pages statiques
  const routes = ["", "/a-propos", "/contact", "/mentions-legales"].map(
    (route) => ({
      url: `${baseUrl}${route}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }),
  );

  try {
    // 2. Produits
    const products = await getAllProducts();
    const productRoutes = products.map((product: any) => ({
      url: `${baseUrl}/products/${product.handle}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly" as const,
      priority: 1.0,
    }));

    // 3. Collections
    const collections = await getAllCollections();
    const collectionRoutes = collections.map((collection: any) => ({
      url: `${baseUrl}/collections/${collection.handle}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly" as const,
      priority: 0.9,
    }));

    return [...routes, ...productRoutes, ...collectionRoutes];
  } catch (error) {
    console.error("Sitemap: Failed to fetch Shopify data, returning static routes only:", error);
    return routes;
  }
}
