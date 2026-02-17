/**
 * 🍍 JOLANANAS - Product Category Component
 * =========================================
 * Composant d'affichage de catégorie/collection de produits
 * Intègre les variantes Shadcn Studio avec design system JOLANANAS
 * Utilise uniquement les données Shopify réelles (fetch API)
 */

"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Grid3x3, List, SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ProductCard } from "@/components/product/ProductCard";
import { ProductQuickView } from "./ProductQuickView";
// getAllCollections est server-only, utiliser l'API route à la place
import type { Product } from "@/lib/shopify/types";
import type {
  FilterOptions,
  ViewMode,
  SortOption,
  BaseEcommerceProps,
} from "@/types/ecommerce";

interface ProductCategoryProps extends BaseEcommerceProps {
  products: Product[];
  collectionHandle?: string;
  collectionTitle?: string;
  collectionDescription?: string;
}

export function ProductCategory({
  products,
  collectionHandle,
  collectionTitle,
  collectionDescription,
  className,
}: ProductCategoryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const [filters, setFilters] = useState<FilterOptions>({
    availability: "all",
    priceRange: undefined,
    tags: [],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [collections, setCollections] = useState<
    Array<{ handle: string; title: string }>
  >([]);

  // Charger les collections disponibles depuis l'API route
  React.useEffect(() => {
    fetch("/api/collections")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCollections(
            data.map((col: any) => ({ handle: col.handle, title: col.title })),
          );
        }
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des collections:", error);
      });
  }, []);

  // Filtrer et trier les produits
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filtre par disponibilité
    if (filters.availability === "in-stock") {
      result = result.filter((p) => p.availableForSale);
    } else if (filters.availability === "out-of-stock") {
      result = result.filter((p) => !p.availableForSale);
    }

    // Filtre par prix
    if (filters.priceRange) {
      result = result.filter((p) => {
        const price = p.price;
        return (
          price >= filters.priceRange!.min && price <= filters.priceRange!.max
        );
      });
    }

    // Filtre par tags
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter((p) =>
        filters.tags!.some((tag) => p.tags?.includes(tag)),
      );
    }

    // Tri
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-asc":
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "name-desc":
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case "newest":
        // Par défaut, garder l'ordre d'origine (supposé être le plus récent)
        break;
      case "oldest":
        result.reverse();
        break;
      default:
        break;
    }

    return result;
  }, [products, filters, sortBy]);

  // Extraire les tags uniques
  const availableTags = useMemo(() => {
    const tagSet = new Set<string>();
    products.forEach((p) => p.tags?.forEach((tag) => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [products]);

  // Extraire la plage de prix
  const priceRange = useMemo(() => {
    if (products.length === 0) return { min: 0, max: 0 };
    const prices = products.map((p) => p.price);
    return {
      min: Math.floor(Math.min(...prices)),
      max: Math.ceil(Math.max(...prices)),
    };
  }, [products]);

  return (
    <div className={`product-category ${className}`}>
      {/* View Controls - More subtle and modern */}
      <div className="flex flex-col sm:flex-row gap-6 mb-12 items-start sm:items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-jolananas-black-ink/40">
            {filteredAndSortedProducts.length} Produit{filteredAndSortedProducts.length > 1 ? "s" : ""}
          </span>
          <div className="h-px w-8 bg-jolananas-peach-light" />
        </div>

        <div className="flex items-center gap-4">
          <Select
            value={sortBy}
            onValueChange={(value) => setSortBy(value as SortOption)}
          >
            <SelectTrigger className="w-[180px] bg-white/50 border-0 shadow-none text-[10px] uppercase font-bold tracking-widest h-9">
              <SelectValue placeholder="Trier par" />
            </SelectTrigger>
            <SelectContent className="glass-strong border-0 shadow-jolananas">
              <SelectItem value="newest" className="text-[10px] uppercase font-bold tracking-widest">Plus récents</SelectItem>
              <SelectItem value="oldest" className="text-[10px] uppercase font-bold tracking-widest">Plus anciens</SelectItem>
              <SelectItem value="price-asc" className="text-[10px] uppercase font-bold tracking-widest">Prix croissant</SelectItem>
              <SelectItem value="price-desc" className="text-[10px] uppercase font-bold tracking-widest">Prix décroissant</SelectItem>
              <SelectItem value="name-asc" className="text-[10px] uppercase font-bold tracking-widest">Nom A-Z</SelectItem>
              <SelectItem value="name-desc" className="text-[10px] uppercase font-bold tracking-widest">Nom Z-A</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center bg-white/50 rounded-full p-1 h-9">
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full h-7 w-7 ${viewMode === "grid" ? "bg-white shadow-sm text-primary" : "text-jolananas-black-ink/40"}`}
              onClick={() => setViewMode("grid")}
              aria-label="Vue grille"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`rounded-full h-7 w-7 ${viewMode === "list" ? "bg-white shadow-sm text-primary" : "text-jolananas-black-ink/40"}`}
              onClick={() => setViewMode("list")}
              aria-label="Vue liste"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Résultats - Modern Grid with staggered feel */}
      {filteredAndSortedProducts.length === 0 ? (
        <div className="py-24 text-center glass rounded-3xl border-dashed border-2 border-primary/20">
          <p className="text-jolananas-black-ink/60 font-medium mb-6">
            Aucune création ne correspond à votre recherche.
          </p>
          <Button
            variant="outline"
            className="rounded-full px-8 text-[10px] uppercase font-bold tracking-widest"
            onClick={() =>
              setFilters({
                availability: "all",
                priceRange: undefined,
                tags: [],
              })
            }
          >
            Réinitialiser
          </Button>
        </div>
      ) : (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-x-8 gap-y-12"
              : "space-y-8"
          }
        >
          {filteredAndSortedProducts.map((product, index) => (
            <div 
              key={product.id} 
              className={`transition-all duration-700 animate-fade-in`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
