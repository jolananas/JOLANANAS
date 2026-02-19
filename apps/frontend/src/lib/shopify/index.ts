"use server";
import { shopifyFetch } from "./client";
import { GET_PRODUCT_RECOMMENDATIONS_QUERY, GET_SHOP_INFO_QUERY } from "./queries";

/** Garde-fou JS — version stricte :
 *  1. Répare les URLs avec double extension (.heic.webp) issues d'un vieux cache
 *  2. Détecte HEIC/HEIF uniquement dans le chemin (avant le ?) pour éviter les faux positifs
 *  3. Ajoute ?format=webp via paramètre URL — jamais en changeant l'extension
 *  4. N'ajoute pas format= si c'est déjà présent
 */
function cleanShopifyImage(url: string | undefined | null): string {
  if (!url) return "";

  // 1. Nettoyer toute double extension erronée laissée par d'anciennes tentatives
  let cleanUrl = url
    .replace(/\.heic\.webp/gi, ".heic")
    .replace(/\.heif\.webp/gi, ".heif");

  // 2. Détecter HEIC/HEIF uniquement dans le path (avant le premier ?)
  const path = cleanUrl.split("?")[0];
  const isHeic = /\.heic$/i.test(path) || /\.heif$/i.test(path);

  // 3. Forcer la conversion via paramètre CDN Shopify (pas en modifiant l'extension)
  if (isHeic && !cleanUrl.includes("format=")) {
    const separator = cleanUrl.includes("?") ? "&" : "?";
    return `${cleanUrl}${separator}format=webp`;
  }

  return cleanUrl;
}

function reshapeProduct(product: any) {
  if (!product) return null;

  const { images, variants, priceRange, featuredImage, ...rest } = product;

  return {
    ...rest,
    images: images?.edges?.map((edge: any) => ({
      ...edge.node,
      url: cleanShopifyImage(edge.node.url),
    })) || [],
    price: parseFloat(priceRange?.minVariantPrice?.amount),
    compareAtPrice: variants?.edges?.[0]?.node?.compareAtPrice
      ? parseFloat(variants.edges[0].node.compareAtPrice.amount)
      : undefined,
    currency: priceRange?.minVariantPrice?.currencyCode,
    variants: variants?.edges?.map((edge: any) => {
      const node = edge.node;
      return {
        ...node,
        price: parseFloat(node.price?.amount),
        compareAtPrice: node.compareAtPrice
          ? parseFloat(node.compareAtPrice.amount)
          : undefined,
        quantityAvailable: node.quantityAvailable,
        inventoryPolicy:
          node.quantityAvailable <= 0 && node.availableForSale
            ? "CONTINUE"
            : "DENY",
        image: node.image
          ? { ...node.image, url: cleanShopifyImage(node.image.url) }
          : null,
      };
    }) || [],
    featuredImage: cleanShopifyImage(
      featuredImage?.url || images?.edges?.[0]?.node?.url || ""
    ),
    sellingPlanGroups:
      product.sellingPlanGroups?.edges?.map((edge: any) => ({
        ...edge.node,
        sellingPlans: {
          edges: edge.node.sellingPlans.edges.map((e: any) => ({
            node: e.node,
          })),
        },
      })) || [],
  };
}


export async function getAllProducts() {
  const query = `
    query AllProducts {
      products(first: 250) {
        edges {
          node {
            id
            title
            handle
            description
            availableForSale
            featuredImage {
              url(transform: {preferredContentType: WEBP})
              altText
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
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
                }
              }
            }
          }
        }
      }
    }
  `;
  const { data } = await shopifyFetch<any>({ query, tags: ["products"] });
  return (
    data?.products?.edges.map((edge: any) => reshapeProduct(edge.node)) || []
  );
}

export async function getProductByHandle(handle: string) {
  const query = `
    query Product($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        description
        availableForSale
        images(first: 250) {
          edges {
            node {
              url(transform: {preferredContentType: WEBP})
              altText
            }
          }
        }
        media(first: 250) {
          edges {
            node {
              ... on Video {
                mediaContentType
                sources {
                  url
                  mimeType
                }
                previewImage {
                  url
                  altText
                }
              }
              ... on MediaImage {
                mediaContentType
                image {
                  url
                  altText
                }
              }
            }
          }
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        variants(first: 250) {
          edges {
            node {
              id
              title
              availableForSale
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
              quantityAvailable
              image {
                url(transform: {preferredContentType: WEBP})
                altText
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
        options {
          id
          name
          values
        }
        tags
      }
    }
  `;
  const { data } = await shopifyFetch<any>({
    query,
    variables: { handle },
    cache: "no-store",
  });
  return reshapeProduct(data?.product);
}

export async function getAllCollections() {
  const query = `
    query Collections {
      collections(first: 250) {
        edges {
          node {
            id
            title
            handle
            description
            image {
              url(transform: {preferredContentType: WEBP})
              altText
            }
          }
        }
      }
    }
  `;
  const { data } = await shopifyFetch<any>({ query });
  return data?.collections?.edges.map((edge: any) => edge.node) || [];
}

export async function getCollectionByHandle(handle: string) {
  const query = `
    query Collection($handle: String!) {
      collection(handle: $handle) {
        id
        title
        description
        products(first: 250) {
          edges {
            node {
              id
              title
              handle
              description
              availableForSale
              featuredImage {
                url(transform: {preferredContentType: WEBP})
                altText
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
              variants(first: 1) {
                edges {
                  node {
                    price {
                      amount
                      currencyCode
                    }
                    compareAtPrice {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  const { data } = await shopifyFetch<any>({ query, variables: { handle } });

  if (data?.collection) {
    return {
      ...data.collection,
      products:
        data.collection.products?.edges.map((edge: any) =>
          reshapeProduct(edge.node),
        ) || [],
    };
  }

  return null;
}

export async function getShopInfo() {
  const { data } = await shopifyFetch<any>({ query: GET_SHOP_INFO_QUERY });
  return data?.shop;
}

export async function getShippingInfo() {
  // Mock/Fallback car souvent géré par metafields ou settings complexes
  // Pour le MVP on retourne des valeurs par défaut si pas de metafields
  return {
    success: true,
    data: {
      freeShippingThreshold: 100,
      standardShippingCost: 5,
      expressShippingCost: 15,
      deliveryDaysFrance: "2-4",
      deliveryDaysInternational: "5-10",
    },
  };
}

// --- MUTATIONS PANIER (Actions Client -> Serveur) ---

export async function createCart() {
  const query = `
    mutation cartCreate {
      cartCreate {
        cart {
          id
          checkoutUrl
          lines(first: 0) { edges { node { id } } }
        }
      }
    }
  `;
  const { data } = await shopifyFetch<any>({ query, cache: "no-store" });
  return data?.cartCreate?.cart;
}

export async function getCart(cartId: string) {
  const query = `
    query getCart($cartId: ID!) {
      cart(id: $cartId) {
        id
        checkoutUrl
        cost {
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
                  product {
                    title
                    handle
                    featuredImage {
                      url(transform: {preferredContentType: WEBP})
                      altText
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  try {
    const { data } = await shopifyFetch<any>({
      query,
      variables: { cartId },
      cache: "no-store",
    });
    return data?.cart;
  } catch (e) {
    return null; // Si le panier a expiré
  }
}

export async function addToCart(
  cartId: string,
  lines: { merchandiseId: string; quantity: number; sellingPlanId?: string }[],
) {
  const query = `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          cost {
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
                    product {
                      title
                      handle
                      featuredImage {
                        url(transform: {preferredContentType: WEBP})
                        altText
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  const { data } = await shopifyFetch<any>({
    query,
    variables: { cartId, lines },
    cache: "no-store",
  });
  return data?.cartLinesAdd?.cart;
}

export async function updateCartLine(
  cartId: string,
  lineId: string,
  quantity: number,
) {
  const query = `
    mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
      cartLinesUpdate(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          cost {
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
                    product {
                      title
                      handle
                      featuredImage {
                        url(transform: {preferredContentType: WEBP})
                        altText
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  const { data } = await shopifyFetch<any>({
    query,
    variables: { cartId, lines: [{ id: lineId, quantity }] },
    cache: "no-store",
  });
  return data?.cartLinesUpdate?.cart;
}

export async function removeFromCart(cartId: string, lineIds: string[]) {
  const query = `
    mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
      cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
        cart {
          id
          checkoutUrl
          cost {
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
                    product {
                      title
                      handle
                      featuredImage {
                        url(transform: {preferredContentType: WEBP})
                        altText
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;
  const { data } = await shopifyFetch<any>({
    query,
    variables: { cartId, lineIds },
    cache: "no-store",
  });
  return data?.cartLinesRemove?.cart;
}

// Re-export what might be needed by other files if they were using it

export async function getVariantAvailability(variantId: string) {
  const query = `
    query getVariantAvailability($variantId: ID!) {
      node(id: $variantId) {
        ... on ProductVariant {
          storeAvailability(first: 50) {
            edges {
              node {
                available
                location {
                  name
                }
                pickUpTime
              }
            }
          }
        }
      }
    }
  `;
  const { data } = await shopifyFetch<any>({
    query,
    variables: { variantId },
    cache: "no-store",
  });
  
  const edges = data?.node?.storeAvailability?.edges;
  if (!edges || edges.length === 0) return null;
  
  // Return the first available location or null
  const available = edges.find((edge: any) => edge.node.available);
  return available ? available.node : null;
}

export async function getProductRecommendations(productId: string) {
  const { data } = await shopifyFetch<any>({
    query: GET_PRODUCT_RECOMMENDATIONS_QUERY,
    variables: { productId },
    cache: "no-store", // Recommendations should be fresh
  });

  return data?.productRecommendations?.map((product: any) => reshapeProduct(product)) || [];
}
