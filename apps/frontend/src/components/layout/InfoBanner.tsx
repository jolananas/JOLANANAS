"use client";

import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import {
  X,
  Sparkles,
  Info,
  AlertTriangle,
  CheckCircle2,
  ArrowRight,
  Truck,
  Zap,
  Gift,
  ShoppingCart,
  Wrench,
  PartyPopper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils/cn";
import { useCart } from "@/components/providers/CartProvider";
import { useBanner } from "@/components/layout/BannerContext";
import {
  getBannerMessage,
  isBannerDismissed,
  dismissBanner,
  type BannerMessage,
} from "@/lib/config/bannerConfig";

const BANNER_STYLES = {
  promotion: {
    bg: "bg-accent dark:bg-accent/20",
    border: "border-accent dark:border-accent/30",
    text: "text-foreground dark:text-accent-foreground",
    badge:
      "bg-background/90 text-accent border-transparent hover:bg-background",
  },
  info: {
    bg: "bg-slate-100 dark:bg-slate-900",
    border: "border-slate-200 dark:border-slate-800",
    text: "text-slate-900 dark:text-slate-100",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950/50",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-900 dark:text-amber-100",
  },
  success: {
    bg: "bg-emerald-50 dark:bg-emerald-950/50",
    border: "border-emerald-200 dark:border-emerald-800",
    text: "text-emerald-900 dark:text-emerald-100",
  },
  default: {
    bg: "bg-muted dark:bg-muted/10",
    border: "border-muted-foreground/20",
    text: "text-foreground",
  },
} as const;

interface InfoBannerProps {
  className?: string;
}

export function InfoBanner({ className }: InfoBannerProps) {
  const [banner, setBanner] = useState<BannerMessage | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const { totalPrice, totalItems } = useCart();
  const { setIsBannerVisible } = useBanner();
  const bannerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Déterminer le message à afficher selon le contexte
    const context = {
      isFirstVisit:
        typeof window !== "undefined" &&
        !localStorage.getItem("jolananas-has-visited"),
      cartTotal: totalPrice,
      hasAbandonedCart:
        totalItems > 0 &&
        typeof window !== "undefined" &&
        !localStorage.getItem("jolananas-cart-checked-out"),
      isMaintenanceMode: false, // TODO: Récupérer depuis une variable d'environnement ou API
    };

    const message = getBannerMessage(context);

    if (message && !isBannerDismissed(message.id)) {
      setBanner(message);
      setIsVisible(true);
      setIsBannerVisible(true);

      // Marquer la première visite
      if (context.isFirstVisit && typeof window !== "undefined") {
        localStorage.setItem("jolananas-has-visited", "true");
      }
    } else {
      setIsVisible(false);
      setIsBannerVisible(false);
    }
  }, [totalPrice, totalItems, setIsBannerVisible]);

  // Animation GSAP (remplace Framer Motion)
  useLayoutEffect(() => {
    if (!bannerRef.current || !containerRef.current) return;

    const prefersReducedMotion =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;

    const ctx = gsap.context(() => {
      if (isVisible && banner) {
        // S'assurer que l'élément est visible avant l'animation
        if (bannerRef.current) {
          bannerRef.current.style.display = "";
        }

        if (prefersReducedMotion) {
          // Animation réduite : simple fade in
          gsap.fromTo(
            containerRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.3, ease: "power2.out" },
          );
        } else {
          // Animation complète : slide down + fade in
          gsap.fromTo(
            containerRef.current,
            { opacity: 0, y: -20, scale: 0.98 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.4,
              ease: "power3.out",
            },
          );
        }
      } else {
        // Animation de sortie
        gsap.to(containerRef.current, {
          opacity: 0,
          y: prefersReducedMotion ? 0 : -20,
          scale: prefersReducedMotion ? 1 : 0.98,
          duration: 0.3,
          ease: "power2.in",
          onComplete: () => {
            if (bannerRef.current) {
              bannerRef.current.style.display = "none";
            }
          },
        });
      }
    }, bannerRef);

    return () => ctx.revert();
  }, [isVisible, banner]);

  const handleDismiss = () => {
    if (banner) {
      dismissBanner(banner.id);
      setIsVisible(false);
      setIsBannerVisible(false);
    }
  };

  // Icônes selon le type et l'ID du banner
  const getIcon = () => {
    const iconClass = "h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0";

    // Mapping intelligent selon l'ID du banner pour des icônes contextuelles
    if (banner?.id) {
      switch (banner.id) {
        case "free-shipping-50":
        case "free-shipping-close":
        case "free-shipping-achieved":
          return <Truck className={iconClass} aria-hidden="true" />;
        case "express-delivery":
          return <Zap className={iconClass} aria-hidden="true" />;
        case "welcome-discount":
          return <Gift className={iconClass} aria-hidden="true" />;
        case "abandoned-cart":
          return <ShoppingCart className={iconClass} aria-hidden="true" />;
        case "maintenance":
          return <Wrench className={iconClass} aria-hidden="true" />;
        default:
          // Fallback sur le type si l'ID n'est pas reconnu
          break;
      }
    }

    // Fallback sur le type de banner
    switch (banner?.type) {
      case "promotion":
        return <Sparkles className={iconClass} aria-hidden="true" />;
      case "info":
        return <Info className={iconClass} aria-hidden="true" />;
      case "warning":
        return <AlertTriangle className={iconClass} aria-hidden="true" />;
      case "success":
        return <CheckCircle2 className={iconClass} aria-hidden="true" />;
      default:
        return <Info className={iconClass} aria-hidden="true" />;
    }
  };

  // Styles de fond selon le type
  const getBannerStyle = (type?: string) => {
    const styleKey = (type as keyof typeof BANNER_STYLES) || "default";
    return BANNER_STYLES[styleKey] || BANNER_STYLES.default;
  };

  const currentStyle = getBannerStyle(banner?.type);

  return (
    <div
      ref={bannerRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-[101] w-full overflow-hidden",
        "shadow-sm dark:shadow-none",
        // ANIMATION HAUTEUR : On joue sur max-height pour glisser
        "transition-all duration-700 ease-swiss",
        isVisible && banner ? "max-h-20" : "max-h-0",
        className,
      )}
      role={banner?.type === "warning" ? "alert" : "banner"}
      aria-live={banner?.type === "warning" ? "assertive" : "polite"}
      aria-atomic="true"
      aria-hidden={!isVisible || !banner}
    >
      <div
        ref={containerRef}
        className={cn(
          "w-full transition-opacity duration-300",
          isVisible && banner ? "opacity-100 delay-200" : "opacity-0",
          currentStyle.bg,
          "border-b",
          currentStyle.border,
          currentStyle.text,
        )}
      >
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between gap-2 sm:gap-3 md:gap-4 px-3 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-2.5 md:py-3">
            {/* Section gauche : Icône + Titre */}
            <div className="flex items-center gap-2 sm:gap-2.5 md:gap-3 min-w-0 flex-1">
              {/* Icône */}
              <div className="flex-shrink-0 flex items-center [&>svg]:shrink-0">
                {getIcon()}
              </div>

              {/* Titre + Description */}
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-semibold leading-tight truncate">
                  {banner?.title}
                </p>
                {banner?.description && (
                  <p className="hidden sm:block text-xs text-muted-foreground/90 mt-0.5 leading-tight line-clamp-1">
                    {banner.description}
                  </p>
                )}
              </div>
            </div>

            {/* Section droite : Action + Fermeture */}
            <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
              {/* Bouton d'action (lien) */}
              {banner?.link && (
                <Link
                  href={banner.link.href}
                  className="hidden sm:inline-flex items-center gap-1.5 group"
                  onClick={() => setIsVisible(false)}
                  aria-label={banner.link.label}
                >
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-xs font-semibold cursor-pointer transition-all duration-200 hover:scale-105 h-6 px-2.5 sm:h-7 sm:px-3",
                      banner.type === "promotion"
                        ? BANNER_STYLES.promotion.badge
                        : "bg-transparent hover:bg-accent/50",
                    )}
                  >
                    {banner.link.label}
                    <ArrowRight
                      className="h-3 w-3 ml-0.5 transition-transform duration-200 group-hover:translate-x-0.5"
                      aria-hidden="true"
                    />
                  </Badge>
                </Link>
              )}

              {/* Bouton de fermeture */}
              {banner?.dismissible && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="h-7 w-7 sm:h-8 sm:w-8 opacity-70 hover:opacity-100 transition-all duration-200 hover:bg-accent/50 flex-shrink-0"
                  onClick={handleDismiss}
                  aria-label="Fermer le bandeau d'information"
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      handleDismiss();
                    }
                  }}
                >
                  <X className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
                  <span className="sr-only">Fermer</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
