/**
 * 🍍 JOLANANAS - Shop Pay Button Component
 * =========================================
 * Composant bouton Shop Pay avec design shadcn/ui et intégration Shop Pay Payment Request API
 * Interface de paiement entièrement personnalisée (pas de redirection)
 */

"use client";

import React from "react";
import { ShopPayPaymentSection } from "./ShopPayPaymentSection";
import type { BaseEcommerceProps } from "@/types/ecommerce";

export interface ShopPayButtonProps extends BaseEcommerceProps {
  checkoutId: string;
  variantIds: string[]; // Variant IDs numériques pour Shop Pay
  amount: number;
  currency?: string; // Si fourni, sera utilisé (priorité sur détection automatique)
  subtotal?: number; // Sous-total (sans livraison)
  shippingCost?: number; // Frais de livraison
  invoiceUrl?: string; // Invoice URL pour fallback redirection (déprécié)
  onSuccess?: (orderId: string, transactionId: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  containerId?: string; // Déprécié mais conservé pour compatibilité
}

export function ShopPayButton({
  className,
  checkoutId,
  variantIds,
  amount,
  currency: providedCurrency,
  subtotal,
  shippingCost,
  invoiceUrl, // Déprécié mais conservé pour compatibilité
  onSuccess,
  onError,
  disabled = false,
  containerId, // Déprécié mais conservé pour compatibilité
}: ShopPayButtonProps) {
  // Utiliser ShopPayPaymentSection pour l'interface personnalisée
  return (
    <ShopPayPaymentSection
      className={className}
      checkoutId={checkoutId}
      variantIds={variantIds}
      amount={amount}
      currency={providedCurrency}
      subtotal={subtotal}
      shippingCost={shippingCost}
      invoiceUrl={invoiceUrl}
      onSuccess={onSuccess}
      onError={onError}
      disabled={disabled}
    />
  );
}
