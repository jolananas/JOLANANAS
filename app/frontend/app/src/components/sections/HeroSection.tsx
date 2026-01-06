/**
 * 🍍 JOLANANAS - HeroCarousel Hydrogen Style
 * ==========================================
 * Hero avec fond animé GIF visible et overlay texte pour lisibilité
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';

export function HeroSection() {
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
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1 },
  };


  return (
    <section 
      className="relative flex items-center justify-center overflow-hidden min-h-screen"
    >
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/images/background/Fond perso rapide – Jolananas.gif"
          alt="Background JOLANANAS"
          fill
          className="object-cover"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-white/25"></div>
      </div>

      <div className="relative z-10 text-center text-white px-4">
        <motion.div
          className="max-w-4xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={badgeVariants}
            transition={{ delay: 0.3 }}
          >
            <Badge 
              variant="secondary" 
              className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white mb-6"
            >
              <span className="text-jolananas-gold mr-2">✨</span>
              <span className="text-sm font-medium">
                Créations artisanales françaises
              </span>
            </Badge>
          </motion.div>

          <motion.h1
            className="mb-6 leading-tight flex items-center justify-center"
            variants={itemVariants}
            transition={{ delay: 0.5 }}
          >
            <Image
              src="/assets/images/logo/Logo – Jolananas (uniquement) argent.png"
              alt="JOLANANAS Logo"
              width={600}
              height={200}
              className="w-[280px] h-auto md:w-[400px] lg:w-[500px] xl:w-[600px] object-contain"
              sizes="(max-width: 768px) 280px, (max-width: 1024px) 400px, (max-width: 1280px) 500px, 600px"
              priority
            />
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto"
            variants={itemVariants}
            transition={{ delay: 0.7 }}
          >
            Découvrez nos accessoires artisanaux exclusifs, 
            façonnés avec amour et passion en France.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={itemVariants}
            transition={{ delay: 0.9 }}
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="shine" className="group" asChild>
                  <a href="#collections">
                    Découvrir la collection
                    <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Explorer nos créations artisanales</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  className="group bg-white/90 text-jolananas-black-ink border-white/50 hover:bg-white hover:text-jolananas-black-ink shadow-lg backdrop-blur-sm" 
                  asChild
                >
                  <a href="/pages/about">
                    <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                    Voir notre histoire
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Découvrir l'histoire de JOLANANAS</p>
              </TooltipContent>
            </Tooltip>
          </motion.div>
        </motion.div>
      </div>

    </section>
  );
}
