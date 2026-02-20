// Shopify GraphQL Queries

export const PRODUCT_FRAGMENT = `
  fragment ProductFragment on Product {
    id
    title
    handle
    description
    descriptionHtml
    availableForSale
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
    images(first: 250) {
      edges {
        node {
          url
          altText
          width
          height
        }
      }
    }
    options {
      name
      values
    }
    variants(first: 250) {
      edges {
        node {
          id
          title
          availableForSale
          quantityAvailable
          sku
          barcode
          weight
          weightUnit
          price {
            amount
            currencyCode
          }
          compareAtPrice {
            amount
            currencyCode
          }
          selectedOptions {
            name
            value
          }
          image {
            url
            altText
            width
            height
          }
        }
      }
    }
    tags
    collections(first: 250) {
      edges {
        node {
          id
          title
          handle
        }
      }
    }
    material: metafield(namespace: "custom", key: "material") {
      reference {
        ... on Metaobject {
          id
          handle
          type
          fields {
            key
            value
          }
        }
      }
    }
    sellingPlanGroups(first: 1) {
      edges {
        node {
          name
          options {
            name
            values
          }
          sellingPlans(first: 250) {
            edges {
              node {
                id
                name
                description
                options {
                  name
                  value
                }
                priceAdjustments {
                  orderCount
                  adjustmentValue {
                    ... on SellingPlanFixedAmountPriceAdjustment {
                      adjustmentAmount {
                        amount
                        currencyCode
                      }
                    }
                    ... on SellingPlanPercentagePriceAdjustment {
                      adjustmentPercentage
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
`

export const GET_ALL_PRODUCTS_QUERY = `
  query GetAllProducts($first: Int = 250, $after: String) {
    products(first: $first, after: $after) {
      edges {
        cursor
        node {
          ...ProductFragment
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`

export const GET_PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!) {
    productByHandle(handle: $handle) {
      ...ProductFragment
    }
  }
  ${PRODUCT_FRAGMENT}
`

export const GET_COLLECTION_BY_HANDLE_QUERY = `
  query GetCollectionByHandle($handle: String!, $first: Int = 250, $after: String) {
    collectionByHandle(handle: $handle) {
      id
      title
      handle
      description
      image {
        url
        altText
        width
        height
      }
      products(first: $first, after: $after) {
        pageInfo {
          hasNextPage
          endCursor
        }
        edges {
          node {
            ...ProductFragment
          }
        }
      }
    }
  }
  ${PRODUCT_FRAGMENT}
`

export const GET_ALL_COLLECTIONS_QUERY = `
  query GetAllCollections($first: Int = 250) {
    collections(first: $first) {
      edges {
        node {
          id
          title
          handle
          description
          image {
            url
            altText
            width
            height
          }
        }
      }
    }
  }
`

export const GET_SHOP_INFO_QUERY = `
  query GetShopInfo {
    shop {
      name
      primaryDomain {
        url
      }
      paymentSettings {
        currencyCode
        supportedDigitalWallets
      }
    }
  }
`

export const CART_FRAGMENT = `
  fragment CartFragment on Cart {
    id
    checkoutUrl
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
              availableForSale
              price {
                amount
                currencyCode
              }
              compareAtPrice {
                amount
                currencyCode
              }
              selectedOptions {
                name
                value
              }
              image {
                url
                altText
                width
                height
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
    totalQuantity
  }
`

export const CREATE_CART_MUTATION = `
  mutation CreateCart($lineItems: [CartLineInput!]) {
    cartCreate(input: { lines: $lineItems }) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`

export const ADD_TO_CART_MUTATION = `
  mutation AddToCart($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`

export const UPDATE_CART_MUTATION = `
  mutation UpdateCart($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`

export const REMOVE_FROM_CART_MUTATION = `
  mutation RemoveFromCart($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
      cart {
        ...CartFragment
      }
      userErrors {
        field
        message
      }
    }
  }
  ${CART_FRAGMENT}
`

export const GET_CART_QUERY = `
  query GetCart($cartId: ID!) {
    cart(id: $cartId) {
      ...CartFragment
    }
  }
  ${CART_FRAGMENT}
`

export const GET_SHIPPING_INFO_QUERY = `
  query GetShippingInfo {
    shop {
      metafields(identifiers: [
        { namespace: "shipping", key: "free_shipping_threshold" },
        { namespace: "shipping", key: "delivery_days_france" },
        { namespace: "shipping", key: "delivery_days_international" },
        { namespace: "shipping", key: "standard_shipping_cost" },
        { namespace: "shipping", key: "express_shipping_cost" },
        { namespace: "shipping", key: "express_delivery_days" }
      ]) {
        id
        namespace
        key
        value
        type
      }
      }
    }
  }
`

export const GET_VARIANT_AVAILABILITY_QUERY = `
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
`

export const GET_PRODUCT_RECOMMENDATIONS_QUERY = `
  query productRecommendations($productId: ID!) {
    productRecommendations(productId: $productId) {
      ...ProductFragment
    }
  }
  ${PRODUCT_FRAGMENT}
`


