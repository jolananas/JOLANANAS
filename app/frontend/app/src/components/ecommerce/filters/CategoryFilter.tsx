/**
 * 🍍 JOLANANAS - Category Filter Component
 * =========================================
 * Système de filtres avancés pour les produits
 * Intègre les variantes Shadcn Studio avec design system JOLANANAS
 * Utilise uniquement les collections réelles de Shopify (fetch API)
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/Separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Slider } from '@/components/ui/Slider';
import { Checkbox } from '@/components/ui/Checkbox';
import { Label } from '@/components/ui/Label';
// getAllCollections est server-only, utiliser l'API route à la place
import type { FilterOptions, BaseEcommerceProps } from '@/app/src/types/ecommerce';

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
  const [collections, setCollections] = useState<Array<{ handle: string; title: string }>>([]);
  const [filters, setFilters] = useState<FilterOptions>(initialFilters || {
    collections: [],
    priceRange: priceRange,
    tags: [],
    availability: 'all',
    sortBy: 'newest',
  });

  // Charger les collections réelles depuis l'API route
  useEffect(() => {
    fetch('/api/collections')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCollections(data.map((col: any) => ({ handle: col.handle, title: col.title })));
        }
      })
      .catch((error) => {
        console.error('Erreur lors du chargement des collections:', error);
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
      availability: 'all',
      sortBy: 'newest',
    };
    setFilters(reset);
    onFilterChange(reset);
  };

  // Compter les filtres actifs
  const activeFiltersCount = [
    filters.collections?.length || 0,
    filters.tags?.length || 0,
    filters.availability !== 'all' ? 1 : 0,
    filters.priceRange && (filters.priceRange.min !== priceRange?.min || filters.priceRange.max !== priceRange?.max) ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle>Filtres</CardTitle>
            {activeFiltersCount > 0 && (
              <Badge variant="secondary">{activeFiltersCount}</Badge>
            )}
          </div>
          {activeFiltersCount > 0 && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <X className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Filtre par collection */}
        {collections.length > 0 && (
          <div className="space-y-2">
            <Label>Collections</Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {collections.map((collection) => {
                const isSelected = filters.collections?.includes(collection.handle) || false;
                return (
                  <div key={collection.handle} className="flex items-center space-x-2">
                    <Checkbox
                      id={`collection-${collection.handle}`}
                      checked={isSelected}
                      onCheckedChange={(checked) => {
                        const current = filters.collections || [];
                        const updated = checked
                          ? [...current, collection.handle]
                          : current.filter((c) => c !== collection.handle);
                        updateFilter('collections', updated);
                      }}
                    />
                    <Label
                      htmlFor={`collection-${collection.handle}`}
                      className="text-sm font-normal cursor-pointer"
                    >
                      {collection.title}
                    </Label>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Separator />

        {/* Filtre par prix */}
        {priceRange && (
          <div className="space-y-2">
            <Label>
              Prix : {filters.priceRange?.min || priceRange.min}€ - {filters.priceRange?.max || priceRange.max}€
            </Label>
            <Slider
              value={[filters.priceRange?.min || priceRange.min, filters.priceRange?.max || priceRange.max]}
              onValueChange={([min, max]) => {
                updateFilter('priceRange', { min, max });
              }}
              min={priceRange.min}
              max={priceRange.max}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{priceRange.min}€</span>
              <span>{priceRange.max}€</span>
            </div>
          </div>
        )}

        <Separator />

        {/* Filtre par tags */}
        {availableTags.length > 0 && (
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2">
              {availableTags.slice(0, 20).map((tag) => {
                const isSelected = filters.tags?.includes(tag) || false;
                return (
                  <Badge
                    key={tag}
                    variant={isSelected ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => {
                      const current = filters.tags || [];
                      const updated = isSelected
                        ? current.filter((t) => t !== tag)
                        : [...current, tag];
                      updateFilter('tags', updated);
                    }}
                  >
                    {tag}
                  </Badge>
                );
              })}
            </div>
          </div>
        )}

        <Separator />

        {/* Filtre par disponibilité */}
        <div className="space-y-2">
          <Label>Disponibilité</Label>
          <Select
            value={filters.availability || 'all'}
            onValueChange={(value) => updateFilter('availability', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les produits</SelectItem>
              <SelectItem value="in-stock">En stock uniquement</SelectItem>
              <SelectItem value="out-of-stock">Épuisés uniquement</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Separator />

        {/* Tri */}
        <div className="space-y-2">
          <Label>Trier par</Label>
          <Select
            value={filters.sortBy || 'newest'}
            onValueChange={(value) => updateFilter('sortBy', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Plus récents</SelectItem>
              <SelectItem value="oldest">Plus anciens</SelectItem>
              <SelectItem value="price-asc">Prix croissant</SelectItem>
              <SelectItem value="price-desc">Prix décroissant</SelectItem>
              <SelectItem value="name-asc">Nom A-Z</SelectItem>
              <SelectItem value="name-desc">Nom Z-A</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filtres actifs */}
        {activeFiltersCount > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Filtres actifs</Label>
              <div className="flex flex-wrap gap-2">
                {filters.collections?.map((handle) => {
                  const collection = collections.find((c) => c.handle === handle);
                  return collection ? (
                    <Badge
                      key={handle}
                      variant="secondary"
                      className="cursor-pointer"
                      onClick={() => {
                        const updated = filters.collections?.filter((c) => c !== handle) || [];
                        updateFilter('collections', updated);
                      }}
                    >
                      {collection.title}
                      <X className="ml-1 h-3 w-3" />
                    </Badge>
                  ) : null;
                })}
                {filters.tags?.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => {
                      const updated = filters.tags?.filter((t) => t !== tag) || [];
                      updateFilter('tags', updated);
                    }}
                  >
                    {tag}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                ))}
                {filters.availability !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => updateFilter('availability', 'all')}
                  >
                    {filters.availability === 'in-stock' ? 'En stock' : 'Épuisé'}
                    <X className="ml-1 h-3 w-3" />
                  </Badge>
                )}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

