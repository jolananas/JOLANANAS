import { Heart, Share2, Truck } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Separator } from "@/components/ui/Separator"
import { Badge } from "@/components/ui/Badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/Accordion"
import { AddToCartButton } from "@/app/src/components/AddToCartButton"
import { useProductCurrency } from "@/hooks/useProductCurrency"
import type { Product } from "@/app/src/lib/shopify/types"

interface ProductInfoProps {
  product: Product
}

export function ProductInfo({ product }: ProductInfoProps) {
  // Utiliser le hook pour extraire automatiquement le currencyCode et formater les prix
  const { formatPrice, currency } = useProductCurrency(product);

  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price
  const discountPercentage = hasDiscount
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0

  // Get first variant ID
  const variantId = product.firstVariantId

  return (
    <div className="space-y-6">
      {/* Title and Price */}
      <div className="space-y-2">
        <h1 className="font-serif text-3xl font-bold tracking-tight md:text-4xl text-balance">{product.title}</h1>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-bold text-primary">
            {formatPrice(product.price, currency)}
          </span>
          {hasDiscount && (
            <>
              <Badge variant="outline" className="text-xl line-through">
                {formatPrice(product.compareAtPrice!, currency)}
              </Badge>
              <Badge variant="destructive" className="text-sm font-semibold">
                -{discountPercentage}%
              </Badge>
            </>
          )}
        </div>
      </div>

      <Separator />

      {/* Description */}
      <div className="space-y-2">
        <h2 className="font-serif font-semibold">Description</h2>
        <p className="text-muted-foreground leading-relaxed">{product.description}</p>
      </div>

      {/* Tags */}
      {product.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {product.tags.map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <Separator />

      {/* Actions */}
      <div className="space-y-3">
        {variantId ? (
          <AddToCartButton
            productId={product.id}
            productTitle={product.title}
            productHandle={product.handle}
            productImage={product.images[0] || "/assets/images/collections/placeholder.svg"}
            productPrice={product.price}
            variantId={variantId}
            availableForSale={product.availableForSale}
          />
        ) : (
          <Button disabled className="w-full">
            Produit indisponible
          </Button>
        )}
        <div className="flex gap-2">
          <Button variant="outline" size="lg" className="flex-1 bg-transparent">
            <Heart className="mr-2 h-5 w-5" />
            Ajouter aux favoris
          </Button>
          <Button variant="outline" size="lg">
            <Share2 className="h-5 w-5" />
            <span className="sr-only">Partager</span>
          </Button>
        </div>
      </div>

      <Separator />

    </div>
  )
}
