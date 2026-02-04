#!/usr/bin/env node

/**
 * 🍍 JOLANANAS - Vérification des Permissions Shopify Admin API
 * =============================================================
 * Script de vérification des permissions Admin API Shopify
 * Teste les scopes requis et affiche des instructions en cas d'erreur
 */

const { readFileSync, existsSync } = require("fs");
const { join } = require("path");

const COLORS = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  cyan: "\x1b[36m",
};

// Scopes Admin API requis
const REQUIRED_SCOPES = [
  {
    name: "write_draft_orders",
    description: "Créer et modifier des commandes brouillons",
  },
  { name: "read_customers", description: "Lire les informations des clients" },
  { name: "write_customers", description: "Créer et modifier des clients" },
];

/**
 * Charger les variables d'environnement depuis .env.local
 */
function loadEnvFile() {
  const envPaths = [
    join(process.cwd(), "app", "frontend", ".env.local"),
    join(process.cwd(), ".env.local"),
    join(process.cwd(), "frontend", ".env.local"),
  ];

  for (const envPath of envPaths) {
    if (existsSync(envPath)) {
      const envContent = readFileSync(envPath, "utf-8");
      const envVars = {};

      envContent.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const [key, ...valueParts] = trimmed.split("=");
          if (key && valueParts.length > 0) {
            envVars[key.trim()] = valueParts.join("=").trim();
          }
        }
      });

      return envVars;
    }
  }

  return {};
}

/**
 * Vérifier les variables d'environnement requises
 */
function checkEnvironmentVariables(envVars) {
  console.log(
    `${COLORS.blue}📋 Vérification des variables d'environnement...${COLORS.reset}\n`,
  );

  const required = {
    SHOPIFY_STORE_DOMAIN: "Domaine de votre boutique Shopify",
    SHOPIFY_ADMIN_TOKEN: "Token Admin API (OBLIGATOIRE pour le checkout)",
    SHOPIFY_API_VERSION: "Version de l'API Shopify",
  };

  const missing = [];
  const invalid = [];

  for (const [key, description] of Object.entries(required)) {
    const value = envVars[key] || process.env[key];

    if (!value || value.trim() === "") {
      missing.push({ key, description });
      console.log(
        `${COLORS.red}❌ ${key}${COLORS.reset} - ${description} (MANQUANT)`,
      );
    } else {
      // Validation spécifique
      if (key === "SHOPIFY_STORE_DOMAIN" && !value.includes(".myshopify.com")) {
        invalid.push({
          key,
          description,
          reason: "Format invalide. Doit contenir .myshopify.com",
        });
        console.log(
          `${COLORS.yellow}⚠️  ${key}${COLORS.reset} - Format invalide: ${value}`,
        );
      } else if (
        key === "SHOPIFY_ADMIN_TOKEN" &&
        !value.startsWith("shpat_") &&
        !value.startsWith("shpca_")
      ) {
        invalid.push({
          key,
          description,
          reason: "Format suspect. Doit commencer par shpat_ ou shpca_",
        });
        console.log(
          `${COLORS.yellow}⚠️  ${key}${COLORS.reset} - Format suspect (doit commencer par shpat_ ou shpca_)`,
        );
      } else {
        const preview =
          key === "SHOPIFY_ADMIN_TOKEN"
            ? `${value.substring(0, 10)}...`
            : value;
        console.log(`${COLORS.green}✅ ${key}${COLORS.reset} - ${preview}`);
      }
    }
  }

  console.log("");

  if (missing.length > 0 || invalid.length > 0) {
    return { success: false, missing, invalid };
  }

  return { success: true, envVars };
}

/**
 * Tester les permissions Admin API avec plusieurs requêtes
 */
async function testAdminAPIPermissions(storeDomain, adminToken, apiVersion) {
  console.log(
    `${COLORS.blue}🔍 Test des permissions Admin API...${COLORS.reset}\n`,
  );

  const results = {
    readCustomers: false,
    writeDraftOrders: false,
    errors: [],
  };

  // Test 1: read_customers
  console.log(`${COLORS.cyan}Test 1: read_customers${COLORS.reset}`);
  const customersEndpoint = `https://${storeDomain}/admin/api/${apiVersion}/customers.json?limit=1`;
  console.log(`📡 GET ${customersEndpoint}`);

  try {
    const customersResponse = await fetch(customersEndpoint, {
      method: "GET",
      headers: {
        "X-Shopify-Access-Token": adminToken,
        "Content-Type": "application/json",
      },
    });

    const customersText = await customersResponse.text();
    let customersData;

    try {
      customersData = JSON.parse(customersText);
    } catch {
      customersData = { message: customersText };
    }

    if (customersResponse.ok) {
      console.log(`${COLORS.green}✅ read_customers : OK${COLORS.reset}\n`);
      results.readCustomers = true;
    } else if (customersResponse.status === 403) {
      console.log(
        `${COLORS.red}❌ read_customers : 403 Forbidden${COLORS.reset}`,
      );
      const errorMsg = customersData.errors
        ? Array.isArray(customersData.errors)
          ? customersData.errors.map((e) => e.message || e).join(", ")
          : JSON.stringify(customersData.errors)
        : customersData.message || "Accès refusé";
      console.log(`   ${errorMsg}\n`);
      results.errors.push({ scope: "read_customers", error: errorMsg });
    } else {
      console.log(
        `${COLORS.yellow}⚠️  read_customers : ${customersResponse.status}${COLORS.reset}\n`,
      );
      results.errors.push({
        scope: "read_customers",
        error: `Status ${customersResponse.status}`,
      });
    }
  } catch (error) {
    console.log(
      `${COLORS.red}❌ read_customers : Erreur - ${error.message}${COLORS.reset}\n`,
    );
    results.errors.push({ scope: "read_customers", error: error.message });
  }

  // Test 2: write_draft_orders (CRITIQUE pour le checkout)
  console.log(
    `${COLORS.cyan}Test 2: write_draft_orders (CRITIQUE)${COLORS.reset}`,
  );
  const draftOrdersEndpoint = `https://${storeDomain}/admin/api/${apiVersion}/draft_orders.json`;
  console.log(`📡 POST ${draftOrdersEndpoint}`);

  // Créer un draft order minimal pour tester (sera supprimé immédiatement)
  const testDraftOrder = {
    draft_order: {
      line_items: [
        {
          variant_id: "1", // ID fictif, mais permet de tester la permission
          quantity: 1,
        },
      ],
      note: "Test de permission - sera supprimé",
    },
  };

  try {
    const draftResponse = await fetch(draftOrdersEndpoint, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": adminToken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(testDraftOrder),
    });

    const draftText = await draftResponse.text();
    let draftData;

    try {
      draftData = JSON.parse(draftText);
    } catch {
      draftData = { message: draftText };
    }

    if (draftResponse.ok) {
      console.log(`${COLORS.green}✅ write_draft_orders : OK${COLORS.reset}`);
      // Supprimer le draft order de test si créé avec succès
      if (draftData.draft_order && draftData.draft_order.id) {
        const deleteEndpoint = `https://${storeDomain}/admin/api/${apiVersion}/draft_orders/${draftData.draft_order.id}.json`;
        try {
          await fetch(deleteEndpoint, {
            method: "DELETE",
            headers: {
              "X-Shopify-Access-Token": adminToken,
            },
          });
          console.log(`   (Draft order de test supprimé)\n`);
        } catch {
          // Ignorer les erreurs de suppression
        }
      }
      results.writeDraftOrders = true;
    } else if (draftResponse.status === 403) {
      console.log(
        `${COLORS.red}❌ write_draft_orders : 403 Forbidden${COLORS.reset}`,
      );
      const errorMsg = draftData.errors
        ? Array.isArray(draftData.errors)
          ? draftData.errors.map((e) => e.message || e).join(", ")
          : JSON.stringify(draftData.errors)
        : draftData.message || "Accès refusé";
      console.log(`   ${errorMsg}\n`);
      results.errors.push({ scope: "write_draft_orders", error: errorMsg });
    } else if (draftResponse.status === 422) {
      // 422 peut signifier que les données sont invalides mais la permission est OK
      // Vérifier si c'est une erreur de permission ou de données
      const errorMsg = draftData.errors
        ? Array.isArray(draftData.errors)
          ? draftData.errors.map((e) => e.message || e).join(", ")
          : JSON.stringify(draftData.errors)
        : draftData.message || "Erreur de validation";

      if (
        errorMsg.toLowerCase().includes("scope") ||
        errorMsg.toLowerCase().includes("permission")
      ) {
        console.log(
          `${COLORS.red}❌ write_draft_orders : Permission refusée${COLORS.reset}`,
        );
        console.log(`   ${errorMsg}\n`);
        results.errors.push({ scope: "write_draft_orders", error: errorMsg });
      } else {
        // Erreur de données, mais permission OK
        console.log(
          `${COLORS.green}✅ write_draft_orders : Permission OK (erreur de données attendue)${COLORS.reset}\n`,
        );
        results.writeDraftOrders = true;
      }
    } else {
      console.log(
        `${COLORS.yellow}⚠️  write_draft_orders : ${draftResponse.status}${COLORS.reset}\n`,
      );
      results.errors.push({
        scope: "write_draft_orders",
        error: `Status ${draftResponse.status}`,
      });
    }
  } catch (error) {
    console.log(
      `${COLORS.red}❌ write_draft_orders : Erreur - ${error.message}${COLORS.reset}\n`,
    );
    results.errors.push({ scope: "write_draft_orders", error: error.message });
  }

  // Résumé des résultats
  console.log(`${COLORS.bold}📊 Résumé des tests:${COLORS.reset}`);
  console.log(
    `   ${results.readCustomers ? COLORS.green + "✅" : COLORS.red + "❌"} read_customers`,
  );
  console.log(
    `   ${results.writeDraftOrders ? COLORS.green + "✅" : COLORS.red + "❌"} write_draft_orders (CRITIQUE pour le checkout)${COLORS.reset}`,
  );
  console.log("");

  // Déterminer le résultat global
  if (results.writeDraftOrders && results.readCustomers) {
    return { success: true, results };
  } else {
    // Identifier les scopes manquants
    const missingScopes = [];
    if (!results.readCustomers) {
      missingScopes.push(
        REQUIRED_SCOPES.find((s) => s.name === "read_customers"),
      );
    }
    if (!results.writeDraftOrders) {
      missingScopes.push(
        REQUIRED_SCOPES.find((s) => s.name === "write_draft_orders"),
      );
    }

    return {
      success: false,
      results,
      missingScopes: missingScopes.filter(Boolean),
      errors: results.errors,
    };
  }
}

/**
 * Afficher les instructions de correction
 */
function displayFixInstructions(missingScopes) {
  console.log(
    `${COLORS.cyan}${COLORS.bold}🔧 Instructions pour corriger:${COLORS.reset}\n`,
  );

  console.log(`${COLORS.bold}1. Accédez à Shopify Admin${COLORS.reset}`);
  console.log("   → https://admin.shopify.com");
  console.log("   → Settings → Apps and sales channels → Develop apps");
  console.log("");

  console.log(
    `${COLORS.bold}2. Sélectionnez ou créez votre app${COLORS.reset}`,
  );
  console.log("   → Cliquez sur votre app existante ou créez-en une nouvelle");
  console.log("");

  console.log(
    `${COLORS.bold}3. Configurez les permissions Admin API${COLORS.reset}`,
  );
  console.log('   → Cliquez sur "Configure Admin API scopes"');
  console.log("   → Cochez les scopes suivants (OBLIGATOIRES) :");

  for (const scope of missingScopes) {
    console.log(`      ✅ ${scope.name} - ${scope.description}`);
  }

  console.log('   → Cliquez sur "Save"');
  console.log("");

  console.log(
    `${COLORS.bold}4. ⚠️  INSTALLEZ OU RÉINSTALLEZ L'APP${COLORS.reset}`,
  );
  console.log("   → API credentials → Admin API access token");
  console.log('   → Cliquez sur "Install app" (ou "Uninstall" puis "Install")');
  console.log("   → Autorisez toutes les permissions demandées");
  console.log(
    "   → ⚠️  IMPORTANT : L'app doit être installée pour obtenir l'approbation du marchand",
  );
  console.log("");

  console.log(`${COLORS.bold}5. Générez le token Admin${COLORS.reset}`);
  console.log('   → Après installation, cliquez sur "Reveal token once"');
  console.log("   → Copiez le token (commence par shpat_ ou shpca_)");
  console.log("   → ⚠️  Le token ne sera affiché qu'une seule fois");
  console.log("");

  console.log(
    `${COLORS.bold}6. Ajoutez le token dans .env.local${COLORS.reset}`,
  );
  console.log("   → Ouvrez apps/frontend/.env.local");
  console.log("   → Ajoutez ou modifiez : SHOPIFY_ADMIN_TOKEN=votre_token_ici");
  console.log("   → Sauvegardez le fichier");
  console.log("");

  console.log(`${COLORS.bold}7. Redémarrez le serveur${COLORS.reset}`);
  console.log("   → Arrêtez le serveur (Ctrl+C)");
  console.log("   → Relancez : pnpm run dev");
  console.log("");

  console.log(
    `${COLORS.cyan}📖 Guide détaillé : apps/docs/Configuration Admin API — JOLANANAS.md${COLORS.reset}`,
  );
  console.log("");
}

/**
 * Fonction principale
 */
async function main() {
  console.log(
    `${COLORS.green}${COLORS.bold}🍍 JOLANANAS - Vérification des Permissions Shopify Admin API${COLORS.reset}\n`,
  );

  // Charger les variables d'environnement
  const envVars = loadEnvFile();

  // Vérifier les variables d'environnement
  const envCheck = checkEnvironmentVariables(envVars);

  if (!envCheck.success) {
    console.log(
      `${COLORS.red}${COLORS.bold}❌ Variables d'environnement manquantes ou invalides${COLORS.reset}\n`,
    );

    if (envCheck.missing && envCheck.missing.length > 0) {
      console.log(`${COLORS.yellow}Variables manquantes:${COLORS.reset}`);
      envCheck.missing.forEach(({ key, description }) => {
        console.log(`   - ${key}: ${description}`);
      });
      console.log("");
    }

    if (envCheck.invalid && envCheck.invalid.length > 0) {
      console.log(`${COLORS.yellow}Variables invalides:${COLORS.reset}`);
      envCheck.invalid.forEach(({ key, reason }) => {
        console.log(`   - ${key}: ${reason}`);
      });
      console.log("");
    }

    console.log(
      `${COLORS.cyan}💡 Ajoutez les variables manquantes dans apps/frontend/.env.local${COLORS.reset}`,
    );
    console.log(
      `${COLORS.cyan}📖 Voir apps/frontend/CONFIGURATION_ENV.md pour les instructions${COLORS.reset}\n`,
    );
    process.exit(1);
  }

  // Récupérer les variables depuis envVars ou process.env
  const storeDomain =
    envVars.SHOPIFY_STORE_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN;
  const adminToken =
    envVars.SHOPIFY_ADMIN_TOKEN || process.env.SHOPIFY_ADMIN_TOKEN;
  const apiVersion =
    envVars.SHOPIFY_API_VERSION || process.env.SHOPIFY_API_VERSION;

  // Tester les permissions
  const testResult = await testAdminAPIPermissions(
    storeDomain,
    adminToken,
    apiVersion,
  );

  if (testResult.success) {
    console.log(
      `${COLORS.green}${COLORS.bold}✅ Toutes les vérifications sont passées avec succès !${COLORS.reset}\n`,
    );
    console.log("Votre configuration Admin API est correcte.");
    console.log(
      "Vous pouvez maintenant utiliser le système de checkout personnalisé.\n",
    );
    process.exit(0);
  } else {
    console.log(
      `${COLORS.red}${COLORS.bold}❌ Les permissions Admin API ne sont pas correctement configurées${COLORS.reset}\n`,
    );

    // Afficher les erreurs détaillées si disponibles
    if (testResult.errors && testResult.errors.length > 0) {
      console.log(`${COLORS.yellow}📋 Détails des erreurs:${COLORS.reset}`);
      testResult.errors.forEach(({ scope, error }) => {
        console.log(`   ${COLORS.red}❌${COLORS.reset} ${scope}: ${error}`);
      });
      console.log("");
    }

    if (testResult.missingScopes && testResult.missingScopes.length > 0) {
      displayFixInstructions(testResult.missingScopes);
    } else if (testResult.status === 401) {
      console.log(
        `${COLORS.yellow}💡 Le token Admin semble invalide ou expiré.${COLORS.reset}`,
      );
      console.log("   → Générez un nouveau token dans Shopify Admin");
      console.log(
        "   → API credentials → Admin API access token → Reveal token once",
      );
      console.log("   → Mettez à jour SHOPIFY_ADMIN_TOKEN dans .env.local\n");
    } else {
      // Afficher les instructions par défaut si aucun scope spécifique n'est identifié
      displayFixInstructions(REQUIRED_SCOPES);
    }

    process.exit(1);
  }
}

// Exécuter le script
main().catch((error) => {
  console.error(`${COLORS.red}❌ Erreur fatale:${COLORS.reset}`);
  console.error(error);
  process.exit(1);
});
