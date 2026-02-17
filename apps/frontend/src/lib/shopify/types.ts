export interface Image {
  url: string;
  altText?: string;
}

export interface ImageEdge {
  node: Image;
}

export interface ImageConnection {
  edges: ImageEdge[];
}

export interface Price {
  amount: string;
  currencyCode: string;
}

export interface SelectedOption {
  name: string;
  value: string;
}

export interface Variant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: SelectedOption[];
  price: number;
  compareAtPrice?: number;
  image?: Image;
}

export interface VariantEdge {
  node: Variant;
}

export interface VariantConnection {
  edges: VariantEdge[];
}

export interface ProductOption {
  id: string;
  name: string;
  values: string[];
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  descriptionHtml?: string;
  availableForSale: boolean;
  price: number;
  compareAtPrice?: number;
  currency: string;
  images: Image[];
  featuredImage?: string;
  variants?: Variant[];
  options?: ProductOption[];
  tags?: string[];
  vendor?: string;
  productType?: string;
  addedAt?: string;
  collections?: string[];
  media?: MediaConnection;
  firstVariantId?: string;
}

export interface Media {
  mediaContentType: "VIDEO" | "IMAGE";
  sources?: { url: string; mimeType: string }[];
  previewImage?: { url: string; altText?: string };
  image?: { url: string; altText?: string };
}

export interface MediaEdge {
  node: Media;
}

export interface MediaConnection {
  edges: MediaEdge[];
}

export interface Collection {
  id: string;
  handle: string;
  title: string;
  description: string;
  image?: Image;
  updatedAt?: string;
}

export interface ShopInfo {
  name: string;
  primaryDomain: {
    url: string;
  };
  paymentSettings: {
    currencyCode: string;
  };
  currencyCode?: string; // Helper property
}
export interface CartItem {
  id: string;
  variantId: string;
  quantity: number;
  title: string;
  price: number;
  image?: string;
  productTitle?: string;
  handle?: string;
}
export interface ShopifyProduct {
  id: string;
  title: string;
  handle: string;
  description?: string;
  priceRange?: PriceRange;
  variants?: {
    edges: Array<{
      node: ShopifyVariant;
    }>;
  };
}

export interface ShopifyVariant {
  id: string;
  title: string;
  price: Price;
  compareAtPrice?: Price;
  availableForSale: boolean;
}

export interface PriceRange {
  minVariantPrice?: Price;
  maxVariantPrice?: Price;
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  cost: {
    totalAmount: Price;
    subtotalAmount: Price;
  };
  lines: {
    edges: Array<{
      node: ShopifyCartLine;
    }>;
  };
}

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  cost: {
    totalAmount: Price;
  };
  merchandise: ShopifyVariant;
}
