import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.DOMAIN_URL || "https://jolananas.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/private/", "/api/", "/checkout/", "/cart/"],
      },
      {
        userAgent: ["Google-Extended", "PerplexityBot"],
        allow: "/",
        disallow: ["/private/", "/api/", "/checkout/", "/cart/"],
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
