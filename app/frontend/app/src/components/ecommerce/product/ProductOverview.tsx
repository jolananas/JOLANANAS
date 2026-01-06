/**
 * 🍍 JOLANANAS - Product Overview Component
 * ==========================================
 * Composant d'affichage détaillé d'un produit
 * Intègre les variantes Shadcn Studio avec design system JOLANANAS
 * Utilise uniquement les données Shopify réelles (fetch API)
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Share2, ShoppingCart, Check, Star, Truck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/Separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from '@/components/ui/Carousel';
import { AspectRatio } from '@/components/ui/AspectRatio';
import { ProductThumbnailCard } from './ProductThumbnailCard';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { LoadingDots } from '@/components/ui/LoadingDots';
import { useCart } from '@/lib/CartContext';
import { useProductCurrency } from '@/hooks/useProductCurrency';
import { extractCurrencyFromProduct } from '@/lib/currency/helpers';
import type { Product } from '@/app/src/lib/shopify/types';
import type { EcommerceProduct, BaseEcommerceProps } from '@/app/src/types/ecommerce';

interface ShippingInfo {
  freeShippingThreshold: number;
  deliveryDaysFrance: string;
  deliveryDaysInternational: string;
  standardShippingCost: number;
  expressShippingCost: number;
  expressDeliveryDays: string;
}

interface ProductOverviewProps extends BaseEcommerceProps {
  product: Product;
  relatedProducts?: Product[];
}

export function ProductOverview({ product, relatedProducts = [], className, variant = 'default' }: ProductOverviewProps) {
  const { addItem } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<string | null>(product.firstVariantId || null);
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);
  const [api, setApi] = useState<CarouselApi>();

  // Utiliser le hook pour extraire automatiquement le currencyCode et formater les prix
  // Extraire le currencyCode depuis le produit (peut être depuis priceRange si disponible)
  const shopifyCurrencyCode = extractCurrencyFromProduct(product as any);
  const { formatPrice, currency } = useProductCurrency(product as any);

  // Récupérer les informations de livraison depuis l'API
  useEffect(() => {
    async function fetchShippingInfo() {
      try {
        const response = await fetch('/api/shipping');
        const data = await response.json();
        
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

  // Synchroniser le carousel avec selectedImageIndex
  useEffect(() => {
    if (!api) return;
    
    const handleSelect = () => {
      const selectedIndex = api.selectedScrollSnap();
      setSelectedImageIndex(selectedIndex);
    };

    api.on('select', handleSelect);
    handleSelect(); // Appeler immédiatement pour synchroniser l'état initial

    return () => {
      api.off('select', handleSelect);
    };
  }, [api]);

  // Synchroniser le carousel quand selectedImageIndex change (depuis les miniatures)
  useEffect(() => {
    if (!api) return;
    if (api.selectedScrollSnap() === selectedImageIndex) return;
    
    api.scrollTo(selectedImageIndex);
  }, [selectedImageIndex, api]);

  // Initialiser les options sélectionnées avec la première variante
  useEffect(() => {
    if (product.variants && product.variants.length > 0 && product.options) {
      const firstVariant = product.variants[0];
      const initialOptions: Record<string, string> = {};
      product.options.forEach(option => {
        const optionValue = firstVariant.selectedOptions.find(so => so.name === option.name)?.value;
        if (optionValue) {
          initialOptions[option.name] = optionValue;
        }
      });
      setSelectedOptions(initialOptions);
      setSelectedVariant(firstVariant.id);
    }
  }, [product]);

  // Trouver la variante correspondant aux options sélectionnées
  const findVariantByOptions = useCallback((options: Record<string, string>) => {
    if (!product.variants || !product.options) return null;
    
    return product.variants.find(variant => {
      return product.options?.every(option => {
        const selectedValue = options[option.name];
        return variant.selectedOptions.some(so => 
          so.name === option.name && so.value === selectedValue
        );
      });
    });
  }, [product.variants, product.options]);

  // Mettre à jour la variante sélectionnée quand les options changent
  useEffect(() => {
    const variant = findVariantByOptions(selectedOptions);
    if (variant) {
      setSelectedVariant(variant.id);
      // Mettre à jour l'image si la variante a une image spécifique
      if (variant.image) {
        const imageIndex = product.images.findIndex(img => img === variant.image);
        if (imageIndex !== -1) {
          setSelectedImageIndex(imageIndex);
        }
      }
    }
  }, [selectedOptions, findVariantByOptions, product.images]);

  // Obtenir la variante actuellement sélectionnée
  const currentVariant = product.variants?.find(v => v.id === selectedVariant);
  const displayPrice = currentVariant?.price ?? product.price;
  const displayCompareAtPrice = currentVariant?.compareAtPrice ?? product.compareAtPrice;
  const isVariantAvailable = currentVariant?.availableForSale ?? product.availableForSale;

  // Calculer la réduction si applicable
  const discount = displayCompareAtPrice
    ? Math.round(((displayCompareAtPrice - displayPrice) / displayCompareAtPrice) * 100)
    : 0;

  // Gérer le changement d'option
  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionName]: value,
    }));
  };

  // Gérer l'ajout au panier
  const handleAddToCart = async () => {
    if (!isVariantAvailable) return;

    if (!selectedVariant) {
      alert('Veuillez sélectionner une variante avant d\'ajouter au panier');
      return;
    }

    setIsAddingToCart(true);
    try {
      addItem({
        variantId: selectedVariant,
        productId: product.id,
        title: product.title,
        price: displayPrice,
        quantity,
        image: currentVariant?.image || product.images[0] || '/assets/images/collections/placeholder.svg',
        handle: product.handle,
      });

      // Feedback visuel
      setTimeout(() => setIsAddingToCart(false), 500);
    } catch (error) {
      console.error('Erreur lors de l\'ajout au panier:', error);
      setIsAddingToCart(false);
      // Afficher un message d'erreur à l'utilisateur si nécessaire
      if (error instanceof Error && error.message.includes('variante')) {
        alert(error.message);
      }
    }
  };

  // Gérer le partage
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: product.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Erreur lors du partage:', error);
      }
    } else {
      // Fallback : copier dans le presse-papier
      navigator.clipboard.writeText(window.location.href);
    }
  };

  return (
    <div className={`product-overview ${className}`}>
      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        {/* Galerie d'images */}
        <Card className="border-0 shadow-none p-0 h-fit">
          <Carousel className="w-full" setApi={setApi}>
            <CarouselContent>
              {product.images.length > 0 ? (
                product.images.map((image, index) => (
                  <CarouselItem key={index}>
                    <AspectRatio ratio={1} className="overflow-hidden rounded-xl">
                      <Image
                        src={image}
                        alt={`${product.title} ${index + 1}`}
                        fill
                        className="object-cover"
                        priority={index === 0}
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </AspectRatio>
                  </CarouselItem>
                ))
              ) : (
                <CarouselItem>
                  <AspectRatio ratio={1} className="overflow-hidden rounded-xl bg-muted">
                    <div className="flex items-center justify-center h-full">
                      <span className="text-muted-foreground">Image non disponible</span>
                    </div>
                  </AspectRatio>
                </CarouselItem>
              )}
            </CarouselContent>
            {product.images.length > 1 && (
              <>
                <CarouselPrevious />
                <CarouselNext />
              </>
            )}
          </Carousel>

          {/* Miniatures */}
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-4 md:gap-3 lg:gap-4">
              {product.images.slice(0, 4).map((image, index) => (
                <ProductThumbnailCard
                  key={index}
                  image={image}
                  alt={`${product.title} miniature ${index + 1}`}
                  isActive={selectedImageIndex === index}
                  onClick={() => setSelectedImageIndex(index)}
                  index={index}
                />
              ))}
            </div>
          )}
        </Card>

        {/* Informations produit */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-3xl mb-2">{product.title}</CardTitle>
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant="default" className="text-2xl px-0 py-0 bg-transparent text-jolananas-pink-deep font-bold">
                    {formatPrice(displayPrice, currency)}
                  </Badge>
                  {displayCompareAtPrice && (
                    <>
                      <Badge variant="outline" className="text-lg line-through">
                        {formatPrice(displayCompareAtPrice, currency)}
                      </Badge>
                      <Badge variant="destructive" className="text-lg">
                        -{discount}%
                      </Badge>
                    </>
                  )}
                </div>
              </div>
            </div>
            <CardDescription className="text-base leading-relaxed">
              {product.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Disponibilité */}
            {!isVariantAvailable && (
              <Alert variant="destructive" role="alert">
                <AlertDescription>
                  {currentVariant ? 'Cette variante est actuellement épuisée. Veuillez sélectionner une autre variante.' : 'Ce produit est actuellement épuisé. Nous vous informerons dès qu\'il sera à nouveau disponible.'}
                </AlertDescription>
              </Alert>
            )}

            {/* Sélecteurs d'options (variantes) */}
            {product.options && product.options.length > 0 && product.variants && product.variants.length > 0 && (
              <div className="space-y-4">
                {product.options.map((option) => {
                  // Si le nom de l'option est court (<= 2 caractères), afficher "Variantes"
                  const displayName = option.name.length <= 2 && option.name.trim() !== '' 
                    ? 'Variantes' 
                    : option.name;
                  
                  return (
                    <div key={option.name} className="space-y-2">
                      {/* Nom du groupe de variantes - toujours affiché */}
                      <label htmlFor={`option-${option.name}`} className="text-base font-semibold text-foreground block">
                        {displayName}
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {option.values.map((value) => {
                        const isSelected = selectedOptions[option.name] === value;
                        // Vérifier si cette combinaison d'options existe
                        const tempOptions = { ...selectedOptions, [option.name]: value };
                        const variantExists = findVariantByOptions(tempOptions) !== null;
                        // Vérifier si la variante est disponible
                        const variant = findVariantByOptions(tempOptions);
                        const isAvailable = variant ? variant.availableForSale : false;

                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => handleOptionChange(option.name, value)}
                            disabled={!variantExists}
                            className={`
                              px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium
                              ${isSelected
                                ? 'border-jolananas-pink-medium bg-jolananas-pink-light text-jolananas-pink-deep'
                                : 'border-gray-300 hover:border-jolananas-pink-medium bg-white text-gray-700'
                              }
                              ${!variantExists
                                ? 'opacity-50 cursor-not-allowed line-through'
                                : 'cursor-pointer hover:bg-gray-50'
                              }
                              ${!isAvailable && variantExists
                                ? 'ring-2 ring-red-300'
                                : ''
                              }
                            `}
                            aria-label={`Sélectionner ${option.name}: ${value}`}
                          >
                            {value}
                            {!isAvailable && variantExists && (
                              <span className="ml-2 text-xs text-red-600">(Épuisé)</span>
                            )}
                          </button>
                        );
                      })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Sélecteur de quantité */}
            {isVariantAvailable && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <label htmlFor="quantity" className="text-sm font-medium">
                    Quantité
                  </label>
                  <Select
                    value={quantity.toString()}
                    onValueChange={(value) => setQuantity(parseInt(value, 10))}
                  >
                    <SelectTrigger id="quantity" className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Boutons d'action */}
                <div className="space-y-3">
                  <Button
                    size="lg"
                    className="w-full bg-gradient-to-r from-jolananas-pink-medium to-jolananas-pink-deep hover:from-jolananas-pink-deep hover:to-jolananas-pink-medium text-white"
                    disabled={!isVariantAvailable || isAddingToCart || !selectedVariant}
                    onClick={handleAddToCart}
                  >
                    {isAddingToCart ? (
                      <>
                        <span className="animate-spin mr-2">⏳</span>
                        Ajout en cours <LoadingDots size="sm" />
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-5 w-5" />
                        Ajouter au panier
                      </>
                    )}
                  </Button>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsFavorite(!isFavorite)}
                      aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                    >
                      <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-jolananas-pink-medium text-jolananas-pink-medium' : ''}`} />
                      {isFavorite ? 'Retiré' : 'Favoris'}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={handleShare}
                      aria-label="Partager ce produit"
                    >
                      <Share2 className="h-4 w-4 mr-2" />
                      Partager
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            {/* Tags */}
            {product.tags.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {product.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Informations supplémentaires */}
            <div className="grid grid-cols-2 gap-4">
              {shippingInfo ? (
                <div className="flex items-center gap-2 text-sm">
                  <Truck className="h-4 w-4 text-jolananas-pink-medium" />
                  <span>Livraison gratuite à partir de {shippingInfo.freeShippingThreshold}€</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="h-4 w-4" />
                  <span>Informations de livraison indisponibles</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm">
                <Check className="h-4 w-4 text-jolananas-pink-medium" />
                <span>Garantie satisfait ou remboursé</span>
              </div>
            </div>

            <Separator />

            {/* Onglets détails */}
            <Tabs defaultValue="details">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="details">Détails</TabsTrigger>
                <TabsTrigger value="shipping">Livraison</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="mt-4">
                <CardDescription className="whitespace-pre-line">
                  {product.description}
                </CardDescription>
              </TabsContent>
              <TabsContent value="shipping" className="mt-4">
                {shippingInfo ? (
                  <div className="space-y-2 text-sm">
                    <p>
                      <strong>Livraison gratuite</strong> à partir de {shippingInfo.freeShippingThreshold}€ d'achat.
                    </p>
                    <p>
                      Délai de livraison : <strong>{shippingInfo.deliveryDaysFrance}</strong> en France métropolitaine.
                    </p>
                    <p>
                      {shippingInfo.deliveryDaysInternational}
                    </p>
                  </div>
                ) : (
                  <Alert variant="default" className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                    <AlertDescription className="text-blue-800 dark:text-blue-200">
                      <strong>Informations de livraison</strong>
                      <br />
                      Les frais de livraison, la TVA et le total final seront calculés lors du paiement sécurisé selon votre adresse de livraison.
                    </AlertDescription>
                  </Alert>
                )}
              </TabsContent>
            </Tabs>

            <Separator />

            {/* FAQ */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="faq">
                <AccordionTrigger>Questions fréquentes</AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Quels sont les délais de livraison ?</h4>
                      {shippingInfo ? (
                        <p className="text-sm text-muted-foreground">
                          Livraison gratuite à partir de {shippingInfo.freeShippingThreshold}€. Délai de livraison : {shippingInfo.deliveryDaysFrance} en France métropolitaine.
                        </p>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Les informations de livraison ne sont pas disponibles pour le moment.
                        </p>
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Puis-je retourner ce produit ?</h4>
                      <p className="text-sm text-muted-foreground">
                        Oui, vous pouvez retourner ce produit sous 30 jours après réception, sans justification.
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2">Le produit est-il garanti ?</h4>
                      <p className="text-sm text-muted-foreground">
                        Tous nos produits bénéficient de notre garantie satisfait ou remboursé. Si vous n'êtes pas satisfait, contactez-nous.
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>

      {/* Produits associés */}
      {relatedProducts.length > 0 && (
        <section className="mt-16">
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Vous aimerez aussi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <Card key={relatedProduct.id} className="group overflow-hidden">
                    <Link href={`/products/${relatedProduct.handle}`}>
                      <AspectRatio ratio={1}>
                        <Image
                          src={relatedProduct.images[0] || '/assets/images/collections/placeholder.svg'}
                          alt={relatedProduct.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        />
                      </AspectRatio>
                      <CardHeader>
                        <CardTitle className="line-clamp-2 text-base">
                          {relatedProduct.title}
                        </CardTitle>
                        <CardDescription className="text-sm font-bold text-jolananas-pink-deep">
                          {formatPrice(relatedProduct.price, currency)}
                        </CardDescription>
                      </CardHeader>
                    </Link>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  );
}

