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
        "w-full",
        className,
        isBannerVisible ? "mt-24" : "mt-16",
        isNavbarVisible ? "mt-24" : "mt-16"
      )}
    >
      {children}
    </div>
  );
}