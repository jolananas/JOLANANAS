/**
 * 🍍 JOLANANAS - Script Envoi Invitations Réinitialisation Mot de Passe
 * ======================================================================
 * Envoie automatiquement des invitations de réinitialisation de mot de passe
 * aux clients Shopify existants
 * 
 * Usage: pnpm tsx scripts/send-password-reset-invitations.ts [--dry-run] [--limit N]
 * 
 * Options:
 *   --dry-run : Affiche ce qui sera envoyé sans effectuer l'envoi
 *   --limit N : Limite le nombre d'invitations à envoyer (défaut: 50)
 */

import { PrismaClient } from '@prisma/client';
import { join } from 'path';
import { existsSync, readFileSync } from 'fs';
import { config } from 'dotenv';

/**
 * Normalise une URL de base de données pour Prisma/SQLite
 */
function normalizeDatabaseUrl(databaseUrl: string): string {
  if (!databaseUrl.startsWith('file:')) {
    return databaseUrl;
  }

  const filePath = databaseUrl.replace(/^file:/, '');
  
  const normalized = filePath
    .replace(/—/g, '-')
    .replace(/–/g, '-')
    .replace(/"/g, '"')
    .replace(/'/g, "'")
    .replace(/"/g, '"')
    .replace(/'/g, "'");
  
  return `file:${normalized}`;
}

// Charger les variables d'environnement
const envPath = join(process.cwd(), '.env.local');
if (existsSync(envPath)) {
  config({ path: envPath });
} else {
  config(); // Utiliser .env par défaut
}

// Initialiser Prisma
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ DATABASE_URL n\'est pas défini dans les variables d\'environnement');
  process.exit(1);
}

const normalizedDatabaseUrl = normalizeDatabaseUrl(databaseUrl);
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: normalizedDatabaseUrl,
    },
  },
});

// Importer ShopifyAdminClient
async function getShopifyAdminClient() {
  // Utiliser une importation dynamique pour éviter les problèmes de module
  // Le script est dans app/frontend/scripts/, donc le chemin relatif est correct
  const { getShopifyAdminClient } = await import('../app/src/lib/ShopifyAdminClient');
  return getShopifyAdminClient();
}

async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const limitArg = args.find(arg => arg.startsWith('--limit='));
  const limit = limitArg ? parseInt(limitArg.split('=')[1], 10) : 50;

  if (isDryRun) {
    console.log('🔍 MODE DRY-RUN - Aucune invitation ne sera envoyée\n');
  }

  try {
    console.log('🚀 Démarrage de l\'envoi d\'invitations de réinitialisation de mot de passe...\n');

    // Vérifier que SHOPIFY_ADMIN_TOKEN est configuré
    if (!process.env.SHOPIFY_ADMIN_TOKEN) {
      console.error('❌ SHOPIFY_ADMIN_TOKEN n\'est pas configuré dans les variables d\'environnement');
      process.exit(1);
    }

    // Récupérer tous les utilisateurs avec shopifyCustomerId
    console.log(`📋 Recherche des utilisateurs avec shopifyCustomerId (limite: ${limit})...`);
    const users = await prisma.user.findMany({
      where: {
        shopifyCustomerId: {
          not: null,
        },
      },
      take: limit,
      select: {
        id: true,
        email: true,
        shopifyCustomerId: true,
        name: true,
      },
    });

    if (users.length === 0) {
      console.log('✅ Aucun utilisateur avec shopifyCustomerId trouvé.');
      return;
    }

    console.log(`📊 ${users.length} utilisateur(s) trouvé(s)\n`);

    const adminClient = await getShopifyAdminClient();
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;

    for (const user of users) {
      if (!user.shopifyCustomerId) {
        skippedCount++;
        continue;
      }

      try {
        console.log(`📧 Envoi invitation à ${user.email} (Customer ID: ${user.shopifyCustomerId})...`);

        if (isDryRun) {
          console.log(`   ✅ [DRY-RUN] Invitation serait envoyée`);
          successCount++;
        } else {
          const inviteResult = await adminClient.sendCustomerPasswordResetInvite(user.shopifyCustomerId);

          if (inviteResult.errors && inviteResult.errors.length > 0) {
            console.error(`   ❌ Erreur:`, inviteResult.errors[0]?.message || 'Erreur inconnue');
            errorCount++;
          } else {
            console.log(`   ✅ Invitation envoyée avec succès`);
            successCount++;
          }
        }
      } catch (error) {
        console.error(`   ❌ Erreur lors de l'envoi à ${user.email}:`, error instanceof Error ? error.message : error);
        errorCount++;
      }

      // Petite pause pour éviter de surcharger l'API Shopify
      if (!isDryRun) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log('📊 Résumé de l\'envoi d\'invitations:');
    console.log(`   ✅ Succès: ${successCount}`);
    console.log(`   ⏭️  Ignorés: ${skippedCount}`);
    console.log(`   ❌ Erreurs: ${errorCount}`);
    console.log('='.repeat(50) + '\n');

    if (isDryRun) {
      console.log('💡 Pour envoyer réellement les invitations, exécutez sans --dry-run');
    }

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('❌ Erreur:', error);
  process.exit(1);
});

