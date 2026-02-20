"use client";

import React, { useState, useEffect } from "react";
import { X, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
// getAllCollections est server-only, utiliser l'API route à la place
import type {
  FilterOptions,
  BaseEcommerceProps,
} from "@/types/ecommerce";

interface CategoryFilterProps extends BaseEcommerceProps {
  onFilterChange: (filters: FilterOptions) => void;
  initialFilters?: FilterOptions;
  availableTags?: string[];
  priceRange?: { min: number; max: number };
}

export function CategoryFilter({
  onFilterChange,
  initialFilters,
  availableTags = [],
  priceRange,
  className,
}: CategoryFilterProps) {
  const [collections, setCollections] = useState<
    Array<{ handle: string; title: string }>
  >([]);
  const [filters, setFilters] = useState<FilterOptions>(
    initialFilters || {
      collections: [],
      priceRange: priceRange,
      tags: [],
      availability: "all",
      sortBy: "newest",
    },
  );

  // Charger les collections réelles depuis l'API route
  useEffect(() => {
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

  // Notifier les changements de filtres
  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  // Gérer les changements de filtres
  const updateFilter = (key: keyof FilterOptions, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    const reset: FilterOptions = {
      collections: [],
      priceRange: priceRange,
      tags: [],
      availability: "all",
      sortBy: "newest",
    };
    setFilters(reset);
    onFilterChange(reset);
  };

  // Compter les filtres actifs
  const activeFiltersCount = [
    filters.collections?.length || 0,
    filters.tags?.length || 0,
    filters.availability ? 1 : 0,
    filters.priceRange &&
    (filters.priceRange.min !== priceRange?.min ||
      filters.priceRange.max !== priceRange?.max)
      ? 1
      : 0,
  ].reduce((sum, count) => sum + count, 0);

  return (
    <Card className={`border-0 shadow-none bg-transparent ${className}`}>
      <CardHeader className="px-0 pb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-primary" />
            <h2 className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">Filtres</h2>
            {activeFiltersCount > 0 && (
              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                {activeFiltersCount}
              </span>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetFilters}
              className="h-auto p-0 text-[9px] uppercase font-bold tracking-[0.2em] text-primary/40 hover:text-primary transition-colors"
            >
              Reset
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="px-0 space-y-10">
        {/* Filtre par collection */}
        {collections.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/40">Collections</h3>
            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {collections.map((collection) => {
                const isSelected =
                  filters.collections?.includes(collection.handle) || false;
                return (
                  <div
                    key={collection.handle}
                    className="flex items-center space-x-3 group cursor-pointer"
                    onClick={() => {
                      const current = filters.collections || [];
                      const updated = isSelected
                        ? current.filter((c) => c !== collection.handle)
                        : [...current, collection.handle];
                      updateFilter("collections", updated);
                    }}
                  >
                    <div className={`w-4 h-4 rounded-sm border transition-all duration-300 flex items-center justify-center
                      ${isSelected ? "bg-primary border-primary" : "border-jolananas-peach-light group-hover:border-primary/50"}`}>
                      {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <span className={`text-[11px] font-medium transition-colors duration-300
                      ${isSelected ? "text-primary" : "text-primary group-hover:text-primary"}`}>
                      {collection.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filtre par prix */}
        {priceRange && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/40">Prix</h3>
              <span className="text-[10px] font-bold text-primary">
                {filters.priceRange?.min || priceRange.min}€ — {filters.priceRange?.max || priceRange.max}€
              </span>
            </div>
            <Slider
              value={[
                filters.priceRange?.min || priceRange.min,
                filters.priceRange?.max || priceRange.max,
              ]}
              onValueChange={([min, max]) => {
                updateFilter("priceRange", { min, max });
              }}
              min={priceRange.min}
              max={priceRange.max}
              step={1}
              className="w-full"
            />
          </div>
        )}

        {/* Filtre par disponibilité */}
        <div className="space-y-4">
          <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/40">Disponibilité</h3>
          <Select
            value={filters.availability}
            onValueChange={(value) => updateFilter("availability", value)}
          >
            <SelectTrigger className="w-full bg-white/50 border-0 shadow-none text-[10px] uppercase font-bold tracking-widest h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="glass-strong border-0 shadow-jolananas">
              <SelectItem value="all" className="text-[10px] uppercase font-bold tracking-widest">Tous</SelectItem>
              <SelectItem value="in-stock" className="text-[10px] uppercase font-bold tracking-widest">En stock</SelectItem>
              <SelectItem value="out-of-stock" className="text-[10px] uppercase font-bold tracking-widest">Épuisé</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tags */}
        {availableTags.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/40">Thématiques</h3>
            <div className="flex flex-wrap gap-2">
              {availableTags.slice(0, 15).map((tag) => {
                const isSelected = filters.tags?.includes(tag) || false;
                return (
                  <button
                    key={tag}
                    onClick={() => {
                      const current = filters.tags || [];
                      const updated = isSelected
                        ? current.filter((t) => t !== tag)
                        : [...current, tag];
                      updateFilter("tags", updated);
                    }}
                    className={`px-3 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest transition-all duration-300
                      ${isSelected 
                        ? "bg-primary text-white shadow-jolananas" 
                        : "bg-white/50 text-primary/40 hover:bg-white hover:text-primary"}`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
