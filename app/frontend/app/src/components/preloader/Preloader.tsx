/**
 * 🍍 JOLANANAS - Preloader Intelligent
 * ===================================
 * Preloader qui vérifie le chargement de toutes les ressources critiques
 * avant de disparaître avec une animation de séparation en deux panneaux
 */

'use client'

import { useLayoutEffect, useRef, useState, useEffect } from 'react'
import { gsap } from 'gsap'
import { usePreloaderCheck } from '@/hooks/usePreloaderCheck'

export function Preloader() {
  const containerRef = useRef<HTMLDivElement>(null)
  const leftPanelRef = useRef<HTMLDivElement>(null)
  const rightPanelRef = useRef<HTMLDivElement>(null)
  const logoRef = useRef<HTMLDivElement>(null)
  const [isAnimating, setIsAnimating] = useState(false)
  const [shouldRender, setShouldRender] = useState(true)

  const status = usePreloaderCheck()

  // Vérifier si on doit démarrer l'animation de disparition
  useEffect(() => {
    if (status.isComplete && !isAnimating && shouldRender) {
      setIsAnimating(true)
    }
  }, [status.isComplete, isAnimating, shouldRender])

  // Animation GSAP de disparition
  useLayoutEffect(() => {
    if (!containerRef.current || !leftPanelRef.current || !rightPanelRef.current || !logoRef.current) {
      return
    }

    // Vérifier les préférences de mouvement réduit
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (!isAnimating) {
      return
    }

    const ctx = gsap.context(() => {
      // Animation de séparation des deux panneaux
      const timeline = gsap.timeline({
        onComplete: () => {
          // Masquer complètement le preloader après l'animation
          setShouldRender(false)
        },
      })

      if (prefersReducedMotion) {
        // Animation réduite : simple fade out
        timeline.to(containerRef.current, {
          opacity: 0,
          duration: 0.3,
          ease: 'power2.in',
        })
      } else {
        // Animation complète : séparation en deux panneaux
        // 1. Fade out du logo et de la séparation en premier (0-0.3s)
        timeline
          .to(logoRef.current, {
            opacity: 0,
            scale: 0.85,
            duration: 0.3,
            ease: 'power2.in',
          }, 0)
        
        // 2. Séparation des panneaux (démarre à 0.2s pour chevaucher légèrement)
        timeline
          .to(
            leftPanelRef.current,
            {
              x: '-100%',
              duration: 0.8,
              ease: 'power3.out',
            },
            0.2
          )
          .to(
            rightPanelRef.current,
            {
              x: '100%',
              duration: 0.8,
              ease: 'power3.out',
            },
            0.2
          )
      }
    }, containerRef)

    return () => ctx.revert()
  }, [isAnimating])

  // Ne pas rendre si l'animation est terminée
  if (!shouldRender) {
    return null
  }

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-transparent overflow-hidden"
      aria-label="Chargement en cours"
      role="status"
    >
      {/* Panneau gauche - couvre la moitié gauche de l'écran */}
      <div
        ref={leftPanelRef}
        className="absolute inset-y-0 left-0 w-1/2 bg-white"
        aria-hidden="true"
      />

      {/* Panneau droit - couvre la moitié droite de l'écran */}
      <div
        ref={rightPanelRef}
        className="absolute inset-y-0 right-0 w-1/2 bg-white"
        aria-hidden="true"
      />

      {/* Logo centré au-dessus des deux panneaux */}
      <div
        ref={logoRef}
        className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
      >
        <img
          src="/assets/images/logo/logo-jolananas-gradient.png"
          alt="JOLANANAS - Chargement"
          width={75}
          height="auto"
          className="object-contain"
          style={{ width: '75px', height: 'auto' }}
          loading="eager"
        />
      </div>
    </div>
  )
}

