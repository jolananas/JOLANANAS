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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';

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
        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Skeleton className="h-12 w-12 rounded-full mb-4" />
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container py-12 md:py-16">
        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={() => window.location.reload()}>
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="container py-12 md:py-16">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* En-tête avec Card */}
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Badge variant="default" className="h-8 w-8 p-0 flex items-center justify-center">
                <Heart className="h-4 w-4 fill-primary" />
              </Badge>
              <CardTitle className="font-serif text-4xl font-bold tracking-tight md:text-5xl">
                Mes Favoris
              </CardTitle>
            </div>
            <CardDescription className="text-lg max-w-2xl mx-auto">
              Retrouvez tous vos produits favoris en un seul endroit
            </CardDescription>
          </CardHeader>
        </Card>

        {/* Grille de favoris */}
        <FavoritesGrid products={products} />
      </div>
    </main>
  );
}

