"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShoppingBag, Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/components/providers/CartProvider";
import { useCurrency } from "@/hooks/useCurrency";
import { useScrollLock } from "@/hooks/useScrollLock";
import { useShipping } from "@/components/ecommerce/cart/shared/useShipping";
import { ReassuranceBlock } from "@/components/ecommerce/cart/shared/ReassuranceBlock";
import { CartItem } from "@/components/ecommerce/cart/shared/CartItem";
import { EmptyCart } from "@/components/cart/EmptyCart";

export function CartSheet() {
  const { items, totalItems, totalPrice } = useCart();
  const { formatPrice } = useCurrency();
  const [open, setOpen] = useState(false);
  const router = useRouter();
  
  const { shippingInfo, freeShippingLeft, progressPercent } = useShipping(totalPrice);

  // Gestion du scroll lock quand le panier est ouvert
  useScrollLock(open);

  // Gérer le passage à la caisse : fermer le panier puis naviguer
  const handleCheckout = () => {
    setOpen(false);
    // Petit délai pour permettre l'animation de fermeture
    setTimeout(() => {
      router.push("/checkout");
    }, 150);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-11 w-11 sm:h-9 sm:w-9 touch-manipulation text-jolananas-pink-medium hover:bg-jolananas-pink-light/10"
          aria-label={`Vos trésors (${totalItems})`}
          suppressHydrationWarning
        >
          <ShoppingBag className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-jolananas-pink-deep text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
              {totalItems}
            </span>
          )}
          <span className="sr-only">Vos trésors ({totalItems})</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        className="w-full sm:max-w-md flex flex-col p-0 border-l-gray-100"
      >
        <div className="p-6 border-b border-gray-50 bg-white sticky top-0 z-10">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3 text-2xl font-black text-gray-900">
              <ShoppingBag className="h-6 w-6 text-jolananas-pink-deep" />
              Vos trésors
              <Badge variant="secondary" className="bg-jolananas-pink-light/10 text-jolananas-pink-deep border-none text-xs">
                {totalItems} {totalItems > 1 ? 'pièces' : 'pièce'}
              </Badge>
            </SheetTitle>
            <SheetDescription className="sr-only">
              Vos trésors actuels chez Jolananas
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-6">
          {items.length === 0 ? (
            <div className="h-full flex items-center justify-center py-12">
              <EmptyCart onBrowse={() => setOpen(false)} />
            </div>
          ) : (
            <div className="py-6 space-y-2">
              <AnimatePresence mode="popLayout">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="border-b border-gray-50 last:border-0"
                  >
                    <CartItem item={item} variant="compact" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 bg-gray-50/50 border-t border-gray-100 space-y-6">
            <div className="space-y-4">


              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span className="text-sm">Sous-total</span>
                  <span className="font-semibold text-gray-900">{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span className="text-sm">Livraison</span>
                  <span className="text-xs italic">Calculée au paiement</span>
                </div>
                <Separator className="bg-gray-200/60" />
                <div className="flex justify-between items-end pt-2">
                  <div className="space-y-0.5">
                    <span className="text-lg font-bold text-gray-900">Total</span>
                    <p className="text-[10px] text-gray-400">TVA incluse</p>
                  </div>
                  <span className="text-2xl font-black text-jolananas-pink-deep">
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Button
                size="lg"
                className="w-full h-14 bg-jolananas-pink-deep hover:bg-jolananas-pink-medium text-white rounded-2xl font-bold text-lg shadow-glow-pink group transition-all"
                onClick={handleCheckout}
              >
                Commander ces trésors
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
              
              <ReassuranceBlock />
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
