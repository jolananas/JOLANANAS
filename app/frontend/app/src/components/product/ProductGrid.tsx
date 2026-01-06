/**
 * 🍍 JOLANANAS - Product Grid Hydrogen Style
 * =========================================
 * Grille de produits avec pagination et filtres
 */

'use client';

import React from 'react';
import { ProductCard } from './ProductCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/Empty';

interface Product {
  id: string;
  title: string;
  handle: string;
  featuredImage?: {
    url: string;
    altText?: string;
  };
  variants?: {
    edges: Array<{
      node: {
        price: {
          amount: string;
          currencyCode: string;
        };
        compareAtPrice?: {
          amount: string;
          currencyCode: string;
        };
        availableForSale: boolean;
      };
    }>;
  };
}

interface ProductGridProps {
  products: Product[];
  title?: string;
  description?: string;
  showTitle?: boolean;
}

export function ProductGrid({ products, title = "Nos Produits", description, showTitle = true }: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <section className="py-20 px-4">
        <div className="container mx-auto">
          {showTitle && (
            <h2 className="text-3xl font-bold text-jolananas-black-ink mb-8 text-center">
              {title}
            </h2>
          )}
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <span className="text-4xl">🍍</span>
              </EmptyMedia>
              <EmptyTitle>Aucun produit disponible</EmptyTitle>
              <EmptyDescription>
                Aucun produit disponible pour le moment.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        {showTitle && (
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-jolananas-black-ink mb-4">
              {title}
            </h2>
            {description && (
              <p className="text-lg text-jolananas-black-ink/70 max-w-2xl mx-auto">
                {description}
              </p>
            )}
          </div>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
      </div>
    </section>
  );
}