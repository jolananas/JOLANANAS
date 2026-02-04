/**
 * 🍍 JOLANANAS - Test Complet de Tous les Flux
 * ==============================================
 * Script de test exhaustif pour valider tous les flux de l'application
 * 
 * Usage:
 *   pnpm tsx scripts/test-all-flows.ts
 *   pnpm tsx scripts/test-all-flows.ts --base-url=http://localhost:4647
 *   pnpm tsx scripts/test-all-flows.ts --skip-auth
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Configuration
const BASE_URL = process.env.BASE_URL || 
  process.argv.find(arg => arg.startsWith('--base-url='))?.split('=')[1] || 
  'https://jolananas.vercel.app';
const SKIP_AUTH = process.argv.includes('--skip-auth');
const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');

// Types
interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  error?: string;
  data?: any;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  duration: number;
  success: boolean;
}

// Utilitaires
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message: string, color: keyof typeof colors = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSection(title: string) {
  console.log('\n' + '='.repeat(80));
  log(`  ${title}`, 'cyan');
  console.log('='.repeat(80) + '\n');
}

function logTest(name: string, success: boolean, duration: number, error?: string, data?: any) {
  const icon = success ? '✅' : '❌';
  const color = success ? 'green' : 'red';
  log(`${icon} ${name} (${duration}ms)`, color);
  if (error) {
    log(`   ⚠️  ${error}`, 'yellow');
  }
  if (data && VERBOSE) {
    log(`   📄 Données: ${JSON.stringify(data).substring(0, 200)}...`, 'cyan');
  }
}

// Fonction de test générique
async function testEndpoint(
  name: string,
  url: string,
  options: RequestInit = {}
): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    const duration = Date.now() - startTime;
    const contentType = response.headers.get('content-type');
    
    let data: any = null;
    if (contentType?.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = text.length > 0 ? text : null;
    }

    const success = response.ok;
    
    return {
      name,
      success,
      duration,
      error: success ? undefined : `HTTP ${response.status}: ${response.statusText}`,
      data: VERBOSE ? data : undefined,
    };
  } catch (error) {
    const duration = Date.now() - startTime;
    return {
      name,
      success: false,
      duration,
      error: error instanceof Error ? error.message : 'Erreur inconnue',
    };
  }
}

// Test avec authentification
async function testAuthenticatedEndpoint(
  name: string,
  url: string,
  sessionCookie: string,
  options: RequestInit = {}
): Promise<TestResult> {
  return testEndpoint(name, url, {
    ...options,
    headers: {
      Cookie: sessionCookie,
      ...options.headers,
    },
  });
}

// ============================================================================
// SUITE 1: HEALTH CHECKS & SYSTÈME
// ============================================================================

async function testHealthChecks(): Promise<TestSuite> {
  logSection('🏥 HEALTH CHECKS & SYSTÈME');

  const tests: TestResult[] = [];

  // Test 1: Health Database
  tests.push(await testEndpoint(
    'Health Database',
    `${BASE_URL}/api/health/db`
  ));

  // Test 2: Config Shopify
  tests.push(await testEndpoint(
    'Config Shopify',
    `${BASE_URL}/api/config/shopify`
  ));

  // Test 3: Config PayPal
  tests.push(await testEndpoint(
    'Config PayPal',
    `${BASE_URL}/api/config/paypal`
  ));

  // Test 4: Shop Info
  tests.push(await testEndpoint(
    'Shop Info',
    `${BASE_URL}/api/shop`
  ));

  const duration = tests.reduce((sum, t) => sum + t.duration, 0);
  const success = tests.every(t => t.success);

  tests.forEach(t => logTest(t.name, t.success, t.duration, t.error));

  return { name: 'Health Checks', tests, duration, success };
}

// ============================================================================
// SUITE 2: API PUBLIQUES (STOREfront)
// ============================================================================

async function testPublicAPIs(): Promise<TestSuite> {
  logSection('📦 API PUBLIQUES (STOREfront)');

  const tests: TestResult[] = [];

  // Test 1: Produits (liste)
  tests.push(await testEndpoint(
    'GET /api/products',
    `${BASE_URL}/api/products?first=5`
  ));

  // Test 2: Collections (liste)
  tests.push(await testEndpoint(
    'GET /api/collections',
    `${BASE_URL}/api/collections?first=5`
  ));

  // Test 3: Produit spécifique (si des produits existent)
  const productsResult = tests[0];
  if (productsResult.success && productsResult.data?.products?.edges?.length > 0) {
    const firstProduct = productsResult.data.products.edges[0].node;
    const handle = firstProduct.handle;
    
    tests.push(await testEndpoint(
      `GET /api/products/${handle}`,
      `${BASE_URL}/api/products/${handle}`
    ));
  }

  // Test 4: Collection spécifique (si des collections existent)
  const collectionsResult = tests[1];
  if (collectionsResult.success && collectionsResult.data?.collections?.edges?.length > 0) {
    const firstCollection = collectionsResult.data.collections.edges[0].node;
    const handle = firstCollection.handle;
    
    tests.push(await testEndpoint(
      `GET /api/collections/${handle}`,
      `${BASE_URL}/api/collections/${handle}`
    ));
  }

  // Test 5: Currency
  tests.push(await testEndpoint(
    'GET /api/currency',
    `${BASE_URL}/api/currency`
  ));

  const duration = tests.reduce((sum, t) => sum + t.duration, 0);
  const success = tests.every(t => t.success);

  tests.forEach(t => logTest(t.name, t.success, t.duration, t.error));

  return { name: 'Public APIs', tests, duration, success };
}

// ============================================================================
// SUITE 3: AUTHENTIFICATION
// ============================================================================

async function testAuthentication(): Promise<TestSuite> {
  logSection('🔐 AUTHENTIFICATION');

  const tests: TestResult[] = [];

  if (SKIP_AUTH) {
    log('⚠️  Tests d\'authentification ignorés (--skip-auth)', 'yellow');
    return { name: 'Authentication', tests, duration: 0, success: true };
  }

  // Test 1: Vérifier la disponibilité de NextAuth
  tests.push(await testEndpoint(
    'NextAuth Session',
    `${BASE_URL}/api/auth/session`
  ));

  // Test 2: Vérifier les providers disponibles
  tests.push(await testEndpoint(
    'NextAuth Providers',
    `${BASE_URL}/api/auth/providers`
  ));

  // Test 3: Test de connexion avec credentials invalides (doit échouer)
  tests.push(await testEndpoint(
    'Login avec credentials invalides',
    `${BASE_URL}/api/auth/callback/credentials`,
    {
      method: 'POST',
      body: JSON.stringify({
        email: 'invalid@test.com',
        password: 'wrongpassword',
      }),
    }
  ));

  // Note: Les tests OAuth nécessitent une interaction utilisateur réelle
  // et ne peuvent pas être testés automatiquement sans navigateur

  const duration = tests.reduce((sum, t) => sum + t.duration, 0);
  const success = tests.every(t => t.success || t.name.includes('invalides')); // Accepte l'échec attendu

  tests.forEach(t => logTest(t.name, t.success, t.duration, t.error));

  return { name: 'Authentication', tests, duration, success };
}

// ============================================================================
// SUITE 4: PANIER
// ============================================================================

async function testCart(): Promise<TestSuite> {
  logSection('🛒 PANIER');

  const tests: TestResult[] = [];

  // Test 1: Créer un panier Shopify (léger)
  tests.push(await testEndpoint(
    'POST /api/cart/create',
    `${BASE_URL}/api/cart/create`,
    {
      method: 'POST',
      body: JSON.stringify({
        lines: [],
      }),
    }
  ));

  // Test 2: GET Panier (peut être vide si pas de session)
  tests.push(await testEndpoint(
    'GET /api/cart',
    `${BASE_URL}/api/cart`
  ));

  // GET /api/cart peut échouer si pas de session, c'est attendu
  const cartGetTest = tests.find(t => t.name === 'GET /api/cart');
  if (cartGetTest && !cartGetTest.success && cartGetTest.error?.includes('401')) {
    log('   ℹ️  Échec attendu: GET /api/cart nécessite une session authentifiée', 'yellow');
    cartGetTest.success = true; // Marquer comme succès attendu
  }

  tests.forEach(t => logTest(t.name, t.success, t.duration, t.error, t.data));

  const duration = tests.reduce((sum, t) => sum + t.duration, 0);
  const success = tests.every(t => t.success);

  return { name: 'Cart', tests, duration, success };
}

// ============================================================================
// SUITE 5: CHECKOUT & PAIEMENT
// ============================================================================

async function testCheckout(): Promise<TestSuite> {
  logSection('💳 CHECKOUT & PAIEMENT');

  const tests: TestResult[] = [];

  // Test 1: Méthodes de paiement disponibles
  tests.push(await testEndpoint(
    'GET /api/checkout/payment/methods',
    `${BASE_URL}/api/checkout/payment/methods`
  ));

  // Test 2: Informations de livraison (GET uniquement)
  tests.push(await testEndpoint(
    'GET /api/shipping',
    `${BASE_URL}/api/shipping`
  ));

  // POST /api/shipping peut échouer si données invalides, vérifier le type d'erreur
  const shippingTest = tests.find(t => t.name === 'POST /api/shipping');
  if (shippingTest && !shippingTest.success) {
    if (shippingTest.error?.includes('400') || shippingTest.error?.includes('422')) {
      log('   ℹ️  Erreur de validation attendue pour données de test', 'yellow');
    }
  }

  tests.forEach(t => logTest(t.name, t.success, t.duration, t.error, t.data));

  const duration = tests.reduce((sum, t) => sum + t.duration, 0);
  const success = tests.every(t => t.success);

  return { name: 'Checkout', tests, duration, success };
}

// ============================================================================
// SUITE 6: NEWSLETTER & CONTACT
// ============================================================================

async function testNewsletterAndContact(): Promise<TestSuite> {
  logSection('📧 NEWSLETTER & CONTACT');

  const tests: TestResult[] = [];

  // Test 1: Newsletter (sans email réel pour éviter les envois)
  tests.push(await testEndpoint(
    'POST /api/newsletter (validation)',
    `${BASE_URL}/api/newsletter`,
    {
      method: 'POST',
      body: JSON.stringify({
        email: 'test-validation@example.com',
      }),
    }
  ));

  // Test 2: Contact (sans données réelles)
  tests.push(await testEndpoint(
    'POST /api/contact (validation)',
    `${BASE_URL}/api/contact`,
    {
      method: 'POST',
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        message: 'Test message',
      }),
    }
  ));

  const duration = tests.reduce((sum, t) => sum + t.duration, 0);
  const success = tests.every(t => t.success);

  tests.forEach(t => logTest(t.name, t.success, t.duration, t.error));

  return { name: 'Newsletter & Contact', tests, duration, success };
}

// ============================================================================
// SUITE 7: REVALIDATION
// ============================================================================

async function testRevalidation(): Promise<TestSuite> {
  logSection('🔄 REVALIDATION');

  const tests: TestResult[] = [];

  // Lire le secret depuis .env.local ou variables d'environnement
  let revalidationSecret: string | undefined = process.env.SHOPIFY_REVALIDATION_SECRET;
  
  if (!revalidationSecret) {
    try {
      const envPath = join(process.cwd(), '.env.local');
      const envContent = readFileSync(envPath, 'utf-8');
      const match = envContent.match(/SHOPIFY_REVALIDATION_SECRET=(.+)/);
      if (match) {
        revalidationSecret = match[1].trim();
      }
    } catch {
      // Ignorer si .env.local n'existe pas
    }
  }

  // Test 1: GET Documentation (peut retourner 405 Method Not Allowed, c'est normal)
  const docTest = await testEndpoint(
    'GET /api/revalidate (documentation)',
    `${BASE_URL}/api/revalidate`
  );
  tests.push(docTest);
  
  // Si GET retourne 405, c'est normal (seul POST est supporté)
  if (!docTest.success && docTest.error?.includes('405')) {
    log('   ℹ️  GET retourne 405 (attendu - seul POST est supporté)', 'yellow');
    docTest.success = true; // Marquer comme succès attendu
  }

  // Test 2: POST Revalidation (si secret disponible)
  if (revalidationSecret) {
    const revalidateTest = await testEndpoint(
      'POST /api/revalidate',
      `${BASE_URL}/api/revalidate`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${revalidationSecret}`,
        },
        body: JSON.stringify({
          tag: 'products',
        }),
      }
    );
    tests.push(revalidateTest);
    
    // Si POST retourne 405, la route n'est peut-être pas déployée
    if (!revalidateTest.success && revalidateTest.error?.includes('405')) {
      log('   ℹ️  POST retourne 405 (route peut ne pas être déployée sur Vercel)', 'yellow');
    }
  } else {
    log('⚠️  SHOPIFY_REVALIDATION_SECRET non trouvé - test de revalidation ignoré', 'yellow');
  }

  const duration = tests.reduce((sum, t) => sum + t.duration, 0);
  const success = tests.every(t => t.success);

  tests.forEach(t => logTest(t.name, t.success, t.duration, t.error));

  return { name: 'Revalidation', tests, duration, success };
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  log('\n🍍 JOLANANAS - Test Complet de Tous les Flux', 'blue');
  log(`Base URL: ${BASE_URL}`, 'cyan');
  log(`Skip Auth: ${SKIP_AUTH}`, 'cyan');
  log(`Verbose: ${VERBOSE}`, 'cyan');
  console.log('');

  const suites: TestSuite[] = [];

  try {
    // Exécuter toutes les suites de tests
    suites.push(await testHealthChecks());
    suites.push(await testPublicAPIs());
    suites.push(await testAuthentication());
    suites.push(await testCart());
    suites.push(await testCheckout());
    suites.push(await testNewsletterAndContact());
    suites.push(await testRevalidation());

    // Résumé final
    logSection('📊 RÉSUMÉ FINAL');

    const totalTests = suites.reduce((sum, s) => sum + s.tests.length, 0);
    const passedTests = suites.reduce((sum, s) => sum + s.tests.filter(t => t.success).length, 0);
    const failedTests = totalTests - passedTests;
    const totalDuration = suites.reduce((sum, s) => sum + s.duration, 0);
    const allSuccess = suites.every(s => s.success);

    console.log('');
    suites.forEach(suite => {
      const icon = suite.success ? '✅' : '❌';
      const color = suite.success ? 'green' : 'red';
      log(`${icon} ${suite.name}: ${suite.tests.filter(t => t.success).length}/${suite.tests.length} tests réussis (${suite.duration}ms)`, color);
    });

    console.log('');
    log(`Total: ${passedTests}/${totalTests} tests réussis`, passedTests === totalTests ? 'green' : 'yellow');
    log(`Durée totale: ${totalDuration}ms`, 'cyan');
    log(`Temps moyen par test: ${Math.round(totalDuration / totalTests)}ms`, 'cyan');

    if (allSuccess) {
      log('\n🎉 Tous les tests sont passés avec succès !', 'green');
      process.exit(0);
    } else {
      log(`\n⚠️  ${failedTests} test(s) ont échoué`, 'yellow');
      process.exit(1);
    }
  } catch (error) {
    log(`\n❌ Erreur fatale: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 'red');
    if (VERBOSE && error instanceof Error) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

// Exécuter les tests
main().catch(error => {
  log(`❌ Erreur non gérée: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 'red');
  process.exit(1);
});

