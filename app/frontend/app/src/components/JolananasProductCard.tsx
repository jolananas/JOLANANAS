/**
 * 🍍 JOLANANAS - Jolananas Product Card
 * ======================================
 * Carte produit spécifique JOLANANAS
 */

'use client';

import React from 'react';
import { ProductCard } from './product/ProductCard';

interface JolananasProductCardProps {
  product: {
    id: string;
    title: string;
    handle: string;
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

export function JolananasProductCard({ product }: JolananasProductCardProps) {
  return (
    <div className="bg-gradient-to-br from-jolananas-peach-light to-jolananas-pink-medium rounded-lg p-1">
      <ProductCard product={product} />
    </div>
  );
}
