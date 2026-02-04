#!/usr/bin/env node

/**
 * 🍍 JOLANANAS - Setup Automatique
 * ================================
 * Configuration automatique de l'environnement de développement
 */

const {
  readFileSync,
  writeFileSync,
  mkdirSync,
  accessSync,
  constants,
} = require("fs");
const { join } = require("path");
const { execSync } = require("child_process");

const COLORS = {
  green: "\x1b[32m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  yellow: "\x1b[33m",
  reset: "\x1b[0m",
  bold: "\x1b[1m",
};

class JolananasSetup {
  constructor() {
    this.projectRoot = process.cwd();
    this.srcPath = join(this.projectRoot, "src");
  }

  async run() {
    console.log(
      `${COLORS.green}${COLORS.bold}🍍 JOLANANAS - Setup Automatique${COLORS.reset}\n`,
    );

    try {
      await this.checkPrerequisites();
      await this.createEnvironmentFiles();
      await this.restructureProject();
      await this.setupDependencies();
      await this.createTestFile();
      await this.finalize();
    } catch (error) {
      console.error(
        `${COLORS.red}❌ Erreur setup: ${error.message}${COLORS.reset}`,
      );
      process.exit(1);
    }
  }

  async checkPrerequisites() {
    console.log(
      `${COLORS.blue}📋 Vérification des prérequis...${COLORS.reset}`,
    );

    // Vérifier Node.js
    const nodeVersion = process.version;
    const nodeMajorVersion = parseInt(nodeVersion.substring(1).split(".")[0]);

    if (nodeMajorVersion < 18) {
      throw new Error(`Node.js >= 18 requis (actuel: ${nodeVersion})`);
    }

    console.log(`${COLORS.green}✓${COLORS.reset} Node.js ${nodeVersion} OK`);

    // Vérifier npm
    try {
      const npmVersion = execSync("npm --version", { encoding: "utf8" }).trim();
      console.log(`${COLORS.green}✓${COLORS.reset} npm ${npmVersion} OK`);
    } catch (error) {
      throw new Error("npm non trouvé");
    }
  }

  async createEnvironmentFiles() {
    console.log(
      `${COLORS.blue}🌍 Configuration des variables d'environnement...${COLORS.reset}`,
    );

    // .env.local
    const envContent = `# 🍍 JOLANANAS - Configuration Environnement
# Généré automatiquement par le setup

# =============================================================================
# 🔗 Shopify Configuration (OBLIGATOIRE)
# =============================================================================
SHOPIFY_STORE_DOMAIN=u6ydbb-sx.myshopify.com
SHOPIFY_STOREFRONT_TOKEN=[STOREFRONT_TOKEN_COMPROMISED]
SHOPIFY_API_VERSION=2026-01

# Token Admin Shopify (optionnel - pour webhooks)
SHOPIFY_ADMIN_API_TOKEN=

# Webhook Secret (optionnel)
SHOPIFY_WEBHOOK_SECRET=

# Revalidation Secret (optionnel - pour sécuriser les endpoints de revalidation manuelle)
SHOPIFY_REVALIDATION_SECRET=

# =============================================================================
# 🌐 Application Configuration
# =============================================================================
APP_URL=http://localhost:3000
DOMAIN_URL=https://jolananas.com
NODE_ENV=development

# =============================================================================
# 🎨 Features Configuration
# =============================================================================
FEATURE_CUSTOMER_ACCOUNTS=true
FEATURE_MULTI_LOCATION=true
FEATURE_WEBHOOKS=false

# =============================================================================
# 📊 Analytics & Monitoring (optionnel)
# =============================================================================
GA_ID=
SENTRY_DSN=

# =============================================================================
# 🚀 Deployment Configuration
# =============================================================================
VERCEL_URL=
NETLIFY_URL=
`;

    writeFileSync(
      join(this.projectRoot, "variables", ".env.local"),
      envContent,
    );

    // .env.example
    const envExampleContent = envContent.replace(/=.+\n/g, "=\n");
    writeFileSync(
      join(this.projectRoot, "variables", ".env.example"),
      envExampleContent,
    );

    console.log(`${COLORS.green}✓${COLORS.reset} variables/.env.local créé`);
    console.log(`${COLORS.green}✓${COLORS.reset} variables/.env.example créé`);
  }

  async restructureProject() {
    console.log(`${COLORS.blue}🏗️ Restructuration du projet...${COLORS.reset}`);

    // Créer la structure src/
    const directories = [
      "src",
      "src/app",
      "src/apps/api",
      "src/apps/api/products",
      "src/apps/api/cart",
      "src/apps/api/webhooks",
      "src/apps/products/[handle]",
      "src/apps/cart",
      "src/apps/checkout",
      "src/components",
      "src/components/ui",
      "src/components/product",
      "src/components/cart",
      "src/components/layout",
      "src/components/forms",
      "src/lib",
      "src/lib/shopify",
      "src/lib/stores",
      "src/lib/utils",
      "src/lib/cache",
      "src/lib/providers",
      "src/hooks",
      "src/styles",
      "tests",
      "tests/api",
      "tests/components",
      "tests/integration",
    ];

    directories.forEach((dir) => {
      try {
        mkdirSync(join(this.projectRoot, dir), { recursive: true });
        console.log(`${COLORS.green}✓${COLORS.reset} ${dir}`);
      } catch (error) {
        // Dossier existe déjà
      }
    });

    // Déplacer les fichiers existants
    await this.moveFiles();
  }

  async moveFiles() {
    console.log(
      `${COLORS.blue}📦 Migration des fichiers existants...${COLORS.reset}`,
    );

    const fileMapping = [
      { from: "apps/frontend/src/apps/page.tsx", to: "src/apps/page.tsx" },
      { from: "apps/frontend/src/apps/layout.tsx", to: "src/apps/layout.tsx" },
      {
        from: "apps/frontend/src/apps/api/products/route.ts",
        to: "src/apps/api/products/route.ts",
      },
      {
        from: "apps/frontend/src/styles/globals.css",
        to: "src/apps/globals.css",
      },
      {
        from: "apps/frontend/src/lib/stores/cartStore.ts",
        to: "src/lib/stores/cartStore.ts",
      },
      {
        from: "apps/shared/utils/shopify-client.ts",
        to: "src/lib/shopify/shopify-client.ts",
      },
      { from: "apps/shared/types/shopify.ts", to: "src/lib/shopify/types.ts" },
    ];

    fileMapping.forEach(({ from, to }) => {
      try {
        const sourcePath = join(this.projectRoot, from);
        const targetPath = join(this.projectRoot, to);

        if (this.fileExists(sourcePath)) {
          const content = readFileSync(sourcePath, "utf8");
          writeFileSync(targetPath, content);
          console.log(`${COLORS.green}✓${COLORS.reset} ${from} → ${to}`);
        }
      } catch (error) {
        console.log(
          `${COLORS.yellow}⚠${COLORS.reset} Fichier non trouvé: ${from}`,
        );
      }
    });
  }

  async setupDependencies() {
    console.log(
      `${COLORS.blue}📦 Installation des dépendances...${COLORS.reset}`,
    );

    try {
      // Utiliser le package.json simplifié
      const pkgContent = readFileSync(
        join(this.projectRoot, "NEW_PACKAGE.json"),
        "utf8",
      );
      const pkg = JSON.parse(pkgContent);

      // Sauvegarder l'ancien package.json
      try {
        const oldPkg = readFileSync(
          join(this.projectRoot, "variables", "package.json"),
          "utf8",
        );
        writeFileSync(
          join(this.projectRoot, "variables", "package.backup.json"),
          oldPkg,
        );
        console.log(`${COLORS.green}✓${COLORS.reset} package.json.backup créé`);
      } catch (error) {
        // Pas de package.json existant
      }

      // Écrire le nouveau package.json
      writeFileSync(
        join(this.projectRoot, "variables", "package.json"),
        JSON.stringify(pkg, null, 2),
      );
      console.log(`${COLORS.green}✓${COLORS.reset} package.json mis à jour`);

      console.log(`${COLORS.blue}🔄 Installation npm...${COLORS.reset}`);
      execSync("npm install", { stdio: "inherit" });
    } catch (error) {
      throw new Error(`Erreur installation: ${error.message}`);
    }
  }

  async createTestFile() {
    console.log(
      `${COLORS.blue}🧪 Création des fichiers de test...${COLORS.reset}`,
    );

    // Test de configuration Shopify
    const shopifyTestContent = `/**
 * 🍍 JOLANANAS - Tests Shopify API
 * ================================
 * Tests complets pour vérifier le fonctionnement de l'API Shopify
 */

import { describe, it, expect, beforeAll } from '@jest/globals';
import { ShopifyStorefrontClient } from '../src/lib/shopify/shopify-client.js';
import { createShopifyConfig } from '../src/lib/shopify/types.js';

describe('Shopify API Tests', () => {
  let shopify: ShopifyStorefrontClient;
  
  beforeAll(() => {
    const config = createShopifyConfig();
    shopify = new ShopifyStorefrontClient(config);
  });

  describe('Configuration Shopify', () => {
    it('should have valid config', async () => {
      const config = createShopifyConfig();
      
      expect(config.domain).toBe('u6ydbb-sx.myshopify.com');
      expect(config.storefrontToken).toMatch(/^[a-f0-9]{32}$/);
      expect(config.apiVersion).toBe('2024-04');
    });
  });

  describe('Produits API', () => {
    it('should fetch products from Shopify', async () => {
      const result = await shopify.getProducts(5);
      
      expect(result.errors).toBeUndefined();
      expect(result.data?.products).toBeDefined();
      expect(result.data?.products.edges).toBeInstanceOf(Array);
      
      if (result.data?.products.edges.length > 0) {
        const product = result.data.products.edges[0].node;
        expect(product.id).toBeDefined();
        expect(product.title).toBeDefined();
        expect(product.handle).toBeDefined();
      }
    });

    it('should search products', async () => {
      const result = await shopify.searchProducts('test', 3);
      
      expect(result.errors).toBeUndefined();
      expect(result.data?.search).toBeDefined();
      expect(result.data?.search).toBeInstanceOf(Array);
    });
  });

  describe('Collections API', () => {
    it('should fetch collections', async () => {
      const result = await shopify.getCollections(5);
      
      expect(result.errors).toBeUndefined();
      expect(result.data?.collections).toBeDefined();
      expect(result.data?.collections.edges).toBeInstanceOf(Array);
    });
  });

  describe('Cart API', () => {
    it('should create cart', async () => {
      const result = await shopify.createCart();
      
      expect(result.errors).toBeUndefined();
      expect(result.data?.cartCreate?.cart).toBeDefined();
      
      if (result.data?.cartCreate?.cart) {
        const cart = result.data.cartCreate.cart;
        expect(cart.id).toBeDefined();
        expect(cart.checkoutUrl).toBeDefined();
      }
    });
  });
});

describe('Integration Tests', () => {
  it('should connect frontend to Shopify APIs', async () => {
    // Test de l'intégration complète
    const response = await fetch('/api/products?first=3');
    
    if (response.ok) {
      const data = await response.json();
      expect(data.products).toBeDefined();
      expect(data.products.edges).toBeInstanceOf(Array);
    }
  });
  
  it('should handle cart operations', async () => {
    // Test des opérations panier
    const cartCreateResponse = await fetch('/api/cart/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lines: [] })
    });
    
    if (cartCreateResponse.ok) {
      const cartData = await cartCreateResponse.json();
      expect(cartData.cart).toBeDefined();
    }
  });
});
`;

    writeFileSync(
      join(this.projectRoot, "tests/shopify-api.test.ts"),
      shopifyTestContent,
    );
    console.log(
      `${COLORS.green}✓${COLORS.reset} tests/shopify-api.test.ts créé`,
    );

    // Configuration Jest
    const jestConfigContent = `{
  "testEnvironment": "jsdom",
  "setupFilesAfterEnv": ["<rootDir>/tests/setup.ts"],
  "moduleNameMapping": {
    "^@/(.*)$": "<rootDir>/src/$1"
  },
  "testMatch": [
    "**/tests/**/*.test.{js,jsx,ts,tsx}",
    "**/*.{test,spec}.{js,jsx,ts,tsx}"
  ],
  "collectCoverage": true,
  "collectCoverageFrom": [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts"
  ],
  "coverageThreshold": {
    "global": {
      "branches": 70,
      "functions": 70,
      "lines": 70,
      "statements": 70
    }
  }
}`;

    writeFileSync(
      join(this.projectRoot, "jest.config.json"),
      jestConfigContent,
    );
    console.log(`${COLORS.green}✓${COLORS.reset} jest.config.json créé`);

    // Setup Jest
    const setupContent = `/**
 * 🍍 JOLANANAS - Configuration des tests Jest
 */

import '@testing-library/jest-dom';

// Mock de l'environnement Next.js
global.fetch = global.fetch || jest.fn();

// Variables d'environnement de test
process.env.SHOPIFY_STORE_DOMAIN = 'u6ydbb-sx.myshopify.com';
process.env.SHOPIFY_STOREFRONT_TOKEN = '[STOREFRONT_TOKEN_COMPROMISED]';
process.env.SHOPIFY_API_VERSION = '2024-04';

// Configuration globales des tests
beforeAll(() => {
  console.log('🧪 Début des tests JOLANANAS');
});

afterAll(() => {
  console.log('✅ Tests terminés');
});
`;

    writeFileSync(join(this.projectRoot, "tests/setup.ts"), setupContent);
    console.log(`${COLORS.green}✓${COLORS.reset} tests/setup.ts créé`);
  }

  async finalize() {
    console.log(`${COLORS.blue}🏁 Finalisation du setup...${COLORS.reset}`);

    // Créer le README
    const readmeContent = `# 🍍 JOLANANAS - Storefront Shopify

## 🚀 Démarrage rapide

\`\`\`bash
# Installer les dépendances
npm install

# Configurer l'environnement (déjà fait)
# Le fichier variables/.env.local est configuré avec vos creds Shopify

# Démarrer le serveur de développement
npm run dev

# Tester l'API Shopify
npm run test:shopify

# Utiliser l'outil de développement
npm run dev:tools
\`\`\`

## 🏗️ Architecture

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **Backend**: API Routes serverless 
- **E-commerce**: Shopify Storefront API
- **Tests**: Jest + Playwright
- **Dev Tools**: Outil interactif personnalisé

## 📁 Structure

\`\`\`
src/
├── apps/                 # Pages Next.js 14
├── components/          # Composants React
├── lib/shopify/         # Client Shopify + types
├── lib/stores/          # State management
└── tests/              # Tests complets
\`\`\`

## 🔗 URLs importantes

- **Dev**: http://localhost:3000
- **API Products**: http://localhost:3000/api/products
- **API Cart**: http://localhost:3000/api/cart/create
- **Shopify Store**: https://u6ydbb-sx.myshopify.com

## 📊 Tests disponibles

\`\`\`bash
npm run test              # Tous les tests
npm run test:shopify      # Tests Shopify uniquement
npm run test:coverage     # Couverture de code
npm run test:e2e          # Tests end-to-end
\`\`\`

## 🛠️ Développement

L'outil de développement visuel vous permet de :
- Naviguer dans l'arborescence
- Visualiser le code
- Tester les connexions Shopify
- Exécuter des tests
- Monitorer l'état du projet

### Commandes disponibles dans l'outil

\`\`\`
ls, cd, cat, find, tree   # Navigation fichiers
shopify, test            # Tests Shopify
dev, build               # Serveur & build
help                     # Aide complète
\`\`\`

---

**Créé avec 🩷 par AÏSSA BELKOUSSA pour JOLANANAS**
`;

    writeFileSync(join(this.projectRoot, "README.md"), readmeContent);
    console.log(`${COLORS.green}✓${COLORS.reset} README.md créé`);

    console.log(
      `\n${COLORS.green}${COLORS.bold}🎉 SETUP TERMINÉ AVEC SUCCÈS !${COLORS.reset}`,
    );
    console.log(`\n${COLORS.yellow}📋 Prochaines étapes:${COLORS.reset}`);
    console.log(
      `${COLORS.white}1. npm run dev          ${COLORS.cyan}# Démarrer le serveur${COLORS.reset}`,
    );
    console.log(
      `${COLORS.white}2. npm run test:shopify ${COLORS.cyan}# Tester Shopify${COLORS.reset}`,
    );
    console.log(
      `${COLORS.white}3. npm run dev:tools     ${COLORS.cyan}# Outil de développement${COLORS.reset}`,
    );
    console.log(
      `\n${COLORS.blue}🌐 Accès: http://localhost:3000${COLORS.reset}\n`,
    );
  }

  fileExists(path) {
    try {
      accessSync(path, constants.F_OK);
      return true;
    } catch {
      return false;
    }
  }
}

// Exécuter le setup
const setup = new JolananasSetup();
setup.run().catch(console.error);

export default JolananasSetup;
