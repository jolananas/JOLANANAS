/**
 * 🍍 JOLANANAS - Product Quick View Component
 * ===========================================
 * Modal de prévisualisation rapide d'un produit
 * Intègre les variantes Shadcn Studio avec design system JOLANANAS
 * Utilise uniquement les données Shopify réelles (fetch API)
 */

'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, ShoppingCart, Heart, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/Separator';
import { AspectRatio } from '@/components/ui/AspectRatio';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { LoadingDots } from '@/components/ui/LoadingDots';
import { useCart } from '@/app/src/lib/CartContext';
import { useProductCurrency } from '@/hooks/useProductCurrency';
// getProductByHandle est server-only, utiliser l'API route à la place
import type { Product } from '@/app/src/lib/shopify/types';
import type { BaseEcommerceProps } from '@/app/src/types/ecommerce';

interface ProductQuickViewProps extends BaseEcommerceProps {
  productHandle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductQuickView({ productHandle, isOpen, onClose, className }: ProductQuickViewProps) {
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
          setProduct(data);
          setIsLoading(false);
        })
        .catch((error) => {
          console.error('Erreur lors du chargement du produit:', error);
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
      console.error('Aucune variante disponible pour ce produit');
      return;
    }

    setIsAddingToCart(true);
    try {
      addItem({
        variantId,
        productId: product.id,
        title: product.title,
        price: product.price,
        quantity,
        image: product.images[0] || '/assets/images/collections/placeholder.svg',
        handle: product.handle,
      });

      // Feedback visuel puis fermeture
      setTimeout(() => {
        setIsAddingToCart(false);
        onClose();
      }, 500);
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      setIsAddingToCart(false);
    }
  };

  // Calculer la réduction si applicable
  const discount = product?.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        {isLoading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-jolananas-pink-medium" />
            <span className="ml-2 text-muted-foreground">Chargement du produit <LoadingDots size="sm" /></span>
          </div>
        ) : product ? (
          <div className={`product-quick-view ${className}`}>
            <DialogHeader>
              <DialogTitle className="sr-only">{product.title}</DialogTitle>
            </DialogHeader>

            <div className="grid gap-6 md:grid-cols-2">
              {/* Images */}
              <div className="space-y-4">
                <AspectRatio ratio={1} className="overflow-hidden rounded-xl">
                  <Image
                    src={product.images[selectedImageIndex] || product.images[0] || '/assets/images/collections/placeholder.svg'}
                    alt={product.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </AspectRatio>

                {/* Miniatures */}
                {product.images.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {product.images.slice(0, 4).map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                          selectedImageIndex === index
                            ? 'border-jolananas-pink-medium'
                            : 'border-transparent hover:border-jolananas-pink-medium/50'
                        }`}
                        aria-label={`Voir l'image ${index + 1}`}
                      >
                        <Image
                          src={image}
                          alt={`${product.title} miniature ${index + 1}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 25vw, 12.5vw"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Informations */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl font-bold mb-2">{product.title}</h2>
                  <div className="flex items-center gap-3 mb-3">
                    <Badge variant="default" className="text-xl px-0 py-0 bg-transparent text-jolananas-pink-deep font-bold">
                      {formatPrice(product.price, currency)}
                    </Badge>
                    {product.compareAtPrice && (
                      <>
                        <Badge variant="outline" className="text-base line-through">
                          {formatPrice(product.compareAtPrice, currency)}
                        </Badge>
                        <Badge variant="destructive" className="text-base">
                          -{discount}%
                        </Badge>
                      </>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    {product.description}
                  </p>
                </div>

                <Separator />

                {/* Disponibilité */}
                {!product.availableForSale && (
                  <div className="text-sm text-destructive font-medium">
                    Ce produit est actuellement épuisé.
                  </div>
                )}

                {/* Quantité et actions */}
                {product.availableForSale && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <label htmlFor="quick-view-quantity" className="text-sm font-medium">
                        Quantité
                      </label>
                      <Select
                        value={quantity.toString()}
                        onValueChange={(value) => setQuantity(parseInt(value, 10))}
                      >
                        <SelectTrigger id="quick-view-quantity" className="w-24">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Button
                        size="lg"
                        className="w-full bg-gradient-to-r from-jolananas-pink-medium to-jolananas-pink-deep hover:from-jolananas-pink-deep hover:to-jolananas-pink-medium text-white"
                        disabled={isAddingToCart}
                        onClick={handleAddToCart}
                      >
                        {isAddingToCart ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Ajout en cours <LoadingDots size="sm" />
                          </>
                        ) : (
                          <>
                            <ShoppingCart className="mr-2 h-4 w-4" />
                            Ajouter au panier
                          </>
                        )}
                      </Button>

                      <Link href={`/products/${product.handle}`} onClick={onClose}>
                        <Button variant="outline" className="w-full">
                          Voir les détails complets
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Tags */}
                {product.tags.length > 0 && (
                  <>
                    <Separator />
                    <div className="flex flex-wrap gap-2">
                      {product.tags.slice(0, 5).map((tag) => (
                        <Badge key={tag} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
            <p className="text-muted-foreground mb-4">
              Impossible de charger ce produit.
            </p>
            <Button variant="outline" onClick={onClose}>
              Fermer
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

