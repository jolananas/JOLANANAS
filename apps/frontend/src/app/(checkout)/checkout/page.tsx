import React, { Suspense } from "react";
import { CustomCheckoutPage } from "@/components/ecommerce/checkout/CustomCheckoutPage";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="container py-40 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      }
    >
      <CustomCheckoutPage />
    </Suspense>
  );
}
