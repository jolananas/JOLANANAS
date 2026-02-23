import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Configuration pour charger .env.local
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env.local") });

async function auditProductVisibility(handle: string) {
  const domain = process.env.SHOPIFY_STORE_DOMAIN;
  const token = process.env.SHOPIFY_STOREFRONT_TOKEN;
  const version = process.env.SHOPIFY_API_VERSION || "2024-01";

  console.log(`\n🔍 AUDIT: Vérification de la visibilité pour le produit: "${handle}"`);
  console.log(`🌐 Domaine: ${domain}`);
  console.log(`📅 Version API: ${version}`);

  if (!domain || !token) {
    console.error("❌ Erreur: SHOPIFY_STORE_DOMAIN ou SHOPIFY_STOREFRONT_TOKEN manquant dans .env.local");
    process.exit(1);
  }

  const endpoint = `https://${domain}/api/${version}/graphql.json`;

  const query = `
    query AuditProductVisibility($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        availableForSale
        publishedAt
      }
    }
  `;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": token,
      },
      body: JSON.stringify({
        query,
        variables: { handle },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`❌ Erreur HTTP Shopify (${response.status}): ${text}`);
      return;
    }

    const { data, errors } = await response.json();

    if (errors) {
      console.error("❌ Erreurs GraphQL détectées :");
      console.error(JSON.stringify(errors, null, 2));
      return;
    }

    if (!data?.product) {
      console.log("\n❌ RÉSULTAT: PRODUIT NON TROUVÉ (404)");
      console.log("⚠️  Le produit existe probablement dans Shopify mais N'EST PAS publié sur le canal de vente 'Headless/Storefront API'.");
      console.log("👉 Action requise: Dans Shopify Admin, allez sur le produit et vérifiez qu'il est bien publié sur votre App Custom (Headless).");
    } else {
      console.log("\n✅ RÉSULTAT: PRODUIT TROUVÉ");
      console.log(`📌 Titre: ${data.product.title}`);
      console.log(`🆔 ID: ${data.product.id}`);
      console.log(`📅 Publié à: ${data.product.publishedAt}`);
      console.log(`💰 Disponible à la vente: ${data.product.availableForSale ? "OUI" : "NON"}`);
      console.log("\n💡 Le produit est bien accessible via l'API Storefront.");
      console.log("👉 Si Vercel renvoie une 404, le problème vient du cache Next.js.");
      console.log("👉 Vérifiez que les webhooks de revalidation fonctionnent ou purgez le cache manuellement.");
    }
  } catch (error) {
    console.error("❌ Erreur lors de l'exécution de l'audit:", error);
  }
}

// Récupérer le handle depuis les arguments de la ligne de commande
const handleArg = process.argv[2];

if (!handleArg) {
  console.error("❌ Usage: npx tsx scripts/audit-shopify.ts <product-handle>");
  process.exit(1);
}

auditProductVisibility(handleArg);
