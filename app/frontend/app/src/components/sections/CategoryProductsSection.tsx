/**
 * 🍍 JOLANANAS - Category Products Section Hydrogen Style
 * ======================================================
 * Section produits par catégorie avec titre, description et grille
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { ProductGrid } from '@/app/src/components/product/ProductGrid';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/Carousel';
import { Skeleton } from '@/components/ui/Skeleton';

interface CategoryProductsSectionProps {
  title: string;
  description?: string;
  products: any[]; // Remplacez 'any' par le type de produit Shopify réel
  categoryHandle: string;
  showViewAll?: boolean;
  maxProducts?: number;
}

export function CategoryProductsSection({ 
  title, 
  description, 
  products, 
  categoryHandle, 
  showViewAll = true,
  maxProducts = 4 
}: CategoryProductsSectionProps) {
  // Limiter le nombre de produits affichés
  const limitedProducts = products.slice(0, maxProducts);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Gradient animé en arrière-plan */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-jolananas-white-soft via-white to-jolananas-gray-warm"
        animate={{
          x: [0, 50, -50, 0],
          y: [0, 30, -30, 0],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          width: '120%',
          height: '120%',
          left: '-10%',
          top: '-10%',
        }}
      />
      
      {/* Contenu par-dessus le gradient */}
      <div className="relative z-10 container mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="mb-12"
        >
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader>
              <motion.div
                variants={itemVariants}
                transition={{ duration: 0.6 }}
              >
                <CardTitle className="text-3xl md:text-4xl font-bold text-jolananas-black-ink mb-4 text-center">
                  {title}
                </CardTitle>
              </motion.div>
              {description && (
                <motion.div
                  variants={itemVariants}
                  transition={{ delay: 0.2, duration: 0.6 }}
                >
                  <CardDescription className="text-lg text-jolananas-black-ink/70 max-w-2xl mx-auto">
                    {description}
                  </CardDescription>
                </motion.div>
              )}
              {showViewAll && (
                <motion.div
                  className="mt-8"
                  variants={itemVariants}
                  transition={{ delay: 0.4, duration: 0.6 }}
                >
                  <Button variant="link" asChild className="text-jolananas-pink-deep hover:text-jolananas-pink-medium">
                    <Link href={`/collections/${categoryHandle}`}>
                      Voir toute la collection
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </Button>
                </motion.div>
              )}
            </CardHeader>
          </Card>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          <ProductGrid 
            products={limitedProducts} 
            showTitle={false}
          />
        </motion.div>
      </div>
    </section>
  );
}
