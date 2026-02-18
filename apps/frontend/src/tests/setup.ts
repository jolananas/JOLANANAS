import "@testing-library/jest-dom";

// Configuration des variables d'environnement pour les tests
// Ces valeurs permettent de configurer l'environnement de test sans données mock
process.env.SHOPIFY_STORE_DOMAIN = "test-store.myshopify.com";
process.env.SHOPIFY_STOREFRONT_TOKEN = "test-token-for-testing-only";
process.env.SHOPIFY_API_VERSION = "2026-01";
process.env.NODE_ENV = "test";
