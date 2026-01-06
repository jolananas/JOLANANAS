/**
 * 🍍 JOLANANAS - MVP STRICT PAGE
 * ==============================
 * Version minimale pour tester rapidement le marché
 */

'use client';

import { useState, useEffect } from 'react';
import { SimpleProductCard } from '@/app/src/components/product/SimpleProductCard';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { AspectRatio } from '@/components/ui/AspectRatio';
import Link from 'next/link';

// Types simplifiés pour l'API
interface Product {
  id: string;
  title: string;
  handle: string;
  description?: string;
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
        id: string;
        price: {
          amount: string;
          currencyCode: string;
        };
        availableForSale: boolean;
      };
    }>;
  };
}

interface Collections {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image?: {
    url: string;
    altText?: string;
  };
}

export default function MVPPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<Collections[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'collections'>('products');

  // Fetch des données
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Parallélisation des appels API
      const [productsResponse, collectionsResponse] = await Promise.all([
        fetch('/src/api/products?first=12'),
        fetch('/api/collections?first=6')
      ]);

      if (!productsResponse.ok || !collectionsResponse.ok) {
        throw new Error('Erreur lors du chargement des données');
      }

      const productsData = await productsResponse.json();
      const collectionsData = await collectionsResponse.json();

      setProducts(productsData.products?.edges?.map((edge: any) => edge.node) || []);
      setCollections(collectionsData.collections?.edges?.map((edge: any) => edge.node) || []);
      
    } catch (err) {
      console.error('❌ Erreur chargement data:', err);
      setError(err instanceof Error ? err.message : 'Erreur inconnue');
    } finally {
      setLoading(false);
    }
  };

  // États de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-jolananas-peach-light via-jolananas-pink-medium to-jolananas-pink-deep">
        <div className="container mx-auto px-4 py-16">
          <Card className="border-0 shadow-none bg-transparent">
            <CardContent className="text-center">
              <Skeleton className="h-12 w-12 rounded-full mx-auto mb-4" />
              <Skeleton className="h-6 w-64 mx-auto" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // État d'erreur
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-100 to-red-200">
        <div className="container mx-auto px-4 py-16">
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-red-800 mb-4 text-center">
                Oops ! Quelque chose s'est mal passé
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button onClick={fetchData}>
                Réessayer
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-jolananas-peach-light via-jolananas-pink-medium to-jolananas-pink-deep">
      
      {/* Header MVP avec Card */}
      <div className="bg-jolananas-white-soft bg-opacity-90 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <CardTitle className="text-4xl font-bold text-jolananas-black-ink">
                  JOLANANAS MVP
                </CardTitle>
                <Badge variant="secondary">Version simplifiée</Badge>
              </div>
              <CardDescription className="text-lg text-jolananas-pink-deep mb-6">
                Testez nos créations artisanales
              </CardDescription>
              
              {/* Tabs Navigation */}
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'products' | 'collections')} className="w-full">
                <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
                  <TabsTrigger value="products">
                    Produits <Badge variant="secondary" className="ml-2">{products.length}</Badge>
                  </TabsTrigger>
                  <TabsTrigger value="collections">
                    Collections <Badge variant="secondary" className="ml-2">{collections.length}</Badge>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Contenu Principal avec Cards */}
      <div className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'products' | 'collections')}>
          <TabsContent value="products">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-jolananas-white-soft text-center mb-8">
                  Nos Créations Artisanales
                </CardTitle>
              </CardHeader>
              <CardContent>
                {products.length === 0 ? (
                  <Card className="border-0 shadow-none bg-transparent">
                    <CardContent className="text-center py-12">
                      <Badge variant="secondary" className="text-4xl mb-4">🍍</Badge>
                      <CardDescription className="text-jolananas-white-soft text-lg">
                        Aucun produit disponible pour le moment
                      </CardDescription>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map((product) => (
                      <SimpleProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="collections">
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-jolananas-white-soft text-center mb-8">
                  Nos Collections
                </CardTitle>
              </CardHeader>
              <CardContent>
                {collections.length === 0 ? (
                  <Card className="border-0 shadow-none bg-transparent">
                    <CardContent className="text-center py-12">
                      <Badge variant="secondary" className="text-4xl mb-4">📂</Badge>
                      <CardDescription className="text-jolananas-white-soft text-lg">
                        Aucune collection disponible pour le moment
                      </CardDescription>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {collections.map((collection) => (
                      <CollectionCard key={collection.id} collection={collection} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer MVP avec Card */}
      <footer className="bg-jolananas-black-ink text-jolananas-white-soft">
        <div className="container mx-auto px-4 py-8">
          <Card className="border-0 shadow-none bg-transparent text-center">
            <CardContent>
              <CardDescription className="text-sm opacity-75">
                MVP JOLANANAS - Version de test simplifiée
              </CardDescription>
              <CardDescription className="text-xs opacity-50 mt-2">
                Cart natif Shopify • Paiement sécurisé • Build with ❤️ by AÏSSA BELKOUSSA
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </footer>
    </div>
  );
}

/**
 * 🎨 Composant Collection Card Simple avec ShadCN
 */
function CollectionCard({ collection }: { collection: Collections }) {
  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow">
      <AspectRatio ratio={16 / 9} className="bg-gradient-to-br from-jolananas-peach-light to-jolananas-pink-medium relative">
        {collection.image ? (
          <img 
            src={collection.image.url} 
            alt={collection.image.altText || collection.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Badge variant="secondary" className="text-2xl">📂</Badge>
          </div>
        )}
      </AspectRatio>
      
      <CardHeader>
        <CardTitle className="font-bold text-lg text-jolananas-black-ink mb-2">
          {collection.title}
        </CardTitle>
        <CardDescription className="text-sm mb-4">
          {collection.description || 'Collection artisanale exclusive'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          asChild
          className="w-full"
        >
          <Link href={`/collections/${collection.handle}`}>
            Voir la Collection
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

