"use client";

import { useState, useEffect, useCallback } from "react";
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
  X,
  Maximize2,
  Images,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn, formatPrice } from "@/lib/utils";

import type { Product, Variant as ProductVariant } from "@/lib/shopify/types";
import { getVariantAvailability } from "@/lib/shopify";
import { StoreAvailability } from "@/components/product/StoreAvailability";
import { ShopPayInstallments } from "@/components/product/ShopPayInstallments";
import { ProductBundle } from "@/components/product/ProductBundle";
import { SellingPlanSelector } from "@/components/product/SellingPlanSelector";
import { useBanner } from "@/components/layout/BannerContext";
import { PageContainer } from "@/components/layout/PageContainer";

// ─── Types ───────────────────────────────────────────────────────────────────
interface PhotoGroup {
  label: string;
  images: string[];
}

// ─── Helper: build photo groups from product data ────────────────────────────
function buildPhotoGroups(product: Product): PhotoGroup[] {
  const hasVariants =
    product.variants && product.variants.length > 0 &&
    !(product.variants.length === 1 && product.variants[0].title === "Default Title");

  // Map variant image url → variant label(s)
  const variantImageMap = new Map<string, string[]>();
  if (hasVariants && product.variants) {
    for (const variant of product.variants) {
      if (variant.image?.url) {
        const url = variant.image.url;
        if (!variantImageMap.has(url)) variantImageMap.set(url, []);
        const label =
          variant.selectedOptions?.map((o) => o.value).join(" / ") ||
          variant.title;
        variantImageMap.get(url)!.push(label);
      }
    }
  }

  // All product images
  const allImages: string[] = (product.images || []).map((img) => img.url);

  if (!hasVariants) {
    // No meaningful variants — single group
    return allImages.length > 0
      ? [{ label: "Toutes les photos", images: allImages }]
      : [];
  }

  // Group images by variant label
  const groups = new Map<string, string[]>();

  for (const url of allImages) {
    const labels = variantImageMap.get(url);
    if (labels && labels.length > 0) {
      for (const label of labels) {
        if (!groups.has(label)) groups.set(label, []);
        if (!groups.get(label)!.includes(url)) groups.get(label)!.push(url);
      }
    } else {
      const key = "Photos de la collection";
      if (!groups.has(key)) groups.set(key, []);
      if (!groups.get(key)!.includes(url)) groups.get(key)!.push(url);
    }
  }

  return Array.from(groups.entries()).map(([label, images]) => ({
    label,
    images,
  }));
}

// ─── Photo Library Modal ──────────────────────────────────────────────────────
function PhotoLibraryModal({
  open,
  onClose,
  groups,
  productTitle,
}: {
  open: boolean;
  onClose: () => void;
  groups: PhotoGroup[];
  productTitle: string;
}) {
  const allImages = groups.flatMap((g) => g.images);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const goPrev = useCallback(() => {
    setLightboxIndex((i) =>
      i !== null ? (i - 1 + allImages.length) % allImages.length : null
    );
  }, [allImages.length]);

  const goNext = useCallback(() => {
    setLightboxIndex((i) =>
      i !== null ? (i + 1) % allImages.length : null
    );
  }, [allImages.length]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightboxIndex !== null) setLightboxIndex(null);
        else onClose();
      }
      if (lightboxIndex !== null) {
        if (e.key === "ArrowLeft") goPrev();
        if (e.key === "ArrowRight") goNext();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, lightboxIndex, onClose, goPrev, goNext]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[300] flex flex-col"
          style={{ background: "rgba(0,0,0,0.96)" }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 sm:px-8 py-4 border-b border-white/10 flex-shrink-0">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/50 font-semibold">
                Photothèque
              </p>
              <h2 className="text-white font-black text-lg sm:text-2xl tracking-tight uppercase leading-tight">
                {productTitle}
              </h2>
              <p className="text-white/40 text-xs mt-0.5">
                {allImages.length} photo{allImages.length > 1 ? "s" : ""}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors focus:outline-none"
              aria-label="Fermer la photothèque"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body: Groups */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-10">
            {groups.map((group) => (
              <section key={group.label}>
                {/* Group label */}
                {groups.length > 1 && (
                  <div className="mb-4 flex items-center gap-3">
                    <span className="h-px flex-1 bg-white/10" />
                    <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-white/60 px-2 whitespace-nowrap">
                      {group.label}
                    </h3>
                    <span className="h-px flex-1 bg-white/10" />
                  </div>
                )}

                {/* Masonry-style grid */}
                <div
                  className={cn(
                    "grid gap-3",
                    group.images.length === 1
                      ? "grid-cols-1 max-w-sm mx-auto"
                      : group.images.length === 2
                      ? "grid-cols-2"
                      : group.images.length === 3
                      ? "grid-cols-2 sm:grid-cols-3"
                      : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                  )}
                >
                  {group.images.map((url, idx) => {
                    const globalIndex = allImages.indexOf(url);
                    return (
                      <motion.div
                        key={url + idx}
                        className="relative w-full overflow-hidden rounded-xl sm:rounded-2xl bg-white/5 cursor-pointer group"
                        style={{ paddingBottom: "100%" }}
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", damping: 20, stiffness: 300 }}
                        onClick={() => setLightboxIndex(globalIndex)}
                      >
                        <div className="absolute inset-0">
                          <Image
                            src={url}
                            alt={`${productTitle} — ${group.label} — photo ${idx + 1}`}
                            fill
                            sizes="(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 22vw"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          {/* Hover overlay */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                              <Maximize2 className="w-4 h-4 text-white" />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </section>
            ))}

            {groups.length === 0 && (
              <div className="flex items-center justify-center h-40 text-white/30 text-sm">
                Aucune photo disponible
              </div>
            )}
          </div>

          {/* Inline Lightbox */}
          <AnimatePresence>
            {lightboxIndex !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 z-[310] flex items-center justify-center"
                style={{ background: "rgba(0,0,0,0.95)" }}
              >
                {/* Close lightbox */}
                <button
                  onClick={() => setLightboxIndex(null)}
                  className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  aria-label="Fermer"
                >
                  <X className="w-5 h-5" />
                </button>

                {/* Counter */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-black/50 backdrop-blur-sm text-white/70 text-xs font-bold px-4 py-1.5 rounded-full">
                  {lightboxIndex + 1} / {allImages.length}
                </div>

                {/* Prev */}
                {allImages.length > 1 && (
                  <button
                    onClick={goPrev}
                    className="absolute left-2 sm:left-6 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    aria-label="Photo précédente"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                {/* Image */}
                <motion.div
                  key={lightboxIndex}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full h-full max-w-5xl max-h-[85vh] mx-auto px-14 sm:px-20 flex items-center justify-center"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={allImages[lightboxIndex]}
                      alt={`${productTitle} — photo ${lightboxIndex + 1}`}
                      fill
                      className="object-contain"
                      sizes="100vw"
                      priority
                      quality={95}
                    />
                  </div>
                </motion.div>

                {/* Next */}
                {allImages.length > 1 && (
                  <button
                    onClick={goNext}
                    className="absolute right-2 sm:right-6 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    aria-label="Photo suivante"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}

                {/* Filmstrip */}
                {allImages.length > 1 && (
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center px-4">
                    <div className="flex gap-2 overflow-x-auto max-w-full pb-1 scrollbar-hide">
                      {allImages.map((url, idx) => (
                        <button
                          key={idx}
                          onClick={() => setLightboxIndex(idx)}
                          className={cn(
                            "relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                            idx === lightboxIndex
                              ? "border-white ring-2 ring-white/30"
                              : "border-transparent opacity-50 hover:opacity-80"
                          )}
                        >
                          <Image
                            src={url}
                            alt=""
                            fill
                            sizes="64px"
                            className="object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function ProductPageClient({
  product,
  recommendations,
  shopInfo,
}: {
  product: Product;
  recommendations?: Product[];
  shopInfo?: any;
}) {
  const { addItem } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [quantity, setQuantity] = useState(1);

  // 1. GESTION DES VARIANTES
  const [selectedOptions, setSelectedOptions] = useState<
    Record<string, string>
  >({});
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );
  const [selectedSellingPlanId, setSelectedSellingPlanId] = useState<string | undefined>(undefined);

  // Lightbox State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Photo Library State
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const photoGroups = buildPhotoGroups(product);
  const totalPhotoCount = (product.images || []).length;

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

  // Fetch Store Availability based on selected variant
  const [availability, setAvailability] = useState<any>(null);

  useEffect(() => {
    if (!selectedVariant) {
      setAvailability(null);
      return;
    }
    const fetchAvailability = async () => {
      try {
        const data = await getVariantAvailability(selectedVariant.id);
        setAvailability(data);
      } catch (err) {
        console.error("Failed to fetch availability", err);
      }
    };
    fetchAvailability();
  }, [selectedVariant]);

  // 2. GESTION DES IMAGES
  const [activeImage, setActiveImage] = useState<string | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  useEffect(() => {
    if (selectedVariant?.image?.url) {
      setActiveImage(selectedVariant.image.url);
      const idx = product?.images?.findIndex((img: any) => img.url === selectedVariant.image!.url) ?? 0;
      setActiveImageIndex(idx >= 0 ? idx : 0);
    } else {
      const firstVideo = product?.media?.edges.find(
        (e: any) => e.node.mediaContentType === "VIDEO",
      );
      if (firstVideo && firstVideo.node.previewImage) {
        setActiveImage(firstVideo.node.previewImage.url);
        setActiveImageIndex(0);
      } else if (product?.featuredImage) {
        setActiveImage(product.featuredImage);
        setActiveImageIndex(0);
      } else if (product?.images && product.images.length > 0) {
        setActiveImage(product.images[0].url);
        setActiveImageIndex(0);
      }
    }
  }, [selectedVariant, product]);

  // Metadata for lightbox overlay
  const activeImageNode = product?.images?.[activeImageIndex];
  const activeImageAlt = activeImageNode?.altText || product.title;
  const totalImages = product?.images?.length || 1;
  const variantLabel = selectedVariant?.selectedOptions
    ?.map((opt) => opt.value)
    .filter((v) => v !== "Default Title")
    .join(" · ");

  // 3. HANDLERS
  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions((prev) => ({ ...prev, [optionName]: value }));
  };
  const handleAddToCart = async () => {
    if (!selectedVariant) return;
    setIsAdding(true);
    
    try {
      await addItem(selectedVariant.id, quantity, selectedSellingPlanId);
      setTimeout(() => setIsAdding(false), 500);
    } catch (err) {
      console.error("Failed to add to cart", err);
      setIsAdding(false);
    }
  };
  const price = selectedVariant?.price;
  const compareAtPrice = selectedVariant?.compareAtPrice;
  const isSale =
    compareAtPrice &&
    compareAtPrice > (price || 0);

  const isPreOrder = selectedVariant?.quantityAvailable === 0 && selectedVariant?.inventoryPolicy === "CONTINUE" && !selectedSellingPlanId;

  return (
    <div className="container mx-auto px-4 py-32 max-w-4xl">
      <PageContainer className="bg-[#FEF7F0] min-h-screen pt-12 pb-24">
        <PageContainer className="container mx-auto px-4 md:px-8">
          {/* LAYOUT GRID : 2 COLONNES */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            {/* COLONNE GAUCHE : GALERIE (Sticky) */}
            <div className="lg:col-span-7 space-y-6">
              <div className="sticky top-24 space-y-4">
                {/* Image Principale */}
                <div 
                  className="relative aspect-[4/5] md:aspect-square w-full overflow-hidden rounded-[2rem] bg-white border border-black/5 shadow-sm group cursor-zoom-in"
                  onClick={() => activeImage && setIsLightboxOpen(true)}
                >
                  {activeImage ? (
                    (() => {
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
                        <>
                          <Image
                            src={activeImage}
                            alt={product.title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 60vw"
                            className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                            priority
                          />
                          {/* Overlay Hint */}
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <div className="bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                              <Maximize2 className="w-4 h-4 text-primary" />
                              <span className="text-xs font-bold uppercase tracking-widest text-primary">Agrandir</span>
                            </div>
                          </div>
                        </>
                      );
                    })()
                  ) : (
                    <div className="flex items-center justify-center h-full text-muted-foreground bg-secondary/10">
                      Aucune image
                    </div>
                  )}

                  {/* Badge Promo */}
                  {isSale && (
                    <div className="absolute top-6 left-6 bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full uppercase tracking-widest z-10">
                      Soldes
                    </div>
                  )}
                </div>

                {/* Galerie Thumbnails + "Voir toutes" */}
                {((product?.images && product.images.length > 1) || (product?.media?.edges && product.media.edges.length > 0)) && (
                  <div className="space-y-3">
                    {/* Thumbnails Strip */}
                    <div 
                      className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide"
                      style={{ 
                        WebkitMaskImage: 'linear-gradient(90deg, transparent 0, #000 10%, #000 90%, transparent)',
                        maskImage: 'linear-gradient(90deg, transparent 0, #000 10%, #000 90%, transparent)',
                        WebkitMaskRepeat: 'no-repeat',
                        maskRepeat: 'no-repeat'
                      }}
                    >
                      {product?.images?.map((node, i) => (
                        <button
                          key={`img-${i}`}
                          onClick={() => { setActiveImage(node.url); setActiveImageIndex(i); }}
                          className={cn(
                            "relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all",
                            activeImage === node.url
                              ? "border-primary ring-2 ring-primary/20 ring-offset-2 ring-offset-[#FEF7F0]"
                              : "border-transparent hover:border-black/10",
                          )}
                          aria-label={`Vue ${i + 1}`}
                          aria-pressed={activeImage === node.url}
                          aria-controls={`product-image-${i}`}
                          aria-describedby={`product-image-${i}`}
                          aria-haspopup="dialog"
                          style={{ cursor: "pointer" }}
                        >
                          <Image
                            src={node.url}
                            alt={node.altText || `Vue ${i + 1}`}
                            fill
                            sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 96px"
                            className="object-cover"
                          />
                        </button>
                      ))}

                      {/* Vidéos */}
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
                              "relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all group/vid",
                              activeImage === node.previewImage?.url
                                ? "border-primary ring-2 ring-primary/20 ring-offset-2 ring-offset-[#FEF7F0]"
                                : "border-transparent hover:border-black/10",
                            )}
                          >
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 group-hover/vid:bg-black/10 transition-colors">
                              <div className="w-7 h-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm">
                                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-black border-b-[5px] border-b-transparent ml-1" />
                              </div>
                            </div>
                            {node.previewImage && (
                              <Image
                                src={node.previewImage.url}
                                alt="Produit en vidéo"
                                fill
                                sizes="(max-width: 640px) 64px, (max-width: 768px) 80px, 96px"
                                className="object-cover"
                              />
                            )}
                          </button>
                        ))}
                    </div>

                    {/* Bouton "Voir toutes les photos" */}
                    {totalPhotoCount > 1 && (
                      <button
                        onClick={() => setIsLibraryOpen(true)}
                        className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl border border-black/10 bg-white/60 hover:bg-white hover:border-primary/30 text-sm font-bold text-primary/70 hover:text-primary transition-all duration-200 group"
                      >
                        <Images className="w-4 h-4 transition-transform group-hover:scale-110" />
                        <span>Voir toutes les photos</span>
                        <span className="ml-1 text-xs font-semibold text-primary/40 bg-primary/5 px-2 py-0.5 rounded-full">
                          {totalPhotoCount}
                        </span>
                      </button>
                    )}
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
                
                {shopInfo?.paymentSettings?.supportedDigitalWallets?.includes("SHOP_PAY") && price && (
                  <ShopPayInstallments amount={price} currencyCode={product.currency} />
                )}
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

                {/* Sélecteur d'Abonnement / Selling Plans */}
                {product.sellingPlanGroups && product.sellingPlanGroups.length > 0 && (
                  <div className="space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                      Options d'achat
                    </h3>
                    <SellingPlanSelector
                      sellingPlanGroups={product.sellingPlanGroups}
                      onSellingPlanChange={setSelectedSellingPlanId}
                      basePrice={selectedVariant?.price || product.price}
                      currency={product.currency}
                    />
                  </div>
                )}

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

              {/* Actions Principales */}
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
                        : isPreOrder
                          ? "Pré-commander"
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
                
                <StoreAvailability availability={availability} />

                <ProductBundle mainProduct={product} recommendations={recommendations || []} />
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

        {/* STICKY MOBILE BAR */}
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

        {/* Lightbox (single image, click on main) */}
        <AnimatePresence>
          {isLightboxOpen && activeImage && (
            <div className="fixed inset-0 z-[200] flex items-center justify-center isolate">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
                onClick={() => setIsLightboxOpen(false)}
              />
              
              {/* Close Button */}
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ delay: 0.1 }}
                className="absolute top-6 right-6 z-50 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                onClick={() => setIsLightboxOpen(false)}
              >
                <X className="w-6 h-6" />
              </motion.button>

              {/* TOP-LEFT : Titre + Variante */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ delay: 0.15 }}
                className="absolute top-6 left-0 md:left-6 z-50 w-full md:w-auto md:max-w-[calc(100%-5rem)] text-center md:text-left pointer-events-none px-6 md:px-0"
              >
                <p className="text-white font-bold text-base md:text-lg leading-tight drop-shadow-md">
                  {product.title}
                </p>
                {variantLabel && (
                  <p className="text-white/70 text-xs md:text-sm font-medium mt-0.5 tracking-wide drop-shadow">
                    {variantLabel}
                  </p>
                )}
              </motion.div>

              {/* BOTTOM-RIGHT : Métadonnées photo */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ delay: 0.15 }}
                className="absolute bottom-6 left-0 md:left-auto md:right-6 z-50 w-full md:w-auto md:max-w-[calc(100%-3rem)] text-center md:text-right pointer-events-none px-6 md:px-0"
              >
                {activeImageAlt && activeImageAlt !== product.title && (
                  <p className="text-white/80 text-xs md:text-sm font-medium drop-shadow leading-snug">
                    {activeImageAlt}
                  </p>
                )}
                <p className="text-white/40 text-[11px] mt-0.5 tracking-widest uppercase drop-shadow">
                  {activeImageIndex + 1} / {totalImages}
                </p>
              </motion.div>

              {/* Image Container */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                className="relative w-full h-full max-w-7xl max-h-[90vh] p-4 flex items-center justify-center pointer-events-none"
              >
                <div className="relative w-full h-full pointer-events-auto">
                  <Image
                      src={activeImage}
                      alt={activeImageAlt}
                      fill
                      className="object-contain"
                      sizes="100vw"
                      priority
                      quality={100}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Photo Library Modal */}
        <PhotoLibraryModal
          open={isLibraryOpen}
          onClose={() => setIsLibraryOpen(false)}
          groups={photoGroups}
          productTitle={product.title}
        />
      </PageContainer>
    </div>
  );
}
