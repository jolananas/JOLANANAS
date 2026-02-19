import { Heart, Share2, Truck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { useProductCurrency } from "@/hooks/useProductCurrency";
import type { Product, Variant } from "@/lib/shopify/types";
import { PageContainer } from "../layout/PageContainer";

interface ProductInfoProps {
  product: Product;
}

export function ProductInfo({ product }: ProductInfoProps) {
  // Utiliser le hook pour extraire automatiquement le currencyCode et formater les prix
  const { formatPrice, currency } = useProductCurrency(product);

  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) *
          100,
      )
    : 0;

  // Get first variant ID
  const variantId = product.firstVariantId;

  return (
    <div className="container mx-auto px-4 py-32 max-w-4xl">
      <PageContainer className="space-y-6">
        {/* Title and Price */}
        <div className="space-y-2">
          <h1 className="font-serif text-3xl font-bold tracking-tight md:text-4xl text-balance">
            {product.title}
          </h1>
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

          {/* Stock Status */}
          {/* Stock Status */}
          {(() => {
            const selectedVariant = product.variants?.find((v) => v.id === variantId) as Variant | undefined;
            if (!selectedVariant) return null;

            const quantity = selectedVariant.quantityAvailable;
            const policy = selectedVariant.inventoryPolicy;

            if (quantity === undefined) return null;

            return (
              <div className="mt-3 flex flex-wrap gap-2">
                {quantity === 1 && (
                  <Badge variant="outline" className="border-jolananas-pink-deep text-jolananas-pink-deep bg-jolananas-pink-light/10 animate-pulse">
                    ✨ Pièce unique - Disponible
                  </Badge>
                )}
                {quantity === 2 && (
                  <Badge variant="outline" className="border-orange-500 text-orange-600 bg-orange-50">
                    ⚡ Dernière chance
                  </Badge>
                )}
                {quantity === 0 && policy === "CONTINUE" && (
                  <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200 border">
                    ⏳ Précommande - Expédition sous 2 semaines
                  </Badge>
                )}
                {quantity > 2 && quantity <= 5 && (
                  <div className="text-sm font-medium text-orange-600 flex items-center gap-1.5">
                    ⚠️ Plus que {quantity} en stock
                  </div>
                )}
                {quantity > 5 && (
                  <div className="text-sm font-medium text-green-600 flex items-center gap-1.5">
                    <Truck className="h-4 w-4" />
                    En stock - Expédition immédiate
                  </div>
                )}
              </div>
            );
          })()}
        </div>

        <Separator />

        {/* Description */}
        <div className="space-y-2">
          <h2 className="font-serif font-semibold text-xl">Le mot de Joanna</h2>
          <p className="text-muted-foreground leading-relaxed">
            {product.description}
          </p>
        </div>

        {product.material?.reference && (
          <div className="space-y-3 pt-2">
            <Separator />
            <div className="flex items-center justify-between">
                <h3 className="font-serif font-medium text-lg">Matière & Origine</h3>
                <Button variant="link" asChild className="p-0 h-auto text-primary">
                  <a href={`/materials/${product.material.reference.handle}`}>En savoir plus &rarr;</a>
                </Button>
            </div>
            <p className="text-muted-foreground">
              {product.material.reference.fields.find(f => f.key === "name" || f.key === "label")?.value}
            </p>
          </div>
        )}

        {/* Secrets de fabrication */}
        {product.tags && product.tags.length > 0 && (
          <div className="space-y-2 pt-2">
            <Separator />
            <h3 className="font-serif font-medium text-lg">Les secrets de fabrication</h3>
            <div className="flex flex-wrap gap-2">
              {product.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="bg-jolananas-pink-light/10 text-jolananas-pink-deep hover:bg-jolananas-pink-light/20">
                  {tag}
                </Badge>
              ))}
            </div>
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
              productImage={
                product.images?.[0]?.url || "/assets/images/collections/placeholder.svg"
              }
              productPrice={product.price}
              variantId={variantId}
              availableForSale={product.availableForSale}
              quantityAvailable={product.variants?.find((v) => v.id === variantId)?.quantityAvailable}
              inventoryPolicy={product.variants?.find((v) => v.id === variantId)?.inventoryPolicy}
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
      </PageContainer>
    </div>
  );
}
