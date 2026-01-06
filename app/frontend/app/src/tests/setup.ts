/**
 * 🍍 JOLANANAS - Jest Setup
 * =====================================
 * Configuration Jest simplifiée pour les tests
 * 
 * Note: Les variables d'environnement ci-dessous sont des valeurs de test
 * pour configurer l'environnement de test. Elles ne sont PAS des données mock.
 * Les tests utilisent les vraies APIs Shopify quand disponibles.
 */

import '@testing-library/jest-dom'

// Configuration des variables d'environnement pour les tests
// Ces valeurs permettent de configurer l'environnement de test sans données mock
process.env.SHOPIFY_STORE_DOMAIN = 'test-store.myshopify.com'
process.env.SHOPIFY_STOREFRONT_TOKEN = 'test-token-for-testing-only'
process.env.SHOPIFY_API_VERSION = '2025-10'
process.env.NODE_ENV = 'test'