/**
 * 🍍 JOLANANAS - Preloader Intelligent
 * ===================================
 * Preloader qui vérifie le chargement de toutes les ressources critiques
 * avant de disparaître avec une animation de séparation en deux panneaux
 */

"use client";

import Image from "next/image";
import { useLayoutEffect, useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { gsap } from "gsap";
import { usePreloaderCheck } from "@/hooks/usePreloaderCheck";
import { usePreloaderLogic } from "@/hooks/usePreloaderLogic";

export function Preloader() {
  const { isLoading, show } = usePreloaderLogic();

  if (!show) return null;

  const commonStyle = {
    backgroundImage: "url(/assets/images/background/bg-jolananas-fast.gif)",
    backgroundRepeat: "no-repeat",
    backgroundSize: "200% 100%", // 200% car chaque panneau fait 50% de l'écran
  };

  const overlayStyle = {
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    backgroundColor: "rgba(254, 247, 240, 0.675)",
  };

  return (
    <div className="fixed inset-0 z-[9999] flex pointer-events-none">
      {/* --- LOGO CENTRAL INDÉPENDANT --- */}
      {/* Positionné au-dessus des rideaux (z-50) */}
      <div
        className={cn(
          "absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50",
          // ANIMATION DU LOGO :
          // 1. transition-all duration-500 : Rapide
          // 2. ease-in : Accélération
          // 3. scale-[10] : Zoom massif (x10)
          // 4. opacity-0 : Disparition en fondu
          "transition-all duration-500 ease-in will-change-transform",
          !isLoading ? "scale-[50] opacity-0" : "scale-100 opacity-100",
        )}
      >
        <div className="relative w-40 h-40 md:w-56 md:h-56">
          <Image
            src="/assets/images/logo/logo-jolananas-gradient.png"
            alt="Jolananas"
            fill
            sizes="(max-width: 768px) 160px, 224px"
            className="object-contain"
            priority
          />
        </div>
      </div>

      {/* --- RIDEAU GAUCHE --- */}
      <div
        className={cn(
          // On ajoute un délai (delay-100) pour que le rideau parte juste APRES le début du zoom du logo
          "relative h-full w-1/2 transition-transform duration-1000 delay-100 ease-[cubic-bezier(0.87,0,0.13,1)]",
          !isLoading && "-translate-x-full",
        )}
        style={{ ...commonStyle, backgroundPosition: "0% center" }}
      >
        <div className="absolute inset-0" style={overlayStyle} />
      </div>

      {/* --- RIDEAU DROIT --- */}
      <div
        className={cn(
          // Même délai pour la synchro
          "relative h-full w-1/2 transition-transform duration-1000 delay-100 ease-[cubic-bezier(0.87,0,0.13,1)]",
          !isLoading && "translate-x-full",
        )}
        style={{ ...commonStyle, backgroundPosition: "100% center" }}
      >
        <div className="absolute inset-0" style={overlayStyle} />
      </div>
    </div>
  );
}
