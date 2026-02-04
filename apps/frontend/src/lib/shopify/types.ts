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
  price: Price;
  compareAtPrice?: Price;
  image?: Image;
}

export interface VariantEdge {
  node: Variant;
}

export interface VariantConnection {
  edges: VariantEdge[];
}

export interface Product {
  id: string;
  handle: string;
  title: string;
  description: string;
  availableForSale: boolean;
  priceRange: {
    minVariantPrice: Price;
  };
  addedAt: string;
  images: ImageConnection;
  variants: VariantConnection;
  featuredImage?: Image;
  collections?: string[];
  tags?: string[];
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
