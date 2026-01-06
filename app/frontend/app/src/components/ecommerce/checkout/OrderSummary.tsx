/**
 * 🍍 JOLANANAS - Order Summary Component
 * =======================================
 * Composant récapitulatif de commande
 * Intègre les variantes Shadcn Studio avec design system JOLANANAS
 * Utilise uniquement les données réelles du CartContext
 */

'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Separator } from '@/components/ui/Separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { useCart } from '@/lib/CartContext';
import { safeJsonParse } from '@/app/src/lib/api-client';
import type { BaseEcommerceProps } from '@/app/src/types/ecommerce';

interface ShippingInfo {
  freeShippingThreshold: number;
  deliveryDaysFrance: string;
  deliveryDaysInternational: string;
  standardShippingCost: number;
  expressShippingCost: number;
  expressDeliveryDays: string;
}

interface OrderSummaryProps extends BaseEcommerceProps {
  showItems?: boolean;
  shippingCost?: number;
  shippingThreshold?: number;
  hideShippingAlert?: boolean; // Masquer l'alerte sur la page de checkout
}

export function OrderSummary({ 
  className, 
  showItems = true, 
  shippingCost,
  shippingThreshold,
  hideShippingAlert = false
}: OrderSummaryProps) {
  const { items, totalPrice } = useCart();
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);

  // Récupérer les informations de livraison depuis l'API
  useEffect(() => {
    async function fetchShippingInfo() {
      try {
        const response = await fetch('/api/shipping');
        const data = await safeJsonParse<ShippingInfo & { error?: boolean; message?: string }>(response);
        
        if (response.ok && !data.error) {
          setShippingInfo(data);
        } else {
          console.error('❌ Erreur de configuration Shopify:', data.message || 'Metafields de livraison non configurés');
          setShippingInfo(null);
        }
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des informations de livraison:', error);
        setShippingInfo(null);
      }
    }
    fetchShippingInfo();
  }, []);


  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-jolananas-pink-medium">Récapitulatif de commande</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Items */}
        {showItems && items.length > 0 && (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image || '/assets/images/collections/placeholder.svg'}
                    alt={item.title}
                    fill
                    className="object-cover"
                    sizes="64px"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/products/${item.handle}`}
                    className="block"
                  >
                    <h4 className="text-sm font-medium line-clamp-2 hover:text-jolananas-pink-deep transition-colors">
                      {item.title}
                    </h4>
                  </Link>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">
                      Quantité : {item.quantity}
                    </span>
                    <span className="text-sm font-semibold">
                      {(item.price * item.quantity).toFixed(2)} €
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Totaux */}
        <div className="space-y-2">
          {!hideShippingAlert && (
            <Alert variant="default" className="mt-2 border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
              <AlertDescription className="text-xs text-blue-800 dark:text-blue-200">
                Les frais de livraison, la TVA et le total final seront calculés lors du paiement sécurisé selon votre adresse de livraison.
              </AlertDescription>
            </Alert>
          )}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Sous-total</span>
              <span className="font-semibold">
                {totalPrice.toFixed(2)} €
              </span>
            </div>
            {shippingCost !== undefined && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Livraison</span>
                <span className="font-semibold">
                  {shippingCost === 0 ? (
                    <Badge variant="default" className="bg-green-500 hover:bg-green-600 text-white">
                      Gratuit
                    </Badge>
                  ) : (
                    `${shippingCost.toFixed(2)} €`
                  )}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="font-semibold text-lg text-jolananas-pink-medium">Total</span>
              <span className="font-bold text-xl text-jolananas-pink-deep">
                {((shippingCost !== undefined ? shippingCost : 0) + totalPrice).toFixed(2)} €
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

