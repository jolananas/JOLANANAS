"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, LogIn, Sparkles, Crown, Palette } from "lucide-react";
import { CartSheet } from "@/components/cart/CartSheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBanner } from "@/components/layout/BannerContext";

const navItems = [
  { name: "Accueil", href: "/" },
  { name: "Collections", href: "/collections" },
  { name: "Notre Histoire", href: "/about" },
  { name: "Contact", href: "/contact" },
];

export function Navigation() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [shouldHideNav, setShouldHideNav] = React.useState(false);
  const pathname = usePathname();
  const { isBannerVisible } = useBanner();

  // Fermer le menu mobile au changement de page
  React.useEffect(() => setIsOpen(false), [pathname]);

  // Détecter quand le footer est à 75% visible pour masquer la navbar
  React.useEffect(() => {
    let observer: IntersectionObserver | null = null;
    let intervalId: NodeJS.Timeout | null = null;

    const initObserver = () => {
      const footer = document.getElementById("footer");
      if (!footer) return false;

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Masquer la navbar quand le footer est visible à 75% ou plus
            setShouldHideNav(entry.intersectionRatio >= 0.75);
          });
        },
        {
          threshold: [0, 0.75, 1], // Observer à 0%, 75%, et 100%
        },
      );

      observer.observe(footer);
      return true;
    };

    // Tentative immédiate
    if (!initObserver()) {
      // Si pas encore là (Suspense/Hydration), on réessaie
      intervalId = setInterval(() => {
        if (initObserver()) {
          if (intervalId) clearInterval(intervalId);
        }
      }, 200);

      // Sécurité : arrêter de chercher après 10 secondes
      setTimeout(() => {
        if (intervalId) clearInterval(intervalId);
      }, 10000);
    }

    return () => {
      if (observer) observer.disconnect();
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  return (
    <header
      className={cn(
        "fixed border border-border/50 backdrop-blur-xl shadow-sm overflow-hidden bg-white/60",
        // Z-Index : Nav au-dessus du banner (z-101) uniquement quand ouvert pour éviter le chevauchement
        isOpen ? "z-[102]" : "z-50",
        // ANIMATION DE MASQUAGE AU FOOTER
        "transition-all duration-500 ease-swiss", // Transition fluide
        shouldHideNav && "-translate-y-40 opacity-0 pointer-events-none", // Masquage

        // LOGIQUE DE POSITIONNEMENT
        isOpen
          ? cn(
              // MOBILE OUVERT : Plein écran, top-0 pour couvrir le banner
              "top-0 w-full h-full rounded-none bg-white/95",
              // DESKTOP OUVERT : Garde la position relative au banner et les styles desktop
              "md:left-1/2 md:-translate-x-1/2 md:w-[95%] md:max-w-7xl md:rounded-[2rem] md:h-fit",
              isBannerVisible ? "md:top-24" : "md:top-6",
            )
          : cn(
              // FERMÉ (Mobile & Desktop) : Position pillule
              "left-1/2 -translate-x-1/2 w-[95%] max-w-7xl rounded-[34px] h-[68px]",
              isBannerVisible ? "top-24" : "top-6",
            ),
      )}
    >
      {/* BARRE DU HAUT (Toujours visible) */}
      <div
        className={cn(
          "px-6 h-[66px] flex items-center justify-between",
          isOpen && "md:mt-0",
        )}
      >
        {/* Mobile Menu Button */}
        <button
          className="p-2 -ml-2 text-primary hover:bg-secondary/20 rounded-full transition-colors"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="relative w-6 h-6 flex items-center justify-center">
            <span
              className={cn(
                "absolute transition-all duration-300 rotate-0 scale-100",
                isOpen && "rotate-90 scale-0",
              )}
            >
              <Menu size={24} />
            </span>
            <span
              className={cn(
                "absolute transition-all duration-300 rotate-90 scale-0",
                isOpen && "rotate-0 scale-100",
              )}
            >
              <X size={24} />
            </span>
          </div>
        </button>

        {/* LOGO CENTRÉ */}
        <Link
          href="/"
          className="font-serif text-2xl font-bold tracking-tighter text-primary flex items-center justify-center absolute left-1/2 -translate-x-1/2"
        >
          <Image
            src="/assets/images/logo/logo-jolananas-gradient.png"
            alt="Logo – Jolananas"
            width={20}
            height={50}
            className="h-8 w-auto object-contain"
          />
        </Link>

        {/* ACTIONS (CART) */}
        <div className="flex items-center text-primary gap-2">
          <CartSheet />
        </div>
      </div>

      {/* MENU DÉROULANT */}
      <div
        className={cn(
          "flex flex-col md:flex-row justify-between px-4 overflow-y-auto",
          // Mobile : Hauteur calculée pour remplir l'écran moins la barre du haut (66px)
          isOpen ? "h-[calc(100dvh-66px)]" : "h-0",
          // Desktop : Hauteur auto
          "md:h-auto",
        )}
      >
        {/* LIENS & BOUTON CONNEXION */}
        <div
          className={cn(
            "flex flex-col justify-between",
            isOpen ? "opacity-100 pb-6 pt-2" : "opacity-0", // Toujours visible sur desktop
          )}
        >
          {/* LIENS */}
          <div
            className={cn(
              "flex flex-col gap-2 px-4 w-full transition-all duration-500 ease-swiss",
              isOpen
                ? "max-h-[400px] opacity-100 pb-6 pt-2" // Déroule le contenu
                : "max-h-0 opacity-0", // Cache le contenu proprement
              "md:max-h-full md:opacity-100 md:pb-0 md:pt-0", // Toujours visible sur desktop
            )}
          >
            {navItems.map((item, index) => (
              <Button
                key={item.href}
                asChild
                variant="ghost"
                style={{ transitionDelay: isOpen ? `${index * 50}ms` : "0ms" }}
                className={cn(
                  "text-lg font-medium h-auto py-3 px-6 rounded-xl transition-all duration-300 transform justify-start",
                  pathname === item.href,
                  isOpen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0 md:translate-y-0 md:opacity-100",
                )}
              >
                <Link href={item.href}>{item.name}</Link>
              </Button>
            ))}
          </div>

          {/* BOUTTON CONNEXION */}
          <div
            className={cn(
              "flex flex-row gap-2 px-4 w-full transition-all duration-500 ease-swiss",
              isOpen
                ? "max-h-[400px] opacity-100 pb-6 pt-2" // Déroule le contenu
                : "max-h-0 opacity-0", // Cache le contenu proprement
              "md:max-h-full md:opacity-100 md:pb-0 md:pt-0", // Toujours visible sur desktop
            )}
          >
            <Button
              variant="default"
              size="lg"
              className="w-full"
              onClick={() => setIsOpen(false)}
            >
              Connexion
            </Button>
          </div>
        </div>
        {/* CARTE ACTUALITÉS */}
        <div
          className={cn(
            "grid grid-cols-1 md:grid-cols-2 gap-4 px-4 transition-all duration-500 ease-swiss",
            isOpen
              ? "max-h-[600px] opacity-100 pb-6 pt-2"
              : "max-h-0 opacity-0", // Toujours visible sur desktop
          )}
        >
          {/* Carte 1 - Nouvelle Collection */}
          <Link
            href="/collections/nouvelle-collection"
            className={cn(
              "group relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-50 to-purple-50 p-6 transition-all duration-100",
              isOpen
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0 md:translate-y-0 md:opacity-100",
            )}
            style={{ transitionDelay: isOpen ? "200ms" : "0ms" }}
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-primary/20 to-purple-300/20 blur-2xl transition-transform group-hover:scale-150" />
            <div className="relative">
              <span className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Nouveau
              </span>
              <h3 className="mt-3 text-xl font-bold text-foreground">
                Collection Printemps
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Découvrez nos dernières créations artisanales
              </p>
            </div>
          </Link>

          {/* Carte 2 - Offre Spéciale */}
          <Link
            href="/promo"
            className={cn(
              "group relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50 p-6 transition-all duration-100",
              isOpen
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0 md:translate-y-0 md:opacity-100",
            )}
            style={{ transitionDelay: isOpen ? "250ms" : "0ms" }}
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-amber-300/20 to-orange-300/20 blur-2xl transition-transform group-hover:scale-150" />
            <div className="relative">
              <span className="inline-block rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-700">
                -20%
              </span>
              <h3 className="mt-3 text-xl font-bold text-foreground">
                Offre Limitée
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Profitez de réductions exclusives
              </p>
            </div>
          </Link>

          {/* Carte 3 - Notre Histoire */}
          <Link
            href="/about"
            className={cn(
              "group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50 p-6 transition-all duration-100",
              isOpen
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0 md:translate-y-0 md:opacity-100",
            )}
            style={{ transitionDelay: isOpen ? "300ms" : "0ms" }}
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-blue-300/20 to-cyan-300/20 blur-2xl transition-transform group-hover:scale-150" />
            <div className="relative">
              <span className="inline-block rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-700">
                À propos
              </span>
              <h3 className="mt-3 text-xl font-bold text-foreground">
                Notre Savoir-Faire
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                L'art de la création artisanale
              </p>
            </div>
          </Link>

          {/* Carte 4 - Contact */}
          <Link
            href="/contact"
            className={cn(
              "group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 p-6 transition-all duration-100",
              isOpen
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0 md:translate-y-0 md:opacity-100",
            )}
            style={{ transitionDelay: isOpen ? "350ms" : "0ms" }}
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-300/20 to-teal-300/20 blur-2xl transition-transform group-hover:scale-150" />
            <div className="relative">
              <span className="inline-block rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-700">
                Support
              </span>
              <h3 className="mt-3 text-xl font-bold text-foreground">
                Nous Contacter
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Une question ? Notre équipe vous répond
              </p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
