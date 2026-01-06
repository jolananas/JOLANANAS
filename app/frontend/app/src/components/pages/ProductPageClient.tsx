/**
 * 🍍 JOLANANAS - Composant Client Page Produit
 * =============================================
 * Client Component pour la page produit qui charge les données depuis l'API
 */

'use client';

import { useProduct } from '@/app/src/hooks/useProduct';
import { ProductOverview } from '@/app/src/components/ecommerce/product/ProductOverview';
import { Skeleton } from '@/components/ui/Skeleton';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { transformShopifyError } from '@/app/src/lib/utils/shopify-error-handler';

interface ProductPageClientProps {
  handle: string;
}

export function ProductPageClient({ handle }: ProductPageClientProps) {
  const { product, relatedProducts, isLoading, isError, error } = useProduct(handle);

  // État de chargement
  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <section className="container py-8 md:py-12">
          <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
            <Skeleton className="h-[600px] w-full" />
            <div className="space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </section>
      </main>
    );
  }

  // État d'erreur 404
  if ((isError && error?.message?.includes('404')) || (!isLoading && !product)) {
    return (
      <main className="min-h-screen bg-background">
        <section className="container py-8 md:py-12">
          <Card>
            <CardHeader>
              <CardTitle>Produit non trouvé</CardTitle>
              <CardDescription>
                Le produit que vous recherchez n'existe pas ou a été supprimé.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/">
                <Button>Retour à l'accueil</Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>
    );
  }

  // État d'erreur autre
  if (isError) {
    const userFriendlyError = transformShopifyError(error, 'ProductPageClient');
    return (
      <main className="min-h-screen bg-background">
        <section className="container py-8 md:py-12">
          <Alert variant="destructive">
            <AlertDescription>
              {userFriendlyError}
            </AlertDescription>
          </Alert>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <section className="container py-8 md:py-12">
        <ProductOverview product={product} relatedProducts={relatedProducts} />
      </section>
    </main>
  );
}

