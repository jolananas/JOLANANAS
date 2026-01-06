/**
 * 🍍 JOLANANAS - Shipping Method Selector Component
 * =================================================
 * Composant de sélection de méthode de livraison
 * Utilise shadcn/ui RadioGroup pour la sélection
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { Label } from '@/components/ui/Label';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/Separator';
import { Truck, Zap } from 'lucide-react';
import type { BaseEcommerceProps } from '@/app/src/types/ecommerce';

export type ShippingMethodType = 'standard' | 'express';

interface ShippingInfo {
  freeShippingThreshold: number;
  deliveryDaysFrance: string;
  deliveryDaysInternational: string;
  standardShippingCost: number;
  expressShippingCost: number;
  expressDeliveryDays: string;
}

interface ShippingMethodSelectorProps extends BaseEcommerceProps {
  value: ShippingMethodType;
  onChange: (method: ShippingMethodType) => void;
  shippingInfo?: ShippingInfo | null;
  subtotal: number;
}

export function ShippingMethodSelector({
  className,
  value,
  onChange,
  shippingInfo,
  subtotal,
}: ShippingMethodSelectorProps) {
  // Calculer les coûts de livraison
  const isFreeShipping = subtotal >= (shippingInfo?.freeShippingThreshold || 50);
  const standardCost = isFreeShipping ? 0 : (shippingInfo?.standardShippingCost || 5.99);
  const expressCost = isFreeShipping ? 0 : (shippingInfo?.expressShippingCost || 12.99);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-jolananas-pink-medium">Méthode de livraison</CardTitle>
        <CardDescription>
          Choisissez votre méthode de livraison préférée
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup value={value} onValueChange={(val) => onChange(val as ShippingMethodType)}>
          <div className="space-y-4">
            {/* Livraison Standard */}
            <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-transparent hover:border-jolananas-pink-medium/30 transition-colors data-[selected=true]:border-jolananas-pink-medium">
              <RadioGroupItem value="standard" id="standard" />
              <Label
                htmlFor="standard"
                className="flex-1 cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-jolananas-pink-medium flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-base">Livraison standard</div>
                      <div className="text-sm text-muted-foreground">
                        {shippingInfo?.deliveryDaysFrance || '3-5 jours ouvrés'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end ml-4 flex-shrink-0">
                    {isFreeShipping ? (
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                        Gratuit
                      </Badge>
                    ) : (
                      <span className="font-bold text-lg text-jolananas-pink-deep whitespace-nowrap">
                        {standardCost.toFixed(2)} €
                      </span>
                    )}
                  </div>
                </div>
              </Label>
            </div>

            <Separator />

            {/* Livraison Express */}
            <div className="flex items-center space-x-3 p-4 rounded-lg border-2 border-transparent hover:border-jolananas-pink-medium/30 transition-colors data-[selected=true]:border-jolananas-pink-medium">
              <RadioGroupItem value="express" id="express" />
              <Label
                htmlFor="express"
                className="flex-1 cursor-pointer"
              >
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-jolananas-pink-medium flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-base">Livraison express</div>
                      <div className="text-sm text-muted-foreground">
                        {shippingInfo?.expressDeliveryDays || '1-2 jours ouvrés'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-end ml-4 flex-shrink-0">
                    {isFreeShipping ? (
                      <Badge variant="default" className="bg-green-500 hover:bg-green-600">
                        Gratuit
                      </Badge>
                    ) : (
                      <span className="font-bold text-lg text-jolananas-pink-deep whitespace-nowrap">
                        {expressCost.toFixed(2)} €
                      </span>
                    )}
                  </div>
                </div>
              </Label>
            </div>
          </div>
        </RadioGroup>

        {/* Alerte livraison gratuite */}
        {isFreeShipping && (
          <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
            <p className="text-sm text-green-800 dark:text-green-200">
              🎉 Livraison gratuite ! Votre commande dépasse {shippingInfo?.freeShippingThreshold || 50}€
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

