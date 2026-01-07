// Shopify API Functions
// ⚠️ SERVER-ONLY : Ces fonctions utilisent des modules Node.js et ne peuvent être utilisées que côté serveur

import 'server-only';

import { shopifyFetch } from "./client"
import { TAGS } from "@/app/src/lib/constants"
import {
  GET_ALL_PRODUCTS_QUERY,
  GET_PRODUCT_BY_HANDLE_QUERY,
  GET_COLLECTION_BY_HANDLE_QUERY,
  GET_ALL_COLLECTIONS_QUERY,
  GET_SHOP_INFO_QUERY,
  GET_SHIPPING_INFO_QUERY,
  CREATE_CART_MUTATION,
  ADD_TO_CART_MUTATION,
  UPDATE_CART_MUTATION,
  REMOVE_FROM_CART_MUTATION,
  GET_CART_QUERY,
} from "./queries"
import { extractAndTransformUserErrors } from "../utils/shopify-error-handler"
import type { ShopifyProduct, ShopifyCollection, ShopifyCart, Product } from "./types"

export interface ShopInfo {
  name: string
  email: string | null
  description: string | null
  url: string | null
  currencyCode: string
}

export interface ShippingInfo {
  freeShippingThreshold: number; // Seuil pour la livraison gratuite en EUR
  deliveryDaysFrance: string; // Délai de livraison en France (ex: "3-5 jours ouvrés")
  deliveryDaysInternational: string; // Délai de livraison international
  standardShippingCost: number; // Coût de livraison standard en EUR
  expressShippingCost: number; // Coût de livraison express en EUR
  expressDeliveryDays: string; // Délai de livraison express
}

/**
 * Type d'erreur pour distinguer les différents types d'erreurs lors de la récupération des informations de livraison
 */
export type ShippingInfoError = 
  | { type: 'CONFIGURATION'; message: string; details?: string }
  | { type: 'GRAPHQL'; message: string; details?: string }
  | { type: 'METAFIELDS_MISSING'; message: string; missingFields: string[] }
  | { type: 'VALIDATION'; message: string; field: string; value: string }
  | { type: 'UNKNOWN'; message: string; details?: string };

/**
 * Résultat de la récupération des informations de livraison
 */
export type ShippingInfoResult = 
  | { success: true; data: ShippingInfo }
  | { success: false; error: ShippingInfoError };

// Transform Shopify product to simplified format
export function transformProduct(shopifyProduct: ShopifyProduct): Product {
  const minPrice = Number.parseFloat(shopifyProduct.priceRange.minVariantPrice.amount)
  const firstVariant = shopifyProduct.variants.edges[0]?.node
  const compareAtPrice = firstVariant?.compareAtPrice ? Number.parseFloat(firstVariant.compareAtPrice.amount) : null

  // Vérifier que firstVariantId est bien un ID de variant et non un ID de produit
  let firstVariantId: string | undefined = firstVariant?.id;
  
  // Validation : s'assurer que c'est bien un ID de variant
  if (firstVariantId) {
    // Si c'est un ID de produit au lieu d'un ID de variant, logger un warning
    if (firstVariantId.includes('gid://shopify/Product/') && !firstVariantId.includes('ProductVariant')) {
      console.warn('⚠️ Attention: firstVariantId semble être un ID de produit au lieu d\'un ID de variant:', firstVariantId);
      console.warn('   Produit:', shopifyProduct.title, '| Variants disponibles:', shopifyProduct.variants.edges.length);
      // Essayer de trouver un vrai variant
      const realVariant = shopifyProduct.variants.edges.find(edge => 
        edge.node.id.includes('ProductVariant')
      );
      if (realVariant) {
        firstVariantId = realVariant.node.id;
        console.log('✅ Variant correct trouvé:', firstVariantId);
      } else {
        console.error('❌ Aucun variant valide trouvé pour le produit:', shopifyProduct.title);
        firstVariantId = undefined;
      }
    }
  }

  // Transformer les variantes
  const variants = shopifyProduct.variants.edges.map(edge => {
    const variant = edge.node;
    return {
      id: variant.id,
      title: variant.title,
      availableForSale: variant.availableForSale,
      price: Number.parseFloat(variant.price.amount),
      compareAtPrice: variant.compareAtPrice ? Number.parseFloat(variant.compareAtPrice.amount) : null,
      currency: variant.price.currencyCode,
      selectedOptions: variant.selectedOptions,
      image: variant.image?.url || null,
    };
  });

  return {
    id: shopifyProduct.id,
    title: shopifyProduct.title,
    handle: shopifyProduct.handle,
    description: shopifyProduct.description,
    price: minPrice,
    compareAtPrice,
    currency: shopifyProduct.priceRange.minVariantPrice.currencyCode,
    images: shopifyProduct.images.edges.map((edge) => edge.node.url),
    availableForSale: shopifyProduct.availableForSale,
    tags: shopifyProduct.tags,
    collections: shopifyProduct.collections.edges.map((edge) => edge.node.handle),
    firstVariantId,
    options: shopifyProduct.options || [],
    variants: variants.length > 0 ? variants : undefined,
  }
}

// Get all products with pagination support
export async function getAllProducts(limit: number = 250): Promise<Product[]> {
  try {
    const allProducts: Product[] = []
    let hasNextPage = true
    let cursor: string | null = null

    while (hasNextPage && allProducts.length < limit) {
      type ProductsResponse = {
        products: {
          edges: Array<{ node: ShopifyProduct; cursor: string }>
          pageInfo: {
            hasNextPage: boolean
            endCursor: string | null
          }
        }
      }

      const response: { data: ProductsResponse; errors?: Array<{ message: string }> } = await shopifyFetch<ProductsResponse>({
        query: GET_ALL_PRODUCTS_QUERY,
        variables: { 
          first: Math.min(250, limit - allProducts.length),
          after: cursor,
        },
        tags: [TAGS.products],
      })

      const data: ProductsResponse | undefined = response.data

      if (!data?.products) {
        break
      }

      const products = data.products.edges.map((edge: { node: ShopifyProduct; cursor: string }) => transformProduct(edge.node))
      allProducts.push(...products)

      hasNextPage = data.products.pageInfo.hasNextPage
      cursor = data.products.pageInfo.endCursor
    }

    if (allProducts.length === 0) {
      console.warn("No products found from Shopify")
      return []
    }

    return allProducts
  } catch (error) {
    console.error("Error fetching products:", error)
    // Retourner un tableau vide au lieu de lancer une erreur pour éviter de faire crasher l'application
    return []
  }
}

// Get product by handle
export async function getProductByHandle(handle: string): Promise<Product | null> {
  try {
    const { data } = await shopifyFetch<{ productByHandle: ShopifyProduct }>({
      query: GET_PRODUCT_BY_HANDLE_QUERY,
      variables: { handle },
      tags: [TAGS.products],
    })

    if (!data.productByHandle) {
      return null
    }

    return transformProduct(data.productByHandle)
  } catch (error) {
    console.error("Error fetching product:", error)
    return null
  }
}

// Get collection by handle
export async function getCollectionByHandle(handle: string) {
  try {
    const { data } = await shopifyFetch<{ collectionByHandle: ShopifyCollection }>({
      query: GET_COLLECTION_BY_HANDLE_QUERY,
      variables: { handle, first: 20 },
      tags: [TAGS.collections],
    })

    return data.collectionByHandle
  } catch (error) {
    console.error("Error fetching collection:", error)
    return null
  }
}

// Get all collections
export async function getAllCollections() {
  try {
    const { data } = await shopifyFetch<{
      collections: { edges: Array<{ node: ShopifyCollection }> }
    }>({
      query: GET_ALL_COLLECTIONS_QUERY,
      variables: { first: 10 },
      tags: [TAGS.collections],
    })

    return data.collections?.edges.map((edge) => edge.node) || []
  } catch (error) {
    console.error("Error fetching collections:", error)
    return []
  }
}

// Get shop information
export async function getShopInfo(): Promise<ShopInfo | null> {
  try {
    console.log('🔄 Exécution de la requête GET_SHOP_INFO_QUERY...');
    
    const response = await shopifyFetch<{
      shop: {
        name: string
        primaryDomain: {
          url: string
        } | null
        paymentSettings: {
          currencyCode: string
        }
      }
    }>({
      query: GET_SHOP_INFO_QUERY,
      tags: [], // Shop info n'a pas besoin de tag spécifique
    })

    const { data, errors } = response;

    // Log détaillé pour le débogage
    if (errors) {
      console.error('❌ Erreurs GraphQL Shopify:', JSON.stringify(errors, null, 2));
    }

    if (!data) {
      console.warn('⚠️ Aucune donnée retournée par Shopify API');
      return null
    }

    if (!data.shop) {
      console.warn('⚠️ Objet shop non présent dans la réponse:', JSON.stringify(data, null, 2));
      return null
    }

    console.log('✅ Informations de la boutique récupérées avec succès');

    return {
      name: data.shop.name,
      email: null, // Non disponible via Storefront API, nécessite Admin API
      description: null, // Non disponible via Storefront API, nécessite Admin API
      url: data.shop.primaryDomain?.url || null,
      currencyCode: data.shop.paymentSettings.currencyCode,
    }
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des informations de la boutique:", error);
    if (error instanceof Error) {
      console.error("Message d'erreur:", error.message);
      console.error("Stack trace:", error.stack);
    }
    return null
  }
}

/**
 * Retourne des valeurs par défaut pour les informations de livraison
 * Utilisé comme fallback lorsque les metafields ne sont pas configurés dans Shopify
 */
function getDefaultShippingInfo(): ShippingInfoResult {
  const defaultShippingInfo: ShippingInfo = {
    freeShippingThreshold: 50, // 50€ pour la livraison gratuite
    deliveryDaysFrance: '3-5 jours ouvrés',
    deliveryDaysInternational: '7-14 jours ouvrés',
    standardShippingCost: 5.99, // 5.99€ pour la livraison standard
    expressShippingCost: 12.99, // 12.99€ pour la livraison express
    expressDeliveryDays: '1-2 jours ouvrés',
  };

  console.log('✅ Utilisation des valeurs par défaut pour les informations de livraison:', defaultShippingInfo);
  
  return {
    success: true,
    data: defaultShippingInfo,
  };
}

// Get shipping information from Shopify metafields
// Retourne un résultat typé avec succès ou erreur pour permettre une meilleure gestion
export async function getShippingInfo(): Promise<ShippingInfoResult> {
  try {
    console.log('🔄 Récupération des informations de livraison depuis Shopify...');
    
    const response = await shopifyFetch<{
      shop: {
        metafields: Array<{
          id: string;
          namespace: string;
          key: string;
          value: string;
          type: string;
        } | null>;
      };
    }>({
      query: GET_SHIPPING_INFO_QUERY,
      tags: [], // Shipping info n'a pas besoin de tag spécifique
    });

    const { data, errors } = response;

    // Erreur de configuration (variables d'environnement manquantes)
    if (errors && errors.some(e => e.message.includes('not configured') || e.message.includes('environment variables'))) {
      const errorMessage = errors.map(e => e.message).join(', ');
      console.error('❌ Erreur de configuration Shopify:', errorMessage);
      return {
        success: false,
        error: {
          type: 'CONFIGURATION',
          message: 'Configuration Shopify manquante',
          details: errorMessage,
        },
      };
    }

    // Erreur GraphQL
    if (errors) {
      const errorMessage = errors.map(e => e.message).join(', ');
      console.error('❌ Erreurs GraphQL lors de la récupération des metafields de livraison:', errors);
      // En cas d'erreur GraphQL, utiliser les valeurs par défaut
      console.warn('⚠️ Utilisation des valeurs par défaut pour les informations de livraison');
      return getDefaultShippingInfo();
    }

    if (!data?.shop?.metafields || data.shop.metafields.length === 0) {
      console.warn('⚠️ Aucun metafield de livraison trouvé dans Shopify. Utilisation des valeurs par défaut.');
      return getDefaultShippingInfo();
    }

    // Filtrer les valeurs null et parser les metafields
    const validMetafields = data.shop.metafields.filter(
      (metafield): metafield is NonNullable<typeof metafield> => metafield !== null
    );

    if (validMetafields.length === 0) {
      console.warn('⚠️ Aucun metafield de livraison valide trouvé dans Shopify');
      console.log('📊 Debug: Nombre total de metafields reçus:', data.shop.metafields.length);
      console.log('📊 Debug: Metafields reçus (avec null):', JSON.stringify(data.shop.metafields, null, 2));
      console.warn('⚠️ Utilisation des valeurs par défaut pour les informations de livraison');
      console.log('💡 Pour configurer les metafields dans Shopify Admin:');
      console.log('   1. Allez dans Settings > Custom data > Shop metafields');
      console.log('   2. Créez les metafields suivants avec le namespace "shipping":');
      console.log('      - free_shipping_threshold (type: number_integer)');
      console.log('      - delivery_days_france (type: single_line_text_field)');
      console.log('      - delivery_days_international (type: single_line_text_field)');
      console.log('      - standard_shipping_cost (type: number_decimal)');
      return getDefaultShippingInfo();
    }

    const metafields = validMetafields.reduce((acc, metafield) => {
      acc[metafield.key] = metafield.value;
      return acc;
    }, {} as Record<string, string>);

    // Vérifier que les metafields essentiels sont présents (sans les optionnels)
    const requiredFields = [
      'free_shipping_threshold',
      'delivery_days_france',
      'delivery_days_international',
      'standard_shipping_cost'
    ];

    const missingRequiredFields = requiredFields.filter(field => !metafields[field] || metafields[field].trim() === '');
    
    // Si des champs essentiels manquent, utiliser les valeurs par défaut pour ceux-ci
    if (missingRequiredFields.length > 0) {
      console.warn(`⚠️ Metafields de livraison manquants: ${missingRequiredFields.join(', ')}`);
      console.warn('⚠️ Utilisation des valeurs par défaut pour les champs manquants');
      
      // Utiliser les valeurs par défaut comme base
      const defaultInfo = getDefaultShippingInfo();
      if (defaultInfo.success) {
        // Fusionner les valeurs Shopify avec les valeurs par défaut
        const shippingInfo: ShippingInfo = {
          freeShippingThreshold: metafields.free_shipping_threshold 
            ? parseFloat(metafields.free_shipping_threshold) 
            : defaultInfo.data.freeShippingThreshold,
          deliveryDaysFrance: metafields.delivery_days_france?.trim() || defaultInfo.data.deliveryDaysFrance,
          deliveryDaysInternational: metafields.delivery_days_international?.trim() || defaultInfo.data.deliveryDaysInternational,
          standardShippingCost: metafields.standard_shipping_cost 
            ? parseFloat(metafields.standard_shipping_cost) 
            : defaultInfo.data.standardShippingCost,
          expressShippingCost: metafields.express_shipping_cost 
            ? parseFloat(metafields.express_shipping_cost) 
            : defaultInfo.data.expressShippingCost,
          expressDeliveryDays: metafields.express_delivery_days?.trim() || defaultInfo.data.expressDeliveryDays,
        };
        
        return {
          success: true,
          data: shippingInfo,
        };
      }
    }

    // Extraire et valider les valeurs des metafields
    const freeShippingThreshold = parseFloat(metafields.free_shipping_threshold);
    const standardShippingCost = parseFloat(metafields.standard_shipping_cost);

    if (isNaN(freeShippingThreshold) || freeShippingThreshold < 0) {
      console.warn('⚠️ Valeur invalide pour free_shipping_threshold, utilisation de la valeur par défaut');
      const defaultInfo = getDefaultShippingInfo();
      if (defaultInfo.success) {
        return {
          success: true,
          data: {
            ...defaultInfo.data,
            deliveryDaysFrance: metafields.delivery_days_france?.trim() || defaultInfo.data.deliveryDaysFrance,
            deliveryDaysInternational: metafields.delivery_days_international?.trim() || defaultInfo.data.deliveryDaysInternational,
            expressShippingCost: metafields.express_shipping_cost 
              ? parseFloat(metafields.express_shipping_cost) 
              : defaultInfo.data.expressShippingCost,
            expressDeliveryDays: metafields.express_delivery_days?.trim() || defaultInfo.data.expressDeliveryDays,
          },
        };
      }
      return defaultInfo;
    }

    if (isNaN(standardShippingCost) || standardShippingCost < 0) {
      console.warn('⚠️ Valeur invalide pour standard_shipping_cost, utilisation de la valeur par défaut');
      const defaultInfo = getDefaultShippingInfo();
      if (defaultInfo.success) {
        return {
          success: true,
          data: {
            ...defaultInfo.data,
            freeShippingThreshold,
            deliveryDaysFrance: metafields.delivery_days_france?.trim() || defaultInfo.data.deliveryDaysFrance,
            deliveryDaysInternational: metafields.delivery_days_international?.trim() || defaultInfo.data.deliveryDaysInternational,
            expressShippingCost: metafields.express_shipping_cost 
              ? parseFloat(metafields.express_shipping_cost) 
              : defaultInfo.data.expressShippingCost,
            expressDeliveryDays: metafields.express_delivery_days?.trim() || defaultInfo.data.expressDeliveryDays,
          },
        };
      }
      return defaultInfo;
    }

    const shippingInfo: ShippingInfo = {
      freeShippingThreshold,
      deliveryDaysFrance: metafields.delivery_days_france.trim(),
      deliveryDaysInternational: metafields.delivery_days_international.trim(),
      standardShippingCost,
      expressShippingCost: metafields.express_shipping_cost 
        ? parseFloat(metafields.express_shipping_cost) 
        : 0,
      expressDeliveryDays: metafields.express_delivery_days 
        ? metafields.express_delivery_days.trim() 
        : '',
    };

    console.log('✅ Informations de livraison récupérées avec succès depuis Shopify');
    return {
      success: true,
      data: shippingInfo,
    };
  } catch (error) {
    console.error("❌ ERREUR CRITIQUE: Impossible de récupérer les informations de livraison:", error);
    const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error("Message d'erreur:", errorMessage);
    console.warn('⚠️ Utilisation des valeurs par défaut pour les informations de livraison');
    
    // En cas d'erreur, retourner les valeurs par défaut
    return getDefaultShippingInfo();
  }
}

// Cart operations
export async function createCart(variantId: string, quantity = 1) {
  try {
    const response = await shopifyFetch<{
      cartCreate: { cart: ShopifyCart; userErrors: Array<{ message: string }> }
    }>({
      query: CREATE_CART_MUTATION,
      variables: {
        lineItems: [{ merchandiseId: variantId, quantity }],
      },
      cache: 'no-store', // Les opérations de panier ne doivent pas être mises en cache
    })

    // Vérifier les erreurs GraphQL
    if (response.errors) {
      console.error("Error creating cart (GraphQL errors):", response.errors)
      return null
    }

    // Vérifier les userErrors
    if (response.data?.cartCreate) {
      const userError = extractAndTransformUserErrors(response.data.cartCreate, 'createCart')
      if (userError) {
        console.error("Error creating cart (userErrors):", response.data.cartCreate.userErrors)
        // Logger l'erreur technique mais ne pas la retourner directement
        // L'erreur sera gérée par les composants qui appellent cette fonction
      }
    }

    return response.data?.cartCreate?.cart || null
  } catch (error) {
    console.error("Error creating cart:", error)
    return null
  }
}

export async function addToCart(cartId: string, variantId: string, quantity = 1) {
  try {
    const response = await shopifyFetch<{
      cartLinesAdd: { cart: ShopifyCart; userErrors: Array<{ message: string }> }
    }>({
      query: ADD_TO_CART_MUTATION,
      variables: {
        cartId,
        lines: [{ merchandiseId: variantId, quantity }],
      },
      cache: 'no-store', // Les opérations de panier ne doivent pas être mises en cache
    })

    // Vérifier les erreurs GraphQL
    if (response.errors) {
      console.error("Error adding to cart (GraphQL errors):", response.errors)
      return null
    }

    // Vérifier les userErrors
    if (response.data?.cartLinesAdd) {
      const userError = extractAndTransformUserErrors(response.data.cartLinesAdd, 'addToCart')
      if (userError) {
        console.error("Error adding to cart (userErrors):", response.data.cartLinesAdd.userErrors)
        // Logger l'erreur technique mais ne pas la retourner directement
      }
    }

    return response.data?.cartLinesAdd?.cart || null
  } catch (error) {
    console.error("Error adding to cart:", error)
    return null
  }
}

export async function updateCartLine(cartId: string, lineId: string, quantity: number) {
  try {
    const response = await shopifyFetch<{
      cartLinesUpdate: { cart: ShopifyCart; userErrors: Array<{ message: string }> }
    }>({
      query: UPDATE_CART_MUTATION,
      variables: {
        cartId,
        lines: [{ id: lineId, quantity }],
      },
      cache: 'no-store', // Les opérations de panier ne doivent pas être mises en cache
    })

    // Vérifier les erreurs GraphQL
    if (response.errors) {
      console.error("Error updating cart (GraphQL errors):", response.errors)
      return null
    }

    // Vérifier les userErrors
    if (response.data?.cartLinesUpdate) {
      const userError = extractAndTransformUserErrors(response.data.cartLinesUpdate, 'updateCartLine')
      if (userError) {
        console.error("Error updating cart (userErrors):", response.data.cartLinesUpdate.userErrors)
        // Logger l'erreur technique mais ne pas la retourner directement
      }
    }

    return response.data?.cartLinesUpdate?.cart || null
  } catch (error) {
    console.error("Error updating cart:", error)
    return null
  }
}

export async function removeFromCart(cartId: string, lineId: string) {
  try {
    const response = await shopifyFetch<{
      cartLinesRemove: { cart: ShopifyCart; userErrors: Array<{ message: string }> }
    }>({
      query: REMOVE_FROM_CART_MUTATION,
      variables: {
        cartId,
        lineIds: [lineId],
      },
      cache: 'no-store', // Les opérations de panier ne doivent pas être mises en cache
    })

    // Vérifier les erreurs GraphQL
    if (response.errors) {
      console.error("Error removing from cart (GraphQL errors):", response.errors)
      return null
    }

    // Vérifier les userErrors
    if (response.data?.cartLinesRemove) {
      const userError = extractAndTransformUserErrors(response.data.cartLinesRemove, 'removeFromCart')
      if (userError) {
        console.error("Error removing from cart (userErrors):", response.data.cartLinesRemove.userErrors)
        // Logger l'erreur technique mais ne pas la retourner directement
      }
    }

    return response.data?.cartLinesRemove?.cart || null
  } catch (error) {
    console.error("Error removing from cart:", error)
    return null
  }
}

export async function getCart(cartId: string) {
  try {
    const { data } = await shopifyFetch<{ cart: ShopifyCart }>({
      query: GET_CART_QUERY,
      variables: { cartId },
      tags: [TAGS.cart],
    })

    return data.cart
  } catch (error) {
    console.error("Error fetching cart:", error)
    return null
  }
}

