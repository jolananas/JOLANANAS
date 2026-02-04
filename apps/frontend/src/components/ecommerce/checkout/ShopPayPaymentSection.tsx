/**
 * 🍍 JOLANANAS - Shop Pay Payment Section Component
 * ================================================
 * Section de paiement personnalisée pour Shop Pay
 * Design et UX entièrement personnalisés en TypeScript
 * Utilise l'API Shop Pay Payment Request pour paiement sécurisé
 */

"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  CreditCard,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { LoadingDots } from "@/components/ui/loadingdots";
import { useShopPay } from "@/hooks/useShopPay";
import { useCurrency } from "@/hooks/useCurrency";
import { useCart } from "@/components/providers/CartProvider";
import type { BaseEcommerceProps } from "@/types/ecommerce";

export interface ShopPayPaymentSectionProps extends BaseEcommerceProps {
  checkoutId: string;
  variantIds: string[]; // Variant IDs numériques pour Shop Pay
  amount: number;
  currency?: string; // Si fourni, sera utilisé (priorité sur détection automatique)
  subtotal?: number;
  shippingCost?: number;
  invoiceUrl?: string; // Invoice URL pour fallback si l'API Payment Request n'est pas disponible
  onSuccess?: (orderId: string, transactionId: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
}

export function ShopPayPaymentSection({
  className,
  checkoutId,
  variantIds,
  amount,
  currency: providedCurrency,
  subtotal,
  shippingCost = 0,
  invoiceUrl,
  onSuccess,
  onError,
  disabled = false,
}: ShopPayPaymentSectionProps) {
  // Utiliser le hook pour détecter automatiquement la devise
  const {
    currency: detectedCurrency,
    formatPrice,
    isLoading: isCurrencyLoading,
  } = useCurrency(providedCurrency);

  // Utiliser la devise fournie en priorité, sinon la devise détectée
  const currency = providedCurrency || detectedCurrency;

  // Utiliser le panier pour afficher les produits
  const { items } = useCart();

  // Hook Shop Pay
  const { state, isComponentLoaded, createPaymentSession, reset } =
    useShopPay();

  // Référence à la session de paiement
  const paymentSessionRef = useRef<ReturnType<
    typeof createPaymentSession
  > | null>(null);

  // État local pour gérer le clic sur le bouton
  const [isRequestingPayment, setIsRequestingPayment] = useState(false);

  // Créer la session de paiement au montage
  // Note: Même si l'API ne se charge pas, on peut utiliser l'invoice URL comme fallback
  useEffect(() => {
    if (disabled || !checkoutId || amount <= 0) {
      return;
    }

    if (!variantIds || variantIds.length === 0) {
      console.warn("⚠️ Aucun variant ID fourni pour Shop Pay");
      if (onError) {
        onError("Aucun variant ID disponible pour Shop Pay");
      }
      return;
    }

    // Construire les line items depuis le panier
    const lineItems = items.map((item) => ({
      label: item.title,
      quantity: item.quantity,
      finalItemPrice: {
        amount: item.price,
        currencyCode: currency,
      },
      finalLinePrice: {
        amount: item.price * item.quantity,
        currencyCode: currency,
      },
    }));

    // Créer la session de paiement
    const session = createPaymentSession({
      checkoutId,
      variantIds,
      amount,
      currency,
      lineItems,
      subtotal: subtotal
        ? {
            amount: subtotal,
            currencyCode: currency,
          }
        : undefined,
      total: {
        amount: amount,
        currencyCode: currency,
      },
      onSuccess: (orderId, transactionId) => {
        console.log("✅ Paiement Shop Pay réussi:", { orderId, transactionId });
        setIsRequestingPayment(false);
        if (onSuccess) {
          onSuccess(orderId, transactionId);
        }
      },
      onError: (error) => {
        console.error("❌ Erreur Shop Pay:", error);
        setIsRequestingPayment(false);
        if (onError) {
          onError(error);
        }
      },
    });

    paymentSessionRef.current = session;

    // Cleanup
    return () => {
      if (paymentSessionRef.current) {
        try {
          paymentSessionRef.current.destroy();
        } catch (error) {
          console.warn(
            "⚠️ Erreur lors de la destruction de la session:",
            error,
          );
        }
        paymentSessionRef.current = null;
      }
    };
  }, [
    checkoutId,
    variantIds,
    amount,
    currency,
    subtotal,
    disabled,
    isComponentLoaded,
    createPaymentSession,
    items,
    onSuccess,
    onError,
    invoiceUrl,
  ]);

  // Réinitialiser en cas d'erreur
  useEffect(() => {
    if (state.status === "error" && state.error) {
      const timer = setTimeout(() => {
        reset();
      }, 5000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [state.status, state.error, reset]);

  // Gérer le clic sur le bouton Shop Pay
  const handlePayWithShopPay = async () => {
    if (disabled || isRequestingPayment) {
      return;
    }

    // Si une session de paiement est disponible, l'utiliser
    if (paymentSessionRef.current) {
      try {
        setIsRequestingPayment(true);
        await paymentSessionRef.current.request();
        return;
      } catch (error) {
        console.error("❌ Erreur lors de la demande de paiement:", error);
        setIsRequestingPayment(false);
        if (onError) {
          onError(
            error instanceof Error
              ? error.message
              : "Erreur lors de la demande de paiement",
          );
        }
        return;
      }
    }

    // Fallback: Utiliser l'invoice URL si la session n'est pas disponible
    try {
      setIsRequestingPayment(true);

      // Récupérer l'invoice URL si non fournie
      let finalInvoiceUrl = invoiceUrl;

      if (!finalInvoiceUrl) {
        const response = await fetch(`/api/checkout/${checkoutId}/invoice-url`);
        if (response.ok) {
          const data = await response.json();
          finalInvoiceUrl = data.invoiceUrl;
        } else {
          throw new Error("Erreur lors de la récupération de l'invoice URL");
        }
      }

      if (finalInvoiceUrl) {
        // Rediriger vers l'invoice URL qui contient Shop Pay intégré
        console.log(
          "🔄 Redirection vers Shop Pay via invoice URL:",
          finalInvoiceUrl,
        );
        window.location.href = finalInvoiceUrl;
      } else {
        throw new Error("Invoice URL non disponible");
      }
    } catch (error) {
      console.error("❌ Erreur redirection Shop Pay:", error);
      setIsRequestingPayment(false);
      if (onError) {
        onError(
          error instanceof Error
            ? error.message
            : "Erreur lors de la redirection vers Shop Pay",
        );
      }
    }
  };

  // Calculer le sous-total si non fourni
  const calculatedSubtotal =
    subtotal ??
    items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = calculatedSubtotal + shippingCost;

  // État de chargement (seulement si on attend vraiment le chargement de l'API)
  // Note: Même si l'API ne se charge pas, on peut utiliser l'invoice URL
  if (state.status === "loading" && isComponentLoaded === undefined) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-[#5A31F4]" />
            <span className="text-sm text-[#5A31F4]">
              Initialisation de Shop Pay
              <LoadingDots size="sm" />
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // État désactivé
  if (disabled) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3 opacity-50">
            <CreditCard className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Shop Pay non disponible
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // État de traitement
  if (state.status === "processing" || isRequestingPayment) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-[#5A31F4]" />
            <span className="text-sm font-medium text-[#5A31F4]">
              Traitement du paiement Shop Pay
              <LoadingDots size="sm" />
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardContent className="space-y-6">
        {/* Liste des produits */}
        {items.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Articles</h3>
            {items.map((item) => (
              <div key={item.id} className="flex gap-3">
                <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-muted">
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="64px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">
                      Image
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium line-clamp-2">
                    {item.title}
                  </h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">
                      Quantité : {item.quantity}
                    </span>
                    <span className="text-sm font-semibold">
                      {isCurrencyLoading ? (
                        <LoadingDots
                          size="sm"
                          className="text-muted-foreground"
                        />
                      ) : (
                        formatPrice(item.price * item.quantity, currency)
                      )}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Récapitulatif des prix */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Sous-total</span>
            <span className="font-semibold">
              {isCurrencyLoading ? (
                <LoadingDots size="sm" className="text-muted-foreground" />
              ) : (
                formatPrice(calculatedSubtotal, currency)
              )}
            </span>
          </div>
          {shippingCost !== undefined && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Livraison</span>
              <span className="font-semibold">
                {shippingCost === 0 ? (
                  <Badge
                    variant="default"
                    className="bg-green-500 hover:bg-green-600 text-white text-xs"
                  >
                    Gratuit
                  </Badge>
                ) : isCurrencyLoading ? (
                  <LoadingDots size="sm" className="text-muted-foreground" />
                ) : (
                  formatPrice(shippingCost, currency)
                )}
              </span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between items-center pt-2">
            <span className="font-semibold text-lg text-jolananas-pink-medium">
              Total
            </span>
            <span className="font-bold text-xl text-jolananas-pink-deep">
              {isCurrencyLoading ? (
                <LoadingDots size="sm" className="text-muted-foreground" />
              ) : (
                formatPrice(total, currency)
              )}
            </span>
          </div>
        </div>

        {/* Bouton Shop Pay */}
        <Button
          onClick={handlePayWithShopPay}
          disabled={disabled || isRequestingPayment}
          className="w-full min-h-[56px] py-3 bg-[#5A31F4] hover:bg-[#4A2AE4] text-white font-semibold text-base flex items-center justify-center"
          size="lg"
        >
          {isRequestingPayment ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Traitement <LoadingDots size="sm" />
            </>
          ) : (
            <div className="flex items-center justify-center px-6">
              {/* Logo officiel Shop Pay - Taille minimale 105x25px avec espacement X (hauteur du logo) */}
              <img
                src="/assets/images/payment/shop-pay-logo.svg"
                alt="Shop Pay"
                width={105}
                height={25}
                className="h-[25px] w-auto"
                loading="eager"
                onError={(e) => {
                  // Fallback si le logo n'est pas disponible
                  const target = e.target as HTMLImageElement;
                  target.style.display = "none";
                  const fallback = target.nextElementSibling as HTMLElement;
                  if (fallback) {
                    fallback.style.display = "inline-block";
                  }
                }}
              />
              {/* Fallback SVG inline si le logo n'est pas disponible */}
              <svg
                width="105"
                height="25"
                viewBox="0 0 105 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-[25px] w-auto"
                aria-label="Shop Pay"
                role="img"
                style={{ display: "none" }}
              >
                <text
                  x="0"
                  y="18"
                  fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  fontSize="16"
                  fontWeight="700"
                  fill="white"
                >
                  shop
                </text>
                <text
                  x="48"
                  y="18"
                  fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
                  fontSize="16"
                  fontWeight="400"
                  fill="white"
                >
                  Pay
                </text>
              </svg>
            </div>
          )}
        </Button>

        {/* Message d'erreur */}
        {state.status === "error" && state.error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Erreur Shop Pay :</strong> {state.error}
              <br />
              <span className="text-xs mt-1 block">
                {state.error.includes("chargement") ||
                state.error.includes("API") ||
                state.error.includes("non disponible")
                  ? "Shop Pay n'a pas pu être chargé. Veuillez réessayer ou choisir une autre méthode de paiement."
                  : state.error.includes("montant") ||
                      state.error.includes("amount")
                    ? "Le montant du paiement ne correspond pas. Veuillez réessayer."
                    : state.error.includes("variant") ||
                        state.error.includes("Variant")
                      ? "Les informations du produit ne sont pas disponibles. Veuillez réessayer."
                      : "Veuillez réessayer ou choisir une autre méthode de paiement."}
              </span>
            </AlertDescription>
          </Alert>
        )}

        {/* Message de succès */}
        {state.status === "success" && (
          <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              ✅ Paiement Shop Pay réussi ! Redirection en cours{" "}
              <LoadingDots size="sm" />
            </AlertDescription>
          </Alert>
        )}

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
