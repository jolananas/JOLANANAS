"use client";

import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";

export function CollectionPageClient({ collection }: { collection: any }) {
  const products = collection.products || [];

  return (
    <PageContainer className="container mx-auto px-4 py-12">
      {/* Header Collection */}
      <div className="flex flex-col items-center text-center space-y-4 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Link
          href="/collections"
          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2 mb-2"
        >
          <ArrowLeft className="w-4 h-4" /> Retour aux collections
        </Link>
        <h1 className="text-4xl md:text-5xl font-serif font-bold">
          {collection.title}
        </h1>
        {collection.description && (
          <div className="max-w-2xl text-muted-foreground text-lg leading-relaxed">
            {collection.description}
          </div>
        )}
      </div>

      {/* Grille Produits */}
      {products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {products.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="text-center py-60 bg-secondary/10 rounded-xl">
          <h3 className="text-xl font-medium mb-2">
            Cette collection est vide pour le moment.
          </h3>
          <p className="text-muted-foreground mb-6">
            Revenez bientôt pour découvrir nos nouveautés.
          </p>
          <Link href="/">
            <Button variant="cta">Retour à l'accueil</Button>
          </Link>
        </div>
      )}
    </PageContainer>
  );
}
