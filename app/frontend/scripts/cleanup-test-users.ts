/**
 * 🍍 JOLANANAS - Script de Nettoyage Utilisateurs de Test
 * ========================================================
 * Supprime les utilisateurs de test de la base de données
 * 
 * Usage: pnpm tsx scripts/cleanup-test-users.ts [--dry-run]
 */

import { PrismaClient } from '@prisma/client';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { normalizeDatabaseUrl } from '../app/src/lib/utils/path-resolver';

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

function isTestEmail(email: string): boolean {
  return TEST_EMAIL_PATTERNS.some(pattern => pattern.test(email));
}

function isTestName(name: string | null): boolean {
  if (!name) return false;
  return TEST_NAME_PATTERNS.some(pattern => pattern.test(name));
}

function isTestUser(user: { email: string; name: string | null }): boolean {
  return isTestEmail(user.email) || isTestName(user.name);
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  console.log('🍍 JOLANANAS - Nettoyage Utilisateurs de Test\n');
  console.log(`Mode: ${dryRun ? '🔍 DRY RUN (simulation)' : '🗑️  SUPPRESSION RÉELLE'}\n`);

  // Charger les variables d'environnement
  const envPath = join(process.cwd(), '.env.local');
  let databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    if (existsSync(envPath)) {
      try {
        const envContent = readFileSync(envPath, 'utf-8');
        const envMatch = envContent.match(/DATABASE_URL=(.+)/);
        if (envMatch) {
          databaseUrl = envMatch[1].trim().replace(/^["']|["']$/g, '');
        }
      } catch (err) {
        console.error('❌ Impossible de lire .env.local');
        process.exit(1);
      }
    }
  }

  if (!databaseUrl) {
    console.error('❌ DATABASE_URL non défini');
    process.exit(1);
  }

  // Normaliser l'URL de la base de données pour éviter les erreurs ByteString
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
        createdAt: 'desc',
      },
    });

    console.log(`📊 Total utilisateurs dans la base: ${allUsers.length}\n`);

    // Identifier les utilisateurs de test
    const testUsers = allUsers.filter(isTestUser);

    if (testUsers.length === 0) {
      console.log('✅ Aucun utilisateur de test détecté\n');
      await prisma.$disconnect();
      return;
    }

    console.log(`⚠️  ${testUsers.length} utilisateur(s) de test détecté(s):\n`);
    testUsers.forEach((user, index) => {
      console.log(`  ${index + 1}. ${user.email} (${user.name || 'Not Available (N/A)'}) - Créé le ${user.createdAt.toLocaleDateString('fr-FR')}`);
    });
    console.log('');

    if (dryRun) {
      console.log('🔍 Mode DRY RUN: Aucune suppression effectuée');
      console.log('💡 Exécutez sans --dry-run pour supprimer ces utilisateurs\n');
      await prisma.$disconnect();
      return;
    }

    // Supprimer les utilisateurs de test
    console.log('🗑️  Suppression des utilisateurs de test...\n');

    for (const user of testUsers) {
      try {
        // Note: Les utilisateurs sont maintenant gérés par Shopify Customer Accounts
        // On nettoie uniquement les données locales liées
        
        // Supprimer les données liées (cascade via Prisma)
        // Utiliser shopifyCustomerId si disponible, sinon utiliser l'ID local
        const shopifyCustomerId = (user as any).shopifyCustomerId;
        
        if (shopifyCustomerId) {
          // Supprimer les données liées via shopifyCustomerId
          // Note: Utiliser des type assertions jusqu'à la régénération de Prisma Client
          await prisma.cart.deleteMany({
            where: { shopifyCustomerId: shopifyCustomerId } as any,
          }).catch(() => {}); // Ignorer si le champ n'existe pas encore

          await prisma.order.updateMany({
            where: { shopifyCustomerId: shopifyCustomerId } as any,
            data: { shopifyCustomerId: 'ANONYMIZED' } as any,
          }).catch(() => {});

          await prisma.address.deleteMany({
            where: { shopifyCustomerId: shopifyCustomerId } as any,
          }).catch(() => {});

          await prisma.userPreferences.deleteMany({
            where: { shopifyCustomerId: shopifyCustomerId } as any,
          }).catch(() => {});

          await prisma.activityLog.deleteMany({
            where: { shopifyCustomerId: shopifyCustomerId } as any,
          }).catch(() => {});
        } else {
          // Fallback: utiliser l'ID local si shopifyCustomerId n'est pas disponible
          // (pour les anciens utilisateurs non migrés)
          console.log(`  ⚠️  Utilisateur ${user.email} n'a pas de shopifyCustomerId - nettoyage partiel`);
        }

        // Supprimer l'utilisateur local
        // Note: L'utilisateur Shopify doit être supprimé manuellement via l'Admin API si nécessaire
        await prisma.user.delete({
          where: { id: user.id },
        }).catch((err) => {
          console.warn(`  ⚠️  Impossible de supprimer l'utilisateur local ${user.email}:`, err);
        });

        console.log(`  ✅ Nettoyé: ${user.email}${shopifyCustomerId ? ` (Shopify ID: ${shopifyCustomerId})` : ' (pas de Shopify ID)'}`);
      } catch (error) {
        const err = error as Error;
        console.error(`  ❌ Erreur lors de la suppression de ${user.email}:`, err.message);
      }
    }

    console.log('\n✅ Nettoyage terminé\n');

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
      console.log('\nUtilisateurs restants:');
      remainingUsers.forEach((user, index) => {
        console.log(`  ${index + 1}. ${user.email} (${user.name || 'Not Available (N/A)'})`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch(console.error);

