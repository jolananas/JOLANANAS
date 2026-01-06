'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { BannerProvider, useBanner } from '@/app/src/components/layout/BannerContext';
import { InfoBanner } from '@/app/src/components/layout/InfoBanner';
import { Navigation } from '@/app/src/components/layout/Navigation';
import { Footer } from '@/app/src/components/layout/Footer';
import { ScrollToTop } from '@/app/src/components/layout/ScrollToTop';
import { cn } from '@/app/src/lib/utils/cn';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

function LayoutContent({ children }: LayoutWrapperProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const { isBannerVisible } = useBanner();
  
  return (
    <div className="relative flex min-h-screen flex-col">
      {/* Bandeau d'informations intelligent - Au-dessus de la navbar (ordre vertical) */}
      <InfoBanner />
      
      {/* Navigation Globale - Positionnée sous le bandeau (ordre vertical) */}
      <Navigation />
      
      {/* Contenu Pages - Padding-top ajusté selon la hauteur du bandeau + navbar */}
      {/* Navbar : h-14 (56px) sm:h-16 (64px) */}
      {/* Bandeau si visible : h-9 (36px) sm:h-10 (40px) md:h-12 (48px) */}
      {/* Total si bandeau visible : 56+36=92px mobile, 64+40=104px tablet, 64+48=112px desktop */}
      <main 
        className={cn(
          "flex-1 bg-transparent transition-[padding-top] duration-400 ease-[cubic-bezier(0.4,0,0.2,1)]",
          !isHomePage && !isBannerVisible && "pt-14 sm:pt-16",
          !isHomePage && isBannerVisible && "pt-[92px] sm:pt-[104px] md:pt-[112px]"
        )}
      >
        {children}
      </main>
      
      {/* Footer Global */}
      <Footer />
      
      {/* Bouton Scroll to Top - Tout en bas */}
      <ScrollToTop />
    </div>
  );
}

export function LayoutWrapper({ children }: LayoutWrapperProps) {
  return (
    <BannerProvider>
      <LayoutContent>{children}</LayoutContent>
    </BannerProvider>
  );
}
