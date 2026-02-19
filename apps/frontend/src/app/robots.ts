import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.DOMAIN_URL;

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/private/", "/api/auth/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
