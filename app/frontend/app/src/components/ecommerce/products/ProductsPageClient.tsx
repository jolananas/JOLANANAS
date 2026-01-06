'use client';

import { useEffect, useState } from 'react';
import { ProductCategory } from '@/app/src/components/ecommerce/product/ProductCategory';
import { CategoryFilter } from '@/app/src/components/ecommerce/filters/CategoryFilter';
import { apiGet } from '@/app/src/lib/api-client';
import type { Product, FilterOptions } from '@/app/src/lib/shopify/types';

export function ProductsPageClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    availability: 'all',
    sortBy: 'newest',
  });

  useEffect(() => {
    // Utiliser l'API route au lieu d'appeler directement getAllProducts (server-only)
    apiGet<Product[]>('/api/products')
      .then((data) => {
        setProducts(data || []);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error('❌ Erreur lors du chargement des produits:', error);
        setIsLoading(false);
        setProducts([]);
      });
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container py-12">
          <div className="text-center">Chargement des produits...</div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container py-8 md:py-12">
        <div className="grid gap-8 lg:grid-cols-4">
          {/* Filtres */}
          <div className="lg:col-span-1">
            <CategoryFilter
              onFilterChange={setFilters}
              initialFilters={filters}
              availableTags={Array.from(new Set(products.flatMap((p) => p.tags)))}
              priceRange={
                products.length > 0
                  ? {
                      min: Math.floor(Math.min(...products.map((p) => p.price))),
                      max: Math.ceil(Math.max(...products.map((p) => p.price))),
                    }
                  : undefined
              }
            />
          </div>

          {/* Produits */}
          <div className="lg:col-span-3">
            <ProductCategory
              products={products}
              collectionTitle="Tous nos produits"
              collectionDescription="Découvrez notre collection complète de créations artisanales"
            />
          </div>
        </div>
      </div>
    </main>
  );
}

