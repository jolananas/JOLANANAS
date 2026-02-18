"use client";
import { useState } from "react";

import Link from "next/link";
import Image from "next/image";
import { Heart, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ProductQuickView } from "@/components/ecommerce/product/ProductQuickView";
import type { Product } from "@/lib/shopify/types";
import { useCurrency } from "@/hooks/useCurrency";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false);
  const { formatPrice, currency } = useCurrency(product.currency);
  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) *
          100,
      )
    : 0;

  // Nettoyer la description HTML
  const cleanDescription = product.description
    ? product.description
        .replace(/<[^>]*>/g, "") // Supprimer les balises HTML
        .replace(/&nbsp;/g, " ")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .trim()
    : null;

  // Obtenir l'image principale ou un placeholder
  const mainImage = product.featuredImage || (product.images && product.images.length > 0 ? product.images[0].url : null);

  return (
    <Link href={`/products/${product.handle}`} className="block h-full group">
      <Card className="h-full relative overflow-hidden border-border/40 bg-white/50 backdrop-blur-sm transition-all duration-500 ease-swiss hover:shadow-jolananas-lg hover:border-primary/30 hover:-translate-y-1">
        <CardContent className="p-0">
          <div className="flex flex-col items-center text-center">
            
            {/* 1. Conteneur Image : Ratio fixe pour l'alignement parfait */}
            <div className="relative w-full aspect-[4/5] md:aspect-[3/4] lg:aspect-[2/3] overflow-hidden rounded-t-lg mb-4 bg-secondary/5">
              {mainImage ? (
                <Image
                  src={mainImage}
                  alt={product.title}
                  fill
                  className="object-cover w-full h-full transition-transform duration-1000 ease-swiss group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-muted/30">
                  <span className="text-muted-foreground text-xs uppercase tracking-widest">
                    No Image
                  </span>
                </div>
              )}
              
              {/* Overlay Gradient on Hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              {/* Badge Promo Optionnel */}
              {hasDiscount && (
                <div className="absolute top-3 left-3 glass-strong text-primary text-[10px] font-bold px-2 py-1 uppercase tracking-[0.2em] rounded-full">
                  -{discountPercentage}%
                </div>
              )}

              {!product.availableForSale && (
                <div className="absolute inset-0 bg-jolananas-white-soft/80 backdrop-blur-[2px] flex items-center justify-center z-10">
                  <span className="text-xs font-bold uppercase tracking-[0.3em] text-primary">Sold Out</span>
                </div>
              )}
            </div>

            {/* 2. Contenu Texte : Raffiné */}
            <div className="w-full space-y-3 px-4 pb-6">
              <h3 className="font-sans font-semibold text-xs uppercase tracking-[0.15em] text-primary/80 transition-colors group-hover:text-primary line-clamp-1">
                {product.title}
              </h3>

              <div className="flex items-center justify-center gap-3">
                <span className="font-bold text-sm tracking-tight text-primary">
                  {formatPrice(product.price ?? 0, product.currency)}
                </span>
                {hasDiscount && (
                  <span className="text-[10px] text-muted-foreground line-through decoration-primary/30">
                    {formatPrice(product.compareAtPrice!, product.currency)}
                  </span>
                )}
              </div>

              {cleanDescription && (
                <p className="text-[10px] text-muted-foreground/60 line-clamp-2 leading-relaxed italic">
                  {cleanDescription}
                </p>
              )}
            </div>

          </div>
        </CardContent>
        <ProductQuickView
          productHandle={product.handle}
          isOpen={isQuickViewOpen}
          onClose={() => setIsQuickViewOpen(false)}
        />
      </Card>
    </Link>
  );
}
