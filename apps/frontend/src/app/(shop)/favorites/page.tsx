"use client";

import React, { useState, useEffect } from "react";
import { Heart } from "lucide-react";
import { FavoritesGrid } from "@/components/favorites/FavoritesGrid";
import type { Product } from "@/lib/shopify/types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { PageContainer } from "@/components/layout/PageContainer";

export default function FavoritesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Récupérer tous les produits pour pouvoir afficher les favoris
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/api/products");

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des produits");
        }

        const data = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erreur lors du chargement des produits:", err);
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (isLoading) {
    return (
      <PageContainer className="container py-32 md:py-48">
        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-60">
            <Skeleton className="h-12 w-12 rounded-full mb-4" />
            <Skeleton className="h-4 w-48 mb-2" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer className="container py-32 md:py-48">
        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-60 text-center">
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={() => window.location.reload()}>Réessayer</Button>
          </CardContent>
        </Card>
      </PageContainer>
    );
  }

  return (
    <div className="container mx-auto px-4 py-32 max-w-4xl"></div>
      <PageContainer className="container py-32 md:py-48">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* En-tête avec Card */}
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader className="text-center space-y-4">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Badge
                  variant="default"
                  className="h-8 w-8 p-0 flex items-center justify-center"
                >
                  <Heart className="h-4 w-4 fill-primary" />
                </Badge>
                <CardTitle className="font-serif text-4xl font-bold tracking-tight md:text-5xl">
                  Mes Favoris
                </CardTitle>
              </div>
              <CardDescription className="text-lg max-w-2xl mx-auto">
                Retrouvez tous vos produits favoris en un seul endroit
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Grille de favoris */}
          <FavoritesGrid products={products} />
        </div>
      </PageContainer>
    </div>
  );
}
