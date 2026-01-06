/**
 * 🍍 JOLANANAS - Simple Product Card MVP
 * =====================================
 * Version SIMPLIFIÉE avec cart PERSISTÉ UNIFIÉ
 */

'use client';

import React from 'react';
import { useCartStore } from '@/app/src/lib/stores/cartStore';
import { useCurrency } from '@/hooks/useCurrency';
import { EnhancedCard } from '@/components/ui/card/EnhancedCard';

interface SimpleProductCardProps {
  product: {
    id: string;
    title: string;
    handle: string;
    description?: string;
    images?: {
      edges: Array<{
        node: {
          url: string;
          altText?: string;
        };
      }>;
    };
    variants?: {
      edges: Array<{
        node: {
          id: string;
          price: {
            amount: string;
            currencyCode: string;
          };
          availableForSale: boolean;
        };
      }>;
    };
  };
}

export function SimpleProductCard({ product }: SimpleProductCardProps) {
  const { addItem, totalItems, openCart } = useCartStore();
  
  // Récupérer le premier variant comme default
  const firstVariant = product.variants?.edges[0]?.node;
  
  if (!firstVariant) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="text-gray-500">Produit indisponibles</div>
      </div>
    );
  }

  // Utiliser le hook pour extraire automatiquement le currencyCode et formater les prix
  const currencyCode = firstVariant.price?.currencyCode;
  const { formatPrice, currency } = useCurrency(currencyCode);

  const variantId = firstVariant.id;
  const priceValue = parseFloat(firstVariant.price.amount);
  const price = formatPrice(priceValue, currency);
  const imageUrl = product.images?.edges[0]?.node?.url;
  const imageAlt = product.images?.edges[0]?.node?.altText || product.title;

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
        title: 'Produit standard',
      },
    };

    console.log('🛒 Ajout au panier persisté:', cartItem);
    
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
      <div className="aspect-square bg-gradient-to-br from-jolananas-peach-light to-jolananas-pink-medium relative overflow-hidden">
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={imageAlt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-jolananas-pink-deep font-medium">🍍 JOLANANAS</span>
          </div>
        )}
        
        {/* Badge Disponibilité */}
        <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${
          isAvailable 
            ? 'bg-jolananas-green text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {isAvailable ? 'Disponible' : 'Épuisé'}
        </div>
      </div>

      {/* Infos Produit */}
      <div className="p-4">
        <h3 className="font-bold text-lg text-jolananas-black-ink mb-2 line-clamp-2">
          {product.title}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description || 'Création artisanale exclusive JOLANANAS'}
        </p>

        {/* Prix */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-2xl font-bold text-jolananas-pink-deep">
            {price}
          </span>
        </div>

        {/* Bouton Ajout Panier */}
        <button
          onClick={handleAddToCart}
          disabled={!isAvailable}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
            isAvailable
              ? 'bg-gradient-to-r from-jolananas-pink-medium to-jolananas-pink-deep text-white hover:from-jolananas-pink-deep hover:to-jolananas-peach-bright hover:shadow-lg transform hover:-translate-y-0.5'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isAvailable ? '🛒 Ajouter au Panier' : '❌ Produit Épuisé'}
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
  const firstVariant = product.variants?.edges[0]?.node;
  
  if (!firstVariant) return null;

  // Utiliser le hook pour extraire automatiquement le currencyCode et formater les prix
  const currencyCode = firstVariant.price?.currencyCode;
  const { formatPrice, currency } = useCurrency(currencyCode);

  const variantId = firstVariant.id;
  const priceValue = parseFloat(firstVariant.price.amount);
  const price = formatPrice(priceValue, currency);
  const imageUrl = product.images?.edges[0]?.node?.url;
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
        title: 'Produit standard',
      },
    };

    console.log('🛒 Ajout rapide:', cartItem);
    addItem(cartItem);
    openCart();
  };

  return (
    <div className="flex bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4">
      {/* Image */}
      <div className="w-20 h-20 bg-gradient-to-br from-jolananas-peach-light to-jolananas-pink-medium rounded-lg overflow-hidden flex-shrink-0 mr-4">
        {imageUrl ? (
          <img src={imageUrl} alt={product.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-xs">
            🍍
          </div>
        )}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-jolananas-black-ink line-clamp-1 mb-1">
          {product.title}
        </h3>
        <p className="text-sm text-gray-600 mb-2">
          {price}
        </p>
        
        <button
          onClick={handleAddToCart}
          disabled={!isAvailable}
          className={`text-sm px-3 py-1 rounded ${
            isAvailable
              ? 'bg-jolananas-pink-medium text-white hover:bg-jolananas-pink-deep'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isAvailable ? 'Ajouter' : 'Épuisé'}
        </button>
      </div>
    </div>
  );
}
