"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/components/providers/CartProvider";

export function CheckoutSuccessClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const orderId = searchParams.get("order_id");

  useEffect(() => {
    // Vider le panier après confirmation
    clearCart();
  }, [clearCart]);

  return (
    <div className="container py-12 md:py-16">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 md:p-12 text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Commande confirmée !</h2>
          <p className="text-muted-foreground mb-6">
            Merci pour votre commande. Vous recevrez un e-mail de confirmation
            dans quelques instants avec tous les détails.
            {orderId && (
              <span className="block mt-2 text-sm">
                Numéro de commande : {orderId}
              </span>
            )}
          </p>
          <div className="flex gap-4 justify-center">
            <Button variant="outline" onClick={() => router.push("/products")}>
              <ShoppingBag className="mr-2 h-4 w-4" />
              Continuer mes achats
            </Button>
            <Button onClick={() => router.push("/account")}>
              Voir mes commandes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
