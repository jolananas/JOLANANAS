"use client";

import { useState, useEffect } from "react";
import { safeJsonParse } from "@/lib/api-client";

export interface ShippingInfo {
  freeShippingThreshold: number;
  deliveryDaysFrance: string;
  deliveryDaysInternational: string;
  standardShippingCost: number;
  expressShippingCost: number;
  expressDeliveryDays: string;
}

export function useShipping(totalPrice: number) {
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);

  useEffect(() => {
    async function fetchShippingInfo() {
      try {
        const response = await fetch("/api/shipping");
        const data = await safeJsonParse<ShippingInfo & { error?: boolean; message?: string }>(response);
        if (response.ok && !data.error) {
          setShippingInfo(data);
        }
      } catch (error) {
        console.error("❌ Error fetching shipping info:", error);
      }
    }
    fetchShippingInfo();
  }, []);

  const freeShippingLeft = shippingInfo ? Math.max(0, shippingInfo.freeShippingThreshold - totalPrice) : 0;
  const progressPercent = shippingInfo ? Math.min(100, (totalPrice / shippingInfo.freeShippingThreshold) * 100) : 0;
  const isFreeShipping = totalPrice >= (shippingInfo?.freeShippingThreshold || Infinity);

  return {
    shippingInfo,
    freeShippingLeft,
    progressPercent,
    isFreeShipping,
  };
}
