/**
 * 🍍 JOLANANAS - Composant Client Page d'Accueil
 * ===============================================
 * Client Component pour la page d'accueil qui charge les produits depuis l'API
 */

'use client';

import { useEffect, useState } from 'react';
import { HeroSection } from '@/components/sections/HeroSection';
import { AboutSection } from '@/components/sections/AboutSection';
import { CollectionsGrid } from '@/components/sections/CollectionsGrid';
import { ProductGrid } from '@/components/product/ProductGrid';
import { CategoryProductsSection } from '@/components/sections/CategoryProductsSection';
import { TrustSection } from '@/components/sections/TrustSection';
import { Skeleton } from '@/components/ui/Skeleton';
import { apiGet } from '@/app/src/lib/api-client';
import type { Product } from '@/app/src/lib/shopify/types';

export function HomePageClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Appel API côté client
        const productsData = await apiGet<Product[]>('/api/products');
        
        setProducts(productsData || []);
      } catch (err) {
        console.error('❌ Erreur lors du chargement des produits:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Filtrer les produits par catégorie pour les sections spécialisées
  const featuredProducts = products.slice(0, 4);
  const colliersProducts = products.filter(product => 
    product.title.toLowerCase().includes('collier') || 
    product.tags?.some(tag => tag.toLowerCase().includes('collier'))
  ).slice(0, 4);
  
  const braceletsProducts = products.filter(product => 
    product.title.toLowerCase().includes('bracelet') || 
    product.tags?.some(tag => tag.toLowerCase().includes('bracelet'))
  ).slice(0, 4);

  // État de chargement
  if (isLoading) {
    return (
      <main className="min-h-screen">
        <HeroSection />
        <CollectionsGrid />
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <Skeleton className="h-10 w-64 mx-auto mb-4" />
              <Skeleton className="h-6 w-96 mx-auto" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-96 w-full" />
              ))}
            </div>
          </div>
        </section>
        <AboutSection />
        <TrustSection />
      </main>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <main className="min-h-screen">
        <HeroSection />
        <CollectionsGrid />
        <section className="py-20 px-4">
          <div className="container mx-auto text-center">
            <p className="text-destructive mb-4">Erreur lors du chargement des produits</p>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
        </section>
        <AboutSection />
        <TrustSection />
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection />
      
      {/* Collections Grid */}
      <CollectionsGrid />
      
      {/* Featured Products */}
      <ProductGrid 
        products={featuredProducts} 
        title="Nos créations"
        description="Découvrez notre sélection d'accessoires uniques, faits main avec passion et attention aux détails."
      />
      
      {/* Colliers Category */}
      {colliersProducts.length > 0 && (
        <CategoryProductsSection
          title="Nos Colliers Exclusifs"
          description="Découvrez notre collection de colliers artisanaux, créés avec des matériaux nobles et des techniques traditionnelles."
          products={colliersProducts}
          categoryHandle="colliers"
          maxProducts={4}
        />
      )}
      
      {/* Bracelets Category */}
      {braceletsProducts.length > 0 && (
        <CategoryProductsSection
          title="Bracelets Raffinés"
          description="Des bracelets uniques pour toutes les occasions, alliant élégance et confort."
          products={braceletsProducts}
          categoryHandle="bracelets"
          maxProducts={4}
        />
      )}
      
      {/* About */}
      <AboutSection />
      
      {/* Trust Section */}
      <TrustSection />
    </main>
  );
}

