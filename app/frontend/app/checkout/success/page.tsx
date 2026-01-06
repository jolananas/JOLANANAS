/**
 * 🍍 JOLANANAS - Checkout Success Page
 * =====================================
 * Page de confirmation après paiement Shopify
 * Gère le retour depuis le paiement sécurisé
 */

'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, ShoppingBag, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { useCart } from '@/lib/CartContext';

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const orderId = searchParams.get('order_id');

  useEffect(() => {
    // Vider le panier après confirmation
    clearCart();
  }, [clearCart]);

  return (
    <div className="container py-12 md:py-16">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 md:p-12 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Commande confirmée !</h2>
          <p className="text-muted-foreground mb-6">
            Merci pour votre commande. Vous recevrez un e-mail de confirmation 
            dans quelques instants avec tous les détails.
            {orderId && (
              <span className="block mt-2 text-sm">
                Numéro de commande : {orderId}
              </span>
            )}
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => router.push('/products')}>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continuer mes achats
            </Button>
            <Button onClick={() => router.push('/account')}>
              Voir mes commandes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container py-12 md:py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-12 w-12 animate-spin text-jolananas-pink-medium mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
