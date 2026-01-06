/**
 * 🍍 JOLANANAS - Composant Client Page Collection
 * ===============================================
 * Client Component pour la page collection qui charge les données depuis l'API
 */

'use client';

import { useEffect, useState } from 'react';
import { ProductCategory } from '@/app/src/components/ecommerce/product/ProductCategory';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { apiGet } from '@/app/src/lib/api-client';
import Link from 'next/link';
import type { Product } from '@/app/src/lib/shopify/types';

interface CollectionData {
  handle: string;
  title: string;
  description: string;
  image: string | null;
  productCount: number;
  products: Product[];
}

interface CollectionPageClientProps {
  handle: string;
}

export function CollectionPageClient({ handle }: CollectionPageClientProps) {
  const [collection, setCollection] = useState<CollectionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    const fetchCollection = async () => {
      try {
        setIsLoading(true);
        setIsNotFound(false);
        
        // Appel API côté client
        const collectionData = await apiGet<CollectionData>(`/api/collections/${handle}`);
        
        if (!collectionData) {
          setIsNotFound(true);
          return;
        }
        
        setCollection(collectionData);
      } catch (err: unknown) {
        // Gérer silencieusement les erreurs 404
        const apiError = err as { status?: number; message?: string };
        
        if (apiError.status === 404 || apiError.message?.includes('404') || apiError.message?.includes('non trouvée')) {
          console.warn(`⚠️ Collection "${handle}" non trouvée`);
          setIsNotFound(true);
          return;
        }
        
        // Pour les autres erreurs, logger mais ne pas afficher à l'utilisateur
        console.error('❌ Erreur lors du chargement de la collection:', err);
        setIsNotFound(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCollection();
  }, [handle]);

  // État de chargement
  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container py-8 md:py-12">
          <div className="mb-8">
            <Skeleton className="h-10 w-64 mb-4" />
            <Skeleton className="h-6 w-full max-w-2xl" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-96 w-full" />
            ))}
          </div>
        </div>
      </main>
    );
  }

  // État 404 - Collection non trouvée (géré silencieusement)
  if (isNotFound || !collection) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container py-8 md:py-12">
          <Card>
            <CardHeader>
              <CardTitle>Collection non trouvée</CardTitle>
              <CardDescription>
                La collection que vous recherchez n'existe pas ou a été supprimée.
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

  if (!collection) {
    return null;
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container py-8 md:py-12">
        <ProductCategory
          products={collection.products}
          collectionHandle={collection.handle}
          collectionTitle={collection.title}
          collectionDescription={collection.description}
        />
      </div>
    </main>
  );
}

