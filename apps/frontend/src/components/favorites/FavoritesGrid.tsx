"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Skeleton } from "@/components/ui/skeleton";
import { useFavorites } from "@/hooks/useFavorites";
import { useCart } from "@/components/providers/CartProvider";
import { useCurrency } from "@/hooks/useCurrency";
import type { Product } from "@/lib/shopify/types";

interface FavoritesGridProps {
  products: Product[];
}

export function FavoritesGrid({ products }: FavoritesGridProps) {
  const { favoriteProducts, isFavorite, toggleFavorite } =
    useFavorites(products);
  const { addItem } = useCart();
  const { formatPrice } = useCurrency();

  if (favoriteProducts.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Heart className="h-12 w-12 text-muted-foreground/50" />
          </EmptyMedia>
          <EmptyTitle>Aucun favori pour le moment</EmptyTitle>
          <EmptyDescription>
            Commencez à ajouter des produits à vos favoris en cliquant sur
            l'icône cœur
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <Link href="/products">Découvrir nos produits</Link>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  const handleAddToCart = (product: Product) => {
    const variantId = product.firstVariantId;
    if (!variantId) {
      console.error("Aucune variante disponible pour ce produit");
      return;
    }

    const firstImage =
      product.images?.[0] || "/assets/images/collections/placeholder.svg";

    addItem(variantId);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {favoriteProducts.map((product) => {
        const firstImage =
          (typeof product.images?.[0] === 'string' ? product.images[0] : (product.images?.[0] as any)?.url) || 
          "/assets/images/collections/placeholder.svg";
        const isFav = isFavorite(product.id);

        return (
          <Card
            key={product.id}
            className="group overflow-hidden hover:shadow-xl transition-all duration-300 h-full"
          >
            {/* Image */}
            <Link
              href={`/products/${product.handle}`}
              className="block relative w-full aspect-square overflow-hidden"
            >
              <Image
                src={firstImage}
                alt={product.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />

              {/* Bouton Favoris */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  toggleFavorite(product.id);
                }}
                className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-md hover:bg-white transition-colors"
                aria-label={
                  isFav ? "Retirer des favoris" : "Ajouter aux favoris"
                }
              >
                <Heart
                  className={`h-5 w-5 transition-colors ${
                    isFav
                      ? "fill-primary text-primary"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            </Link>

            {/* Infos Produit */}
            <CardHeader>
              <Link href={`/products/${product.handle}`}>
                <CardTitle className="font-semibold text-lg mb-2 line-clamp-2 hover:text-primary transition-colors">
                  {product.title}
                </CardTitle>
              </Link>
              {product.description && (
                <CardDescription className="text-sm line-clamp-2">
                  {product.description}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="flex flex-col flex-grow">
              {/* Prix */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xl font-bold text-primary">
                  {formatPrice(product.price)}
                </span>
                {product.compareAtPrice &&
                  product.compareAtPrice > product.price && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(product.compareAtPrice)}
                    </span>
                  )}
              </div>

              {/* Bouton Ajouter au Panier */}
              <Button
                onClick={() => handleAddToCart(product)}
                className="w-full"
                disabled={!product.availableForSale}
              >
                <ShoppingBag className="h-4 w-4 mr-2" />
                {product.availableForSale
                  ? "Ajouter au panier"
                  : "Indisponible"}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
