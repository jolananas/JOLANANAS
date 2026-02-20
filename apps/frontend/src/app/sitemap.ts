import { getAllCollections, getAllProducts } from "@/lib/shopify";
import { MetadataRoute } from "next";

export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.DOMAIN_URL;

  // Accueil (1.0)
  const homeRoute = {
    url: `${baseUrl}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "weekly" as const,
    priority: 1.0,
  };

  // Pages statiques (0.8)
  const staticRoutes = [
    "/a-propos",
    "/contact",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // Mentions légales (0.3)
  const legalRoutes = [
    "/mentions-legales",
    "/mentions-legales/CGV",
    "/mentions-legales/confidentialite",
    "/mentions-legales/CGU",
    "/mentions-legales/cookies",
    "/mentions-legales/retours",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: "yearly" as const,
    priority: 0.3,
  }));

  try {
    // 2. Produits (0.8)
    const products = await getAllProducts();
    const productRoutes = products.map((product: any) => ({
      url: `${baseUrl}/products/${product.handle}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    // 3. Collections (0.8)
    const collections = await getAllCollections();
    const collectionRoutes = collections.map((collection: any) => ({
      url: `${baseUrl}/collections/${collection.handle}`,
      lastModified: new Date().toISOString(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [homeRoute, ...staticRoutes, ...legalRoutes, ...productRoutes, ...collectionRoutes];
  } catch (error) {
    console.error("Sitemap: Failed to fetch Shopify data, returning static routes only:", error);
    return [homeRoute, ...staticRoutes, ...legalRoutes];
  }
}
