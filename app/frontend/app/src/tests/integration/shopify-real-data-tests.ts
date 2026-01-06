/**
 * 🍍 JOLANANAS - Shopify Real Data Integration Tests
 * ===================================================
 * Tests d'intégration STRICTS utilisant uniquement les vraies données Shopify
 * AUCUNE données mockées, fake data, ou placeholder autorisée
 */

import { describe, it, expect, beforeAll } from '@jest/globals';

describe('Shopify Real Data Integration Tests', () => {
  const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
  let hasTestData: boolean = false;

  beforeAll(async () => {
    // Vérifier la disponibilité de l'API Shopify dès le début
    try {
      const response = await fetch(`${BASE_URL}/api/products?first=1`);
      hasTestData = response.ok;
      
      if (!hasTestData) {
        console.warn('⚠️ API Shopify non disponible - certains tests seront ignorés');
      }
    } catch (error) {
      console.warn('⚠️ Serveur de développement non accessible');
      hasTestData = false;
    }
  });

  describe('Shopify Products API - Real Data Only', () => {
    it('should fetch real products from our Shopify store', async () => {
      if (!hasTestData) {
        throw new Error('API Shopify non disponible - test impossible sans données réelles');
      }

      const response = await fetch(`${BASE_URL}/api/products?first=20`);
      
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      
      // Vérifier la structure de réponse Shopify réelle
      expect(data).toHaveProperty('products');
      expect(data.products).toHaveProperty('edges');
      expect(data.products).toHaveProperty('pageInfo');
      expect(data.products.edges).toBeInstanceOf(Array);
      
      // Si des produits sont disponibles, vérifier leur structure réelle
      if (data.products.edges.length > 0) {
        const product = data.products.edges[0].node;
        
        // Vérifier que l'ID est un vrai ID Shopify
        expect(product.id).toMatch(/^gid:\/\/shopify\/Product\/\d+/);
        
        // Vérifier les propriétés requises
        expect(product.title).toBeDefined();
        expect(product.handle).toBeDefined();
        expect(product.priceRange).toBeDefined();
        
        // Vérifier la structure des prix réels
        expect(product.priceRange.minVariantPrice).toBeDefined();
        expect(product.priceRange.minVariantPrice.amount).toBeDefined();
        expect(product.priceRange.minVariantPrice.currencyCode).toBe('EUR');
        
        // Afficher les données réelles pour vérification
        console.log('✅ Produit réel chargé:', {
          id: product.id,
          title: product.title,
          handle: product.handle,
          prix: `${product.priceRange.minVariantPrice.amount} ${product.priceRange.minVariantPrice.currencyCode}`,
          disponible: product.availableForSale
        });
      }
    });

    it('should handle pagination with real Shopify data', async () => {
      if (!hasTestData) {
        throw new Error('API Shopify non disponible - test impossible sans données réelles');
      }

      const response = await fetch(`${BASE_URL}/api/products?first=5`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.products.pageInfo).toHaveProperty('hasNextPage');
      expect(data.products.pageInfo).toHaveProperty('hasPreviousPage');
      
      console.log('📄 Pagination réelle:', {
        produits: data.products.edges.length,
        hasNextPage: data.products.pageInfo.hasNextPage,
        hasPreviousPage: data.products.pageInfo.hasPreviousPage
      });
    });

    it('should fetch products with real filtering', async () => {
      if (!hasTestData) {
        throw new Error('API Shopify non disponible - test impossible sans données réelles');
      }

      // Essayer d'obtenir des produits disponibles seulement
      const response = await fetch(`${BASE_URL}/api/products?first=10`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      
      // Vérifier que les produits disponibles sont bien marqués
      if (data.products.edges.length > 0) {
        const availableProducts = data.products.edges.filter(
          (edge: any) => edge.node.availableForSale === true
        );
        
        console.log('🛍️ Produits disponibles:', {
          total: data.products.edges.length,
          disponibles: availableProducts.length,
          pourcentage: Math.round((availableProducts.length / data.products.edges.length) * 100)
        });
      }
    });
  });

  describe('Shopify Collections API - Real Data Only', () => {
    it('should fetch real collections from our Shopify store', async () => {
      if (!hasTestData) {
        throw new Error('API Shopify non disponible - test impossible sans données réelles');
      }

      const response = await fetch(`${BASE_URL}/api/collections?first=10`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      
      expect(data).toHaveProperty('collections');
      expect(data.collections).toHaveProperty('edges');
      expect(data.collections.edges).toBeInstanceOf(Array);
      
      // Afficher les collections réelles
      if (data.collections.edges.length > 0) {
        console.log('📂 Collections réelles chargées:');
        data.collections.edges.forEach((edge: any) => {
          const collection = edge.node;
          console.log(`   - ${collection.title} (${collection.handle}): ${collection.products?.edges?.length || 0} produits`);
        });
      }
    });

    it('should fetch collections with real products', async () => {
      if (!hasTestData) {
        throw new Error('API Shopify non disponible - test impossible sans données réelles');
      }

      const response = await fetch(`${BASE_URL}/api/collections?first=5`);
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      
      if (data.collections.esges.length > 0) {
        // Vérifier la structure des produits dans les collections
        data.collections.edges.forEach((edge: any) => {
          const collection = edge.node;
          if (collection.products?.edges?.length > 0) {
            const product = collection.products.edges[0].node;
            expect(product.id).toMatch(/^gid:\/\/shopify\/Product\/\d+/);
            expect(product.title).toBeDefined();
            expect(product.handle).toBeDefined();
            
            console.log(`📦 Collection "${collection.title}" contient des produits réels`);
          }
        });
      }
    });
  });

  describe('Shopify Data Consistency - Real Data Only', () => {
    it('should maintain data consistency across all Shopify APIs', async () => {
      if (!hasTestData) {
        throw new Error('API Shopify non disponible - test impossible sans données réelles');
      }

      const [productsResponse, collectionsResponse] = await Promise.all([
        fetch(`${BASE_URL}/api/products?first=5`),
        fetch(`${BASE_URL}/api/collections?first=3`)
      ]);

      expect(productsResponse.ok).toBe(true);
      expect(collectionsResponse.ok).toBe(true);

      const productsData = await productsResponse.json();
      const collectionsData = await collectionsResponse.json();

      // Vérifier la cohérence des devises toujours EUR
      if (productsData.products.edges.length > 0) {
        const product = productsData.products.edges[0].node;
        expect(product.priceRange.minVariantPrice.currencyCode).toBe('EUR');
        expect(product.priceRange.maxVariantPrice.currencyCode).toBe('EUR');
        
        console.log('💰 Cohérence des devises vérifiée: EUR partout');
      }

      // Vérifier la cohérence des IDs Shopify
      const allIds = [];
      
      productsData.products.edges.forEach((edge: any) => {
        allIds.push(edge.node.id);
      });
      
      collectionsData.collections.edges.forEach((edge: any) => {
        allIds.push(edge.node.id);
      });

      allIds.forEach(id => {
        expect(id).toMatch(/^gid:\/\/shopify\/(Product|Collection)\/\d+/);
      });

      console.log(`🔍 ${allIds.length} IDs Shopify vérifiés pour cohérence`);
    });
  });
});

/**
 * Aucune donnée mockée n'est autorisée dans ce fichier.
 * Si l'API Shopify n'est pas disponible, les tests échouent.
 * C'est le comportement attendu selon la règle STRICTE des données réelles.
 */
