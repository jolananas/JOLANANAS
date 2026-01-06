/**
 * 🍍 JOLANANAS - Contexte pour la visibilité du bandeau
 * ======================================================
 * Permet de partager l'état de visibilité du bandeau entre InfoBanner et Navigation
 */

'use client';

import React, { createContext, useContext, useState, type ReactNode } from 'react';

interface BannerContextType {
  isBannerVisible: boolean;
  bannerHeight: number; // Hauteur en pixels
  setBannerVisible: (visible: boolean, height?: number) => void;
}

const BannerContext = createContext<BannerContextType | undefined>(undefined);

export function BannerProvider({ children }: { children: ReactNode }) {
  const [isBannerVisible, setIsBannerVisible] = useState(false);
  const [bannerHeight, setBannerHeight] = useState(0);

  const setBannerVisible = (visible: boolean, height: number = 0) => {
    setIsBannerVisible(visible);
    setBannerHeight(height);
  };

  return (
    <BannerContext.Provider value={{ isBannerVisible, bannerHeight, setBannerVisible }}>
      {children}
    </BannerContext.Provider>
  );
}

export function useBanner() {
  const context = useContext(BannerContext);
  if (context === undefined) {
    throw new Error('useBanner must be used within a BannerProvider');
  }
  return context;
}







