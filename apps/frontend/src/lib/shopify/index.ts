"use server";

const domain = process.env.SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!domain || !storefrontAccessToken) {
  console.error(
    "ERREUR CONFIGURATION: SHOPIFY_STORE_DOMAIN ou SHOPIFY_STOREFRONT_ACCESS_TOKEN manquant dans env.local",
  );
}

const SHOPIFY_GRAPHQL_API_ENDPOINT = `https://${domain}/api/2024-01/graphql.json`;

async function shopifyFetch<T>({
  query,
  variables,
  cache = "force-cache",
  tags,
}: {
  query: string;
  variables?: any;
  cache?: RequestCache;
  tags?: string[];
}): Promise<T> {
  try {
    const response = await fetch(SHOPIFY_GRAPHQL_API_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": storefrontAccessToken!,
      },
      body: JSON.stringify({ query, variables }),
      cache,
      ...(tags && { next: { tags } }),
    });

    const json = await response.json();

    if (json.errors) {
      console.error("Erreur Shopify API:", json.errors);
      throw new Error("Erreur API Shopify");
    }

    return json.data;
  } catch (error) {
    console.error("Erreur Fetch Shopify:", error);
    throw { error };
  }
}

function reshapeProduct(product: any) {
  if (!product) return null;

  const { images, variants, priceRange, featuredImage, ...rest } = product;

  return {
    ...rest,
    images: images?.edges?.map((edge: any) => edge.node) || [],
    price: parseFloat(priceRange?.minVariantPrice?.amount || "0"),
    compareAtPrice: variants?.edges?.[0]?.node?.compareAtPrice
      ? parseFloat(variants.edges[0].node.compareAtPrice.amount)
      : undefined,
    currency: priceRange?.minVariantPrice?.currencyCode || "EUR",
    variants: variants?.edges?.map((edge: any) => {
      const node = edge.node;
      return {
        ...node,
        price: parseFloat(node.price?.amount || "0"),
        compareAtPrice: node.compareAtPrice
          ? parseFloat(node.compareAtPrice.amount)
          : undefined,
      };
    }) || [],
    featuredImage: featuredImage?.url || images?.edges?.[0]?.node?.url || "",
  };
}

export async function getAllProducts() {
  const query = `
    query AllProducts {
      products(first: 20) {
        edges {
          node {
            id
            title
            handle
            description
            availableForSale
            featuredImage {
              url
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
  const data = await shopifyFetch<any>({ query, tags: ["products"] });
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
        images(first: 10) {
          edges {
            node {
              url
              altText
            }
          }
        }
        media(first: 10) {
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
        variants(first: 20) {
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
              image {
                url
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
  const data = await shopifyFetch<any>({
    query,
    variables: { handle },
    cache: "no-store",
  });
  return reshapeProduct(data?.product);
}

export async function getAllCollections() {
  const query = `
    query Collections {
      collections(first: 10) {
        edges {
          node {
            id
            title
            handle
            description
            image {
              url
              altText
            }
          }
        }
      }
    }
  `;
  const data = await shopifyFetch<any>({ query });
  return data?.collections?.edges.map((edge: any) => edge.node) || [];
}

export async function getCollectionByHandle(handle: string) {
  const query = `
    query Collection($handle: String!) {
      collection(handle: $handle) {
        id
        title
        description
        products(first: 20) {
          edges {
            node {
              id
              title
              handle
              description
              availableForSale
              featuredImage {
                url
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
  const data = await shopifyFetch<any>({ query, variables: { handle } });

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
  const query = `
    query getShopInfo {
      shop {
        name
        description
        paymentSettings {
          currencyCode
        }
      }
    }
  `;
  const data = await shopifyFetch<any>({ query });
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
  const data = await shopifyFetch<any>({ query, cache: "no-store" });
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
                      url
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
    const data = await shopifyFetch<any>({
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
  lines: { merchandiseId: string; quantity: number }[],
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
                        url
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
  const data = await shopifyFetch<any>({
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
                        url
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
  const data = await shopifyFetch<any>({
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
                        url
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
  const data = await shopifyFetch<any>({
    query,
    variables: { cartId, lineIds },
    cache: "no-store",
  });
  return data?.cartLinesRemove?.cart;
}

// Re-export what might be needed by other files if they were using it
// Assuming other utility functions were not essential or provided in the snippet
