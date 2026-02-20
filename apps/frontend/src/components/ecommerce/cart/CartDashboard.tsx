"use client";

import React, { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Plus, Minus, Trash2, ArrowRight, ShieldCheck, Truck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useCart } from "@/components/providers/CartProvider";
import { useCurrency } from "@/hooks/useCurrency";
import { safeJsonParse } from "@/lib/api-client";
import { EmptyCart } from "@/components/cart/EmptyCart";
import { useShipping } from "./shared/useShipping";
import { ReassuranceBlock } from "./shared/ReassuranceBlock";
import { CartItem } from "./shared/CartItem";
import { PageContainer } from "@/components/layout/PageContainer";

export function CartDashboard() {
  const {
    items,
    totalItems,
    totalPrice,
  } = useCart();
  const { formatPrice } = useCurrency();
  const { shippingInfo, freeShippingLeft, progressPercent } = useShipping(totalPrice);

  const handleCheckout = () => {
    window.location.href = "/checkout";
  };

  if (items.length === 0) {
    return <EmptyCart fullPage={true} />;
  }

  return (
    <div className="mx-auto py-32">
      <PageContainer className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 tracking-tight">Mon Panier</h1>
              <p className="text-gray-500 mt-2">
                Vous avez <span className="font-semibold text-jolananas-pink-deep">{totalItems}</span> {totalItems > 1 ? 'articles' : 'article'} dans votre sélection.
              </p>
            </div>
            <Link href="/collections" className="text-jolananas-pink-deep hover:underline flex items-center gap-2 font-medium">
              Continuer mes achats <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Content - Items List */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {items.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <CartItem item={item} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Reassurance Badges */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Paiement Sécurisé</p>
                    <p className="text-xs text-gray-500">Transaction cryptée</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Livraison Suivie</p>
                    <p className="text-xs text-gray-500">Expédition rapide</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    <RotateCcw className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Retours Simples</p>
                    <p className="text-xs text-gray-500">Sous 14 jours</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar - Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <Card className="border-gray-100 shadow-lg bg-white overflow-hidden">
                  <div className="p-6 space-y-6">
                    <h2 className="text-xl font-bold text-gray-900">Résumé de la commande</h2>
                    
                    {/* Shipping Progress */}


                    <div className="space-y-4 pt-4 border-t border-gray-100">
                      <div className="flex justify-between text-gray-600">
                        <span>Sous-total</span>
                        <span className="font-semibold text-gray-900">{formatPrice(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600">
                        <span>Livraison</span>
                        <span className="text-sm italic">Calculée à l'étape suivante</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between items-end">
                        <div className="space-y-1">
                          <span className="text-lg font-bold text-gray-900">Total</span>
                          <p className="text-xs text-gray-400">TVA incluse</p>
                        </div>
                        <span className="text-3xl font-black text-jolananas-pink-deep">
                          {formatPrice(totalPrice)}
                        </span>
                      </div>
                    </div>

                    <Button 
                      size="lg" 
                      className="w-full bg-jolananas-pink-deep hover:bg-jolananas-pink-medium text-white h-14 rounded-2xl font-bold text-lg shadow-glow-pink group transition-all"
                      onClick={handleCheckout}
                    >
                      Passer à la caisse
                      <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </Button>

                    <div className="flex items-center justify-center gap-2 pt-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <p className="text-xs text-gray-500 font-medium">Commande prête pour expédition</p>
                    </div>
                  </div>
                </Card>

                <ReassuranceBlock />
              </div>
            </div>
          </div>
        </div>
      </div>
      </PageContainer>
    </div>
  );
}
