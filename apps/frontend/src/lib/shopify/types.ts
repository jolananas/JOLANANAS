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

export interface SellingPlanPriceAdjustment {
  orderCount?: number;
  adjustmentValue: {
    adjustmentAmount?: {
      amount: string;
      currencyCode: string;
    };
    adjustmentPercentage?: number;
  };
}

export interface SellingPlan {
  id: string;
  name: string;
  description?: string;
  options: {
    name: string;
    value: string;
  }[];
  priceAdjustments: SellingPlanPriceAdjustment[];
}

export interface SellingPlanGroup {
  name: string;
  options: {
    name: string;
    values: string[];
  }[];
  sellingPlans: {
    edges: {
      node: SellingPlan;
    }[];
  };
}

export interface Variant {
  id: string;
  title: string;
  availableForSale: boolean;
  selectedOptions: SelectedOption[];
  price: number;
  compareAtPrice?: number;
  quantityAvailable?: number;
  inventoryPolicy?: "DENY" | "CONTINUE";
  image?: Image;
  sku?: string;
  barcode?: string;
  weight?: number;
  weightUnit?: string;
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
  material?: {
    reference?: {
      id: string;
      handle: string;
      type: string;
      fields: {
        key: string;
        value: string;
      }[];
    };
  };
  sellingPlanGroups?: SellingPlanGroup[];
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
  sellingPlanId?: string;
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
  sellingPlanGroups?: {
    edges: Array<{
      node: SellingPlanGroup;
    }>;
  };
}

export interface ShopifyVariant {
  id: string;
  title: string;
  price: Price;
  compareAtPrice?: Price;
  availableForSale: boolean;
  quantityAvailable?: number;
  inventoryPolicy?: "DENY" | "CONTINUE";
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
  sellingPlanAllocation?: {
    sellingPlan: {
      id: string;
      name: string;
    };
  };
}

export interface Blog {
  handle: string;
  title: string;
}

export interface Article {
  id: string;
  handle: string;
  title: string;
  excerpt?: string;
  excerptHtml?: string;
  contentHtml: string;
  publishedAt: string;
  image?: Image;
  author?: {
    name: string;
  };
  blog: Blog;
}

export interface MetaobjectField {
  key: string;
  value: string;
  reference?: {
    id: string;
    image?: {
      url: string;
      altText?: string;
    };
  };
}

export interface Metaobject {
  id: string;
  handle: string;
  type: string;
  fields: MetaobjectField[];
}
