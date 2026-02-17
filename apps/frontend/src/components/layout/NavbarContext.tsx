"use client";
import React, { createContext, useContext, useState } from "react";

const NavbarContext = createContext({
  isNavbarVisible: true,
  setIsNavbarVisible: (visible: boolean) => {},
});

export const NavbarProvider = ({ children }: { children: React.ReactNode }) => {
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  return (
    <NavbarContext.Provider value={{ isNavbarVisible, setIsNavbarVisible }}>
      {children}
    </NavbarContext.Provider>
  );
};

export const useNavbar = () => useContext(NavbarContext);
