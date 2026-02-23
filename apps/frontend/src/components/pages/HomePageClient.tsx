"use client";

import React from "react";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowRight, Star } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { RetroGrid } from "@/components/ui/retro-grid";
import { useBanner } from "@/components/layout/BannerContext";
import { cn } from "@/lib/utils";
import { PageContainer } from "@/components/layout/PageContainer";
import { SocialProofSection } from "@/components/sections/SocialProofSection";
import { LatestArticles } from "@/components/blog/LatestArticles";
import { Article } from "@/lib/shopify/types";

interface HomePageClientProps {
  products: any[];
  articles?: Article[];
}

export const HomePageClient: React.FC<HomePageClientProps> = ({ products = [], articles = [] }) => {
  const safeProducts = Array.isArray(products) ? products : [];
  const featuredProducts = safeProducts.slice(0, 4);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.015,
        delayChildren: 0.2,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  const text = "\"Chaque pièce est une histoire, façonnée à la main avec passion. J'allie l'artisanat traditionnel à une vision moderne pour créer des bijoux uniques, en séries très limitées.\"";

  return (
    <div className="flex flex-col bg-[#FEF7F0] overflow-x-hidden">
      {/* --- HERO SECTION PRO --- */}
      <PageContainer
        className="relative w-full min-h-[calc(100vh-var(--header-offset,84px))] flex flex-col justify-center overflow-hidden"
      >
        {/* ARRIÈRE-PLAN : RETRO GRID */}
        <RetroGrid
          className="absolute inset-0 z-0"
          angle={65}
          cellSize={60}
          opacity={0.35}
          lightLineColor="#EC7B9C"
          darkLineColor="#F4C0AC"
        />

        <div className="container flex items-center justify-center px-4 md:px-6 py-12 lg:py-24">
          <div className="flex flex-row items-center justify-start gap-6 lg:gap-12">
            {/* 1. COLONNE VISUELLE */}
            <div className="hidden md:flex flex-none relative shrink-0">
              <Image
                src="/assets/images/logo/logo-jolananas-gradient.png"
                alt="Logo – JOLANANAS"
                width={350}
                height={350}
                className="object-contain w-[125px] sm:w-[175px] md:w-[225px] lg:w-[275px] xl:w-[325px] 2xl:w-[375px] h-auto"
                priority={true}
                fetchPriority="high"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {/* 2. COLONNE TEXTE (Éditorial) */}
            <div className="flex-1 flex flex-col items-start text-left space-y-8 z-10 min-w-0">
              {/* Badge Premium */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-black/5 shadow-sm">
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="w-5 h-5 rounded-full bg-gray-100 border border-white overflow-hidden relative"
                    >
                      {/* Placeholder avatars ou couleurs */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                      <Image
                        src="/assets/images/logo/logo-jolananas-gradient.png"
                        alt="Logo – JOLANANAS"
                        width={350}
                        height={350}
                        className="object-contain w-[125px] sm:w-[175px] md:w-[225px] lg:w-[275px] xl:w-[325px] 2xl:w-[375px] h-auto"
                        priority={true}
                        fetchPriority="high"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#595959] pl-1">
                  Bienvenue à nos nouveaux clients
                </span>
              </div>

              {/* Titre Principal */}
              <div className="space-y-2 w-full">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] text-secondary uppercase">
                  L'ARTISANAT <br />
                  <span className="text-primary italic font-serif pr-2">
                    au cœur.
                  </span>
                </h1>
                <div className="text-lg md:text-xl text-[#595959] max-w-xl leading-relaxed space-y-4 font-medium italic">
                  <motion.p
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="inline-block"
                  >
                    {text.split(" ").map((word, wordIndex) => (
                      <motion.span
                        key={wordIndex}
                        className="inline-block whitespace-nowrap"
                        variants={{
                          hidden: {},
                          visible: {},
                        }}
                      >
                        {word.split("").map((char, charIndex) => (
                          <motion.span
                            key={charIndex}
                            variants={letterVariants}
                            className="inline-block"
                          >
                            {char}
                          </motion.span>
                        ))}
                        <span className="inline-block">{"\u00A0"}</span>
                      </motion.span>
                    ))}
                  </motion.p>
                  <p className="text-right font-bold text-primary not-italic">
                    — <span className="font-brand text-secondary">Joanna M.</span>, Fondatrice
                  </p>
                </div>
              </div>

              {/* Actions & CTA */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
                <Link href="/collections" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    variant="cta"
                    className="group w-full sm:w-auto rounded-full h-14 px-8 text-base font-bold uppercase tracking-widest transition-all shadow-xl hover:scale-105 border-2 border-transparent relative overflow-hidden"
                    style={{
                      backgroundImage:
                        "linear-gradient(#000, #000), linear-gradient(90deg, #EC7B9C, #F4C0AC, #ffffff, #EC7B9C)",
                      backgroundOrigin: "padding-box, border-box",
                      backgroundClip: "padding-box, border-box",
                      backgroundSize: "100% 100%, 200% 100%",
                    }}
                  >
                    <div
                      className="absolute inset-0 animate-shine [background-size:200%_100%]"
                      style={{
                        backgroundImage: "inherit",
                        backgroundOrigin: "inherit",
                        backgroundClip: "inherit",
                      }}
                    />
                    <span className="relative flex items-center justify-center gap-3 z-10">
                      DÉCOUVRIR LES CRÉATIONS
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </Button>
                </Link>
              </div>

            </div>
          </div>
        </div>
      </PageContainer>

      {/* BEST SELLERS */}
      <section className="my-12 py-24 container mx-auto px-4 relative z-10 bg-[#FEF7F0]">
        <div className="flex justify-between items-end mb-12 border-b border-black/5 pb-4">
          <h2 className="text-4xl font-serif font-black tracking-tighter uppercase">
            Nos Créations
          </h2>
          <Link
            href="/products"
            className="text-primary hover:underline flex items-center gap-1 font-bold tracking-widest uppercase text-sm"
          >
            Voir tout <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12">
          {featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
              <ProductCard key={product.handle} product={product} />
            ))
          ) : (
            <div className="col-span-4 text-center py-20 border-2 border-dashed border-black/10 rounded-xl">
              <p className="text-[#595959] font-medium">
                Chargement des produits...
              </p>
            </div>
          )}
        </div>
      </section>

      {/* BLOG / LATEST ARTICLES */}
      <LatestArticles articles={articles} />

      {/* SOCIAL PROOF / TESTIMONIALS */}
      <SocialProofSection />
    </div>
  );
};
