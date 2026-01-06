/**
 * 🍍 JOLANANAS - Shopify Context Provider
 * =======================================
 * Provider pour le contexte Shopify Storefront
 */

'use client';

import React, { createContext, useContext, ReactNode } from 'react';

interface ShopifyConfig {
  domain: string;
  storefrontToken: string;
  apiVersion: string;
}

interface ShopifyContextType {
  config: ShopifyConfig;
}

const ShopifyContext = createContext<ShopifyContextType | undefined>(undefined);

interface ShopifyProviderProps {
  children: ReactNode;
  config?: ShopifyConfig;
}

export function ShopifyProvider({ children, config }: ShopifyProviderProps) {
  const defaultConfig = {
    domain: process.env.SHOPIFY_STORE_DOMAIN ?? '',
    storefrontToken: process.env.SHOPIFY_STOREFRONT_TOKEN ?? '',
    apiVersion: process.env.SHOPIFY_API_VERSION ?? '2025-10',
  };
  
  const shopifyConfig = config || defaultConfig;

  return (
    <ShopifyContext.Provider value={{ config: shopifyConfig }}>
      {children}
    </ShopifyContext.Provider>
  );
}

export function useShopifyConfig() {
  const context = useContext(ShopifyContext);
  if (context === undefined) {
    throw new Error('useShopifyConfig must be used within a ShopifyProvider');
  }
  return context;
}
