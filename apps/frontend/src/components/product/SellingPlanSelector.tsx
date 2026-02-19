"use client";

import { useState } from "react";
import { Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { SellingPlanGroup, SellingPlan } from "@/lib/shopify/types";
import { Badge } from "@/components/ui/badge";

interface SellingPlanSelectorProps {
  sellingPlanGroups: SellingPlanGroup[];
  onSellingPlanChange: (sellingPlanId: string | undefined) => void;
  basePrice: number;
  currency: string;
}

export function SellingPlanSelector({
  sellingPlanGroups,
  onSellingPlanChange,
  basePrice,
  currency,
}: SellingPlanSelectorProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | undefined>(undefined);

  if (sellingPlanGroups.length === 0) return null;

  // For now, support the first selling plan group
  const group = sellingPlanGroups[0];
  const plans = group.sellingPlans.edges.map((e) => e.node);

  const handleSelect = (planId: string | undefined) => {
    setSelectedPlanId(planId);
    onSellingPlanChange(planId);
  };

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const calculateDiscountedPrice = (plan: SellingPlan) => {
    const adjustment = plan.priceAdjustments[0];
    if (!adjustment) return basePrice;

    if (adjustment.adjustmentValue.adjustmentPercentage) {
      return basePrice * (1 - adjustment.adjustmentValue.adjustmentPercentage / 100);
    }

    if (adjustment.adjustmentValue.adjustmentAmount) {
      return parseFloat(adjustment.adjustmentValue.adjustmentAmount.amount);
    }

    return basePrice;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        {/* One-time purchase */}
        <label
          className={cn(
            "relative flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition-all hover:bg-black/5",
            selectedPlanId === undefined
              ? "border-primary bg-primary/5 ring-2 ring-primary/20"
              : "border-black/10 bg-white"
          )}
          onClick={() => handleSelect(undefined)}
        >
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
                selectedPlanId === undefined ? "border-primary bg-primary" : "border-black/20"
              )}
            >
              {selectedPlanId === undefined && <Check className="h-3 w-3 text-white" />}
            </div>
            <div className="flex flex-col">
              <span className="font-bold uppercase tracking-widest text-xs">Achat unique</span>
              <span className="text-sm text-muted-foreground">Pièce artisanale limitée</span>
            </div>
          </div>
          <span className="font-bold">{formatPrice(basePrice)}</span>
        </label>

        {/* Subscription plans */}
        {plans.map((plan) => {
          const discountedPrice = calculateDiscountedPrice(plan);
          const hasDiscount = discountedPrice < basePrice;
          const discountPercent = hasDiscount 
            ? Math.round(((basePrice - discountedPrice) / basePrice) * 100)
            : 0;

          return (
            <label
              key={plan.id}
              className={cn(
                "relative flex cursor-pointer items-center justify-between rounded-2xl border-2 p-4 transition-all hover:bg-black/5",
                selectedPlanId === plan.id
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-black/10 bg-white"
              )}
              onClick={() => handleSelect(plan.id)}
            >
              <div className="flex items-center gap-3">
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors",
                    selectedPlanId === plan.id ? "border-primary bg-primary" : "border-black/20"
                  )}
                >
                  {selectedPlanId === plan.id && <Check className="h-3 w-3 text-white" />}
                </div>
                <div className="flex flex-col">
                  <span className="font-bold uppercase tracking-widest text-xs">
                    {plan.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">Abonnement privilège</span>
                    {hasDiscount && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 text-[10px] py-0 px-1.5 h-4">
                        -{discountPercent}%
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <span className="font-bold text-primary">{formatPrice(discountedPrice)}</span>
                {hasDiscount && (
                  <span className="text-[10px] text-muted-foreground line-through">
                    {formatPrice(basePrice)}
                  </span>
                )}
              </div>
            </label>
          );
        })}
      </div>

      <div className="flex items-start gap-2 rounded-xl bg-orange-50 p-3 text-[10px] text-orange-800 border border-orange-100 italic">
        <Info className="h-3 w-3 shrink-0 mt-0.5" />
        <p>
          L'abonnement vous garantit un accès prioritaire à nos nouvelles collections et un tarif préférentiel. 
          Annulable à tout moment après 2 cycles.
        </p>
      </div>
    </div>
  );
}
