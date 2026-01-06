/**
 * 🍍 JOLANANAS - Product Card Hydrogen Style
 * ==========================================
 * Design blanc épuré avec badges réduction et quick add to cart
 */

'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Heart, ShoppingCart, Eye } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { EnhancedCard } from '@/components/ui/card/EnhancedCard';
import { Badge } from '@/components/ui/Badge';
import { AspectRatio } from '@/components/ui/AspectRatio';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/HoverCard';
import { useCurrency } from '@/hooks/useCurrency';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    handle: string;
    featuredImage?: {
      url: string;
      altText?: string;
    };
    images?: {
      edges: Array<{
        node: {
          url: string;
          altText?: string;
        };
      }>;
    };
    variants?: {
      edges: Array<{
        node: {
          price: {
            amount: string;
            currencyCode: string;
          };
          compareAtPrice?: {
            amount: string;
            currencyCode: string;
          };
          availableForSale: boolean;
        };
      }>;
    };
  };
  showQuickAction?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

export function ProductCard({ product, showQuickAction, variant = 'default' }: ProductCardProps) {
  const firstVariant = product.variants?.edges?.[0]?.node;
  const price = firstVariant?.price;
  const compareAtPrice = firstVariant?.compareAtPrice;
  const imageRef = useRef<HTMLImageElement>(null);

  // Extraire le currencyCode depuis le prix (priorité absolue)
  const currencyCode = price?.currencyCode || compareAtPrice?.currencyCode;
  const { formatPrice, currency } = useCurrency(currencyCode);

  const discount =
    compareAtPrice && price
      ? Math.round(
          ((parseFloat(compareAtPrice.amount) - parseFloat(price.amount)) /
            parseFloat(compareAtPrice.amount)) *
            100,
        )
      : 0;

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <motion.div
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
          className="h-full"
        >
          <EnhancedCard
            hoverEffect="3d"
            imageRef={imageRef}
            className="group overflow-hidden hover:shadow-xl transition-shadow h-full"
          >
            <Link href={`/products/${product.handle}`} className="block h-full">
          <AspectRatio ratio={1} className="overflow-hidden relative">
            {product.featuredImage && (
              <div ref={imageRef} className="absolute inset-0">
              <Image
                src={product.featuredImage.url}
                alt={product.featuredImage.altText || product.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              </div>
            )}
            {discount > 0 && (
              <Badge variant="destructive" className="absolute top-3 left-3 z-10">
                -{discount}%
              </Badge>
            )}
            <motion.div
              className="absolute top-3 right-3 z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full bg-white/80 hover:bg-white"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      // TODO: Ajouter la logique de favoris
                    }}
                  >
                    <Heart className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ajouter aux favoris</p>
                </TooltipContent>
              </Tooltip>
            </motion.div>
          </AspectRatio>
          <EnhancedCard.Header>
            <EnhancedCard.Title className="text-lg font-semibold text-jolananas-black-ink mb-2 line-clamp-2">
              {product.title}
            </EnhancedCard.Title>
          </EnhancedCard.Header>
          <EnhancedCard.Content className="flex items-center justify-between mt-auto">
            {price && (
              <Badge variant="default" className="text-xl font-bold text-jolananas-pink-deep bg-transparent px-0 py-0">
                {formatPrice(parseFloat(price.amount), currency)}
              </Badge>
            )}
            {compareAtPrice && (
              <Badge variant="outline" className="text-sm line-through">
                {formatPrice(parseFloat(compareAtPrice.amount), currency)}
              </Badge>
            )}
          </EnhancedCard.Content>
        </Link>
          </EnhancedCard>
    </motion.div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">{product.title}</h4>
          {price && (
            <p className="text-sm font-bold text-primary">
              {formatPrice(parseFloat(price.amount), currency)}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Cliquez pour voir les détails
          </p>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
