"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import { BannerProvider, useBanner } from "@/components/layout/BannerContext";
import dynamic from "next/dynamic";
import { InfoBanner } from "@/components/layout/InfoBanner";
import { Navigation } from "@/components/layout/Navigation";
import { Preloader } from "@/components/preloader/Preloader";
import { Toaster } from "@/components/ui/sonner";

const Footer = dynamic(() =>
  import("@/components/layout/Footer").then((mod) => mod.Footer),
);
import { cn } from "@/lib/utils/cn";

interface LayoutWrapperProps {
  children: React.ReactNode;
}

function LayoutContent({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const { isBannerVisible } = useBanner();

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Bandeau d'informations intelligent - Au-dessus de la navbar (ordre vertical) */}
      <Suspense fallback={null}>
        <InfoBanner />
      </Suspense>

      {/* Navigation Globale - Positionnée sous le bandeau (ordre vertical) */}
      <Suspense fallback={null}>
        <Navigation />
      </Suspense>

      {/* Contenu Pages - Padding-top ajusté selon la hauteur du bandeau + navbar */}
      {/* Bandeau si visible : h-9 (36px) sm:h-10 (40px) md:h-12 (48px) */}
      {/* Total si bandeau visible : 56+36=92px mobile, 64+40=104px tablet, 64+48=112px desktop */}
      <main
        className={cn(
          "flex-1 bg-transparent transition-[padding-top] duration-400 ease-smooth",
        )}
      >
        {children}
      </main>

      {/* Footer Global */}
      <Suspense fallback={null}>
        <Footer />
      </Suspense>

      {/* Toast Notifications */}
      <Toaster position="top-center" richColors />
    </div>
  );
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <BannerProvider>
      <Preloader />
      <LayoutContent>{children}</LayoutContent>
    </BannerProvider>
  );
}
