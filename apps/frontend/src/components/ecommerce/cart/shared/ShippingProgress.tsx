"use client";

import { motion } from "framer-motion";
import { useCurrency } from "@/hooks/useCurrency";

interface ShippingProgressProps {
  progressPercent: number;
  freeShippingLeft: number;
}

export function ShippingProgress({ progressPercent, freeShippingLeft }: ShippingProgressProps) {
  const { formatPrice } = useCurrency();

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-gray-600">
          {freeShippingLeft > 0 
            ? `Plus que ${formatPrice(freeShippingLeft)} pour la livraison gratuite`
            : "Livraison gratuite offerte !"}
        </span>
        <span className="font-bold text-jolananas-pink-deep">{Math.round(progressPercent)}%</span>
      </div>
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-jolananas-pink-deep"
          initial={{ width: 0 }}
          animate={{ width: `${progressPercent}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
