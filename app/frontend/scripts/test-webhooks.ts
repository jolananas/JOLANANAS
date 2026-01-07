#!/usr/bin/env tsx
/**
 * 🍍 JOLANANAS - Script de Test des Webhooks ISR
 * ==============================================
 * Teste la route /api/webhooks/revalidate avec différents topics
 */

import crypto from 'crypto';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from 'dotenv';

// Charger les variables d'environnement
const envPath = join(process.cwd(), 'variables', '.env.local');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  const envVars = envContent.split('\n').reduce((acc, line) => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      acc[key.trim()] = valueParts.join('=').trim();
    }
    return acc;
  }, {} as Record<string, string>);
  
  // Charger dans process.env
  Object.entries(envVars).forEach(([key, value]) => {
    if (!process.env[key]) {
      process.env[key] = value;
    }
  });
} catch (error) {
  console.warn('⚠️ Fichier .env.local non trouvé, utilisation des variables système');
}

// Configuration
const WEBHOOK_SECRET = process.env.SHOPIFY_WEBHOOK_SECRET;
const BASE_URL = process.env.TEST_WEBHOOK_URL || 'http://localhost:3000';
const WEBHOOK_ENDPOINT = `${BASE_URL}/api/webhooks/revalidate`;

// Topics à tester
const TOPICS_TO_TEST = [
  'products/create',
  'products/update',
  'products/delete',
  'collections/create',
  'collections/update',
  'collections/delete',
];

/**
 * Génère une signature HMAC pour un payload
 */
function generateHMAC(payload: string, secret: string): string {
  return crypto
    .createHmac('sha256', secret)
    .update(payload, 'utf8')
    .digest('base64');
}

/**
 * Crée un payload de test pour un topic donné
 */
function createTestPayload(topic: string): any {
  const basePayload = {
    id: Math.floor(Math.random() * 1000000),
    admin_graphql_api_id: `gid://shopify/${topic.split('/')[0]}/${Math.floor(Math.random() * 1000000)}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  switch (topic) {
    case 'products/create':
    case 'products/update':
    case 'products/delete':
      return {
        ...basePayload,
        title: 'Produit Test',
        handle: 'produit-test',
        status: 'active',
      };
    case 'collections/create':
    case 'collections/update':
    case 'collections/delete':
      return {
        ...basePayload,
        title: 'Collection Test',
        handle: 'collection-test',
      };
    default:
      return basePayload;
  }
}

/**
 * Teste un webhook pour un topic donné
 */
async function testWebhook(topic: string): Promise<{ success: boolean; message: string }> {
  try {
    if (!WEBHOOK_SECRET) {
      return {
        success: false,
        message: '❌ SHOPIFY_WEBHOOK_SECRET non configuré',
      };
    }

    const payload = createTestPayload(topic);
    const payloadString = JSON.stringify(payload);
    const signature = generateHMAC(payloadString, WEBHOOK_SECRET);

    console.log(`\n🧪 Test du webhook: ${topic}`);
    console.log(`   URL: ${WEBHOOK_ENDPOINT}`);
    console.log(`   Payload: ${JSON.stringify(payload, null, 2).substring(0, 100)}...`);

    const response = await fetch(WEBHOOK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Hmac-Sha256': signature,
        'X-Shopify-Topic': topic,
        'X-Shopify-Shop-Domain': process.env.SHOPIFY_STORE_DOMAIN || 'test.myshopify.com',
      },
      body: payloadString,
    });

    const responseData = await response.json();

    if (response.ok) {
      return {
        success: true,
        message: `✅ Succès: ${JSON.stringify(responseData)}`,
      };
    } else {
      return {
        success: false,
        message: `❌ Erreur ${response.status}: ${JSON.stringify(responseData)}`,
      };
    }
  } catch (error) {
    return {
      success: false,
      message: `❌ Exception: ${error instanceof Error ? error.message : String(error)}`,
    };
  }
}

/**
 * Fonction principale
 */
async function main() {
  console.log('🍍 JOLANANAS - Test des Webhooks ISR\n');
  console.log('=' .repeat(60));
  console.log(`📍 Endpoint: ${WEBHOOK_ENDPOINT}`);
  console.log(`🔐 Secret: ${WEBHOOK_SECRET ? '✅ Configuré' : '❌ Manquant'}`);
  console.log('=' .repeat(60));

  if (!WEBHOOK_SECRET) {
    console.error('\n❌ ERREUR: SHOPIFY_WEBHOOK_SECRET n\'est pas configuré');
    console.error('   Ajoutez-le dans variables/.env.local ou dans les variables d\'environnement');
    process.exit(1);
  }

  // Vérifier que le serveur est accessible
  try {
    const healthCheck = await fetch(BASE_URL);
    if (!healthCheck.ok && healthCheck.status !== 404) {
      console.warn(`⚠️  Le serveur à ${BASE_URL} ne semble pas accessible`);
      console.warn('   Assurez-vous que le serveur de développement est démarré (npm run dev)');
    }
  } catch (error) {
    console.warn(`⚠️  Impossible de se connecter à ${BASE_URL}`);
    console.warn('   Le serveur de développement est-il démarré ? (npm run dev)');
  }

  // Tester tous les topics
  const results: Array<{ topic: string; success: boolean; message: string }> = [];

  for (const topic of TOPICS_TO_TEST) {
    const result = await testWebhook(topic);
    results.push({ topic, ...result });
    console.log(result.message);
    
    // Attendre un peu entre les tests
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  // Résumé
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ DES TESTS');
  console.log('='.repeat(60));

  const successCount = results.filter(r => r.success).length;
  const failCount = results.filter(r => !r.success).length;

  results.forEach(result => {
    const icon = result.success ? '✅' : '❌';
    console.log(`${icon} ${result.topic}: ${result.success ? 'SUCCÈS' : 'ÉCHEC'}`);
  });

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Succès: ${successCount}/${results.length}`);
  console.log(`❌ Échecs: ${failCount}/${results.length}`);
  console.log('='.repeat(60));

  if (failCount > 0) {
    console.log('\n💡 Conseils de dépannage:');
    console.log('   1. Vérifiez que SHOPIFY_WEBHOOK_SECRET est correct');
    console.log('   2. Vérifiez que le serveur est démarré (npm run dev)');
    console.log('   3. Vérifiez les logs du serveur pour plus de détails');
    console.log('   4. Pour tester en production, utilisez:');
    console.log(`      TEST_WEBHOOK_URL=https://jolananas.vercel.app npm run test:webhooks`);
    process.exit(1);
  } else {
    console.log('\n🎉 Tous les tests sont passés avec succès !');
    process.exit(0);
  }
}

// Exécuter le script
main().catch(error => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});

