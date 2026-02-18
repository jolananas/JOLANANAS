"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import { BannerProvider, useBanner } from "@/components/layout/BannerContext";
import { NavbarProvider } from "./NavbarContext";
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
    <div 
      className="relative flex min-h-screen flex-col"
      style={{
        "--header-offset": isBannerVisible ? "var(--banner-height, 48px) + var(--navbar-height, 68px)" : "var(--navbar-height, 68px)"
      } as React.CSSProperties}
    >
      {/* Bandeau d'informations intelligent */}
      <Suspense fallback={null}>
        <InfoBanner />
      </Suspense>

      {/* Navigation Globale */}
      <Suspense fallback={null}>
        <Navigation />
      </Suspense>

      <main
        className={cn(
          "flex-1 bg-transparent transition-[padding-top] duration-500 ease-smooth",
          isBannerVisible ? "pt-[112px] md:pt-[116px]" : "pt-[84px] md:pt-[92px]"
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
    <NavbarProvider>
      <BannerProvider>
        <Preloader />
        <LayoutContent>{children}</LayoutContent>
      </BannerProvider>
    </NavbarProvider>
  );
}
