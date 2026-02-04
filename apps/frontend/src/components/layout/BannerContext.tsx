"use client";
import React, { createContext, useContext, useState } from "react";

const BannerContext = createContext({
  isBannerVisible: true,
  setIsBannerVisible: (visible: boolean) => {},
});

export const BannerProvider = ({ children }: { children: React.ReactNode }) => {
  const [isBannerVisible, setIsBannerVisible] = useState(true);
  return (
    <BannerContext.Provider value={{ isBannerVisible, setIsBannerVisible }}>
      {children}
    </BannerContext.Provider>
  );
};

export const useBanner = () => useContext(BannerContext);
