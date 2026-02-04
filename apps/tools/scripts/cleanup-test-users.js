#!/usr/bin/env node

/**
 * 🍍 JOLANANAS - Script de Nettoyage Utilisateurs de Test
 * ========================================================
 * Supprime les utilisateurs de test de la base de données
 *
 * Usage: node cleanup-test-users.js [--dry-run]
 */

import { PrismaClient } from "@prisma/client";
import { readFileSync, existsSync } from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Trouver le répertoire frontend (où se trouve Prisma)
const frontendDir = resolve(__dirname, "../../../frontend");
const prismaClientPath = join(frontendDir, "node_modules/@prisma/client");

if (!existsSync(prismaClientPath)) {
  console.error(
    "❌ @prisma/client non trouvé. Assurez-vous d'avoir installé les dépendances dans apps/frontend",
  );
  process.exit(1);
}

// Patterns d'emails de test à détecter
const TEST_EMAIL_PATTERNS = [
  /^exemple@/i,
  /@exemple\./i,
  /^test@/i,
  /@test\./i,
  /^demo@/i,
  /@demo\./i,
  /^fake@/i,
  /@fake\./i,
  /^mock@/i,
  /@mock\./i,
  /^user@test\./i,
  /^admin@test\./i,
  /@example\.com$/i,
  /@test\.com$/i,
  /@demo\.com$/i,
  /@fake\.com$/i,
  /@mock\.com$/i,
  /@localhost$/i,
  /@127\.0\.0\.1$/i,
];

// Noms de test à détecter
const TEST_NAME_PATTERNS = [
  /^exemple$/i,
  /^test$/i,
  /^demo$/i,
  /^fake$/i,
  /^mock$/i,
  /^user$/i,
  /^admin$/i,
  /test user/i,
  /demo user/i,
];

function isTestEmail(email) {
  return TEST_EMAIL_PATTERNS.some((pattern) => pattern.test(email));
}

function isTestName(name) {
  if (!name) return false;
  return TEST_NAME_PATTERNS.some((pattern) => pattern.test(name));
}

function isTestUser(user) {
  return isTestEmail(user.email) || isTestName(user.name);
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");

  console.log("🍍 JOLANANAS - Nettoyage Utilisateurs de Test\n");
  console.log(
    `Mode: ${dryRun ? "🔍 DRY RUN (simulation)" : "🗑️  SUPPRESSION RÉELLE"}\n`,
  );

  // Charger les variables d'environnement
  const envPath = join(frontendDir, ".env.local");
  let databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
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

  if (!databaseUrl) {
    console.error("❌ DATABASE_URL non défini");
    process.exit(1);
  }

  // Normaliser l'URL de la base de données pour éviter les erreurs ByteString
  // Remplace les caractères Unicode problématiques par des équivalents ASCII
  function normalizeDatabaseUrl(url) {
    if (!url.startsWith("file:")) {
      return url;
    }
    const filePath = url.replace(/^file:/, "");
    const normalized = filePath
      .replace(/—/g, "-") // Tiret cadratin (U+2014, 8211) → tiret simple
      .replace(/–/g, "-") // Tiret demi-cadratin (U+2013, 8212) → tiret simple
      .replace(/"/g, '"') // Guillemets typographiques
      .replace(/'/g, "'")
      .replace(/"/g, '"')
      .replace(/'/g, "'");
    return `file:${normalized}`;
  }

  const normalizedDatabaseUrl = normalizeDatabaseUrl(databaseUrl);

  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: normalizedDatabaseUrl,
      },
    },
  });

  try {
    // Récupérer tous les utilisateurs
    const allUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(`📊 Total utilisateurs dans la base: ${allUsers.length}\n`);

    // Identifier les utilisateurs de test
    const testUsers = allUsers.filter(isTestUser);

    if (testUsers.length === 0) {
      console.log("✅ Aucun utilisateur de test détecté\n");
      await prisma.$disconnect();
      return;
    }

    console.log(`⚠️  ${testUsers.length} utilisateur(s) de test détecté(s):\n`);
    testUsers.forEach((user, index) => {
      console.log(
        `  ${index + 1}. ${user.email} (${user.name || "Not Available (N/A)"}) - Créé le ${user.createdAt.toLocaleDateString("fr-FR")}`,
      );
    });
    console.log("");

    if (dryRun) {
      console.log("🔍 Mode DRY RUN: Aucune suppression effectuée");
      console.log(
        "💡 Exécutez sans --dry-run pour supprimer ces utilisateurs\n",
      );
      await prisma.$disconnect();
      return;
    }

    // Supprimer les utilisateurs de test
    console.log("🗑️  Suppression des utilisateurs de test...\n");

    for (const user of testUsers) {
      try {
        // Supprimer les données liées (cascade via Prisma)
        await prisma.cart.deleteMany({
          where: { userId: user.id },
        });

        await prisma.order.updateMany({
          where: { userId: user.id },
          data: { userId: "ANONYMIZED" },
        });

        await prisma.address.deleteMany({
          where: { userId: user.id },
        });

        await prisma.userPreferences.deleteMany({
          where: { userId: user.id },
        });

        await prisma.activityLog.deleteMany({
          where: { userId: user.id },
        });

        await prisma.session.deleteMany({
          where: { userId: user.id },
        });

        await prisma.account.deleteMany({
          where: { userId: user.id },
        });

        // Supprimer l'utilisateur
        await prisma.user.delete({
          where: { id: user.id },
        });

        console.log(`  ✅ Supprimé: ${user.email}`);
      } catch (error) {
        console.error(
          `  ❌ Erreur lors de la suppression de ${user.email}:`,
          error.message,
        );
      }
    }

    console.log("\n✅ Nettoyage terminé\n");

    // Afficher les utilisateurs restants
    const remainingUsers = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    console.log(`📊 Utilisateurs restants: ${remainingUsers.length}`);
    if (remainingUsers.length > 0) {
      console.log("\nUtilisateurs restants:");
      remainingUsers.forEach((user, index) => {
        console.log(
          `  ${index + 1}. ${user.email} (${user.name || "Not Available (N/A)"})`,
        );
      });
    }
  } catch (error) {
    console.error("❌ Erreur:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);
