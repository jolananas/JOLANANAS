"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Product } from "@/lib/shopify/types";
import { useCart } from "@/components/providers/CartProvider";
import { toast } from "sonner";

export function ProductBundle({
  mainProduct,
  recommendations,
}: {
  mainProduct: Product;
  recommendations: Product[];
}) {
  const { addItem } = useCart();

  if (!recommendations || recommendations.length === 0) return null;

  // Take the first recommendation to create a "duo"
  const bundleProduct = recommendations[0];
  const bundlePrice = (mainProduct.price + bundleProduct.price);
  const currencyCode = mainProduct.currency;
  
  const handleAddBundle = async () => {
    // Add main product
    if (mainProduct.variants?.[0]) {
        await addItem(mainProduct.variants[0].id);
    }
    // Add bundle product
    if (bundleProduct.variants?.[0]) {
        await addItem(bundleProduct.variants[0].id);
    }
    toast.success("Le duo a été ajouté à votre panier !");
  };

  return (
    <div className="mt-8 p-6 bg-white border border-dashed border-primary/20 rounded-3xl relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-bl-xl">
        DUO PARFAIT
      </div>
      
      <h3 className="font-bold uppercase tracking-widest text-primary mb-4 flex items-center gap-2">
        <Plus className="w-4 h-4" /> Complétez votre look
      </h3>

      <div className="flex items-center gap-4">
        {/* Main Product Thumbnail */}
        <div className="relative w-16 h-16 rounded-xl overflow-hidden border shrink-0">
           {mainProduct.featuredImage && (
             <Image
               src={mainProduct.featuredImage}
               alt={mainProduct.title}
               fill
               className="object-cover"
             />
           )}
        </div>

        <Plus className="w-5 h-5 text-muted-foreground shrink-0" />

        {/* Bundle Product Thumbnail */}
        <div className="relative w-16 h-16 rounded-xl overflow-hidden border shrink-0">
           <Link href={`/products/${bundleProduct.handle}`}>
            {bundleProduct.featuredImage && (
                <Image
                src={bundleProduct.featuredImage}
                alt={bundleProduct.title}
                fill
                className="object-cover hover:scale-110 transition-transform"
                />
            )}
           </Link>
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{bundleProduct.title}</p>
          <p className="text-sm text-muted-foreground">
            {formatPrice(bundleProduct.price, bundleProduct.currency)}
          </p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-dashed border-primary/10 flex items-center justify-between">
         <div className="text-sm">
            <span className="text-muted-foreground">Total: </span>
            <span className="font-bold text-lg text-primary">{formatPrice(bundlePrice, currencyCode)}</span>
         </div>
         <Button size="sm" onClick={handleAddBundle} className="rounded-full">
            Ajouter le duo
         </Button>
      </div>
    </div>
  );
}
