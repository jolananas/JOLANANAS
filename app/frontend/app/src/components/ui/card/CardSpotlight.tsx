'use client'

import { useEffect, useRef, ReactNode } from 'react'
import { cn } from '@/app/src/lib/utils'

interface CardSpotlightProps {
  children: ReactNode
  className?: string
  blobColor?: string
  blurIntensity?: string
  disabled?: boolean
}

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

export function CardSpotlight({
  children,
  className,
  blobColor = 'bg-sky-600/60 dark:bg-sky-400/60',
  blurIntensity = 'blur-2xl',
  disabled = false,
}: CardSpotlightProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const blobRef = useRef<HTMLDivElement>(null)
  const fakeBlobRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Vérifier si l'utilisateur préfère les animations réduites
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (disabled || prefersReducedMotion) {
      return
    }

    const container = containerRef.current
    const blob = blobRef.current
    const fakeBlob = fakeBlobRef.current

    if (!container || !blob || !fakeBlob) return

    // Ajouter la classe spotlight-card pour la détection globale
    container.classList.add('spotlight-card')

    const handleMouseMove = (ev: MouseEvent) => {
      const rec = fakeBlob.getBoundingClientRect()

      blob.style.opacity = '1'

      // Utiliser requestAnimationFrame pour optimiser les animations
      requestAnimationFrame(() => {
        blob.animate(
          [
            {
              transform: `translate(${ev.clientX - rec.left - rec.width / 2}px, ${
                ev.clientY - rec.top - rec.height / 2
              }px)`,
            },
          ],
          {
            duration: 300,
            fill: 'forwards',
          },
        )
      })
    }

    // Throttle le handler à 16ms (60fps) pour éviter les violations de performance
    const throttledHandleMouseMove = throttle(handleMouseMove, 16)

    const handleMouseLeave = () => {
      if (blob) {
        blob.style.opacity = '0'
      }
    }

    window.addEventListener('mousemove', throttledHandleMouseMove, { passive: true })
    container.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      container.classList.remove('spotlight-card')
      window.removeEventListener('mousemove', throttledHandleMouseMove)
      container.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [disabled])

  return (
    <div
      ref={containerRef}
      className={cn(
        'spotlight-card group bg-border relative overflow-hidden rounded-xl p-px transition-all duration-300 ease-in-out',
        className,
      )}
    >
      {children}
      <div
        ref={blobRef}
        className={cn(
          'blob absolute top-0 left-0 size-20 rounded-full opacity-0 transition-all duration-300 ease-in-out',
          blobColor,
          blurIntensity,
        )}
      />
      <div ref={fakeBlobRef} className="fake-blob absolute top-0 left-0 size-20 rounded-full" />
    </div>
  )
}

