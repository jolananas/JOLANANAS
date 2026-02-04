/**
 * 🍍 JOLANANAS - SWR Provider
 * ============================
 * Provider SWR pour configuration globale du cache
 */

'use client';

import { SWRConfig } from 'swr';
import { swrConfig } from '../cache/swr';

interface SWRProviderProps {
  children: React.ReactNode;
}

export function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig value={swrConfig}>
      {children}
    </SWRConfig>
  );
}




