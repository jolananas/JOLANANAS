import React, { Suspense } from "react";
import { CheckoutSuccessClient } from "./CheckoutSuccessClient";
import { Loader2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="py-12 md:py-16">
          <div className="max-w-2xl mx-auto text-center">
            <Loader2 className="h-12 w-12 animate-spin text-jolananas-pink-medium mx-auto mb-4" />
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      }
    >
      <CheckoutSuccessClient />
    </Suspense>
  );
}
