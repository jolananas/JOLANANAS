/**
 * 🍍 JOLANANAS - Page de Succès Checkout
 * =======================================
 * Page affichée après un paiement réussi
 * Utilise shadcn/ui pour le design
 */

'use client';

import React, { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, ShoppingBag, Mail, Package, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Separator } from '@/components/ui/Separator';
import { LoadingDots } from '@/components/ui/LoadingDots';
import { useCart } from '@/lib/CartContext';
import { useCurrency } from '@/hooks/useCurrency';
import { safeJsonParse } from '@/app/src/lib/api-client';
import { cn } from '@/app/src/lib/utils';

interface OrderData {
  orderId: string;
  orderNumber?: string;
  status: string;
  total: string;
  currency: string;
  paymentGateway?: string;
  transactionId?: string;
}

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const { currency: detectedCurrency, formatPrice } = useCurrency();
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const orderId = searchParams.get('order');
  const draftOrderId = searchParams.get('draft_order');

  useEffect(() => {
    // Vider le panier si le paiement est réussi
    if (orderId || draftOrderId) {
      clearCart();
    }

    // Vérifier le statut du paiement
    async function verifyPayment() {
      if (!orderId && !draftOrderId) {
        setError('Aucune information de commande trouvée');
        setIsLoading(false);
        return;
      }

      try {
        // Si on a un orderId, le paiement est déjà finalisé
        if (orderId) {
          setOrderData({
            orderId,
            status: 'paid',
            total: '0',
            currency: detectedCurrency,
          });
          setIsLoading(false);
          return;
        }

        // Sinon, vérifier le statut du draft order
        if (draftOrderId) {
          const response = await fetch(`/api/checkout/payment/complete`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              draftOrderId,
              paymentStatus: 'paid',
            }),
          });

          if (!response.ok) {
            const errorData = await safeJsonParse<{ error?: string }>(response);
            throw new Error(errorData.error || 'Erreur lors de la vérification du paiement');
          }

          const data = await safeJsonParse<OrderData>(response);
          setOrderData(data);
        }
      } catch (err) {
        console.error('❌ Erreur vérification paiement:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setIsLoading(false);
      }
    }

    verifyPayment();
  }, [orderId, draftOrderId, clearCart]);

  if (isLoading) {
    return (
      <div className="container py-12 md:py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-12 w-12 animate-spin text-jolananas-pink-medium mx-auto mb-4" />
          <p className="text-muted-foreground">Vérification de votre commande <LoadingDots size="sm" /></p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="border-destructive">
            <CardHeader>
              <CardTitle className="text-destructive">Erreur</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
              <Button asChild className="mt-4">
                <Link href="/checkout">Retour au checkout</Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="container py-12 md:py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-3xl mx-auto"
      >
        {/* Message de succès */}
        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200 dark:border-green-800 mb-6">
          <CardContent className="p-8 md:p-12 text-center">
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15 }}
              className="mb-6"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500 mb-4 shadow-lg">
                <CheckCircle2 className="h-12 w-12 text-white" />
              </div>
            </motion.div>
            
            <h1 className="font-serif text-4xl font-bold text-jolananas-black-ink mb-3">
              Commande confirmée !
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Merci pour votre commande. Vous recevrez un e-mail de confirmation 
              dans quelques instants avec tous les détails.
            </p>

            {orderData && (
              <div className="flex items-center justify-center gap-2 mb-4">
                <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 text-base">
                  Commande #{orderData.orderNumber || orderData.orderId}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informations de commande */}
        {orderData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-jolananas-pink-medium flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Détails de la commande
                </CardTitle>
                <CardDescription>
                  Toutes les informations concernant votre commande
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator />
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Numéro de commande</p>
                    <p className="font-semibold text-base">{orderData.orderNumber || orderData.orderId}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Statut</p>
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">
                      {orderData.status === 'paid' ? 'Payée' : orderData.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Total</p>
                    <p className="font-semibold text-lg text-jolananas-pink-deep">
                      {formatPrice(parseFloat(orderData.total), orderData.currency)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Méthode de paiement</p>
                    <Badge variant="outline" className="capitalize">
                      {orderData.paymentGateway === 'paypal' ? 'PayPal' : 
                       orderData.paymentGateway === 'shop_pay' ? 'Shop Pay' : 
                       orderData.paymentGateway || 'Non spécifiée'}
                    </Badge>
                  </div>
                  {orderData.transactionId && (
                    <div className="sm:col-span-2">
                      <p className="text-sm text-muted-foreground mb-1">ID de transaction</p>
                      <p className="font-mono text-xs text-muted-foreground break-all">
                        {orderData.transactionId}
                      </p>
                    </div>
                  )}
                </div>
                <Separator />
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>Un e-mail de confirmation a été envoyé à votre adresse</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Button
            asChild
            size="lg"
            className="flex-1 bg-gradient-to-r from-jolananas-pink-medium to-jolananas-pink-deep text-white hover:from-jolananas-pink-deep hover:to-jolananas-pink-medium shadow-glow-pink font-semibold"
          >
            <Link href="/products">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Continuer mes achats
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="flex-1"
          >
            <Link href="/orders">
              Voir mes commandes
            </Link>
          </Button>
        </motion.div>

        {/* Informations supplémentaires */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card className="mt-6 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <CardContent className="p-6">
              <Alert variant="default" className="border-0 bg-transparent p-0">
                <AlertDescription className="text-sm text-blue-800 dark:text-blue-200">
                  <strong className="text-base mb-2 block">Prochaines étapes :</strong>
                  <ul className="list-disc list-inside mt-2 space-y-2">
                    <li>Vous recevrez un e-mail de confirmation avec le numéro de suivi dans quelques instants</li>
                    <li>Votre commande sera préparée et expédiée dans les plus brefs délais</li>
                    <li>Vous pouvez suivre votre commande depuis votre compte client</li>
                    <li>En cas de question, n'hésitez pas à nous contacter</li>
                  </ul>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="container py-12 md:py-16">
        <div className="max-w-2xl mx-auto text-center">
          <Loader2 className="h-12 w-12 animate-spin text-jolananas-pink-medium mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement <LoadingDots size="sm" /></p>
        </div>
      </div>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
