/**
 * 🍍 JOLANANAS - Script de Migration Utilisateurs vers Shopify
 * ============================================================
 * Migre tous les utilisateurs de la base de données locale vers Shopify
 *
 * Usage: pnpm tsx scripts/migrate-users-to-shopify.ts [--dry-run]
 *
 * Options:
 *   --dry-run : Affiche ce qui sera migré sans effectuer la migration
 */

import { PrismaClient } from "@prisma/client";
import { join } from "path";
import { existsSync, readFileSync } from "fs";

/**
 * Normalise une URL de base de données pour Prisma/SQLite
 * Version standalone pour les scripts (sans dépendance server-only)
 */
function normalizeDatabaseUrl(databaseUrl: string): string {
  // Si ce n'est pas une URL SQLite file:, retourner tel quel
  if (!databaseUrl.startsWith("file:")) {
    return databaseUrl;
  }

  // Extraire le chemin du fichier de l'URL
  const filePath = databaseUrl.replace(/^file:/, "");

  // Normaliser le chemin en remplaçant les caractères Unicode problématiques
  const normalized = filePath
    .replace(/—/g, "-") // Tiret cadratin (U+2014, 8211) → tiret simple
    .replace(/–/g, "-") // Tiret demi-cadratin (U+2013, 8212) → tiret simple
    .replace(/"/g, '"') // Guillemets typographiques
    .replace(/'/g, "'")
    .replace(/"/g, '"')
    .replace(/'/g, "'");

  // Reconstruire l'URL avec le chemin normalisé
  return `file:${normalized}`;
}

/**
 * Normalise les données pour l'API Shopify (évite les erreurs ByteString)
 * Version standalone pour les scripts
 */
function normalizeDataForAPI(data: any): any {
  if (typeof data === "string") {
    // Remplacer les caractères Unicode problématiques
    return data
      .replace(/—/g, "-")
      .replace(/–/g, "-")
      .replace(/"/g, '"')
      .replace(/'/g, "'")
      .replace(/"/g, '"')
      .replace(/'/g, "'");
  }

  if (Array.isArray(data)) {
    return data.map((item) => normalizeDataForAPI(item));
  }

  if (data && typeof data === "object") {
    const normalized: any = {};
    for (const [key, value] of Object.entries(data)) {
      normalized[key] = normalizeDataForAPI(value);
    }
    return normalized;
  }

  return data;
}

/**
 * Client Shopify Admin simplifié pour les scripts
 * Version standalone sans dépendances server-only
 */
class ShopifyAdminClientStandalone {
  private baseUrl: string;
  private adminToken: string;

  constructor(config: {
    domain: string;
    adminToken: string;
    apiVersion: string;
  }) {
    this.baseUrl = `https://${config.domain}/admin/api/${config.apiVersion}`;
    this.adminToken = config.adminToken;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
  ): Promise<{ data?: T; errors?: Array<{ message: string }> }> {
    try {
      const url = `${this.baseUrl}${endpoint}`;

      // Normaliser le body JSON pour éviter les erreurs ByteString
      let normalizedBody = options.body;
      if (normalizedBody && typeof normalizedBody === "string") {
        // Nettoyer les caractères > 255
        normalizedBody = normalizedBody
          .split("")
          .map((char) => {
            const code = char.charCodeAt(0);
            if (code > 255) {
              if (code === 8211 || code === 8212) return "-";
              return " ";
            }
            return char;
          })
          .join("");
      }

      const response = await fetch(url, {
        ...options,
        body: normalizedBody,
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": this.adminToken,
          ...options.headers,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `HTTP ${response.status}: ${errorData.message || "Erreur Admin API"}`,
        );
      }

      const data = await response.json();
      return { data };
    } catch (error: any) {
      console.error("❌ Erreur Shopify Admin:", error);
      return { errors: [{ message: error.message || "Erreur Admin API" }] };
    }
  }

  async getCustomers(first: number = 50) {
    const endpoint = `/customers.json?limit=${first}`;
    return this.request(endpoint);
  }

  async createCustomer(customerData: any) {
    const endpoint = `/customers.json`;
    const normalizedCustomer = normalizeDataForAPI(customerData);

    return this.request(endpoint, {
      method: "POST",
      body: JSON.stringify({ customer: normalizedCustomer }),
    });
  }
}

/**
 * Crée une instance du client Shopify Admin avec les variables d'environnement
 * Version standalone pour les scripts
 */
function getShopifyAdminClient(): ShopifyAdminClientStandalone {
  // Charger les variables d'environnement depuis .env.local
  const envPath = join(process.cwd(), ".env.local");
  let envVars: Record<string, string> = {};

  if (existsSync(envPath)) {
    try {
      const envContent = readFileSync(envPath, "utf-8");
      envContent.split("\n").forEach((line) => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^["']|["']$/g, "");
          envVars[key] = value;
        }
      });
    } catch (err) {
      console.error(
        "⚠️  Impossible de lire .env.local, utilisation des variables système",
      );
    }
  }

  // Récupérer les variables nécessaires
  const domain =
    envVars.SHOPIFY_STORE_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN;
  const adminToken =
    envVars.SHOPIFY_ADMIN_TOKEN || process.env.SHOPIFY_ADMIN_TOKEN;
  const apiVersion =
    envVars.SHOPIFY_API_VERSION || process.env.SHOPIFY_API_VERSION;

  if (!domain || !adminToken) {
    throw new Error("SHOPIFY_STORE_DOMAIN et SHOPIFY_ADMIN_TOKEN sont requis");
  }

  return new ShopifyAdminClientStandalone({
    domain,
    adminToken,
    apiVersion,
  });
}

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

// Si toujours pas trouvé, utiliser une valeur par défaut
if (!databaseUrl) {
  const defaultDbPath = join(process.cwd(), "app", "src", "prisma", "dev.db");
  const defaultDbPathRelative = "./app/src/prisma/dev.db";

  if (existsSync(defaultDbPath)) {
    databaseUrl = `file:${defaultDbPathRelative}`;
    console.log(
      `💡 Utilisation de la base de données par défaut: ${databaseUrl}\n`,
    );
  } else {
    console.error(
      "❌ DATABASE_URL non défini et base de données par défaut introuvable",
    );
    process.exit(1);
  }
}

// Normaliser l'URL de la base de données
const normalizedDatabaseUrl = normalizeDatabaseUrl(databaseUrl);

// Initialiser Prisma
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: normalizedDatabaseUrl,
    },
  },
});

// Vérifier si c'est un dry-run
const isDryRun = process.argv.includes("--dry-run");

async function main() {
  try {
    console.log("🍍 JOLANANAS - Migration Utilisateurs vers Shopify\n");

    if (isDryRun) {
      console.log("⚠️  MODE DRY-RUN : Aucune modification ne sera effectuée\n");
    }

    // Récupérer tous les utilisateurs
    console.log(
      "📋 Récupération des utilisateurs de la base de données locale...",
    );
    const users = await prisma.user.findMany({
      where: {
        role: "CUSTOMER", // Seulement les clients, pas les admins
        shopifyCustomerId: null, // Seulement ceux qui n'ont pas encore été migrés
      },
    });

    console.log(`✅ ${users.length} utilisateur(s) trouvé(s)\n`);

    if (users.length === 0) {
      console.log("ℹ️  Aucun utilisateur à migrer.");
      await prisma.$disconnect();
      return;
    }

    // Initialiser le client Shopify Admin
    const adminClient = getShopifyAdminClient();

    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      try {
        console.log(`\n👤 Migration de: ${user.email}`);

        // Vérifier si le client existe déjà dans Shopify
        const customersResponse = await adminClient.getCustomers(250);
        const existingCustomer = customersResponse.data?.customers?.find(
          (c: any) => c.email?.toLowerCase() === user.email.toLowerCase(),
        );

        if (existingCustomer) {
          console.log(
            `   ⏭️  Client déjà existant dans Shopify (ID: ${existingCustomer.id})`,
          );
          skippedCount++;
          continue;
        }

        // Préparer les données pour Shopify
        const customerData: any = {
          email: user.email.toLowerCase(),
          first_name: user.name?.split(" ")[0],
          last_name: user.name?.split(" ").slice(1).join(" "),
          send_email_welcome: false, // Ne pas envoyer l'email de bienvenue
        };

        // Note: Les adresses ne sont plus liées au modèle User dans le schéma
        // Elles seront gérées directement dans Shopify après la création du client

        if (isDryRun) {
          console.log(
            `   📝 Données qui seraient créées:`,
            JSON.stringify(customerData, null, 2),
          );
          successCount++;
        } else {
          // Créer le client dans Shopify
          const createResult = await adminClient.createCustomer(customerData);

          if (createResult.data?.customer) {
            const shopifyCustomerId = createResult.data.customer.id.toString();
            console.log(
              `   ✅ Client créé dans Shopify (ID: ${shopifyCustomerId})`,
            );

            // Mettre à jour l'utilisateur local avec le shopifyCustomerId
            try {
              await prisma.user.update({
                where: { id: user.id },
                data: { shopifyCustomerId },
              });
              console.log(
                `   ✅ Utilisateur local mis à jour avec shopifyCustomerId`,
              );
            } catch (updateError) {
              console.warn(
                `   ⚠️  Impossible de mettre à jour l'utilisateur local:`,
                updateError,
              );
            }

            successCount++;
          } else if (createResult.errors) {
            console.error(`   ❌ Erreur:`, createResult.errors);
            errorCount++;
          } else {
            console.error(`   ❌ Erreur inconnue lors de la création`);
            errorCount++;
          }
        }
      } catch (error) {
        console.error(
          `   ❌ Erreur lors de la migration de ${user.email}:`,
          error,
        );
        errorCount++;
      }
    }

    console.log("\n" + "=".repeat(50));
    console.log("📊 Résumé de la migration:");
    console.log(`   ✅ Succès: ${successCount}`);
    console.log(`   ⏭️  Ignorés (déjà existants): ${skippedCount}`);
    console.log(`   ❌ Erreurs: ${errorCount}`);
    console.log("=".repeat(50) + "\n");

    if (isDryRun) {
      console.log("💡 Pour effectuer la migration réelle, exécutez:");
      console.log("   pnpm tsx scripts/migrate-users-to-shopify.ts\n");
    }
  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
