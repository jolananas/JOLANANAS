"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useToast } from "@/components/ui/usetoast";
import { toast } from "sonner";
import { useCart } from "@/components/providers/CartProvider";

interface AddToCartButtonProps {
  productId: string;
  productTitle: string;
  productHandle: string;
  productImage: string;
  productPrice: number;
  variantId: string;
  availableForSale: boolean;
  quantityAvailable?: number;
  inventoryPolicy?: "DENY" | "CONTINUE";
  sellingPlanId?: string;
}

export function AddToCartButton({
  productId,
  productTitle,
  productHandle,
  productImage,
  productPrice,
  variantId,
  availableForSale,
  quantityAvailable,
  inventoryPolicy,
  sellingPlanId,
}: AddToCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false);
  const { addItem } = useCart();

  const isPreOrder = quantityAvailable === 0 && inventoryPolicy === "CONTINUE" && !sellingPlanId;

  const handleAddToCart = () => {
    // Check local cart quantity if needed, but for now rely on API response or simple check
    addItem(variantId, 1, sellingPlanId);

    setIsAdded(true);
    toast.success(
      isPreOrder
        ? `${productTitle} précommandé avec succès`
        : `${productTitle} a été ajouté à vos trésors`
    );
    setTimeout(() => setIsAdded(false), 2000);
  };

  if (!availableForSale) {
    return (
      <Button size="lg" disabled className="w-full">
        Épuisé
      </Button>
    );
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={isPreOrder ? "secondary" : "default"}
          size="lg"
          onClick={handleAddToCart}
          disabled={isAdded}
          className="w-full"
        >
          {isAdded ? (
            <>
              <Check className="mr-2 h-5 w-5" />
              {isPreOrder ? "Précommande enregistrée" : "C'est dans la boîte !"}
            </>
          ) : (
            <>
              <ShoppingBag className="mr-2 h-5 w-5" />
              {isPreOrder ? "PRÉCOMMANDER" : "AJOUTER À MES TRÉSORS"}
            </>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {isPreOrder
            ? "Expédition sous 2 semaines environ"
            : "Cliquez pour ajouter ce trésor"}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}
