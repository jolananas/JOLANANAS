"use client"

import { useState } from "react"
import { ShoppingBag, Check } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/Tooltip"
import { useToast } from "@/components/ui/UseToast"
import { toast } from "sonner"
import { useCart } from "@/lib/CartContext"

interface AddToCartButtonProps {
  productId: string
  productTitle: string
  productHandle: string
  productImage: string
  productPrice: number
  variantId: string
  availableForSale: boolean
}

export function AddToCartButton({
  productId,
  productTitle,
  productHandle,
  productImage,
  productPrice,
  variantId,
  availableForSale,
}: AddToCartButtonProps) {
  const [isAdded, setIsAdded] = useState(false)
  const { addItem } = useCart()

  const handleAddToCart = () => {
    addItem({
      variantId,
      productId,
      title: productTitle,
      handle: productHandle,
      price: productPrice,
      quantity: 1,
      image: productImage,
    })

    setIsAdded(true)
    toast.success(`${productTitle} a été ajouté au panier`)
    setTimeout(() => setIsAdded(false), 2000)
  }

  if (!availableForSale) {
    return (
      <Button size="lg" disabled className="w-full">
        Épuisé
      </Button>
    )
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="shine" size="lg" onClick={handleAddToCart} disabled={isAdded} className="w-full">
          {isAdded ? (
            <>
              <Check className="mr-2 h-5 w-5" />
              Ajouté au panier
            </>
          ) : (
            <>
              <ShoppingBag className="mr-2 h-5 w-5" />
              Ajouter au panier
            </>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{availableForSale ? 'Cliquez pour ajouter au panier' : 'Produit épuisé'}</p>
      </TooltipContent>
    </Tooltip>
  )
}
