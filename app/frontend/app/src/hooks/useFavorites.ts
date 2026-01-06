/**
 * 🍍 JOLANANAS - Hook useFavorites
 * =================================
 * Gestion des favoris avec localStorage
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/app/src/lib/shopify/types';

const FAVORITES_STORAGE_KEY = 'jolananas-favorites';

interface UseFavoritesReturn {
  favorites: string[];
  favoriteProducts: Product[];
  isFavorite: (productId: string) => boolean;
  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  toggleFavorite: (productId: string) => void;
  clearFavorites: () => void;
  isLoading: boolean;
}

export function useFavorites(products?: Product[]): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les favoris depuis localStorage au montage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(FAVORITES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
      localStorage.removeItem(FAVORITES_STORAGE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sauvegarder les favoris dans localStorage
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      } catch (error) {
        console.error('Erreur lors de la sauvegarde des favoris:', error);
      }
    }
  }, [favorites, isLoading]);

  // Vérifier si un produit est en favoris
  const isFavorite = useCallback(
    (productId: string): boolean => {
      return favorites.includes(productId);
    },
    [favorites]
  );

  // Ajouter un favori
  const addFavorite = useCallback((productId: string) => {
    setFavorites((prev) => {
      if (prev.includes(productId)) {
        return prev;
      }
      return [...prev, productId];
    });
  }, []);

  // Supprimer un favori
  const removeFavorite = useCallback((productId: string) => {
    setFavorites((prev) => prev.filter((id) => id !== productId));
  }, []);

  // Toggle favori
  const toggleFavorite = useCallback(
    (productId: string) => {
      if (isFavorite(productId)) {
        removeFavorite(productId);
      } else {
        addFavorite(productId);
      }
    },
    [isFavorite, addFavorite, removeFavorite]
  );

  // Vider les favoris
  const clearFavorites = useCallback(() => {
    setFavorites([]);
  }, []);

  // Récupérer les produits favoris complets
  const favoriteProducts = products
    ? products.filter((product) => favorites.includes(product.id))
    : [];

  return {
    favorites,
    favoriteProducts,
    isFavorite,
    addFavorite,
    removeFavorite,
    toggleFavorite,
    clearFavorites,
    isLoading,
  };
}

