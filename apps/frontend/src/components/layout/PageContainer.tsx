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
        "w-full container mx-auto px-6 md:px-12 max-w-6xl transition-all duration-500 ease-in-out",
        isBannerVisible ? "pt-[180px] md:pt-[200px]" : "pt-[100px] md:pt-[120px]",
        "pb-24", // Default bottom padding for mobile sticky bar
        className
      )}
    >
      {children}
    </div>
  );
}