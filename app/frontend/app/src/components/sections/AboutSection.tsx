/**
 * 🍍 JOLANANAS - About Section
 * ==============================
 * Section présentation de l'artisanat JOLANANAS
 */

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/Separator';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';

export function AboutSection() {
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background de base */}
      <div 
        className="absolute inset-0 z-0"
        style={{
          background: 'linear-gradient(135deg, #fef7f0 0%, #f5f0e8 50%, #ffffff 100%)',
        }}
      />
      
      {/* Orbes animés pour effet de profondeur mesh */}
      <motion.div
        className="absolute z-0 rounded-full blur-3xl"
        style={{
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(239, 124, 158, 0.15) 0%, transparent 70%)',
          left: '10%',
          top: '20%',
        }}
        animate={{
          x: [0, 80, 0],
          y: [0, 60, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      
      <motion.div
        className="absolute z-0 rounded-full blur-3xl"
        style={{
          width: '500px',
          height: '500px',
          background: 'radial-gradient(circle, rgba(245, 240, 232, 0.2) 0%, transparent 70%)',
          right: '15%',
          top: '40%',
        }}
        animate={{
          x: [0, -60, 0],
          y: [0, -40, 0],
          scale: [1, 1.15, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
      />
      
      <motion.div
        className="absolute z-0 rounded-full blur-3xl"
        style={{
          width: '400px',
          height: '400px',
          background: 'radial-gradient(circle, rgba(255, 255, 255, 0.4) 0%, transparent 70%)',
          left: '50%',
          top: '10%',
        }}
        animate={{
          x: [0, 40, 0],
          y: [0, 50, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 1,
        }}
      />
      
      {/* Overlay pour douceur */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-jolananas-white-soft/80 via-jolananas-gray-warm/60 to-white/80" />
      
      <div className="relative z-10 container mx-auto">
        
        {/* Header avec Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader>
              <Badge variant="secondary" className="w-fit mx-auto mb-6">
                <Heart className="text-jolananas-pink-deep mr-2 h-4 w-4" />
                Notre Histoire
              </Badge>
              <CardTitle className="text-3xl md:text-4xl lg:text-5xl font-bold text-jolananas-black-ink mb-6">
                L'Art de Créer avec <span className="text-jolananas-pink-deep">Passion</span>
              </CardTitle>
              <CardDescription className="text-xl text-jolananas-black-ink/70 max-w-3xl mx-auto font-sans">
                Depuis plus de 10 ans, JOLANANAS transforme chaque création en œuvre d'art, alliant tradition française et innovation moderne.
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Main Content avec Card */}
        <div className="mb-20">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <Card className="border-0 shadow-none bg-transparent">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-jolananas-black-ink mb-4">
                  Une Histoire Française
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <CardDescription className="text-jolananas-black-ink/80 font-sans text-base">
                  Fondée par des artisans passionnés dans le cœur de la France, <strong className="font-sans">JOLANANAS</strong> est née d'une vision simple : créer des bijoux et accessoires qui racontent votre histoire unique.
                </CardDescription>
                
                <Separator />
                
                <CardDescription className="text-jolananas-black-ink/80 font-sans text-base">
                  Chaque pièce est façonnée à la main avec des matériaux nobles sélectionnés pour leur qualité exceptionnelle. Des perles de Murano aux métaux précieux, nous nous engageons à n'utiliser que ce qui peut vous transmettre beauté et durabilité.
                </CardDescription>
                
                <Separator />
                
                <CardDescription className="text-jolananas-black-ink/80 font-sans text-base">
                  Notre philosophie artisanale nous guide quotidiennement : "<em className="font-sans">Chaque création est unique, comme chaque personne qui la portera</em>".
                </CardDescription>

                <div className="pt-4">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        onClick={() => window.location.href = '/contact'}
                        className="w-full sm:w-auto"
                      >
                        <Globe className="mr-2 h-4 w-4" />
                        Découvrir notre Atelier
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Visitez notre atelier et découvrez notre processus de création</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Stats avec Card */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-16"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-jolananas-black-ink text-center">
                JOLANANAS en Chiffres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {[
                  { number: "500+", label: "Créations Uniques", tooltip: "Plus de 500 créations artisanales uniques" },
                  { number: "10+", label: "Années d'Expertise", tooltip: "Plus de 10 ans d'expérience dans l'artisanat" },
                  { number: "100%", label: "Fabriqué en France", tooltip: "Toutes nos créations sont fabriquées en France" },
                  { number: "∞", label: "Passion Infinie", tooltip: "Notre passion pour l'artisanat est infinie" }
                ].map((stat, index) => (
                  <Tooltip key={stat.label}>
                    <TooltipTrigger asChild>
                      <motion.div
                        initial={{ scale: 0 }}
                        whileInView={{ scale: 1 }}
                        transition={{ type: "spring", delay: index * 0.1 }}
                        viewport={{ once: true }}
                        className="space-y-2"
                      >
                        <Badge variant="default" className="text-3xl font-bold text-jolananas-pink-deep bg-transparent px-0 py-0">
                          {stat.number}
                        </Badge>
                        <CardDescription className="text-sm font-medium">
                          {stat.label}
                        </CardDescription>
                      </motion.div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{stat.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  );
}
