/** @type {import('next-sitemap').IConfig} */
export default {
  siteUrl: process.env.DOMAIN_URL,
  generateRobotsTxt: true,
  exclude: ["/sitemap.xml", "/account/*", "/checkout/*", "/cart"],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/account", "/checkout", "/cart", "/api"],
      },
    ],
    additionalSitemaps: [
      // `${process.env.DOMAIN_URL}/sitemap.xml`, // Si besoin de sitemap dynamique serveur
    ],
  },
};
