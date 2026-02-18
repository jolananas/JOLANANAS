"use client";

import React, { useEffect, useRef } from "react";
import { usePayPal } from "@/hooks/usePayPal";
import { useCurrency } from "@/hooks/useCurrency";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingDots } from "@/components/ui/loadingdots";
import { Loader2, CreditCard, AlertCircle } from "lucide-react";
import type { BaseEcommerceProps } from "@/types/ecommerce";

export interface PayPalButtonProps extends BaseEcommerceProps {
  checkoutId: string;
  amount: number;
  currency?: string; // Si fourni, sera utilisé (priorité sur détection automatique)
  onSuccess?: (orderId: string, transactionId: string) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  containerId?: string;
}

export function PayPalButton({
  className,
  checkoutId,
  amount,
  currency: providedCurrency,
  onSuccess,
  onError,
  disabled = false,
  containerId = "paypal-button-container",
}: PayPalButtonProps) {
  // Utiliser le hook pour détecter automatiquement la devise
  const { currency: detectedCurrency } = useCurrency(providedCurrency);

  // Utiliser la devise fournie en priorité, sinon la devise détectée
  const currency = providedCurrency || detectedCurrency;
  const { state, isSDKLoaded, createPayPalButton, reset } = usePayPal();
  const buttonInstanceRef = useRef<ReturnType<
    typeof createPayPalButton
  > | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Validation des props
  const isValid =
    checkoutId &&
    checkoutId.trim() !== "" &&
    amount > 0 &&
    currency &&
    currency.length === 3;

  // Créer et rendre le bouton PayPal
  useEffect(() => {
    // Validation
    if (!isSDKLoaded || disabled || !isValid) {
      if (process.env.NODE_ENV === "development") {
        if (!isSDKLoaded) {
          console.debug("🔍 PayPalButton: SDK non chargé");
        }
        if (disabled) {
          console.debug("🔍 PayPalButton: Bouton désactivé");
        }
        if (!isValid) {
          console.debug("🔍 PayPalButton: Props invalides", {
            checkoutId,
            amount,
            currency,
          });
        }
      }
      return;
    }

    if (!containerRef.current) {
      if (process.env.NODE_ENV === "development") {
        console.debug("🔍 PayPalButton: Conteneur non disponible");
      }
      return;
    }

    // Nettoyer le conteneur avant de créer un nouveau bouton
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }

    if (process.env.NODE_ENV === "development") {
      console.log("🔄 PayPalButton: Création du bouton PayPal", {
        checkoutId,
        amount,
        currency,
      });
    }

    // Créer le bouton PayPal
    const buttonInstance = createPayPalButton({
      checkoutId,
      amount,
      currency,
      onSuccess: (orderId, transactionId) => {
        if (process.env.NODE_ENV === "development") {
          console.log("✅ PayPalButton: Paiement réussi", {
            orderId,
            transactionId,
          });
        }
        if (onSuccess) {
          onSuccess(orderId, transactionId);
        }
      },
      onError: (error) => {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ PayPalButton: Erreur paiement", error);
        }
        if (onError) {
          onError(error);
        }
      },
    });

    if (buttonInstance && containerRef.current) {
      buttonInstanceRef.current = buttonInstance;

      // Rendre le bouton dans le conteneur
      buttonInstance
        .render(containerRef.current)
        .then(() => {
          if (process.env.NODE_ENV === "development") {
            console.log("✅ PayPalButton: Bouton rendu avec succès");
          }
        })
        .catch((error) => {
          console.error("❌ PayPalButton: Erreur rendu bouton PayPal", error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : "Erreur lors de l'affichage du bouton PayPal";
          if (onError) {
            onError(errorMessage);
          }
        });
    } else {
      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️ PayPalButton: Instance ou conteneur non disponible", {
          hasInstance: !!buttonInstance,
          hasContainer: !!containerRef.current,
        });
      }
    }

    // Cleanup
    return () => {
      if (process.env.NODE_ENV === "development") {
        console.debug("🧹 PayPalButton: Cleanup");
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
      buttonInstanceRef.current = null;
    };
  }, [
    isSDKLoaded,
    checkoutId,
    amount,
    currency,
    disabled,
    isValid,
    createPayPalButton,
    onSuccess,
    onError,
  ]);

  // Réinitialiser en cas d'erreur (avec délai pour permettre à l'utilisateur de lire le message)
  useEffect(() => {
    if (state.status === "error" && state.error) {
      // Ne pas réinitialiser automatiquement si l'erreur est critique
      // L'utilisateur doit pouvoir lire le message d'erreur
      const isCriticalError =
        state.error.includes("Configuration") ||
        state.error.includes("credentials") ||
        state.error.includes("SDK non disponible");

      if (!isCriticalError) {
        // Réinitialiser après 10 secondes pour permettre une nouvelle tentative
        const timer = setTimeout(() => {
          if (process.env.NODE_ENV === "development") {
            console.debug(
              "🔄 PayPalButton: Réinitialisation automatique après erreur",
            );
          }
          reset();
        }, 10000);
        return () => clearTimeout(timer);
      }
    }
    return undefined;
  }, [state.status, state.error, reset]);

  // État de chargement du SDK
  if (!isSDKLoaded) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Chargement de PayPal <LoadingDots size="sm" />
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
              PayPal non disponible
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // État de traitement
  if (state.status === "processing") {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-jolananas-pink-medium" />
            <span className="text-sm font-medium text-jolananas-pink-medium">
              Traitement du paiement PayPal
              <LoadingDots size="sm" />
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      {/* Conteneur pour le bouton PayPal */}
      <div
        id={containerId}
        ref={containerRef}
        className="w-full"
        style={{ minHeight: "50px" }}
      />

      {/* Message d'erreur */}
      {state.status === "error" && state.error && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Erreur PayPal :</strong> {state.error}
            <br />
            <span className="text-xs mt-1 block">
              {state.error.includes("SDK") ||
              state.error.includes("chargement") ||
              state.error.includes("non disponible")
                ? "Veuillez rafraîchir la page et réessayer. Si le problème persiste, contactez le support."
                : state.error.includes("montant") ||
                    state.error.includes("amount") ||
                    state.error.includes("ne correspond pas")
                  ? "Le montant du paiement ne correspond pas à votre commande. Veuillez réessayer ou actualiser la page."
                  : state.error.includes("Configuration") ||
                      state.error.includes("credentials")
                    ? "Configuration PayPal manquante. Veuillez contacter le support."
                    : state.error.includes("Draft order") ||
                        state.error.includes("non trouvé")
                      ? "Votre session de commande a expiré. Veuillez retourner au panier et réessayer."
                      : "Une erreur est survenue lors du paiement. Veuillez réessayer ou choisir une autre méthode de paiement."}
            </span>
          </AlertDescription>
        </Alert>
      )}

      {/* Message de succès */}
      {state.status === "success" && (
        <Alert className="mt-4 border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <AlertDescription className="text-green-800 dark:text-green-200">
            ✅ Paiement PayPal réussi ! Redirection en cours{" "}
            <LoadingDots size="sm" />
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
