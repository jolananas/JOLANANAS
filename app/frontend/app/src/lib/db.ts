/**
 * 🍍 JOLANANAS - Client Base de Données
 * =====================================
 * Client Prisma centralisé avec connexions optimisées
 */

import { PrismaClient } from '@prisma/client';
import { normalizeDatabaseUrl } from './utils/path-resolver';

// Normaliser DATABASE_URL pour éviter les erreurs ByteString avec caractères Unicode
const normalizedDatabaseUrl = process.env.DATABASE_URL 
  ? normalizeDatabaseUrl(process.env.DATABASE_URL)
  : undefined;

// Singleton pattern pour éviter les multiples connexions
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db = globalForPrisma.prisma ?? new PrismaClient({
  datasources: normalizedDatabaseUrl ? {
    db: {
      url: normalizedDatabaseUrl,
    },
  } : undefined,
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}

// Connexion automatique en développement
if (process.env.NODE_ENV === 'development') {
  db.$connect().then(() => {
    console.log('✅ Base de données connectée');
  }).catch((error) => {
    console.error('❌ Erreur connexion BDD:', error);
  });
}

export default db;
