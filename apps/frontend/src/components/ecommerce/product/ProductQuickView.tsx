"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ShoppingCart, Heart, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AspectRatio } from "@/components/ui/aspectratio";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LoadingDots } from "@/components/ui/loadingdots";
import { useCart } from "@/components/providers/CartProvider";
import { useProductCurrency } from "@/hooks/useProductCurrency";
import { cn } from "@/lib/utils";
// getProductByHandle est server-only, utiliser l'API route à la place
import type { Product } from "@/lib/shopify/types";
import type { BaseEcommerceProps } from "@/types/ecommerce";

interface ProductQuickViewProps extends BaseEcommerceProps {
  productHandle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductQuickView({
  productHandle,
  isOpen,
  onClose,
  className,
}: ProductQuickViewProps) {
  const { addItem } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Utiliser le hook pour extraire automatiquement le currencyCode et formater les prix
  const { formatPrice, currency } = useProductCurrency(product);

  // Charger le produit depuis l'API route
  useEffect(() => {
    if (isOpen && productHandle) {
      setIsLoading(true);
      fetch(`/api/products/${productHandle}`)
        .then((res) => res.json())
        .then((data) => {
          setProduct(data.product);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error("Erreur lors du chargement du produit:", error);
          setIsLoading(false);
        });
    }
  }, [isOpen, productHandle]);

  // Réinitialiser l'état à la fermeture
  useEffect(() => {
    if (!isOpen) {
      setProduct(null);
      setQuantity(1);
      setSelectedImageIndex(0);
    }
  }, [isOpen]);

  // Gérer l'ajout au panier
  const handleAddToCart = async () => {
    if (!product || !product.availableForSale) return;

    const variantId = product.firstVariantId;
    if (!variantId) {
      console.error("Aucune variante disponible pour ce produit");
      return;
    }

    setIsAddingToCart(true);
    try {
      await addItem(variantId, quantity);

      // Feedback visuel puis fermeture
      setTimeout(() => {
        setIsAddingToCart(false);
        onClose();
      }, 500);
    } catch (error) {
      console.error("Erreur lors de l'ajout au panier:", error);
      setIsAddingToCart(false);
    }
  };

  // Calculer la réduction si applicable
  const discount = product?.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) *
          100,
      )
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-background">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[500px]">
            <DialogTitle className="sr-only">Chargement</DialogTitle>
            <DialogDescription className="sr-only">Chargement du produit en cours</DialogDescription>
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="mt-4 text-sm text-muted-foreground font-medium uppercase tracking-widest">
              Chargement...
            </p>
          </div>
        ) : product ? (
          <div className={cn("grid md:grid-cols-2", className)}>
            
            {/* Left: Gallery - High Contrast */}
            <div className="relative bg-muted/30 p-4 md:p-8 flex flex-col gap-4">
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-white shadow-sm">
                <Image
                  src={
                    product.images?.[selectedImageIndex]?.url ||
                    product.images?.[0]?.url ||
                    "/assets/images/collections/placeholder.svg"
                  }
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                  priority
                />
                
                {/* Discount Badge - Top Left */}
                {discount > 0 && (
                  <div className="absolute top-4 left-4 z-10">
                    <Badge className="bg-primary text-primary-foreground font-bold rounded-full px-3 py-1 text-xs">
                      -{discount}%
                    </Badge>
                  </div>
                )}
              </div>

              {/* Thumbnails Grid */}
              {product.images && product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-3">
                  {product.images.slice(0, 4).map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImageIndex(index)}
                      className={cn(
                        "relative aspect-square rounded-xl overflow-hidden border-2 transition-all",
                        selectedImageIndex === index
                          ? "border-primary shadow-sm ring-1 ring-primary/20"
                          : "border-transparent opacity-70 hover:opacity-100"
                      )}
                    >
                      <Image
                        src={image.url}
                        alt={image.altText || `${product.title} thumbnail ${index + 1}`}
                        fill
                        className="object-cover"
                        sizes="100px"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info - Structured & Clear */}
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <div className="space-y-6">
                {/* Brand & Title */}
                <div className="space-y-4">
                  <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary/70">
                    Série Limitée
                  </span>
                  
                  <h2 className="text-4xl md:text-5xl font-brand text-primary leading-[1.1]">
                    {product.title}
                  </h2>

                  <div className="flex items-center gap-4 pt-2">
                    <span className="text-3xl font-bold tracking-tight text-primary">
                      {formatPrice(product.price, currency)}
                    </span>
                    {product.compareAtPrice && (
                      <span className="text-xl text-muted-foreground line-through font-medium">
                        {formatPrice(product.compareAtPrice, currency)}
                      </span>
                    )}
                  </div>
                </div>

                <Separator className="bg-border/50" />

                {/* Description */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                    À propos de cette pièce
                  </span>
                  <p className="text-muted-foreground leading-relaxed text-balance">
                    {product.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="space-y-6 pt-4">
                  {product.availableForSale ? (
                    <div className="space-y-4">
                      {/* Quantity Selector */}
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                          Quantité
                        </span>
                        <Select
                          value={quantity.toString()}
                          onValueChange={(value) => setQuantity(parseInt(value, 10))}
                        >
                          <SelectTrigger className="w-24 h-12 rounded-xl bg-muted/50 border-0 focus:ring-1 focus:ring-primary">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            {[1, 2, 3, 4, 5].map((num) => (
                              <SelectItem key={num} value={num.toString()} className="font-medium">
                                {num}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Add to Cart */}
                      <div className="flex flex-col gap-3">
                        <Button
                          size="lg"
                          className="h-14 rounded-2xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg shadow-primary/20 transition-all active:scale-[0.98]"
                          disabled={isAddingToCart}
                          onClick={handleAddToCart}
                        >
                          {isAddingToCart ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <div className="flex items-center gap-2">
                              <ShoppingCart className="w-5 h-5" />
                              <span className="uppercase tracking-[0.2em] text-[11px]">Ajouter au panier</span>
                            </div>
                          )}
                        </Button>

                        <Link href={`/products/${product.handle}`} onClick={onClose}>
                          <Button variant="outline" className="w-full h-12 rounded-2xl border-primary/20 hover:border-primary hover:bg-primary/5 text-primary text-[10px] uppercase font-bold tracking-widest transition-colors">
                            Voir les détails complets
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/10 text-center">
                      <span className="text-xs font-bold uppercase tracking-widest text-destructive">
                        Épuisé pour le moment
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[500px] p-12 text-center">
            <DialogTitle className="sr-only">Erreur</DialogTitle>
            <DialogDescription className="sr-only">Le produit n'a pas pu être chargé</DialogDescription>
            <p className="text-muted-foreground font-medium mb-8">
              La création est actuellement introuvable.
            </p>
            <Button variant="outline" onClick={onClose} className="rounded-full px-8 uppercase tracking-widest text-[10px] font-bold">
              Fermer
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
