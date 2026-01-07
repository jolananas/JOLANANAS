/**
 * 🍍 JOLANANAS - Tests avec Authentification
 * ===========================================
 * Tests des endpoints nécessitant une authentification
 * 
 * Usage:
 *   pnpm tsx scripts/test-authenticated-flows.ts --email=test@example.com --password=password123
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Configuration
const BASE_URL = process.env.BASE_URL || process.argv.find(arg => arg.startsWith('--base-url='))?.split('=')[1] || 'https://jolananas.vercel.app';
const TEST_EMAIL = process.argv.find(arg => arg.startsWith('--email='))?.split('=')[1];
const TEST_PASSWORD = process.argv.find(arg => arg.startsWith('--password='))?.split('=')[1];
const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');

// Types
interface TestResult {
  name: string;
  success: boolean;
  duration: number;
  error?: string;
  data?: any;
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

function logTest(name: string, success: boolean, duration: number, error?: string) {
  const icon = success ? '✅' : '❌';
  const color = success ? 'green' : 'red';
  log(`${icon} ${name} (${duration}ms)`, color);
  if (error) {
    log(`   ⚠️  ${error}`, 'yellow');
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

// Test avec authentification via cookies de session
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

// Obtenir une session NextAuth
async function getSession(email: string, password: string): Promise<string | null> {
  try {
    // Étape 1: Obtenir le CSRF token
    const csrfResponse = await fetch(`${BASE_URL}/api/auth/csrf`);
    const csrfData = await csrfResponse.json();
    const csrfToken = csrfData.csrfToken;

    if (!csrfToken) {
      log('❌ Impossible d\'obtenir le CSRF token', 'red');
      return null;
    }

    // Étape 2: Se connecter avec credentials
    const loginResponse = await fetch(`${BASE_URL}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email,
        password,
        csrfToken,
        callbackUrl: `${BASE_URL}/account`,
        json: 'true',
      }),
      redirect: 'manual',
    });

    // Extraire les cookies de session
    const setCookieHeader = loginResponse.headers.get('set-cookie');
    if (setCookieHeader) {
      // Extraire le cookie de session NextAuth
      const sessionMatch = setCookieHeader.match(/next-auth\.session-token=([^;]+)/);
      if (sessionMatch) {
        return `next-auth.session-token=${sessionMatch[1]}`;
      }
    }

    // Alternative: utiliser les cookies de la réponse
    const cookies = loginResponse.headers.get('set-cookie')?.split(',') || [];
    const sessionCookie = cookies.find(c => c.includes('next-auth.session-token'));
    
    return sessionCookie || null;
  } catch (error) {
    log(`❌ Erreur lors de l'authentification: ${error instanceof Error ? error.message : 'Erreur inconnue'}`, 'red');
    return null;
  }
}

// ============================================================================
// TESTS AUTHENTIFIÉS
// ============================================================================

async function testAuthenticatedEndpoints(sessionCookie: string): Promise<TestResult[]> {
  logSection('🔐 ENDPOINTS AUTHENTIFIÉS');

  const tests: TestResult[] = [];

  // Test 1: GET /api/cart (avec session)
  tests.push(await testAuthenticatedEndpoint(
    'GET /api/cart (authentifié)',
    `${BASE_URL}/api/cart`,
    sessionCookie
  ));

  // Test 2: GET /api/user/dashboard
  tests.push(await testAuthenticatedEndpoint(
    'GET /api/user/dashboard',
    `${BASE_URL}/api/user/dashboard`,
    sessionCookie
  ));

  // Test 3: GET /api/user/profile
  tests.push(await testAuthenticatedEndpoint(
    'GET /api/user/profile',
    `${BASE_URL}/api/user/profile`,
    sessionCookie
  ));

  // Test 4: GET /api/user/addresses
  tests.push(await testAuthenticatedEndpoint(
    'GET /api/user/addresses',
    `${BASE_URL}/api/user/addresses`,
    sessionCookie
  ));

  // Test 5: GET /api/user/orders
  tests.push(await testAuthenticatedEndpoint(
    'GET /api/user/orders',
    `${BASE_URL}/api/user/orders`,
    sessionCookie
  ));

  tests.forEach(t => logTest(t.name, t.success, t.duration, t.error));

  return tests;
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  log('\n🍍 JOLANANAS - Tests avec Authentification', 'blue');
  log(`Base URL: ${BASE_URL}`, 'cyan');
  log(`Verbose: ${VERBOSE}`, 'cyan');
  console.log('');

  if (!TEST_EMAIL || !TEST_PASSWORD) {
    log('❌ Email et mot de passe requis', 'red');
    log('Usage: pnpm tsx scripts/test-authenticated-flows.ts --email=test@example.com --password=password123', 'yellow');
    process.exit(1);
  }

  try {
    // Obtenir une session
    log('🔑 Authentification en cours...', 'yellow');
    const sessionCookie = await getSession(TEST_EMAIL, TEST_PASSWORD);

    if (!sessionCookie) {
      log('❌ Impossible d\'obtenir une session. Vérifiez les identifiants.', 'red');
      process.exit(1);
    }

    log('✅ Session obtenue avec succès', 'green');
    console.log('');

    // Exécuter les tests authentifiés
    const tests = await testAuthenticatedEndpoints(sessionCookie);

    // Résumé
    logSection('📊 RÉSUMÉ');

    const passedTests = tests.filter(t => t.success).length;
    const failedTests = tests.length - passedTests;
    const totalDuration = tests.reduce((sum, t) => sum + t.duration, 0);

    log(`Total: ${passedTests}/${tests.length} tests réussis`, passedTests === tests.length ? 'green' : 'yellow');
    log(`Durée totale: ${totalDuration}ms`, 'cyan');
    log(`Temps moyen par test: ${Math.round(totalDuration / tests.length)}ms`, 'cyan');

    if (passedTests === tests.length) {
      log('\n🎉 Tous les tests authentifiés sont passés avec succès !', 'green');
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

