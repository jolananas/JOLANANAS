"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { useBanner } from "@/components/layout/BannerContext";
import { useNavbar } from "./NavbarContext";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

/**
 * Standard container for pages to handle banner and navbar offsets.
 * Includes mt-24 and dynamic translation based on info banner visibility.
 */
export function PageContainer({ children, className, id }: PageContainerProps) {
  const { isBannerVisible } = useBanner();
  const { isNavbarVisible } = useNavbar();


  return (
    <div
      id={id}
      className={cn(
        "w-full container mx-auto px-4 max-w-4xl",
        className,
        isBannerVisible ? "mt-14 md:mt-14 pt-40 md:pt-20" : "mt-16",
        isNavbarVisible ? "mt-14 md:mt-14 pt-40 md:pt-20" : "mt-16"
      )}
    >
      {children}
    </div>
  );
}