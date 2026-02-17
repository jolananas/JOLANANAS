"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useBanner } from "@/components/layout/BannerContext";
import { useNavbar } from "./NavbarContext";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Standard container for pages to handle banner and navbar offsets.
 * Includes mt-24 and dynamic translation based on info banner visibility.
 */
export function PageContainer({ children, className }: PageContainerProps) {
  const { isBannerVisible } = useBanner();
  const { isNavbarVisible } = useNavbar();


  return (
    <div
      className={cn(
        "transition-transform duration-500 ease-swiss",
        isNavbarVisible ? "translate-y-24" : "translate-y-0", // Standard gap for navbar
        isBannerVisible ? "translate-y-12" : "translate-y-0",
        className
      )}
    >
      {children}
    </div>
  );
}