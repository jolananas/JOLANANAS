/**
 * 🍍 JOLANANAS - Page Favoris
 * ===========================
 * Page affichant tous les produits favoris de l'utilisateur
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { FavoritesGrid } from '@/app/src/components/favorites/FavoritesGrid';
import type { Product } from '@/app/src/lib/shopify/types';

export default function FavoritesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer tous les produits pour pouvoir afficher les favoris
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/products');
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des produits');
        }
        
        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Erreur lors du chargement des produits:', err);
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <main className="container py-12 md:py-16">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Chargement de vos favoris...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container py-12 md:py-16">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="text-destructive mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-12 md:py-16">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* En-tête */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="h-8 w-8 text-primary fill-primary" />
            <h1 className="font-serif text-4xl font-bold tracking-tight md:text-5xl">
              Mes Favoris
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Retrouvez tous vos produits favoris en un seul endroit
          </p>
        </div>

        {/* Grille de favoris */}
        <FavoritesGrid products={products} />
      </div>
    </main>
  );
}

