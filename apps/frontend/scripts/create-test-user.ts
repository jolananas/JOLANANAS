/**
 * 🍍 JOLANANAS - Script de Création Utilisateur de Test
 * =====================================================
 * Crée un utilisateur de test dans Shopify pour le développement
 *
 * Usage: pnpm tsx scripts/create-test-user.ts [email] [password] [name]
 *
 * Exemple: pnpm tsx scripts/create-test-user.ts
 *          pnpm tsx scripts/create-test-user.ts test@jolananas.com password123 "Test User"
 *
 * Note: Les utilisateurs sont maintenant gérés par Shopify Customer Accounts.
 * Ce script crée un client dans Shopify via l'Admin API.
 */

import { PrismaClient } from "@prisma/client";
import { join } from "path";
import { existsSync, readFileSync } from "fs";
import { normalizeDatabaseUrl } from "../app/src/lib/utils/path-resolver";
import { getShopifyAdminClient } from "../app/src/lib/ShopifyAdminClient";
import { ENV } from "../app/src/lib/env";

// Charger les variables d'environnement
const envPath = join(process.cwd(), ".env.local");
let databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  if (existsSync(envPath)) {
    try {
      const envContent = readFileSync(envPath, "utf-8");
      const envMatch = envContent.match(/DATABASE_URL=(.+)/);
      if (envMatch) {
        databaseUrl = envMatch[1].trim().replace(/^["']|["']$/g, "");
      }
    } catch (err) {
      console.error("❌ Impossible de lire .env.local");
      process.exit(1);
    }
  }
}

// Essayer aussi variables/.env.local
if (!databaseUrl) {
  const variablesEnvPath = join(process.cwd(), "variables", ".env.local");
  if (existsSync(variablesEnvPath)) {
    try {
      const envContent = readFileSync(variablesEnvPath, "utf-8");
      const envMatch = envContent.match(/DATABASE_URL=(.+)/);
      if (envMatch) {
        databaseUrl = envMatch[1].trim().replace(/^["']|["']$/g, "");
      }
    } catch (err) {
      // Ignorer silencieusement
    }
  }
}

// Si toujours pas trouvé, utiliser une valeur par défaut basée sur le schéma Prisma
if (!databaseUrl) {
  // Chemin par défaut relatif au schéma Prisma
  const defaultDbPath = join(process.cwd(), "app", "src", "prisma", "dev.db");
  const defaultDbPathRelative = "./app/src/prisma/dev.db";

  // Vérifier si le fichier existe
  if (existsSync(defaultDbPath)) {
    databaseUrl = `file:${defaultDbPathRelative}`;
    console.log(
      `💡 Utilisation de la base de données par défaut: ${databaseUrl}\n`,
    );
  } else {
    console.error(
      "❌ DATABASE_URL non défini et base de données par défaut introuvable",
    );
    console.error(
      "💡 Créez un fichier .env.local ou variables/.env.local avec:",
    );
    console.error(`   DATABASE_URL="file:${defaultDbPathRelative}"`);
    console.error("\n   Ou exécutez d'abord: pnpm run db:push");
    process.exit(1);
  }
}

// Normaliser l'URL de la base de données pour éviter les erreurs ByteString
const normalizedDatabaseUrl = normalizeDatabaseUrl(databaseUrl);

// Initialiser Prisma avec l'URL de la base de données normalisée
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: normalizedDatabaseUrl,
    },
  },
});

// Données par défaut pour l'utilisateur de test
const DEFAULT_EMAIL = "test@jolananas.com";
const DEFAULT_PASSWORD = "test123456";
const DEFAULT_NAME = "Utilisateur Test";

async function main() {
  try {
    // Vérifier que SHOPIFY_ADMIN_TOKEN est configuré
    if (!ENV.SHOPIFY_ADMIN_TOKEN) {
      console.error("❌ SHOPIFY_ADMIN_TOKEN n'est pas configuré.");
      console.error(
        "💡 Configurez SHOPIFY_ADMIN_TOKEN dans votre fichier .env.local\n",
      );
      process.exit(1);
    }

    // Récupérer les arguments de la ligne de commande
    const args = process.argv.slice(2);
    const email = args[0] || DEFAULT_EMAIL;
    const password = args[1] || DEFAULT_PASSWORD;
    const name = args[2] || DEFAULT_NAME;

    console.log("🍍 JOLANANAS - Création Utilisateur de Test (Shopify)\n");
    console.log("📋 Paramètres:");
    console.log(`   Email: ${email}`);
    console.log(`   Nom: ${name}`);
    console.log(`   Mot de passe: ${"*".repeat(password.length)}\n`);

    const adminClient = getShopifyAdminClient();

    // Vérifier si le client existe déjà dans Shopify
    const customersResponse = await adminClient.getCustomers(250);
    const customersData = customersResponse.data as
      | { customers?: any[] }
      | undefined;
    const existingCustomer = customersData?.customers?.find(
      (c: any) => c.email?.toLowerCase() === email.toLowerCase(),
    );

    if (existingCustomer) {
      console.log("⚠️  Un client avec cet email existe déjà dans Shopify.");
      console.log(`   Shopify ID: ${existingCustomer.id}`);
      console.log(
        `   Nom: ${existingCustomer.first_name} ${existingCustomer.last_name}`,
      );
      console.log(
        `   Email vérifié: ${existingCustomer.verified_email ? "Oui" : "Non"}\n`,
      );

      // Vérifier si l'utilisateur existe localement
      const localUser = await prisma.user.findUnique({
        where: { email: email.toLowerCase() },
      });

      if (localUser) {
        console.log("📊 Utilisateur local trouvé:");
        console.log(`   ID local: ${localUser.id}`);
        const shopifyId = (localUser as any).shopifyCustomerId;
        console.log(`   Shopify Customer ID: ${shopifyId || "Non lié"}\n`);
      }

      console.log(
        "💡 Pour créer un nouveau compte, utilisez un email différent.",
      );
      console.log("   Ou utilisez l'interface web pour vous connecter.\n");

      await prisma.$disconnect();
      return;
    }

    // Créer le client dans Shopify
    console.log("👤 Création du client dans Shopify...");
    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    const createResponse = await adminClient.createCustomer({
      email: email.toLowerCase(),
      first_name: firstName,
      last_name: lastName,
      verified_email: false, // L'utilisateur devra vérifier son email
      // Note: Les mots de passe ne peuvent pas être définis directement via l'Admin API
      // L'utilisateur devra utiliser la fonctionnalité "Réinitialiser le mot de passe" de Shopify
    });

    if (createResponse.errors) {
      console.error("❌ Erreur lors de la création du client Shopify:");
      createResponse.errors.forEach((err: any) => {
        console.error(`   - ${err.message}`);
      });
      process.exit(1);
    }

    const createData = createResponse.data as { customer?: any } | undefined;
    const shopifyCustomer = createData?.customer;
    if (!shopifyCustomer) {
      console.error("❌ Impossible de créer le client Shopify");
      process.exit(1);
    }

    const shopifyCustomerId = shopifyCustomer.id.toString();

    // Créer l'utilisateur local avec le lien vers Shopify
    console.log("💾 Création de l'utilisateur local...");
    const localUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        name: name.trim(),
        role: "CUSTOMER",
        shopifyCustomerId: shopifyCustomerId as any, // Type assertion nécessaire jusqu'à la régénération de Prisma
        // Note: Le mot de passe n'est plus stocké localement
      },
    });

    console.log("\n✅ Client créé avec succès !\n");
    console.log("📊 Informations Shopify:");
    console.log(`   Shopify Customer ID: ${shopifyCustomerId}`);
    console.log(`   Email: ${shopifyCustomer.email}`);
    console.log(
      `   Nom: ${shopifyCustomer.first_name} ${shopifyCustomer.last_name}`,
    );
    console.log(
      `   Email vérifié: ${shopifyCustomer.verified_email ? "Oui" : "Non"}\n`,
    );

    console.log("📊 Informations locales:");
    console.log(`   ID local: ${localUser.id}`);
    console.log(`   Email: ${localUser.email}`);
    console.log(`   Nom: ${localUser.name}`);
    console.log(`   Rôle: ${localUser.role}\n`);

    console.log("⚠️  IMPORTANT:");
    console.log(
      "   - Le mot de passe ne peut pas être défini directement via l'Admin API.",
    );
    console.log(
      '   - L\'utilisateur devra utiliser la fonctionnalité "Réinitialiser le mot de passe" de Shopify.',
    );
    console.log(
      "   - Ou vous pouvez envoyer une invitation depuis l'admin Shopify.\n",
    );

    console.log("🔑 Pour définir le mot de passe:");
    console.log(
      "   1. Allez sur https://admin.shopify.com/store/[votre-boutique]/customers",
    );
    console.log(`   2. Trouvez le client: ${email}`);
    console.log(
      '   3. Cliquez sur "Envoyer une invitation" ou "Réinitialiser le mot de passe"\n',
    );

    console.log("🌐 Vous pouvez maintenant vous connecter sur:");
    console.log("   - http://localhost:3000/login");
    console.log("   - http://localhost:3000/account\n");
  } catch (error) {
    console.error("❌ Erreur lors de la création de l'utilisateur:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
