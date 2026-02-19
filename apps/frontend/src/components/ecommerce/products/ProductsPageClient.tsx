"use client";

import { useEffect, useState } from "react";
import { ProductCategory } from "@/components/ecommerce/product/ProductCategory";
import { CategoryFilter } from "@/components/ecommerce/filters/CategoryFilter";
import { apiGet } from "@/lib/api-client";
import type { Product } from "@/lib/shopify/types";
import { PageContainer } from "@/components/layout/PageContainer";

export function ProductsPageClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<any>({
    availability: "all",
    sortBy: "newest",
  });

  useEffect(() => {
    apiGet<Product[]>("/api/products")
      .then((data) => {
        setProducts(data || []);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("❌ Erreur lors du chargement des produits:", error);
        setIsLoading(false);
        setProducts([]);
      });
  }, []);

  if (isLoading) {
    return (
      <PageContainer className="min-h-screen bg-jolananas-white-soft">
        <div className="container py-24 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <div className="text-primary/40 font-bold uppercase tracking-[0.3em] text-[10px]">
            Collection en cours...
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="min-h-screen bg-jolananas-white-soft">
      {/* Dynamic Header with Gradient Overlay */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 bg-jolananas-gradient opacity-5 skew-y-3 -translate-y-24" />
        <div className="container relative z-10 max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-4xl md:text-7xl font-sans font-bold tracking-tight text-primary">
            Toutes nos <span className="text-gradient">créations</span>
          </h1>
          <p className="text-lg md:text-xl text-primary max-w-2xl mx-auto leading-relaxed font-medium">
            Une sélection unique de créations artisanales, conçues avec passion pour illuminer votre quotidien.
          </p>
        </div>
      </section>

      <div className="container max-w-[1600px] mx-auto pb-24 px-4">
        <div className="grid gap-12 lg:grid-cols-12 items-start">
          {/* Filters - Sticky Sidebar Desktop / Floating Mobile Drawer (Future) */}
          <aside className="lg:col-span-3 xl:col-span-2 block lg:sticky top-32">
            <CategoryFilter
              onFilterChange={setFilters}
              initialFilters={filters}
              className="border-0 shadow-none bg-transparent"
              availableTags={Array.from(
                new Set(products.flatMap((p) => p.tags || [])),
              )}
              priceRange={
                products.length > 0
                  ? {
                      min: Math.floor(
                        Math.min(...products.map((p) => (p as any).price || 0)),
                      ),
                      max: Math.ceil(Math.max(...products.map((p) => (p as any).price || 1000))),
                    }
                  : undefined
              }
            />
          </aside>

          {/* Products Grid */}
          <main className="lg:col-span-9 xl:col-span-10">
            <ProductCategory
              products={products}
              className="w-full"
            />
          </main>
        </div>
      </div>
    </PageContainer>
  );
}
