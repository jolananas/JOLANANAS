/**
 * 🍍 JOLANANAS - Types eCommerce
 * ==============================
 * Types TypeScript pour les composants eCommerce
 * Étendus depuis les types Shopify existants
 */

import type { Product, CartItem, Media } from "@/lib/shopify/types";

/**
 * Produit étendu pour les composants eCommerce
 */
export interface EcommerceProduct extends Omit<Product, "variants"> {
  // Variantes détaillées
  variants?: Array<{
    id: string;
    title: string;
    price: number;
    compareAtPrice?: number;
    availableForSale: boolean;
    selectedOptions: Array<{
      name: string;
      value: string;
    }>;
    image?: string;
  }>;

  // Métadonnées supplémentaires
  seo?: {
    title?: string;
    description?: string;
  };

  // Statistiques (calculées)
  averageRating?: number;
  reviewCount?: number;
  salesCount?: number;
}

/**
 * Item de panier étendu
 */
export interface EcommerceCartItem extends Omit<CartItem, "selectedOptions"> {
  // Informations supplémentaires
  variantTitle?: string;
  selectedOptions?: Array<{
    name: string;
    value: string;
  }>;

  // Métadonnées
  addedAt?: Date;
  updatedAt?: Date;
}

/**
 * Avis produit
 */
export interface ProductReview {
  id: string;
  productId: string;
  shopifyCustomerId?: string; // ID client Shopify (remplace userId)
  userId?: string; // Déprécié - utiliser shopifyCustomerId
  userName: string;
  rating: number; // 1-5
  title?: string;
  comment: string;
  verifiedPurchase?: boolean;
  helpfulCount?: number;
  createdAt: Date;
  updatedAt?: Date;

  // Réponse du vendeur
  response?: {
    message: string;
    respondedAt: Date;
  };
}

/**
 * Statistiques d'avis
 */
export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  verifiedPurchases: number;
}

/**
 * Options de filtre
 */
export interface FilterOptions {
  // Filtres par collection
  collections?: string[];

  // Filtres par prix
  priceRange?: {
    min: number;
    max: number;
  };

  // Filtres par tags
  tags?: string[];

  // Filtres par disponibilité
  availability?: "all" | "in-stock" | "out-of-stock";

  // Filtres par note
  minRating?: number;

  // Tri
  sortBy?:
    | "price-asc"
    | "price-desc"
    | "newest"
    | "oldest"
    | "name-asc"
    | "name-desc"
    | "rating";

  // Pagination
  page?: number;
  limit?: number;
}

/**
 * Résultats de filtrage
 */
export interface FilterResults {
  products: Product[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
}

/**
 * Options de tri
 */
export type SortOption =
  | "price-asc"
  | "price-desc"
  | "newest"
  | "oldest"
  | "name-asc"
  | "name-desc"
  | "rating"
  | "popularity";

/**
 * Vue d'affichage (grille ou liste)
 */
export type ViewMode = "grid" | "list";

/**
 * Options d'affichage
 */
export interface DisplayOptions {
  viewMode: ViewMode;
  itemsPerPage: number;
  sortBy: SortOption;
}

/**
 * Commande
 */
export interface Order {
  id: string;
  orderNumber: string;
  shopifyCustomerId?: string; // ID client Shopify (remplace userId)
  userId?: string; // Déprécié - utiliser shopifyCustomerId
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  currency: string;
  shippingAddress?: Address;
  billingAddress?: Address;
  paymentMethod?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Statut de commande
 */
export type OrderStatus =
  | "pending"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded";

/**
 * Item de commande
 */
export interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  title: string;
  variantTitle?: string;
  quantity: number;
  price: number;
  image?: string;
  handle: string;
}

/**
 * Adresse
 */
export interface Address {
  id?: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  postalCode: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}

/**
 * Informations de livraison
 */
export interface ShippingInfo {
  method: string;
  cost: number;
  estimatedDays: number;
  trackingNumber?: string;
}

/**
 * Informations de paiement
 */
export interface PaymentInfo {
  method: "card" | "paypal" | "apple-pay" | "google-pay" | "shopify-pay";
  last4?: string;
  brand?: string;
}

/**
 * Code promo
 */
export interface PromoCode {
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  validUntil?: Date;
  applicableProducts?: string[];
  applicableCollections?: string[];
}

/**
 * Offre promotionnelle
 */
export interface Offer {
  id: string;
  title: string;
  description: string;
  type: "discount" | "free-shipping" | "gift" | "bundle";
  value?: number;
  conditions?: {
    minCartValue?: number;
    applicableProducts?: string[];
    applicableCollections?: string[];
  };
  validFrom: Date;
  validUntil: Date;
  isActive: boolean;
}

/**
 * Collection étendue
 */
export interface EcommerceCollection {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image?: string;
  productCount: number;
  seo?: {
    title?: string;
    description?: string;
  };
}

/**
 * Catégorie de filtre
 */
export interface FilterCategory {
  id: string;
  name: string;
  type: "collection" | "price" | "tag" | "availability" | "rating";
  options: FilterOption[];
}

/**
 * Option de filtre
 */
export interface FilterOption {
  id: string;
  label: string;
  value: string;
  count?: number;
  selected?: boolean;
}

/**
 * État de chargement
 */
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
  isEmpty: boolean;
}

/**
 * État vide avec microcopy
 */
export interface EmptyState {
  title: string;
  description: string;
  icon?: string;
  action?: {
    label: string;
    href: string;
  };
}

/**
 * Métadonnées de pagination
 */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Props communes pour les composants eCommerce
 */
export interface BaseEcommerceProps {
  className?: string;
  variant?: "default" | "compact" | "featured" | "minimal";
}
