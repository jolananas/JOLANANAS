"use client";

import { useCart } from "@/components/providers/CartProvider";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { PageContainer } from "@/components/layout/PageContainer";

export default function CheckoutPage() {
  const { cart, loading } = useCart();

  useEffect(() => {
    if (cart?.checkoutUrl) {
      window.location.href = cart.checkoutUrl;
    }
  }, [cart]);

  return (
    <div className="mx-auto py-32">
      <PageContainer className="container py-32 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <h1 className="text-xl font-medium">Redirection vers le paiement...</h1>
          <p className="text-muted-foreground text-center max-w-md">
            Nous vous transférons vers notre partenaire de paiement sécurisé Shopify.
          </p>
        </div>
      </PageContainer>
    </div>
  );
}
