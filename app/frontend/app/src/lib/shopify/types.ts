// Shopify Storefront API Types

/**
 * Type pour les objets Money de Shopify (toujours avec currencyCode)
 */
export interface ShopifyMoney {
  amount: string
  currencyCode: string
}

/**
 * Type pour les PriceRange de Shopify (toujours avec currencyCode)
 */
export interface ShopifyPriceRange {
  minVariantPrice: ShopifyMoney
  maxVariantPrice: ShopifyMoney
}

export interface ShopifyProduct {
  id: string
  title: string
  handle: string
  description: string
  descriptionHtml: string
  availableForSale: boolean
  priceRange: ShopifyPriceRange
  images: {
    edges: Array<{
      node: {
        url: string
        altText: string | null
        width: number
        height: number
      }
    }>
  }
  options?: Array<{
    name: string
    values: string[]
  }>
  variants: {
    edges: Array<{
      node: ShopifyVariant
    }>
  }
  tags: string[]
  collections: {
    edges: Array<{
      node: {
        id: string
        title: string
        handle: string
      }
    }>
  }
}

export interface ShopifyVariant {
  id: string
  title: string
  availableForSale: boolean
  price: ShopifyMoney
  compareAtPrice: ShopifyMoney | null
  selectedOptions: Array<{
    name: string
    value: string
  }>
  image: {
    url: string
    altText: string | null
    width: number
    height: number
  } | null
}

export interface ShopifyCollection {
  id: string
  title: string
  handle: string
  description: string
  image: {
    url: string
    altText: string | null
    width: number
    height: number
  } | null
  products: {
    edges: Array<{
      node: ShopifyProduct
    }>
  }
}

export interface ShopifyCart {
  id: string
  checkoutUrl: string
  cost: {
    subtotalAmount: ShopifyMoney
    totalAmount: ShopifyMoney
    totalTaxAmount: ShopifyMoney | null
  }
  lines: {
    edges: Array<{
      node: ShopifyCartLine
    }>
  }
  totalQuantity: number
}

export interface ShopifyCartLine {
  id: string
  quantity: number
  merchandise: ShopifyVariant
  cost: {
    totalAmount: ShopifyMoney
  }
}

// Simplified types for frontend use
export interface Product {
  id: string
  title: string
  handle: string
  description: string
  price: number
  compareAtPrice: number | null
  currency: string
  images: string[]
  availableForSale: boolean
  tags: string[]
  collections: string[]
  firstVariantId?: string
  options?: Array<{
    name: string
    values: string[]
  }>
  variants?: Array<{
    id: string
    title: string
    availableForSale: boolean
    price: number
    compareAtPrice: number | null
    currency: string
    selectedOptions: Array<{
      name: string
      value: string
    }>
    image: string | null
  }>
}

export interface CartItem {
  id: string
  variantId: string
  productId: string
  title: string
  price: number
  quantity: number
  image: string
  handle: string
}
