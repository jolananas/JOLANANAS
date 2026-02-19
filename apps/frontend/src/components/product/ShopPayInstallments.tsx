"use client";

import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/utils";

export function ShopPayInstallments({
  amount,
  currencyCode,
}: {
  amount: number;
  currencyCode: string;
}) {
  // Shop Pay Installments is available for orders between $50 USD and $3000 USD (check local currency equivalents)
  // For MVP we assume it's available if likely price > 50
  if (amount < 50) return null;

  const installmentAmount = amount / 4;

  return (
    <div className="mt-4 p-3 bg-secondary/20 rounded-xl flex items-center gap-3 border border-secondary/20">
      <div className="bg-[#5A31F4] text-white px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
        Shop Pay
      </div>
      <p className="text-xs text-muted-foreground">
        Payez en 4x sans frais de <span className="font-bold text-primary">{formatPrice(installmentAmount, currencyCode)}</span>
      </p>
    </div>
  );
}
