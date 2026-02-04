/**
 * 🍍 JOLANANAS - Produits les Plus Commandés
 * ===========================================
 * Affichage des produits les plus commandés par l'utilisateur
 */

'use client';

import React from 'react';
import { EnhancedCard } from '@/components/ui/card/EnhancedCard';
import { Star, ShoppingBag } from 'lucide-react';
import Image from 'next/image';
import { useCurrency } from '@/hooks/useCurrency';

interface TopProduct {
  productId: string;
  title: string;
  quantity: number;
  totalSpent: number;
  imageUrl: string | null;
}

interface DashboardTopProductsProps {
  topProducts: TopProduct[];
}

export function DashboardTopProducts({ topProducts }: DashboardTopProductsProps) {
  const { formatPrice } = useCurrency();
  
  const formatCurrency = (amount: number) => {
    return formatPrice(amount);
  };

  if (topProducts.length === 0) {
    return (
      <EnhancedCard hoverEffect="spotlight" blobColor="bg-yellow-600/20 dark:bg-yellow-400/30">
        <EnhancedCard.Header>
          <EnhancedCard.Title className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Produits favoris
          </EnhancedCard.Title>
          <EnhancedCard.Description>
            Vos produits les plus commandés
          </EnhancedCard.Description>
        </EnhancedCard.Header>
        <EnhancedCard.Content>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <ShoppingBag className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">Aucun produit</p>
            <p className="text-xs mt-1">Vos produits favoris apparaîtront ici</p>
          </div>
        </EnhancedCard.Content>
      </EnhancedCard>
    );
  }

  return (
    <EnhancedCard hoverEffect="spotlight" blobColor="bg-yellow-600/20 dark:bg-yellow-400/30">
      <EnhancedCard.Header>
        <EnhancedCard.Title className="flex items-center gap-2">
          <Star className="h-5 w-5" />
          Produits favoris
        </EnhancedCard.Title>
        <EnhancedCard.Description>
          Vos produits les plus commandés
        </EnhancedCard.Description>
      </EnhancedCard.Header>
      <EnhancedCard.Content>
        <div className="space-y-4">
          {topProducts.map((product, index) => (
            <div
              key={product.productId}
              className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              {/* Badge de classement */}
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                  {index + 1}
                </div>
              </div>

              {/* Image du produit */}
              {product.imageUrl ? (
                <div className="flex-shrink-0">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden border">
                    <Image
                      src={product.imageUrl}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-shrink-0 w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                  <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                </div>
              )}

              {/* Informations du produit */}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate">{product.title}</h4>
                <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                  <span>{product.quantity} article{product.quantity > 1 ? 's' : ''}</span>
                  <span>•</span>
                  <span>{formatCurrency(product.totalSpent)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </EnhancedCard.Content>
    </EnhancedCard>
  );
}

