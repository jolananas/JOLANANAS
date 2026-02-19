"use client";

import React from "react";
import { useCartStore } from "@/lib/stores/cartStore";
import { useCurrency } from "@/hooks/useCurrency";
import { EnhancedCard } from "@/components/ui/card/EnhancedCard";

import type { Product } from "@/lib/shopify/types";

interface SimpleProductCardProps {
  product: Product;
}

export function SimpleProductCard({ product }: SimpleProductCardProps) {
  const { addItem, totalItems, openCart } = useCartStore();

  // Récupérer le premier variant comme default
  const firstVariant = product.variants?.[0];

  if (!firstVariant) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="text-gray-500">Produit indisponibles</div>
      </div>
    );
  }

  // Utiliser le hook pour extraire automatiquement le currencyCode et formater les prix
  const { formatPrice, currency } = useCurrency(product.currency);

  const variantId = firstVariant.id;
  const priceValue = firstVariant.price;
  const price = formatPrice(priceValue, currency);
  const imageUrl = product.featuredImage || product.images?.[0]?.url;
  const imageAlt = product.images?.[0]?.altText || product.title;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();

    // Créer l'item pour le panier persisté
    const cartItem = {
      id: `${product.id}-${variantId}`,
      quantity: 1,
      price: priceValue,
      title: product.title,
      ...(imageUrl && { image: imageUrl }),
      variant: {
        id: variantId,
        title: "Produit standard",
      },
    };

    console.log("🛒 Ajout au panier persisté:", cartItem);

    // Ajouter au store local
    addItem(cartItem);

    // Ouvrir le panier pour feedback visuel
    openCart();

    // TODO: Sync avec API persistée (/api/cart)
  };

  const isAvailable = firstVariant.availableForSale;

  return (
    <EnhancedCard
      hoverEffect="spotlight"
      blobColor="bg-jolananas-pink-medium/60 dark:bg-jolananas-pink-deep/60"
      useCard={false}
      className="group bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-none group-hover:bg-white/90 h-full backdrop-blur-[20px]"
    >
      {/* Image Produit */}
      <div className="relative w-full aspect-[4/5] overflow-hidden rounded-sm bg-secondary/10">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={imageAlt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-muted">
            <span className="text-jolananas-pink-deep font-medium">
              🍍 JOLANANAS
            </span>
          </div>
        )}

        {/* Badge Disponibilité */}
        <div
          className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
            isAvailable
              ? "bg-black text-white"
              : "bg-red-500 text-white"
          }`}
        >
          {isAvailable ? "Disponible" : "Épuisé"}
        </div>
      </div>

      {/* Infos Produit */}
      <div className="p-4 flex flex-col items-center text-center space-y-2">
        <h3 className="font-serif font-medium text-sm leading-tight text-primary transition-colors group-hover:text-primary line-clamp-1">
          {product.title}
        </h3>

        <p className="text-[10px] text-muted-foreground line-clamp-1 leading-relaxed opacity-80">
          {product.description}
        </p>

        {/* Prix */}
        <div className="flex items-center justify-center gap-2 pt-1">
          <span className="font-semibold text-sm text-primary">
            {price}
          </span>
        </div>

        {/* Bouton Ajout Panier */}
        <button
          onClick={handleAddToCart}
          disabled={!isAvailable}
          className={`w-full mt-4 py-2 px-4 rounded-full text-xs font-bold transition-all duration-200 ${
            isAvailable
              ? "bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isAvailable ? "🛒 Ajouter" : "Épuisé"}
        </button>
      </div>
    </EnhancedCard>
  );
}

/**
 * 🎯 Composant List View (pour les pages de liste)
 */
export function SimpleProductCardList({ product }: SimpleProductCardProps) {
  const { addItem, openCart } = useCartStore();
  const firstVariant = product.variants?.[0];

  if (!firstVariant) return null;

  // Utiliser le hook pour extraire automatiquement le currencyCode et formater les prix
  const { formatPrice, currency } = useCurrency(product.currency);

  const variantId = firstVariant.id;
  const priceValue = firstVariant.price;
  const price = formatPrice(priceValue, currency);
  const imageUrl = product.featuredImage || product.images?.[0]?.url;
  const isAvailable = firstVariant.availableForSale;

  const handleAddToCart = async () => {
    const cartItem = {
      id: `${product.id}-${variantId}`,
      quantity: 1,
      price: priceValue,
      title: product.title,
      ...(imageUrl && { image: imageUrl }),
      variant: {
        id: variantId,
        title: "Produit standard",
      },
    };

    console.log("🛒 Ajout rapide:", cartItem);
    addItem(cartItem);
    openCart();
  };

  return (
    <div className="flex bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4">
      {/* Image */}
      <div className="w-20 h-20 bg-gradient-to-br from-jolananas-peach-light to-jolananas-pink-medium rounded-lg overflow-hidden flex-shrink-0 mr-4">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs">
            🍍
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-primary line-clamp-1 mb-1">
          {product.title}
        </h3>
        <p className="text-sm text-gray-600 mb-2">{price}</p>

        <button
          onClick={handleAddToCart}
          disabled={!isAvailable}
          className={`text-sm px-3 py-1 rounded ${
            isAvailable
              ? "bg-jolananas-pink-medium text-white hover:bg-jolananas-pink-deep"
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isAvailable ? "Ajouter" : "Épuisé"}
        </button>
      </div>
    </div>
  );
}
