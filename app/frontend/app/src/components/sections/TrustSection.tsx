/**
 * 🍍 JOLANANAS - Trust Section Hydrogen Style
 * ===========================================
 * Section confiance avec badges livraison, sécurité, qualité
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Truck, Gem } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/Carousel';

export function TrustSection() {
  const badges = [
    {
      icon: <Truck className="h-8 w-8 text-white" />,
      title: 'Livraison Rapide & Sécurisée',
      description: 'Recevez vos créations en toute confiance, directement chez vous.',
    },
    {
      icon: <ShieldCheck className="h-8 w-8 text-white" />,
      title: 'Paiement 100% Sécurisé',
      description: 'Vos transactions sont protégées par les dernières technologies.',
    },
    {
      icon: <Gem className="h-8 w-8 text-white" />,
      title: 'Qualité Artisanale Garantie',
      description: 'Chaque pièce est unique, façonnée avec des matériaux nobles.',
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-20 px-4 bg-jolananas-white-soft">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader>
              <CardTitle className="text-3xl md:text-4xl font-bold text-jolananas-black-ink text-center">
                Pourquoi Choisir JOLANANAS ?
              </CardTitle>
            </CardHeader>
          </Card>
        </motion.div>
        <motion.div
          className="flex flex-col md:flex-row gap-4 md:gap-3"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
        >
          {badges.map((badge, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex-1"
            >
              <Card className="hover:shadow-xl transition-shadow duration-300 h-full">
                <CardHeader>
                  <div className="flex flex-row items-start gap-3 md:gap-4">
                    <Badge className="w-12 h-12 md:w-14 md:h-14 bg-gradient-to-br from-jolananas-peach-light to-jolananas-pink-medium rounded-full flex items-center justify-center shrink-0 p-0">
                      {badge.icon}
                    </Badge>
                    <div className="text-left flex-1 min-w-0">
                      <CardTitle className="text-base md:text-lg font-bold text-jolananas-black-ink mb-2">
                        {badge.title}
                      </CardTitle>
                      <CardDescription className="text-sm text-jolananas-black-ink/70 leading-relaxed">
                        {badge.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
