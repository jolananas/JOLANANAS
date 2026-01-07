/**
 * 🍍 JOLANANAS - Validation Variables d'Environnement
 * =====================================
 * Validation stricte des variables d'environnement avec Zod (open source)
 * pour une validation type-safe et des messages d'erreur clairs
 * 
 * ⚠️ SERVER-ONLY : Ce fichier ne peut être utilisé que côté serveur
 * car il utilise des modules Node.js (fs, path)
 */

import 'server-only';

import { z } from 'zod';
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * Schéma Zod pour la validation des variables d'environnement
 */
const envSchema = z.object({
  // Variables requises
  SHOPIFY_STORE_DOMAIN: z
    .string()
    .min(1, 'SHOPIFY_STORE_DOMAIN est requis')
    .refine(
      (val) => val.includes('.myshopify.com'),
      {
        message: 'Format de domaine Shopify invalide. Format attendu: votre-boutique.myshopify.com',
      }
    ),
  SHOPIFY_STOREFRONT_TOKEN: z
    .string()
    .min(1, 'SHOPIFY_STOREFRONT_TOKEN est requis')
    .refine(
      (val) => !val.includes('your_') && !val.includes('token_ici') && val !== 'test-token-for-testing-only',
      {
        message: 'Token Shopify suspect. Vérifiez votre configuration .env',
      }
    ),
  SHOPIFY_API_VERSION: z
    .string()
    .min(1, 'SHOPIFY_API_VERSION est requis')
    .regex(/^\d{4}-\d{2}$/, 'Format de version API invalide. Format attendu: YYYY-MM'),
  
  NODE_ENV: z
    .enum(['development', 'production', 'test'], {
      errorMap: () => ({ message: 'NODE_ENV doit être development, production ou test' }),
    })
    .default('development'),
  
  DATABASE_URL: z
    .string()
    .min(1, 'DATABASE_URL est requis')
    .default('memory:test.sqlite'),
  
  NEXTAUTH_SECRET: z
    .string()
    .min(1, 'NEXTAUTH_SECRET est requis')
    .default('temporary-secret-for-development-only'),
  
  NEXTAUTH_URL: z
    .string()
    .url('NEXTAUTH_URL doit être une URL valide')
    .default(() => {
      const port = process.env.PORT;
      return port ? `http://localhost:${port}` : 'http://localhost:4647';
    }),
  
  // Variables optionnelles (SHOPIFY_ADMIN_TOKEN maintenant requis pour Customer Accounts)
  SHOPIFY_ADMIN_TOKEN: z.string().min(1, 'SHOPIFY_ADMIN_TOKEN est requis pour Shopify Customer Accounts'),
  SHOPIFY_WEBHOOK_SECRET: z.string().optional(),
  SHOPIFY_REVALIDATION_SECRET: z
    .string()
    .min(1, 'SHOPIFY_REVALIDATION_SECRET doit être une chaîne non vide si configuré')
    .optional(),
  DOMAIN_URL: z.string().url().optional(),
  
  // Variables Customer Account API (requises pour l'authentification frontend)
  SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID: z
    .string()
    .min(1, 'SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID est requis pour Customer Account API')
    .optional(),
  SHOPIFY_CUSTOMER_ACCOUNT_API_VERSION: z
    .string()
    .regex(/^\d{4}-\d{2}$/, 'Format de version API invalide. Format attendu: YYYY-MM')
    .optional(),
  
  // Variables PayPal (optionnelles mais requises si PayPal est utilisé)
  PAYPAL_CLIENT_ID: z
    .string()
    .min(1, 'PAYPAL_CLIENT_ID doit être une chaîne non vide si configuré')
    .refine(
      (val) => !val.includes('your_') && !val.includes('client_id_here'),
      {
        message: 'PAYPAL_CLIENT_ID semble être une valeur placeholder. Vérifiez votre configuration .env',
      }
    )
    .optional(),
  PAYPAL_SECRET: z
    .string()
    .min(1, 'PAYPAL_SECRET doit être une chaîne non vide si configuré')
    .refine(
      (val) => !val.includes('your_') && !val.includes('secret_here'),
      {
        message: 'PAYPAL_SECRET semble être une valeur placeholder. Vérifiez votre configuration .env',
      }
    )
    .optional(),
});

export type EnvironmentConfig = z.infer<typeof envSchema>;

/**
 * Validation des variables d'environnement avec Zod
 */
function validateEnv(): EnvironmentConfig {
  // Vérifier si nous sommes en phase de build Next.js
  // Pendant le build, on peut être plus tolérant si certaines variables manquent
  const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.CI === 'true';

  // Vérifier que process.env est disponible
  if (typeof process === 'undefined' || typeof process.env === 'undefined') {
    throw new Error(
      '❌ process.env n\'est pas disponible. ' +
      'Assurez-vous que ce code s\'exécute dans un environnement Node.js.'
    );
  }

  // Vérifier que le fichier .env.local existe (en développement)
  const envLocalPath = join(process.cwd(), '.env.local');
  const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
  
  if (isDevelopment && !existsSync(envLocalPath)) {
    console.warn(
      '⚠️  Fichier .env.local non trouvé à:', envLocalPath, '\n' +
      '💡 Créez le fichier .env.local avec les variables requises.\n' +
      '📖 Voir CONFIGURATION_ENV.md pour les instructions complètes.'
    );
  }

  try {
    const parsed = envSchema.parse({
      SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN,
      SHOPIFY_STOREFRONT_TOKEN: process.env.SHOPIFY_STOREFRONT_TOKEN,
      SHOPIFY_API_VERSION: process.env.SHOPIFY_API_VERSION,
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL,
      SHOPIFY_ADMIN_TOKEN: process.env.SHOPIFY_ADMIN_TOKEN,
      SHOPIFY_WEBHOOK_SECRET: process.env.SHOPIFY_WEBHOOK_SECRET,
      SHOPIFY_REVALIDATION_SECRET: process.env.SHOPIFY_REVALIDATION_SECRET,
      DOMAIN_URL: process.env.DOMAIN_URL,
      SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID: process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID,
      SHOPIFY_CUSTOMER_ACCOUNT_API_VERSION: process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_VERSION,
      PAYPAL_CLIENT_ID: process.env.PAYPAL_CLIENT_ID,
      PAYPAL_SECRET: process.env.PAYPAL_SECRET,
    });

    return parsed;
  } catch (error) {
    if (isBuildPhase || process.env.NODE_ENV === 'production') {
      const missingVars = error instanceof z.ZodError 
        ? error.errors.map(err => err.path.join('.')).join(', ')
        : 'inconnues';
        
      console.error(`❌ CRITICAL: Variables d'environnement manquantes ou invalides: ${missingVars}`);
      console.warn('⚠️  Utilisation de valeurs de secours pour éviter un crash total.');
      
      // Retourner une version de secours pour éviter que l'import de ENV ne crash tout le serveur
      return {
        SHOPIFY_STORE_DOMAIN: process.env.SHOPIFY_STORE_DOMAIN || 'jolananas.myshopify.com',
        SHOPIFY_STOREFRONT_TOKEN: process.env.SHOPIFY_STOREFRONT_TOKEN || 'fallback-token',
        SHOPIFY_API_VERSION: process.env.SHOPIFY_API_VERSION ,
        NODE_ENV: (process.env.NODE_ENV as any) || 'production',
        DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'fallback-secret',
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
        SHOPIFY_ADMIN_TOKEN: process.env.SHOPIFY_ADMIN_TOKEN || 'fallback-admin-token',
        SHOPIFY_WEBHOOK_SECRET: process.env.SHOPIFY_WEBHOOK_SECRET,
        DOMAIN_URL: process.env.DOMAIN_URL,
      } as EnvironmentConfig;
    }

    if (error instanceof z.ZodError) {
      const errors = error.errors.map((err) => {
        const path = err.path.join('.');
        return `❌ ${path}: ${err.message}`;
      }).join('\n');
      
      const helpMessage = `
🔧 SOLUTION RAPIDE :
1. Vérifiez que le fichier .env.local existe dans app/frontend/
2. Vérifiez que toutes les variables requises sont définies dans .env.local
3. ⚠️  IMPORTANT : Redémarrez le serveur de développement après modification de .env.local
   → Arrêtez le serveur (Ctrl+C) puis relancez : pnpm run dev
4. Les variables d'environnement ne sont pas rechargées à chaud dans Next.js

📖 Pour plus d'aide, consultez : app/frontend/CONFIGURATION_ENV.md
      `.trim();
      
      throw new Error(
        `Erreurs de validation des variables d'environnement:\n${errors}\n\n${helpMessage}`
      );
    }
    throw error;
  }
}

// Configuration validée exportée
export const ENV = validateEnv();

// Log de validation en développement seulement
if (ENV.NODE_ENV === 'development') {
  console.log('✅ Variables d\'environnement validées:', {
    SHOPIFY_STORE_DOMAIN: ENV.SHOPIFY_STORE_DOMAIN,
    SHOPIFY_API_VERSION: ENV.SHOPIFY_API_VERSION,
    NODE_ENV: ENV.NODE_ENV,
    PAYPAL_CONFIGURED: !!(ENV.PAYPAL_CLIENT_ID && ENV.PAYPAL_SECRET),
    CUSTOMER_ACCOUNT_API_CLIENT_ID: ENV.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID ? '✅ Configuré' : '⚠️ Non configuré (fallback Admin API)',
  });
}
