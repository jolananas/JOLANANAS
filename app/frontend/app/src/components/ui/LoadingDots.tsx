'use client';

import React, { useEffect, useState } from 'react';
import { cn } from '@/app/src/lib/utils';

interface LoadingDotsProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * Composant LoadingDots - Animation de 3 points "..." pour les états de chargement
 * 
 * Anime les trois points du texte "..." avec une animation fluide et professionnelle.
 * Respecte prefers-reduced-motion pour l'accessibilité.
 */
export function LoadingDots({ 
  size = 'md',
  className
}: LoadingDotsProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Vérifier la préférence de l'utilisateur pour les animations réduites
    if (typeof window !== 'undefined') {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);

      const handleChange = (e: MediaQueryListEvent) => {
        setPrefersReducedMotion(e.matches);
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, []);

  // Si l'utilisateur préfère les animations réduites, afficher des points statiques
  if (prefersReducedMotion || !mounted) {
    return (
      <span className={cn('inline', className)} aria-label="Chargement en cours">
        ...
      </span>
    );
  }

  return (
    <>
      <span 
        className={cn('inline loading-dots-animated', className)} 
        aria-label="Chargement en cours"
      >
        <span className="loading-dot">.</span>
        <span className="loading-dot">.</span>
        <span className="loading-dot">.</span>
      </span>
      <style dangerouslySetInnerHTML={{
        __html: `
          .loading-dots-animated {
            display: inline-flex;
            align-items: baseline;
            gap: 0.05em;
          }
          .loading-dot {
            animation: loading-dot-pulse 1.4s infinite ease-in-out;
            animation-fill-mode: both;
          }
          .loading-dot:nth-child(1) {
            animation-delay: -0.32s;
          }
          .loading-dot:nth-child(2) {
            animation-delay: -0.16s;
          }
          .loading-dot:nth-child(3) {
            animation-delay: 0s;
          }
          @keyframes loading-dot-pulse {
            0%, 80%, 100% {
              opacity: 0.3;
              transform: scale(0.8);
            }
            40% {
              opacity: 1;
              transform: scale(1);
            }
          }
          @media (prefers-reduced-motion: reduce) {
            .loading-dot {
              animation: none !important;
              opacity: 1 !important;
            }
          }
        `
      }} />
    </>
  );
}
