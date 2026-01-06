/**
 * 🍍 JOLANANAS - Navigation Consolidée
 * =====================================
 * Navbar unique avec animations Framer Motion, style Header,
 * uniquement icônes (Rechercher, Favoris, Panier) sans menu textuel
 */

'use client';

import React, { useState, useEffect, startTransition } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Heart, User, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';
import { SearchDialog } from '@/components/SearchDialog';
import { useCart } from '@/app/src/lib/CartContext';
import { useBanner } from '@/app/src/components/layout/BannerContext';
import { cn } from '@/app/src/lib/utils';
import type { Product } from '@/app/src/lib/shopify/types';

export function Navigation() {
  const [products, setProducts] = useState<Product[]>([]);
  const { scrollY } = useScroll();
  const { totalItems } = useCart();
  const { isBannerVisible, bannerHeight } = useBanner();
  
  // Fetch products pour SearchDialog - Optimisé pour ne pas bloquer le thread principal
  useEffect(() => {
    // Différer le fetch pour ne pas bloquer le rendu initial
    const fetchProducts = () => {
      fetch('/api/products')
        .then(async (res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          const data = await res.json();
          // Vérifier si c'est une erreur ou des produits
          if (data.error) {
            console.error('API error:', data.error);
            return [];
          }
          return Array.isArray(data) ? data : [];
        })
        .then((products) => {
          // Utiliser startTransition pour marquer la mise à jour comme non-urgente
          // Cela permet à React de la traiter de manière asynchrone sans bloquer le thread principal
          startTransition(() => {
            setProducts(products);
            if (products.length > 0) {
              console.log(`✅ ${products.length} produits chargés pour la recherche`);
            }
          });
        })
        .catch((err) => {
          console.error('Failed to fetch products for search:', err);
          startTransition(() => {
            setProducts([]);
          });
        });
    };

    // Utiliser requestIdleCallback si disponible pour différer le fetch
    if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
      requestIdleCallback(fetchProducts, { timeout: 1000 });
    } else {
      // Fallback : utiliser setTimeout pour différer légèrement
      setTimeout(fetchProducts, 0);
    }
  }, []);

  // Animations basées sur le scroll - Background transparent avec blur progressif
  const headerBg = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255,255,255,0)', 'rgba(255,255,255,0)']
  );
  const headerShadow = useTransform(
    scrollY,
    [0, 100],
    ['none', '0 2px 8px -2px rgba(0,0,0,0.03)']
  );
  const borderColor = useTransform(
    scrollY,
    [0, 100],
    ['rgba(0,0,0,0)', 'rgba(0,0,0,0.06)']
  );
  const backdropFilter = useTransform(
    scrollY,
    [0, 100],
    ['blur(0px)', 'blur(10px)']
  );
  const logoFilter = useTransform(
    scrollY,
    [0, 100],
    ['brightness(0) invert(1)', 'none']
  );

  // Positionner la navbar dynamiquement selon la hauteur réelle du banner
  const navbarTop = isBannerVisible && bannerHeight > 0 ? bannerHeight : 0;

  return (
    <>
      <motion.header
        className={cn(
          "fixed left-0 right-0 z-[9998] w-full border-b mb-14 sm:mb-16 transition-[top] duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]"
        )}
        style={{
          top: `${navbarTop}px`,
          backgroundColor: headerBg,
          boxShadow: headerShadow,
          borderColor: borderColor,
          backdropFilter: backdropFilter,
        }}
      >
        <div className="container flex h-14 sm:h-16 items-center justify-between px-3 sm:px-4 md:px-6">
          {/* Logo JOLANANAS */}
          <Link href="/" className="flex items-center min-w-0 flex-shrink-0">
            <motion.div
              className="relative w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12"
              style={{ filter: logoFilter }}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              tabIndex={0}
            >
              <Image
                src="/assets/images/logo/logo-jolananas-gradient.png"
                alt="JOLANANAS Logo"
                fill
                sizes="(max-width: 640px) 32px, (max-width: 768px) 40px, 48px"
                className="object-contain"
                priority
              />
            </motion.div>
          </Link>

          {/* Actions - Icônes uniquement */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Rechercher */}
            <div className="flex-shrink-0">
            <SearchDialog products={products} />
            </div>
            
            {/* Favoris - Masqué sur très petit écran si nécessaire */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/favorites" className="flex-shrink-0">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-11 w-11 sm:h-9 sm:w-9 touch-manipulation text-jolananas-pink-medium hover:text-white"
                    aria-label="Favoris"
                  >
                    <Heart className="h-5 w-5 sm:h-5 sm:w-5" />
                    <span className="sr-only">Favoris</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mes favoris</p>
              </TooltipContent>
            </Tooltip>
            
            {/* Compte / Connexion */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/account" className="flex-shrink-0">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-11 w-11 sm:h-9 sm:w-9 touch-manipulation text-jolananas-pink-medium hover:text-white"
                    aria-label="Compte"
                  >
                    <User className="h-5 w-5 sm:h-5 sm:w-5" />
                    <span className="sr-only">Compte</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mon compte</p>
              </TooltipContent>
            </Tooltip>
            
            {/* Panier */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Link href="/cart" className="flex-shrink-0">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative h-11 w-11 sm:h-9 sm:w-9 touch-manipulation text-jolananas-pink-medium hover:text-white"
                    aria-label={`Panier (${totalItems})`}
                  >
                    <ShoppingBag className="h-5 w-5" />
                    {totalItems > 0 && (
                      <span className="absolute top-0 right-0 -translate-x-1/6 translate-y-1/6 h-4 w-4 sm:h-3.5 sm:w-3.5 rounded-full bg-primary text-[10px] sm:text-[9px] font-bold text-primary-foreground flex items-center justify-center">
                        {totalItems}
                      </span>
                    )}
                    <span className="sr-only">Panier ({totalItems})</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mon panier</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </motion.header>
    </>
  );
}
