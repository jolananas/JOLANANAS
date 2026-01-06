/**
 * 🍍 JOLANANAS - Product Category Component
 * =========================================
 * Composant d'affichage de catégorie/collection de produits
 * Intègre les variantes Shadcn Studio avec design system JOLANANAS
 * Utilise uniquement les données Shopify réelles (fetch API)
 */

'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Grid3x3, List, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Separator } from '@/components/ui/Separator';
import { ProductCard } from '@/app/src/components/ProductCard';
import { ProductQuickView } from './ProductQuickView';
// getAllCollections est server-only, utiliser l'API route à la place
import type { Product } from '@/app/src/lib/shopify/types';
import type { FilterOptions, ViewMode, SortOption, BaseEcommerceProps } from '@/app/src/types/ecommerce';

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
  className 
}: ProductCategoryProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filters, setFilters] = useState<FilterOptions>({
    availability: 'all',
    priceRange: undefined,
    tags: [],
  });
  const [showFilters, setShowFilters] = useState(false);
  const [collections, setCollections] = useState<Array<{ handle: string; title: string }>>([]);

  // Charger les collections disponibles depuis l'API route
  React.useEffect(() => {
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

  // Filtrer et trier les produits
  const filteredAndSortedProducts = useMemo(() => {
    let result = [...products];

    // Filtre par disponibilité
    if (filters.availability === 'in-stock') {
      result = result.filter((p) => p.availableForSale);
    } else if (filters.availability === 'out-of-stock') {
      result = result.filter((p) => !p.availableForSale);
    }

    // Filtre par prix
    if (filters.priceRange) {
      result = result.filter((p) => {
        const price = p.price;
        return price >= filters.priceRange!.min && price <= filters.priceRange!.max;
      });
    }

    // Filtre par tags
    if (filters.tags && filters.tags.length > 0) {
      result = result.filter((p) =>
        filters.tags!.some((tag) => p.tags.includes(tag))
      );
    }

    // Tri
    switch (sortBy) {
      case 'price-asc':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'name-asc':
        result.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'name-desc':
        result.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'newest':
        // Par défaut, garder l'ordre d'origine (supposé être le plus récent)
        break;
      case 'oldest':
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
    products.forEach((p) => p.tags.forEach((tag) => tagSet.add(tag)));
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
      {/* Header */}
      {(collectionTitle || collectionDescription) && (
        <div className="mb-8">
          <Card className="border-0 shadow-none bg-gradient-to-br from-jolananas-peach-light to-jolananas-pink-medium">
            <CardHeader className="text-center space-y-4">
              {collectionTitle && (
                <CardTitle className="text-4xl md:text-5xl font-bold text-jolananas-black-ink">
                  {collectionTitle}
                </CardTitle>
              )}
              {collectionDescription && (
                <CardDescription className="text-lg text-jolananas-black-ink/70 max-w-2xl mx-auto">
                  {collectionDescription}
                </CardDescription>
              )}
              <Badge variant="secondary" className="text-base px-4 py-2 w-fit mx-auto">
                {filteredAndSortedProducts.length} produit{filteredAndSortedProducts.length > 1 ? 's' : ''}
              </Badge>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* Filtres et tri */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filtres
          </Button>
          {Object.keys(filters).some((key) => {
            const filterKey = key as keyof FilterOptions;
            const value = filters[filterKey];
            return Array.isArray(value) ? value.length > 0 : value !== undefined && value !== 'all';
          }) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setFilters({ availability: 'all', priceRange: undefined, tags: [] })}
            >
              <X className="h-4 w-4 mr-2" />
              Réinitialiser
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Trier par" />
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

          <div className="flex border rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              className="rounded-r-none"
              onClick={() => setViewMode('grid')}
              aria-label="Vue grille"
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              className="rounded-l-none"
              onClick={() => setViewMode('list')}
              aria-label="Vue liste"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Panneau de filtres */}
      {showFilters && (
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="grid gap-4 md:grid-cols-3">
              {/* Filtre disponibilité */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Disponibilité</label>
                <Select
                  value={filters.availability || 'all'}
                  onValueChange={(value) =>
                    setFilters({ ...filters, availability: value as 'all' | 'in-stock' | 'out-of-stock' })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous</SelectItem>
                    <SelectItem value="in-stock">En stock</SelectItem>
                    <SelectItem value="out-of-stock">Épuisé</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Filtre prix */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Prix</label>
                <div className="flex gap-2">
                  <Select
                    value={filters.priceRange?.min.toString()}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        priceRange: {
                          min: parseFloat(value),
                          max: filters.priceRange?.max || priceRange.max,
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent>
                      {[0, 10, 20, 30, 50, 100].map((price) => (
                        <SelectItem key={price} value={price.toString()}>
                          {price}€
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.priceRange?.max.toString()}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        priceRange: {
                          min: filters.priceRange?.min || priceRange.min,
                          max: parseFloat(value),
                        },
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Max" />
                    </SelectTrigger>
                    <SelectContent>
                      {[50, 100, 200, 500, 1000].map((price) => (
                        <SelectItem key={price} value={price.toString()}>
                          {price}€
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Filtre tags */}
              {availableTags.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tags</label>
                  <div className="flex flex-wrap gap-2">
                    {availableTags.slice(0, 10).map((tag) => (
                      <Badge
                        key={tag}
                        variant={filters.tags?.includes(tag) ? 'default' : 'outline'}
                        className="cursor-pointer"
                        onClick={() => {
                          const currentTags = filters.tags || [];
                          const newTags = currentTags.includes(tag)
                            ? currentTags.filter((t) => t !== tag)
                            : [...currentTags, tag];
                          setFilters({ ...filters, tags: newTags });
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Résultats */}
      {filteredAndSortedProducts.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">
              Aucun produit ne correspond à vos critères de recherche.
            </p>
            <Button variant="outline" onClick={() => setFilters({ availability: 'all', priceRange: undefined, tags: [] })}>
              Réinitialiser les filtres
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div
          className={
            viewMode === 'grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
          }
        >
          {filteredAndSortedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}

