"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShoppingBag, ArrowRight, Star } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { RetroGrid } from "@/components/ui/retro-grid";
import { useBanner } from "@/components/layout/BannerContext";
import { cn } from "@/lib/utils";

interface HomePageClientProps {
  products: any[];
}

export function HomePageClient({ products = [] }: HomePageClientProps) {
  const safeProducts = Array.isArray(products) ? products : [];
  const featuredProducts = safeProducts.slice(0, 4);
  const { isBannerVisible } = useBanner();

  return (
    <div className="flex flex-col min-h-screen bg-[#FEF7F0] overflow-x-hidden">
      {/* --- HERO SECTION PRO --- */}
      <section
        className={cn(
          "relative w-full flex flex-col justify-center overflow-hidden",
          // LA LOGIQUE DE DÉCOLLEMENT (ESSENTIELLE)
          "transition-transform duration-500 ease-swiss",
          isBannerVisible ? "translate-y-12" : "translate-y-0",
        )}
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

        <div className="container flex items-center justify-center mt-24 px-4 md:px-6 py-12 lg:py-24">
          {/* J'ai corrigé "justify-left" (invalide) par "justify-start" et ajouté gap-12 pour l'espace */}
          <div className="flex flex-row items-center justify-start gap-6 lg:gap-12">
            {/* 1. COLONNE VISUELLE */}
            {/* CORRECTION : On retire flex-1. On met flex-none pour qu'il ne prenne que la taille de l'image */}
            <div className="hidden md:flex flex-none relative shrink-0">
              {/* Cercle décoratif derrière le logo pour l'ancrer visuellement */}
              <div className="absolute inset-0 bg-primary/10 blur-[40px] rounded-full scale-150 -z-10" />

              <Image
                src="/assets/images/logo/logo-jolananas-gradient.png"
                alt="Logo – JOLANANAS"
                width={350}
                height={350}
                className="object-contain w-[150px] sm:w-[200px] md:w-[250px] lg:w-[300px] xl:w-[400px] 2xl:w-[500px] h-auto"
                priority
              />
            </div>

            {/* 2. COLONNE TEXTE (Éditorial) */}
            {/* CORRECTION : flex-1 ici permet au texte de prendre tout l'espace restant */}
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
                    </div>
                  ))}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground pl-1">
                  Approuvé par +500 clientes
                </span>
              </div>

              {/* Titre Principal */}
              <div className="space-y-2 w-full">
                <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.95] text-foreground">
                  L'ART DE <br />
                  <span className="text-primary italic font-serif pr-2">
                    l'audace
                  </span>
                  DOUCE.
                </h1>
                <p className="text-lg md:text-xl text-muted-foreground max-w-lg leading-relaxed">
                  Une collection pensée pour celles qui osent. Des pièces
                  uniques, faites main, qui révèlent votre personnalité sans
                  dire un mot.
                </p>
              </div>

              {/* Actions & CTA */}
              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-4">
                <Link href="/collections" className="w-full sm:w-auto">
                  <Button
                    size="lg"
                    className="group w-full sm:w-auto rounded-full h-14 px-8 text-base font-bold uppercase tracking-widest bg-black text-white hover:bg-primary transition-all shadow-xl hover:scale-105 border-2 border-transparent relative overflow-hidden"
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
                      DÉCOUVRIR LA COLLECTION
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </Button>
                </Link>
              </div>

              {/* Preuve Sociale / Footer Hero */}
              <div className="flex items-center gap-4 pt-4 opacity-80">
                <div className="flex gap-1 text-primary">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} fill="currentColor" />
                  ))}
                </div>
                <p className="text-xs font-medium uppercase tracking-widest text-black/60">
                  4.9/5 sur Trustpilot
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BEST SELLERS */}
      <section className="py-24 container mx-auto px-4 relative z-10 bg-[#FEF7F0]">
        <div className="flex justify-between items-end mb-12 border-b border-black/5 pb-4">
          <h2 className="text-4xl font-serif font-black tracking-tighter uppercase">
            Nos Favoris
          </h2>
          <Link
            href="/collections"
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
              <p className="text-muted-foreground font-medium">
                Chargement des produits...
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
