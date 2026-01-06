import Link from "next/link"
import Image from "next/image"
import { Heart, Eye } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Card, CardContent } from "@/components/ui/Card"
import { ProductQuickView } from "@/app/src/components/ecommerce/product/ProductQuickView"
import { useState } from "react"
import type { Product } from "@/app/src/lib/shopify/types"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const [isQuickViewOpen, setIsQuickViewOpen] = useState(false)
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price
  const discountPercentage = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0

  // Nettoyer la description HTML
  const cleanDescription = product.description
    ? product.description
        .replace(/<[^>]*>/g, '') // Supprimer les balises HTML
        .replace(/&nbsp;/g, ' ')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .trim()
    : null

  // Obtenir l'image principale ou un placeholder
  const mainImage = product.images && product.images.length > 0 
    ? product.images[0] 
    : null

  return (
    <Card className="group relative overflow-hidden border-border/40 transition-all hover:shadow-lg hover:border-primary/20">
      <Link href={`/products/${product.handle}`}>
        <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-muted to-muted/50">
          {mainImage ? (
            <Image
              src={mainImage}
              alt={product.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              unoptimized
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-muted">
              <span className="text-muted-foreground text-sm">Aucune image</span>
            </div>
          )}
          {hasDiscount && (
            <div className="absolute top-2 left-2 bg-accent text-accent-foreground px-2 py-1 rounded-md text-xs font-semibold z-10">
              -{discountPercentage}%
            </div>
          )}
          {!product.availableForSale && (
            <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10">
              <span className="text-sm font-semibold">Épuisé</span>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-4">
        <div className="relative">
          <div className="absolute top-0 right-0 flex gap-1 z-10">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 shrink-0 hover:text-accent"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                // TODO: Ajouter la logique de favoris
              }}
            >
              <Heart className="h-4 w-4" />
              <span className="sr-only">Ajouter aux favoris</span>
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 shrink-0 hover:text-accent"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setIsQuickViewOpen(true)
              }}
            >
              <Eye className="h-4 w-4" />
              <span className="sr-only">Voir rapidement</span>
            </Button>
          </div>
          <div className="text-center pr-8">
            <Link href={`/products/${product.handle}`}>
              <h3 className="font-serif font-semibold text-sm leading-tight group-hover:text-primary transition-colors px-2">
                {product.title}
              </h3>
            </Link>
            {cleanDescription && (
              <p className="mt-2 text-xs text-muted-foreground line-clamp-2 px-2 leading-relaxed">
                {cleanDescription}
              </p>
            )}
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="font-semibold text-primary">
                {product.price.toFixed(2)} {product.currency}
              </span>
              {hasDiscount && (
                <span className="text-xs text-muted-foreground line-through">
                  {product.compareAtPrice!.toFixed(2)} {product.currency}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <ProductQuickView
        productHandle={product.handle}
        isOpen={isQuickViewOpen}
        onClose={() => setIsQuickViewOpen(false)}
      />
    </Card>
  )
}
