"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X, Sparkles, Crown, Palette } from "lucide-react";
import { SearchDialog } from "@/components/layout/SearchDialog";
import { CartSheet } from "@/components/cart/CartSheet";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useBanner } from "@/components/layout/BannerContext";
import { useNavbar } from "./NavbarContext";

const navItems = [
  { name: "Accueil", href: "/" },
  { name: "Créations", href: "/products" },
  { name: "Collections", href: "/collections" },
  { name: "Notre Histoire", href: "/a-propos" },
  { name: "Contact", href: "/contact" },
];

export function Navigation() {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();
  const { isBannerVisible } = useBanner();
  const { isNavbarVisible, setIsNavbarVisible } = useNavbar();

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
            setIsNavbarVisible(entry.intersectionRatio < 0.75);
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
        "fixed border border-border/50 backdrop-blur-xl shadow-sm overflow-hidden bg-white/75 z-[102]",

        // ANIMATION DE MASQUAGE AU FOOTER (ou via context)
        "transition-all duration-500 ease-full",
        !isNavbarVisible &&
          !isOpen &&
          "-translate-y-40 opacity-0 pointer-events-none", // Ne pas masquer si ouvert

        // --- MOBILE : FERMÉ ---
        !isOpen &&
          "left-1/2 -translate-x-1/2 w-[95%] max-w-7xl rounded-[34px] h-[68px]",
        !isOpen && (isBannerVisible ? "top-24" : "top-6"),

        // --- MOBILE : OUVERT ---
        isOpen && "top-0 left-0 w-full h-full rounded-none backdrop-blur-3xl",

        // --- DESKTOP : RESET ---
        // Force styles desktop même si ouvert
        "md:left-1/2 md:-translate-x-1/2 md:w-[95%] md:max-w-7xl",
        // Si ouvert sur desktop : hauteur auto, arrondi, position relative au banner
        isOpen && "md:rounded-[2rem] md:h-fit",
        isOpen && (isBannerVisible ? "md:top-24" : "md:top-6"),
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
            width={200}
            height={50}
            className="h-8 w-auto object-contain"
          />
        </Link>

        {/* ACTIONS (SEARCH + CART) */}
        <div className="flex items-center text-primary gap-1">
          <SearchDialog />
          <CartSheet />
        </div>
      </div>

      {/* MENU DÉROULANT */}
      <div
        className={cn(
          "flex flex-col md:flex-row justify-between px-4 overflow-y-auto",
          // Mobile : Hauteur calculée pour remplir l'écran moins la barre du haut (66px)
          // Correction : Espaces requis autour de l'opérateur '-' dans calc()
          isOpen ? "h-[calc(100dvh_-_66px)]" : "h-0",
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
              "flex flex-col mt-20 md:mt-0 gap-6 md:gap-2 px-4 w-full justify-start items-start",
              isOpen
                ? "max-h-[600px] opacity-100 pb-6 pt-2" // Déroule le contenu
                : "max-h-0 w-0 opacity-0", // Cache le contenu proprement
            )}
          >
            {navItems.map((item, index) => (
              <div
                key={item.href}
                style={{ transitionDelay: isOpen ? `${index * 50}ms` : "0ms" }}
                className={cn(
                  "text-3xl md:text-2xl text-left text-primary hover:text-primary/80 hover:translate-x-4 uppercase font-medium h-auto py-2 rounded-xl transition-all duration-300 transform",
                  pathname === item.href,
                  isOpen
                    ? "translate-y-0 opacity-100"
                    : "translate-y-4 opacity-0",
                )}
              >
                <Link href={item.href}>{item.name}</Link>
              </div>
            ))}
          </div>

          {/* BOUTTON CONNEXION */}
          <div
            className={cn(
              "flex flex-row gap-2 px-4 py-2 w-full justify-center transition-all duration-500 ease-swiss",
              isOpen
                ? "max-h-[400px] opacity-100 pb-6 pt-2" // Déroule le contenu
                : "max-h-0 opacity-0", // Cache le contenu proprement
            )}
          >
            <a href="https://accounts.jolananas.com" className="w-auto md:w-full">
              <Button
                variant="default"
                size="lg"
                className="w-full uppercase text-xl md:text-lg"
                onClick={() => setIsOpen(false)}
              >
                Mon compte
              </Button>
            </a>
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
              "group relative overflow-hidden rounded-2xl bg-gradient-to-br from-jolananas-white-soft to-jolananas-pink-medium/20 p-6 transition-all duration-100",
              isOpen
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0 md:translate-y-0 md:opacity-100",
            )}
            style={{ transitionDelay: isOpen ? "200ms" : "0ms" }}
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-primary/30 to-jolananas-pink-medium/30 blur-2xl transition-transform group-hover:scale-150" />
            <div className="relative text-primary">
              <span className="inline-block rounded-full bg-primary/20 px-3 py-1 text-xs font-semibold">
                Nouveau
              </span>
              <h3 className="mt-3 text-xl font-bold">
                Collection Printemps
              </h3>
              <p className="mt-2 text-sm">
                Découvrez nos dernières créations artisanales
              </p>
            </div>
          </Link>
          {/* Carte 2 - Offre Spéciale */}
          <Link
            href="/promo"
            className={cn(
              "group relative overflow-hidden rounded-2xl bg-gradient-to-br from-jolananas-white-soft to-jolananas-peach-bright/20 p-6 transition-all duration-100",
              isOpen
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0 md:translate-y-0 md:opacity-100",
            )}
            style={{ transitionDelay: isOpen ? "250ms" : "0ms" }}
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-jolananas-peach-bright/30 to-orange-200/20 blur-2xl transition-transform group-hover:scale-150" />
            <div className="relative text-[#D44D5C]">
              <span className="inline-block rounded-full bg-jolananas-peach-bright/20 px-3 py-1 text-xs font-semibold">
                -20%
              </span>
              <h3 className="mt-3 text-xl font-bold">
                Offre Limitée
              </h3>
              <p className="mt-2 text-sm">
                Profitez de réductions exclusives
              </p>
            </div>
          </Link>
          {/* Carte 3 - Notre Histoire */}
          <Link
            href="/a-propos"
            className={cn(
              "group relative overflow-hidden rounded-2xl bg-gradient-to-br from-jolananas-white-soft to-jolananas-peach-light/20 p-6 transition-all duration-100",
              isOpen
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0 md:translate-y-0 md:opacity-100",
            )}
            style={{ transitionDelay: isOpen ? "300ms" : "0ms" }}
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-jolananas-peach-pink/30 to-jolananas-peach-light/20 blur-2xl transition-transform group-hover:scale-150" />
            <div className="relative text-[#8B4513]">
              <span className="inline-block rounded-full bg-secondary/20 px-3 py-1 text-xs font-semibold">
                À propos
              </span>
              <h3 className="mt-3 text-xl font-bold">
                Notre Savoir-Faire
              </h3>
              <p className="mt-2 text-sm">
                L'art de la création artisanale
              </p>
            </div>
          </Link>
          {/* Carte 4 - Contact */}
          <Link
            href="/contact"
            className={cn(
              "group relative overflow-hidden rounded-2xl bg-gradient-to-br from-jolananas-white-soft to-jolananas-gray-warm/20 p-6 transition-all duration-100",
              isOpen
                ? "translate-y-0 opacity-100"
                : "translate-y-4 opacity-0 md:translate-y-0 md:opacity-100",
            )}
            style={{ transitionDelay: isOpen ? "350ms" : "0ms" }}
          >
            <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br from-jolananas-gray-warm/30 to-purple-200/20 blur-2xl transition-transform group-hover:scale-150" />
            <div className="relative text-[#664E88]">
              <span className="inline-block rounded-full bg-jolananas-gray-warm/20 px-3 py-1 text-xs font-semibold">
                Support
              </span>
              <h3 className="mt-3 text-xl font-bold">
                Nous Contacter
              </h3>
              <p className="mt-2 text-sm">
                Une question ? Notre équipe vous répond
              </p>
            </div>
          </Link>
        </div>
      </div>
    </header>
  );
}
