import { GraphQLClient } from 'graphql-request';
import { ENV } from './env';
import { normalizeHeaderValue } from './utils/formatters';

// Configuration Storefront API (publique)
const STOREFRONT_CONFIG = {
  domain: ENV.SHOPIFY_STORE_DOMAIN,
  storefrontToken: ENV.SHOPIFY_STOREFRONT_TOKEN || process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
  apiVersion: ENV.SHOPIFY_API_VERSION,
};

export interface StorefrontConfig {
  domain: string;
  storefrontToken: string;
  apiVersion: string;
}

export interface StorefrontResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export interface CartLineInput {
  merchandiseId: string;
  quantity: number;
}

export class ShopifyStorefrontClient {
  private endpoint: string;
  private config: StorefrontConfig;
  private client: GraphQLClient;

  constructor(config: StorefrontConfig = STOREFRONT_CONFIG) {
    this.config = config;
    this.endpoint = `https://${this.config.domain}/api/${this.config.apiVersion}/graphql.json`;

    // Créer le client GraphQL avec headers correctement encodés
    // CRITIQUE : Normaliser le token pour éviter l'erreur ByteString dans les headers HTTP
    // Les headers HTTP ne peuvent contenir que des caractères ASCII (0-255)
    const normalizedToken = normalizeHeaderValue(String(this.config.storefrontToken));
    
    this.client = new GraphQLClient(this.endpoint, {
      headers: {
        'X-Shopify-Storefront-Access-Token': normalizedToken,
        'Content-Type': 'application/json',
      },
    });

    console.log('✅ Shopify Storefront Client initialisé:', this.config.domain);
  }

  /**
   * Effectue une requête GraphQL avec encodage UTF-8 correct
   * Utilise graphql-request (open source) pour une meilleure gestion des erreurs
   */
  async request<T>(query: string, variables: Record<string, any> = {}): Promise<StorefrontResponse<T>> {
    try {
      // S'assurer que les variables sont sérialisables en JSON (UTF-8 natif)
      const sanitizedVariables = JSON.parse(JSON.stringify(variables));
      
      // Utiliser graphql-request avec gestion d'erreurs
      const data = await this.client.request<T>(query, sanitizedVariables);
      
      return { data };
      
    } catch (error: any) {
      console.error('❌ Erreur Shopify Storefront:', error);
      
      // Gérer les erreurs GraphQL de graphql-request
      if (error.response) {
        const response = error.response as { errors?: Array<{ message: string }>; data?: T };
        
        if (response.errors) {
          console.error('❌ Erreurs GraphQL Shopify:', response.errors);
          return { errors: response.errors };
        }
        
        if (response.data) {
          return { data: response.data };
        }
      }
      
      // Gérer spécifiquement l'erreur ByteString (peu probable avec JSON.stringify)
      if (error.message && (error.message.includes('ByteString') || error.message.includes('encoding'))) {
        console.error('⚠️ Erreur d\'encodage Unicode détectée. Vérifiez les variables GraphQL.');
        // Fallback : utiliser fetch directement si graphql-request échoue
        return this.requestWithFetch<T>(query, variables);
      }
      
      // Erreur réseau ou autre
      const errors = error.errors || [{ message: error.message || 'Erreur inconnue' }];
      return { errors };
    }
  }

  /**
   * Fallback : requête avec fetch direct si graphql-request échoue
   */
  private async requestWithFetch<T>(query: string, variables: Record<string, any> = {}): Promise<StorefrontResponse<T>> {
    try {
      const body = JSON.stringify({ query, variables });
      
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'X-Shopify-Storefront-Access-Token': normalizeHeaderValue(String(this.config.storefrontToken)),
        },
        body: body,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ Shopify API HTTP Error (${response.status}):`, errorText);
        throw new Error(`Shopify API error: ${response.status} ${response.statusText}`);
      }

      const jsonResponse = await response.json();
      
      if (jsonResponse.errors) {
        console.error('❌ Erreurs GraphQL Shopify:', jsonResponse.errors);
        return { errors: jsonResponse.errors };
      }

      return { data: jsonResponse.data as T };
      
    } catch (error: any) {
      console.error('❌ Erreur fetch fallback:', error);
      const errors = error.errors || [{ message: error.message || 'Erreur inconnue' }];
      return { errors };
    }
  }

  // ===============================================
  // PRODUITS PUBLICS
  // ===============================================

  async getProducts(first: number = 250, after?: string) {
    const query = `
      query getProducts($first: Int!, $after: String) {
        products(first: $first, after: $after) {
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          edges {
            node {
              id
              title
              handle
              description
              vendor
              productType
              availableForSale
              images(first: 250) {
                edges {
                  node {
                    id
                    url
                    altText
                    width
                    height
                  }
                }
              }
              variants(first: 250) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    compareAtPrice {
                      amount
                      currencyCode
                    }
                    availableForSale
                    quantityAvailable
                    selectedOptions {
                      name
                      value
                    }
                    image {
                      id
                      url
                      altText
                    }
                  }
                }
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
                maxVariantPrice {
                  amount
                  currencyCode
                }
              }
              seo {
                title
                description
              }
            }
          }
        }
      }
    `;

    return this.request(query, { first, after });
  }

  async getProduct(handle: string) {
    const query = `
      query getProduct($handle: String!) {
        product(handle: $handle) {
          id
          title
          handle
          description
          descriptionHtml
          vendor
          productType
          availableForSale
          createdAt
          updatedAt
          images(first: 250) {
            edges {
              node {
                id
                url
                altText
                width
                height
              }
            }
          }
          variants(first: 250) {
            edges {
              node {
                id
                title
                    price {
                      amount
                      currencyCode
                    }
                compareAtPrice {
                  amount
                  currencyCode
                }
                availableForSale
                quantityAvailable
                selectedOptions {
                  name
                  value
                }
                image {
                  id
                  url
                  altText
                }
              }
            }
          }
          options {
            name
            values
          }
          seo {
            title
            description
          }
          tags
        }
      }
    `;

    return this.request(query, { handle });
  }

  // ===============================================
  // COLLECTIONS PUBLIQUES
  // ===============================================

  async getCollections(first: number = 250, after?: string) {
    const query = `
      query getCollections($first: Int!, $after: String) {
        collections(first: $first, after: $after) {
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
          edges {
            node {
              id
              title
              handle
              description
              descriptionHtml
              image {
                id
                url
                altText
                width
                height
              }
              products(first: 250) {
                edges {
                  node {
                    id
                    title
                    handle
                    images(first: 1) {
                      edges {
                        node {
                          id
                          url
                          altText
                        }
                      }
                    }
                    variants(first: 1) {
                      edges {
                        node {
                          id
                          price {
                            amount
                            currencyCode
                          }
                          compareAtPrice {
                            amount
                            currencyCode
                          }
                          availableForSale
                        }
                      }
                    }
                  }
                }
              }
              seo {
                title
                description
              }
            }
          }
        }
      }
    `;

    return this.request(query, { first, after });
  }

  async getCollection(handle: string) {
    const query = `
      query getCollection($handle: String!) {
        collection(handle: $handle) {
          id
          title
          handle
          description
          descriptionHtml
          image {
            id
            url
            altText
            width
            height
          }
          products(first: 250) {
            pageInfo {
              hasNextPage
              hasPreviousPage
              startCursor
              endCursor
            }
            edges {
              node {
                id
                title
                handle
                availableForSale
                images(first: 250) {
                  edges {
                    node {
                      id
                      url
                      altText
                    }
                  }
                }
                variants(first: 1) {
                  edges {
                    node {
                      id
                      price {
                        amount
                        currencyCode
                      }
                      compareAtPrice {
                        amount
                        currencyCode
                      }
                      availableForSale
                    }
                  }
                }
              }
            }
          }
          seo {
            title
            description
          }
        }
      }
    `;

    return this.request(query, { handle });
  }

  // ===============================================
  // PANIER PUBLIC
  // ===============================================

  async createCart(lines?: CartLineInput[]) {
    const query = `
      mutation createCart($input: CartInput) {
        cartCreate(input: $input) {
          cart {
            id
            checkoutUrl
            totalQuantity
            cost {
              subtotalAmount {
                amount
                currencyCode
              }
              totalAmount {
                amount
                currencyCode
              }
              totalTaxAmount {
                amount
                currencyCode
              }
            }
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  cost {
                    totalAmount {
                      amount
                      currencyCode
                    }
                  }
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      price {
                        amount
                        currencyCode
                      }
                      compareAtPrice {
                        amount
                        currencyCode
                      }
                      image {
                        id
                        url
                        altText
                      }
                      product {
                        id
                        title
                        handle
                      }
                    }
                  }
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    return this.request(query, { 
      input: lines ? { lines } : undefined 
    });
  }

  async addToCart(cartId: string, lines: CartLineInput[]) {
    const query = `
      mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            id
            checkoutUrl
            totalQuantity
            cost {
              subtotalAmount {
                amount
                currencyCode
              }
              totalAmount {
                amount
                currencyCode
              }
              totalTaxAmount {
                amount
                currencyCode
              }
            }
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  cost {
                    totalAmount {
                      amount
                      currencyCode
                    }
                  }
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      price {
                        amount
                        currencyCode
                      }
                      image {
                        id
                        url
                        altText
                      }
                      product {
                        id
                        title
                        handle
                      }
                    }
                  }
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    return this.request(query, { cartId, lines });
  }

  async removeFromCart(cartId: string, lineIds: string[]) {
    const query = `
      mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            id
            checkoutUrl
            totalQuantity
            cost {
              subtotalAmount {
                amount
                currencyCode
              }
              totalAmount {
                amount
                currencyCode
              }
            }
            lines(first: 100) {
              edges {
                node {
                  id
                  quantity
                  merchandise {
                    ... on ProductVariant {
                      id
                      title
                      product {
                        id
                        title
                      }
                    }
                  }
                }
              }
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    return this.request(query, { cartId, lineIds });
  }

  // ===============================================
  // RECHERCHE PUBLIQUE
  // ===============================================

  async searchProducts(query: string, first: number = 250) {
    const graphqlQuery = `
      query searchProducts($query: String!, $first: Int!) {
        search(query: $query, types: PRODUCT, first: $first) {
          edges {
            node {
              ... on Product {
                id
                title
                handle
                images(first: 1) {
                  edges {
                    node {
                      url
                      altText
                    }
                  }
                }
                variants(first: 1) {
                  edges {
                    node {
                      id
                      price {
                        amount
                        currencyCode
                      }
                      availableForSale
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    return this.request(graphqlQuery, { query, first });
  }
}

// Instance singleton pour l'API Storefront
let storefrontClient: ShopifyStorefrontClient | null = null;

export function getShopifyClient(): ShopifyStorefrontClient {
  if (!storefrontClient) {
    storefrontClient = new ShopifyStorefrontClient();
  }
  return storefrontClient;
}

export default ShopifyStorefrontClient;
