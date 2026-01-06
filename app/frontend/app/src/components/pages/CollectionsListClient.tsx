'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiGet } from '@/app/src/lib/api-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';

interface Collection {
  handle: string;
  title: string;
  description: string;
  productCount: number;
  image: string | null;
}

export function CollectionsListClient() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setIsLoading(true);
        setIsNotFound(false);

        const collectionsData = await apiGet<Collection[]>('/api/collections');

        if (!collectionsData || collectionsData.length === 0) {
          setIsNotFound(true);
          return;
        }

        setCollections(collectionsData);
      } catch (err: unknown) {
        const apiError = err as { status?: number; message?: string };

        if (apiError.status === 404 || apiError.message?.includes('404') || apiError.message?.includes('non trouvée')) {
          console.warn('⚠️ Collections non trouvées');
          setIsNotFound(true);
          return;
        }

        console.error('❌ Erreur lors du chargement des collections:', err);
        setIsNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollections();
  }, []);

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container py-8 md:py-12">
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-4" />
            <Skeleton className="h-6 w-96" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Card key={i}>
                <Skeleton className="h-48 w-full" />
                <CardHeader>
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full" />
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (isNotFound || collections.length === 0) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container py-8 md:py-12">
          <Card>
            <CardHeader>
              <CardTitle>Aucune collection disponible</CardTitle>
              <CardDescription>
                Il n'y a actuellement aucune collection disponible dans notre catalogue.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/">
                <Button>Retour à l'accueil</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container py-8 md:py-12">
        <div className="mb-8 md:mb-12">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Toutes nos Collections</h1>
          <p className="text-muted-foreground text-lg">
            Découvrez notre sélection exclusive de collections artisanales
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Link key={collection.handle} href={`/collections/${collection.handle}`} className="block h-full">
              <Card className="h-full hover:shadow-lg transition-shadow">
                {collection.image && (
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <img
                      src={collection.image}
                      alt={collection.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{collection.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {collection.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {collection.productCount} {collection.productCount === 1 ? 'produit' : 'produits'}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}

