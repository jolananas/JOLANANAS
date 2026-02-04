/**
 * 🍍 JOLANANAS - Payment Buttons Component
 * =========================================
 * Composant de boutons de paiement (Shop Pay, PayPal)
 * Design personnalisé avec shadcn/ui
 * Intégration complète Shop Pay et PayPal (pas de redirection)
 */

"use client";

import React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingDots } from "@/components/ui/loadingdots";
import { Lock } from "lucide-react";
import { ShopPayButton } from "./ShopPayButton";
import { PayPalButton } from "./PayPalButton";
import { useCurrency } from "@/hooks/useCurrency";
import type { BaseEcommerceProps } from "@/types/ecommerce";

interface PaymentButtonsProps extends BaseEcommerceProps {
  checkoutData: {
    checkoutId: string;
    paymentUrl?: string;
    cartId?: string;
    variantIds?: string[]; // Variant IDs pour Shop Pay
  } | null;
  total: number;
  subtotal?: number; // Sous-total (sans livraison)
  shippingCost?: number; // Frais de livraison
  currency?: string; // Si fourni, sera utilisé (priorité sur détection automatique)
  disabled?: boolean;
}

export function PaymentButtons({
  className,
  checkoutData,
  total,
  subtotal,
  shippingCost,
  currency: providedCurrency,
  disabled = false,
}: PaymentButtonsProps) {
  // Utiliser le hook pour détecter automatiquement la devise
  const {
    currency: detectedCurrency,
    formatPrice,
    isLoading: isCurrencyLoading,
  } = useCurrency(providedCurrency);

  // Utiliser la devise fournie en priorité, sinon la devise détectée
  const currency = providedCurrency || detectedCurrency;
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-jolananas-pink-medium flex items-center gap-2">
          <Lock className="h-5 w-5" />
          Paiement sécurisé
        </CardTitle>
        <CardDescription>
          Choisissez votre méthode de paiement préférée
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Shop Pay Button - Intégration complète avec interface personnalisée */}
        {checkoutData && (
          <ShopPayButton
            checkoutId={checkoutData.checkoutId}
            variantIds={checkoutData.variantIds || []}
            amount={total}
            currency={currency}
            subtotal={subtotal}
            shippingCost={shippingCost}
            invoiceUrl={checkoutData.paymentUrl}
            disabled={disabled}
            onSuccess={(orderId, transactionId) => {
              console.log("✅ Paiement Shop Pay réussi:", {
                orderId,
                transactionId,
              });
            }}
            onError={(error) => {
              console.error("❌ Erreur paiement Shop Pay:", error);
            }}
          />
        )}

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">OU</span>
          </div>
        </div>

        {/* PayPal Button - Intégration directe SDK */}
        {checkoutData && (
          <PayPalButton
            checkoutId={checkoutData.checkoutId}
            amount={total}
            currency={currency}
            disabled={disabled}
            onSuccess={(orderId, transactionId) => {
              console.log("✅ Paiement PayPal réussi:", {
                orderId,
                transactionId,
              });
            }}
            onError={(error) => {
              console.error("❌ Erreur paiement PayPal:", error);
            }}
          />
        )}

        {/* Total */}
        <div className="pt-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-jolananas-pink-medium">
              Total
            </span>
            <span className="text-2xl font-bold text-jolananas-pink-deep">
              {isCurrencyLoading ? (
                <>
                  Chargement
                  <LoadingDots size="sm" className="text-muted-foreground" />
                </>
              ) : (
                formatPrice(total, currency)
              )}
            </span>
          </div>
        </div>

        {/* Réassurance */}
        <div className="pt-2 text-xs text-muted-foreground text-center">
          <div className="flex items-center justify-center gap-1">
            <Lock className="h-3 w-3" />
            <span>Paiement 100% sécurisé par Shopify</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
