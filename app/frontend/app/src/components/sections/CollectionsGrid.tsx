/**
 * 🍍 JOLANANAS - Collections Grid Hydrogen Style
 * ==============================================
 * Grille de collections avec vraies données Shopify
 */

'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { EnhancedCard } from '@/components/ui/card/EnhancedCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AspectRatio } from '@/components/ui/AspectRatio';
import { Skeleton } from '@/components/ui/Skeleton';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/HoverCard';

interface Collection {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image?: {
    url: string;
    altText?: string;
  };
  productsCount?: number;
}

interface CollectionsGridProps {
  collections?: Collection[];
}

interface CollectionCardProps {
  collection: Collection;
  index: number;
  itemVariants: any;
}

function CollectionCardItem({ collection, index, itemVariants }: CollectionCardProps) {
  const imageRef = useRef<HTMLImageElement>(null);
  
  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="relative group h-full"
        >
          <EnhancedCard
            hoverEffect="3d"
            imageRef={imageRef}
            className="overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full p-0"
          >
            <Link href={`/collections/${collection.handle}`} className="block h-full">
              <AspectRatio ratio={1} className="overflow-hidden relative">
                {collection.image ? (
                  <div ref={imageRef} className="absolute inset-0">
                    <Image
                      src={collection.image.url}
                      alt={collection.image.altText || collection.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-jolananas-peach-light to-jolananas-pink-medium flex items-center justify-center">
                    <span className="text-white/50 text-2xl">🍍</span>
                  </div>
                )}
                
                {/* Overlay avec informations */}
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-300 flex flex-col items-center justify-center p-4 z-10">
                  <h3 className="text-white text-xl font-bold text-center mb-2">
                    {collection.title}
                  </h3>
                  {collection.description && (
                    <p className="text-white/80 text-sm text-center mb-3">
                      {collection.description}
                    </p>
                  )}
                  {collection.productsCount && (
                    <Badge variant="secondary" className="text-jolananas-gold bg-transparent border-jolananas-gold">
                      {collection.productsCount} produits
                    </Badge>
                  )}
                </div>
              </AspectRatio>
            </Link>
          </EnhancedCard>
        </motion.div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-2">
          <h4 className="font-semibold text-sm">{collection.title}</h4>
          {collection.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">
              {collection.description}
            </p>
          )}
          {collection.productsCount && (
            <p className="text-xs text-muted-foreground">
              {collection.productsCount} produit{collection.productsCount > 1 ? 's' : ''}
            </p>
          )}
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export function CollectionsGrid({ collections }: CollectionsGridProps) {
  const displayCollections = collections || [];

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  // Si aucune collection n'est disponible
  if (displayCollections.length === 0) {
    return (
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto">
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl font-bold text-jolananas-black-ink text-center mb-12">
                Nos Collections Exclusives
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center py-12">
              <CardDescription className="text-lg">
                Aucune collection disponible pour le moment.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-white">
      <div className="container mx-auto">
        <Card className="border-0 shadow-none bg-transparent">
          <CardHeader>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6 }}
            >
              <CardTitle className="text-3xl md:text-4xl font-bold text-jolananas-black-ink text-center mb-12">
                Nos Collections Exclusives
              </CardTitle>
            </motion.div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {displayCollections.map((collection, index) => (
                <CollectionCardItem
                  key={collection.id}
                  collection={collection}
                  index={index}
                  itemVariants={itemVariants}
                />
              ))}
            </div>
            
            {/* CTA vers toutes les collections */}
            <motion.div
              className="text-center mt-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <Button asChild>
                <Link href="/collections">
                  Voir toutes les collections
                </Link>
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
