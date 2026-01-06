'use client';

import { useLayoutEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ChevronUp } from 'lucide-react';

/**
 * 🚀 ScrollToTop — Bouton de retour en haut de page
 * 
 * Affiche un bouton flottant en bas de page qui permet de remonter
 * progressivement en haut avec une animation fluide style Apple.
 * 
 * Le bouton s'affiche uniquement lorsque l'utilisateur a scrollé
 * vers le bas (au-delà de 300px).
 */

// Fonction throttle pour limiter la fréquence des événements
function throttle<T extends (...args: any[]) => void>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return function (this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
export function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Détection du scroll pour afficher/masquer le bouton
  useLayoutEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      // Afficher le bouton après 300px de scroll
      setIsVisible(scrollY > 300);
    };

    // Throttle le handler à 100ms pour éviter les violations de performance
    const throttledHandleScroll = throttle(handleScroll, 100);

    // Écouter le scroll avec throttle
    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    
    // Vérifier l'état initial
    handleScroll();

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, []);

  // Animation d'apparition/disparition du bouton
  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      if (isVisible) {
        // Animation d'apparition fluide
        gsap.fromTo(
          containerRef.current,
          {
            opacity: 0,
            y: 20,
            scale: 0.8,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.4,
            ease: 'power3.out',
          }
        );
      } else {
        // Animation de disparition fluide
        gsap.to(containerRef.current, {
          opacity: 0,
          y: 20,
          scale: 0.8,
          duration: 0.3,
          ease: 'power2.in',
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, [isVisible]);

  // Fonction de scroll vers le haut avec animation fluide
  const scrollToTop = () => {
    if (typeof window === 'undefined') return;

    // Vérifier si l'utilisateur préfère les animations réduites
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      // Scroll instantané si l'utilisateur préfère les animations réduites
      window.scrollTo({ top: 0, behavior: 'auto' });
      return;
    }

    // Animation fluide avec GSAP
    const startY = window.scrollY || document.documentElement.scrollTop;
    const scrollObj = { y: startY };
    
    gsap.to(scrollObj, {
      y: 0,
      duration: 1.2,
      ease: 'power3.inOut',
      onUpdate: () => {
        window.scrollTo(0, scrollObj.y);
      },
    });
  };

  // Ne pas afficher si le bouton n'est pas visible
  if (!isVisible) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className="fixed bottom-6 right-6 z-50 md:bottom-8 md:right-8"
      style={{ opacity: 0 }}
    >
      <button
        ref={buttonRef}
        onClick={scrollToTop}
        className="group flex h-12 w-12 items-center justify-center rounded-full bg-jolananas-pink-deep shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-jolananas-pink-deep focus:ring-offset-2 active:scale-95 md:h-14 md:w-14"
        aria-label="Remonter en haut de la page"
        title="Remonter en haut de la page"
      >
        <ChevronUp 
          className="h-5 w-5 text-white transition-transform duration-300 group-hover:-translate-y-1 md:h-6 md:w-6" 
          strokeWidth={2.5}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
