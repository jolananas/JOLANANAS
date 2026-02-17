"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useCart } from "@/components/providers/CartProvider";
import {
  Minus,
  Plus,
  ShoppingBag,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

import type { Product, Variant as ProductVariant } from "@/lib/shopify/types";
import { useBanner } from "@/components/layout/BannerContext";
import { PageContainer } from "@/components/layout/PageContainer";

export function ProductPageClient({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // 1. GESTION DES VARIANTES
  // On stocke les choix de l'utilisateur (ex: { "Color": "Blue", "Size": "M" })
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );

  // Initialisation des options par défaut (première variante dispo)
  useEffect(() => {
    if (product?.variants && product.variants.length > 0) {
      const firstVariant = product.variants[0];
      const initialOptions: Record<string, string> = {};
      firstVariant.selectedOptions?.forEach((opt) => {
        initialOptions[opt.name] = opt.value;
      });
      setSelectedOptions(initialOptions);
      setSelectedVariant(firstVariant);
    }
  }, [product]);

  // Mise à jour de la variante quand les options changent
  useEffect(() => {
    if (Object.keys(selectedOptions).length === 0) return;

    const matchedVariant = product?.variants?.find((variant) => {
      return variant.selectedOptions?.every(
        (opt) => selectedOptions[opt.name] === opt.value,
      );
    });

    setSelectedVariant(matchedVariant || null);
  }, [selectedOptions, product]);

  // 2. GESTION DES IMAGES
  // L'image affichée est celle de la variante, sinon la principale, sinon la première de la galerie
  const [activeImage, setActiveImage] = useState<string | null>(null);
  useEffect(() => {
    if (selectedVariant?.image?.url) {
      setActiveImage(selectedVariant.image.url);
    } else {
      // Check for video first
      const firstVideo = product?.media?.edges.find(
        (e: any) => e.node.mediaContentType === "VIDEO",
      );
      if (firstVideo && firstVideo.node.previewImage) {
        setActiveImage(firstVideo.node.previewImage.url);
      } else if (product?.featuredImage) {
        setActiveImage(product.featuredImage);
      } else if (product?.images && product.images.length > 0) {
        setActiveImage(product.images[0].url);
      }
    }
  }, [selectedVariant, product]);

  // 3. HANDLERS
  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));
  };
  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    setIsAdding(true);
    // On pourrait ajouter la quantité ici si la fonction addItem le supporte,
    // sinon on boucle (pour le MVP simple)
    for (let i = 0; i < quantity; i++) {
      await addItem(selectedVariant.id);
    }
    // Petit délai pour l'UX
    setTimeout(() => setIsAdding(false), 500);
  };
  const price = selectedVariant?.price;
  const compareAtPrice = selectedVariant?.compareAtPrice;
  const isSale =
    compareAtPrice &&
    compareAtPrice > (price || 0);

  return (
    <div className="bg-[#FEF7F0] min-h-screen pt-12 pb-24">
      <PageContainer className="container mx-auto px-4 md:px-8">
        {/* LAYOUT GRID : 2 COLONNES (Style Suisse: Grille stricte) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
          {/* COLONNE GAUCHE : GALERIE (Sticky) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Image Principale (Cadre arrondi "Soft") */}
              <div className="relative aspect-[4/5] md:aspect-square w-full overflow-hidden rounded-[2rem] bg-white border border-black/5 shadow-sm group">
                {activeImage ? (
                  (() => {
                    // Check if activeImage corresponds to a video preview
                    const videoMedia = product.media?.edges.find(
                      (e: any) =>
                        e.node.mediaContentType === "VIDEO" &&
                        e.node.previewImage?.url === activeImage,
                    )?.node;

                    if (
                      videoMedia &&
                      videoMedia.sources &&
                      videoMedia.sources.length > 0
                    ) {
                      return (
                        <video
                          autoPlay
                          muted
                          loop
                          playsInline
                          className="w-full h-full object-cover"
                          poster={activeImage}
                        >
                          <source
                            src={videoMedia.sources[0].url}
                            type={videoMedia.sources[0].mimeType}
                          />
                        </video>
                      );
                    }

                    return (
                      <Image
                        src={activeImage}
                        alt={product.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                        priority
                      />
                    );
                  })()
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground bg-secondary/10">
                    Aucune image
                  </div>
                )}

                {/* Badge Promo */}
                {isSale && (
                  <div className="absolute top-6 left-6 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest">
                    Soldes
                  </div>
                )}
              </div>

              {/* Galerie Thumbnails (Défilement horizontal propre) */}
              {product?.images && product.images.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                  {/* Images existantes */}
                  {product?.images?.map((node, i) => (
                    <button
                      key={`img-${i}`}
                      onClick={() => setActiveImage(node.url)}
                      className={cn(
                        "relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all",
                        activeImage === node.url
                          ? "border-primary ring-2 ring-primary/20 ring-offset-2 ring-offset-[#FEF7F0]"
                          : "border-transparent hover:border-black/10",
                      )}
                    >
                      <Image
                        src={node.url}
                        alt={node.altText || `Vue ${i + 1}`}
                        fill
                        sizes="(max-width: 768px) 80px, 96px"
                        className="object-cover"
                      />
                    </button>
                  ))}

                  {/* Vidéos (Ajoutées à la fin de la galerie) */}
                  {product?.media?.edges
                    .filter((e: any) => e.node.mediaContentType === "VIDEO")
                    .map(({ node }: any, i: number) => (
                      <button
                        key={`vid-${i}`}
                        onClick={() =>
                          node.previewImage &&
                          setActiveImage(node.previewImage.url)
                        }
                        className={cn(
                          "relative w-20 h-20 md:w-24 md:h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all group/vid",
                          activeImage === node.previewImage?.url
                            ? "border-primary ring-2 ring-primary/20 ring-offset-2 ring-offset-[#FEF7F0]"
                            : "border-transparent hover:border-black/10",
                        )}
                      >
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 group-hover/vid:bg-black/10 transition-colors">
                          <div className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                            <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-black border-b-[5px] border-b-transparent ml-1" />
                          </div>
                        </div>
                        {node.previewImage && (
                          <Image
                            src={node.previewImage.url}
                            alt="Produit en vidéo"
                            fill
                            sizes="(max-width: 768px) 80px, 96px"
                            className="object-cover"
                          />
                        )}
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          {/* COLONNE DROITE : INFO & ACTION */}
          <div className="lg:col-span-5 flex flex-col pt-4 lg:pt-0">
            {/* Header Produit */}
            <div className="mb-8 border-b border-black/10 pb-8">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter uppercase text-primary mb-4 leading-[0.9]">
                {product.title}
              </h1>

              <div className="flex items-baseline gap-4">
                <span className="text-3xl font-bold text-primary tracking-tight">
                  {price && formatPrice(price, product.currency)}
                </span>
                {isSale && (
                  <span className="text-xl text-muted-foreground line-through decoration-red-500/50">
                    {formatPrice(
                      compareAtPrice,
                      product.currency,
                    )}
                  </span>
                )}
              </div>
            </div>

            {/* Sélecteurs (Options) */}
            <div className="space-y-8 mb-10">
              {product?.options?.map((option) => (
                <div key={option.id} className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                    {option.name}{" "}:{" "}
                    <span className="text-primary">
                      {selectedOptions[option.name]}
                    </span>
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((value) => {
                      const isSelected = selectedOptions[option.name] === value;
                      return (
                        <button
                          key={value}
                          onClick={() => handleOptionChange(option.name, value)}
                          className={cn(
                            "px-6 py-3 rounded-full text-sm font-bold border transition-all duration-200 min-w-[3rem]",
                            isSelected
                              ? "bg-primary text-white border-primary shadow-lg scale-105"
                              : "bg-white text-primary border-primary/10 hover:border-primary/30 hover:bg-white/50",
                          )}
                        >
                          {value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Sélecteur Quantité */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Quantité
                </h3>
                <div className="flex items-center gap-4 bg-white w-fit px-2 py-1 rounded-full border border-black/10">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary/20 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center font-bold text-lg">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-secondary/20 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Actions Principales (Style Chrome) */}
            <div className="flex flex-col gap-4 mb-10">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={!selectedVariant?.availableForSale || isAdding}
                className="group relative w-full rounded-full h-16 text-lg font-bold uppercase tracking-widest text-white transition-all shadow-xl hover:scale-[1.02] overflow-hidden border-2 border-transparent bg-black disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  backgroundImage:
                    "linear-gradient(#000, #000), linear-gradient(90deg, #EC7B9C, #F4C0AC, #ffffff, #EC7B9C)",
                  backgroundOrigin: "padding-box, border-box",
                  backgroundClip: "padding-box, border-box",
                  backgroundSize: "100% 100%, 200% 100%",
                }}
              >
                <div
                  className="absolute inset-0 animate-shine [background-size:200%_100%]"
                  style={{
                    backgroundImage: "inherit",
                    backgroundOrigin: "inherit",
                    backgroundClip: "inherit",
                  }}
                />
                <span className="relative flex items-center justify-center gap-3 z-10">
                  {isAdding
                    ? "Ajout..."
                    : !selectedVariant?.availableForSale
                      ? "Épuisé"
                      : "Ajouter au Panier"}
                  <ShoppingBag
                    className={cn(
                      "w-5 h-5 transition-transform",
                      isAdding && "animate-bounce",
                    )}
                  />
                </span>
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-2">
                Livraison offerte dès 60€ • Fait main avec passion
              </p>
            </div>

            {/* Accordéons d'Information */}
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="description" className="border-black/10">
                <AccordionTrigger className="text-sm font-bold uppercase tracking-widest hover:no-underline hover:text-primary">
                  L'Âme de la Pièce
                </AccordionTrigger>
                <AccordionContent>
                  <div
                    className="prose prose-sm text-muted-foreground leading-relaxed max-w-none pb-4"
                    dangerouslySetInnerHTML={{
                      __html: product.descriptionHtml || product.description,
                    }}
                  />
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="shipping" className="border-black/10">
                <AccordionTrigger className="text-sm font-bold uppercase tracking-widest hover:no-underline hover:text-primary">
                  Livraison & Authenticité
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground space-y-4 pb-4">
                  <div className="flex gap-3 items-start">
                    <Truck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-primary">
                        Expédition Soignée
                      </p>
                      <p className="text-sm">
                        Chaque création est emballée avec soin et expédiée sous 24/48h depuis mon atelier en France.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-primary">
                        Satisfait ou Échangé
                      </p>
                      <p className="text-sm">
                        Chaque pièce est unique. Si elle ne vous transporte pas, contactez-moi sous 14 jours pour un échange ou un retour.
                      </p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
      </PageContainer>
      {/* STICKY MOBILE BAR (Fixé en bas sur mobile) */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-black/5 z-40 md:hidden flex items-center gap-4 animate-in slide-in-from-bottom-full duration-500 shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)]">
        <div className="flex-1">
          <p className="text-xs font-bold text-primary truncate max-w-[150px]">
            {product.title}
          </p>
          <div className="flex items-center gap-2">
            <p className="text-xs text-muted-foreground">
              {price && formatPrice(price, product.currency)}
            </p>
            {isSale && (
              <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full">
                SOLDES
              </span>
            )}
          </div>
        </div>
        <Button
          size="sm"
          onClick={handleAddToCart}
          disabled={!selectedVariant?.availableForSale || isAdding}
          className="rounded-full px-6 font-bold uppercase tracking-wider bg-primary text-white hover:bg-primary/80 shadow-lg"
        >
          {isAdding ? "..." : "Ajouter"}
        </Button>
      </div>
    </div>
  );
}
