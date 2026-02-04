/**
 * 🍍 JOLANANAS - Shopping Cart Component
 * =======================================
 * Composant de panier amélioré avec variantes Shadcn Studio
 * Remplace/améliore CartDrawer avec design system JOLANANAS
 * Utilise uniquement les données réelles du CartContext
 */

"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCart } from "@/components/providers/CartProvider";
import { safeJsonParse } from "@/lib/api-client";
import type { BaseEcommerceProps } from "@/types/ecommerce";

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  variant?: "drawer" | "modal" | "page";
  className?: string;
}

interface ShippingInfo {
  freeShippingThreshold: number;
  deliveryDaysFrance: string;
  deliveryDaysInternational: string;
  standardShippingCost: number;
  expressShippingCost: number;
  expressDeliveryDays: string;
}

export function ShoppingCart({
  isOpen,
  onClose,
  className,
  variant = "drawer",
}: ShoppingCartProps) {
  const {
    items,
    removeItem,
    updateQuantity,
    totalItems,
    totalPrice,
    clearCart,
  } = useCart();
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);
  // État local pour gérer les valeurs en cours de saisie pour chaque item
  const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>(
    {},
  );
  // Référence pour stocker les timeouts de debounce
  const debounceTimeouts = useRef<Record<string, NodeJS.Timeout>>({});
  // Référence pour suivre les timestamps de dernière modification pour calculer la vitesse
  const lastChangeTimestamps = useRef<Record<string, number>>({});

  // Récupérer les informations de livraison depuis l'API
  useEffect(() => {
    async function fetchShippingInfo() {
      try {
        const response = await fetch("/api/shipping");
        const data = await safeJsonParse<
          ShippingInfo & { error?: boolean; message?: string }
        >(response);

        if (response.ok && !data.error) {
          setShippingInfo(data);
        } else {
          console.error(
            "❌ Erreur de configuration Shopify:",
            data.message || "Metafields de livraison non configurés",
          );
          setShippingInfo(null);
        }
      } catch (error) {
        console.error(
          "❌ Erreur lors de la récupération des informations de livraison:",
          error,
        );
        setShippingInfo(null);
      }
    }
    fetchShippingInfo();
  }, []);

  // Initialiser les valeurs d'input avec les quantités actuelles quand les items changent
  useEffect(() => {
    const initialInputs: Record<string, string> = {};
    items.forEach((item) => {
      initialInputs[item.id] = item.quantity.toString();
    });
    setQuantityInputs(initialInputs);
  }, [items]);

  // Calculer le délai de debounce dynamique (0-200ms) selon plusieurs paramètres
  const calculateDebounceDelay = (
    itemId: string,
    newValue: number,
    currentValue: number,
    valueLength: number,
    isMobile: boolean,
  ): number => {
    // Base : 0ms pour les changements très petits (1-2 unités)
    if (Math.abs(newValue - currentValue) <= 2) {
      return 0;
    }

    // Facteur 1 : Longueur de la valeur (plus c'est long, plus on attend)
    // 1 chiffre = 0ms, 2 chiffres = 50ms, 3 chiffres = 100ms
    const lengthFactor = Math.min((valueLength - 1) * 50, 100);

    // Facteur 2 : Amplitude du changement (gros saut = plus d'attente)
    // Changement < 10 = 0ms, 10-50 = 30ms, > 50 = 60ms
    const changeAmplitude = Math.abs(newValue - currentValue);
    const amplitudeFactor =
      changeAmplitude < 10 ? 0 : changeAmplitude < 50 ? 30 : 60;

    // Facteur 3 : Mobile vs Desktop (mobile = plus réactif)
    const deviceFactor = isMobile ? -20 : 0;

    // Facteur 4 : Vitesse de frappe (si l'utilisateur tape vite, délai plus court)
    const now = Date.now();
    const lastTimestamp = lastChangeTimestamps.current[itemId] || now;
    const timeSinceLastChange = now - lastTimestamp;
    const speedFactor =
      timeSinceLastChange < 100 ? -30 : timeSinceLastChange < 300 ? -15 : 0;

    // Calcul du délai final (0-200ms)
    const calculatedDelay = Math.max(
      0,
      Math.min(
        200,
        lengthFactor + amplitudeFactor + deviceFactor + speedFactor,
      ),
    );

    return calculatedDelay;
  };

  // Debounce pour mettre à jour automatiquement la quantité après l'arrêt de la saisie
  useEffect(() => {
    // Détecter si on est sur mobile
    const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

    Object.entries(quantityInputs).forEach(([itemId, value]) => {
      const item = items.find((i) => i.id === itemId);
      if (!item) return;

      const numericValue = parseInt(value, 10);
      const currentQuantity = item.quantity;

      // Si la valeur est différente de la quantité actuelle et valide
      if (
        value &&
        !isNaN(numericValue) &&
        numericValue >= 1 &&
        numericValue !== currentQuantity
      ) {
        // Nettoyer le timeout précédent pour cet item
        if (debounceTimeouts.current[itemId]) {
          clearTimeout(debounceTimeouts.current[itemId]);
        }

        // Calculer le délai dynamique selon les paramètres
        const delay = calculateDebounceDelay(
          itemId,
          numericValue,
          currentQuantity,
          value.length,
          isMobile,
        );

        // Si le délai est 0, mettre à jour immédiatement
        if (delay === 0) {
          const finalQuantity = Math.min(numericValue, 999);
          updateQuantity(itemId, finalQuantity);
          setQuantityInputs((prev) => ({
            ...prev,
            [itemId]: finalQuantity.toString(),
          }));
        } else {
          // Sinon, créer un timeout avec le délai calculé
          debounceTimeouts.current[itemId] = setTimeout(() => {
            const finalQuantity = Math.min(numericValue, 999);
            updateQuantity(itemId, finalQuantity);
            setQuantityInputs((prev) => ({
              ...prev,
              [itemId]: finalQuantity.toString(),
            }));
            // Nettoyer le timeout après exécution
            delete debounceTimeouts.current[itemId];
          }, delay);
        }
      }
    });

    // Nettoyage des timeouts au démontage
    return () => {
      Object.values(debounceTimeouts.current).forEach((timeout) =>
        clearTimeout(timeout),
      );
      debounceTimeouts.current = {};
    };
  }, [quantityInputs, items, updateQuantity]);

  // Gérer le changement de valeur dans l'input
  const handleQuantityInputChange = (itemId: string, value: string) => {
    // Permettre uniquement les chiffres
    const numericValue = value.replace(/[^0-9]/g, "");

    // Enregistrer le timestamp de cette modification
    lastChangeTimestamps.current[itemId] = Date.now();

    setQuantityInputs((prev) => ({
      ...prev,
      [itemId]: numericValue,
    }));
  };

  // Gérer la validation et la mise à jour de la quantité
  const handleQuantityBlur = (itemId: string, currentValue: string) => {
    const numericValue = parseInt(currentValue, 10);

    // Si la valeur est vide ou invalide, restaurer la quantité actuelle
    if (!currentValue || isNaN(numericValue) || numericValue < 1) {
      const item = items.find((i) => i.id === itemId);
      if (item) {
        setQuantityInputs((prev) => ({
          ...prev,
          [itemId]: item.quantity.toString(),
        }));
      }
      return;
    }

    // Limiter à 999 pour éviter les valeurs excessives
    const finalQuantity = Math.min(numericValue, 999);

    // Mettre à jour l'input avec la valeur validée
    setQuantityInputs((prev) => ({
      ...prev,
      [itemId]: finalQuantity.toString(),
    }));

    // Mettre à jour la quantité dans le panier
    updateQuantity(itemId, finalQuantity);
  };

  // Gérer l'augmentation de quantité
  const handleIncreaseQuantity = (id: string, currentQuantity: number) => {
    const newQuantity = currentQuantity + 1;
    updateQuantity(id, newQuantity);
    setQuantityInputs((prev) => ({
      ...prev,
      [id]: newQuantity.toString(),
    }));
  };

  // Gérer la diminution de quantité
  const handleDecreaseQuantity = (id: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      const newQuantity = currentQuantity - 1;
      updateQuantity(id, newQuantity);
      setQuantityInputs((prev) => ({
        ...prev,
        [id]: newQuantity.toString(),
      }));
    } else {
      removeItem(id);
    }
  };

  // Gérer la suppression d'un item
  const handleRemoveItem = (id: string) => {
    removeItem(id);
  };

  // Gérer le passage à la caisse
  const handleCheckout = () => {
    if (items.length === 0) return;
    if (variant !== "page") {
      onClose();
    }
    // Rediriger vers la page checkout
    window.location.href = "/checkout";
  };

  // Contenu du panier (réutilisable pour tous les variants)
  const cartContent = (
    <div
      className={`flex flex-col ${variant === "page" ? "min-h-[400px]" : "h-full"}`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between ${variant === "page" ? "p-4 md:p-6 border-b border-gray-200" : "p-6 border-b border-white/20"}`}
      >
        <div className="flex items-center space-x-2">
          <ShoppingBag
            className={`h-6 w-6 ${variant === "page" ? "text-jolananas-pink-deep" : "text-white"}`}
          />
          <h2
            id="cart-title"
            className={`text-xl font-bold ${variant === "page" ? "text-gray-900" : "text-white"}`}
          >
            Votre panier
          </h2>
          {totalItems > 0 && (
            <Badge
              variant="secondary"
              className={
                variant === "page"
                  ? "bg-jolananas-pink-medium text-white"
                  : "bg-white/20 text-white border-white/30"
              }
            >
              {totalItems} {totalItems > 1 ? "articles" : "article"}
            </Badge>
          )}
        </div>
        {variant !== "page" && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:text-jolananas-gold hover:bg-white/10"
            aria-label="Fermer le panier"
          >
            <X className="h-5 w-5" />
          </Button>
        )}
      </div>

      {/* Content */}
      <div
        className={`flex-1 ${variant === "page" ? "overflow-visible p-4 md:p-6" : "overflow-y-auto p-6"}`}
      >
        {items.length === 0 ? (
          // État vide amélioré avec design JOLANANAS
          <div className="flex flex-col items-center justify-center text-center px-4 py-12">
            {/* Icône */}
            <div className="relative mb-6">
              <div
                className={`${variant === "page" ? "bg-jolananas-peach-light/20" : "bg-gradient-to-br from-jolananas-gold/20 to-jolananas-pink-medium/20"} rounded-full blur-xl animate-pulse absolute inset-0`}
              />
              <div
                className={`relative ${variant === "page" ? "bg-white border border-gray-200" : "bg-white/10 backdrop-blur-md border-white/20"} rounded-full p-6 ${variant === "page" ? "shadow-md" : "shadow-glow-pink"}`}
              >
                <ShoppingBag
                  className={`h-16 w-16 ${variant === "page" ? "text-jolananas-pink-medium" : "text-white/90"}`}
                />
              </div>
            </div>

            {/* Message principal avec Card */}
            <Card
              className={`${variant === "page" ? "bg-white border border-gray-200 shadow-md" : "bg-white/10 backdrop-blur-md border-white/20 shadow-lg"} mb-6 max-w-md w-full`}
            >
              <CardContent className="p-6">
                <h3
                  className={`text-2xl font-serif font-bold mb-3 ${variant === "page" ? "text-gray-900" : "text-white"}`}
                >
                  Votre panier est vide
                </h3>
                <p
                  className={`leading-relaxed mb-6 ${variant === "page" ? "text-gray-600" : "text-white/80"}`}
                >
                  Découvrez nos créations artisanales faites main et ajoutez vos
                  favoris à votre panier.
                </p>

                {/* Call-to-action amélioré */}
                <Button
                  onClick={
                    variant === "page"
                      ? () => (window.location.href = "/")
                      : onClose
                  }
                  size="lg"
                  className="w-full bg-gradient-to-r from-jolananas-pink-medium to-jolananas-pink-deep text-white hover:from-jolananas-pink-deep hover:to-jolananas-pink-medium shadow-glow-pink font-semibold transition-all duration-300 hover:scale-105"
                >
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Continuer mes achats
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <Card
                key={item.id}
                className={
                  variant === "page"
                    ? "bg-white border border-gray-200 shadow-sm"
                    : "bg-white/95 backdrop-blur-sm border-white/20"
                }
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {/* Image */}
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={
                          item.image ||
                          "/assets/images/collections/placeholder.svg"
                        }
                        alt={item.title}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>

                    {/* Infos */}
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/products/${item.handle}`}
                        onClick={variant !== "page" ? onClose : undefined}
                        className="block"
                      >
                        <h3
                          className={`font-semibold text-sm line-clamp-2 transition-colors ${variant === "page" ? "text-gray-900 hover:text-jolananas-pink-deep" : "hover:text-white"}`}
                        >
                          {item.title}
                        </h3>
                      </Link>
                      <p className="text-sm font-bold text-jolananas-pink-deep mt-1">
                        {item.price.toFixed(2)} €
                      </p>

                      {/* Contrôles quantité */}
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-2 border border-gray-200 rounded-lg">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              handleDecreaseQuantity(item.id, item.quantity)
                            }
                            aria-label="Diminuer la quantité"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={
                              quantityInputs[item.id] ||
                              item.quantity.toString()
                            }
                            onChange={(e) =>
                              handleQuantityInputChange(item.id, e.target.value)
                            }
                            onBlur={(e) =>
                              handleQuantityBlur(item.id, e.target.value)
                            }
                            onKeyDown={(e) => {
                              // Si Enter est pressé, valider immédiatement
                              if (e.key === "Enter") {
                                e.currentTarget.blur();
                                handleQuantityBlur(
                                  item.id,
                                  e.currentTarget.value,
                                );
                              }
                            }}
                            className="text-sm font-medium w-8 text-center bg-transparent border-0 outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            aria-label={`Quantité pour ${item.title}`}
                            min="1"
                            max="999"
                          />
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() =>
                              handleIncreaseQuantity(item.id, item.quantity)
                            }
                            aria-label="Augmenter la quantité"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveItem(item.id)}
                          aria-label="Supprimer cet article"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div
          className={`!py-2 ${variant === "page" ? "p-4 md:p-6 border-t border-gray-200 bg-gray-50" : "p-6 border-t border-white/20 space-y-4 bg-white/5"} space-y-4`}
        >
          {/* Récapitulatif */}
          <div className="space-y-2">
            <Alert
              variant="default"
              className={
                variant === "page"
                  ? "my-2 border-blue-200 bg-blue-50"
                  : "my-2 border-blue-200/30 bg-blue-50/10 dark:border-blue-800/30 dark:bg-blue-950/10"
              }
            >
              <AlertDescription
                className={`text-xs ${variant === "page" ? "text-blue-800 dark:text-blue-200" : "text-white/80 dark:text-white/80"}`}
              >
                Les frais de livraison, la TVA et le total final seront calculés
                lors du paiement sécurisé selon votre adresse de livraison.
              </AlertDescription>
            </Alert>
            <Separator
              className={variant === "page" ? "bg-gray-200" : "bg-white/20"}
            />
            <div
              className={`flex justify-between ${variant === "page" ? "text-gray-900" : "text-white"}`}
            >
              <span className="font-semibold text-lg text-jolananas-pink-medium">
                Sous-total
              </span>
              <span className="font-bold text-xl">
                {totalPrice.toFixed(2)} €
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-2 !py-8">
            <Button
              size="lg"
              className={`w-full font-semibold ${variant === "page" ? "bg-gradient-to-r from-jolananas-pink-medium to-jolananas-pink-deep text-white hover:from-jolananas-pink-deep hover:to-jolananas-pink-medium shadow-glow-pink" : "bg-white text-jolananas-pink-deep hover:bg-white/90"}`}
              onClick={handleCheckout}
            >
              Finaliser la commande
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            {variant === "page" ? (
              <Button
                variant="outline"
                className="w-full border-gray-300"
                onClick={() => (window.location.href = "/")}
              >
                Continuer mes achats
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full border-white/20 text-white hover:bg-white/10"
                onClick={onClose}
              >
                Continuer mes achats
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Rendu selon le variant
  if (variant === "page") {
    return (
      <div
        className={`bg-white rounded-lg shadow-lg overflow-hidden ${className}`}
      >
        {cartContent}
      </div>
    );
  }

  // Rendu pour drawer et modal (avec overlay et animations)
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Cart Drawer/Modal */}
          <motion.div
            initial={{
              x: variant === "drawer" ? "100%" : 0,
              y: variant === "modal" ? 20 : 0,
              opacity: variant === "modal" ? 0 : 1,
            }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            exit={{
              x: variant === "drawer" ? "100%" : 0,
              y: variant === "modal" ? 20 : 0,
              opacity: variant === "modal" ? 0 : 1,
            }}
            transition={{ type: "tween", duration: 0.3 }}
            className={`fixed ${
              variant === "drawer"
                ? "top-0 right-0 h-full w-full max-w-md"
                : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl max-h-[90vh]"
            } bg-gradient-to-br from-jolananas-peach-light via-jolananas-pink-medium to-jolananas-pink-deep shadow-2xl z-50 overflow-hidden ${className}`}
            role="dialog"
            aria-modal="true"
            aria-labelledby="cart-title"
          >
            {cartContent}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
