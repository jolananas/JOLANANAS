'use client'

import { useEffect, useRef, ReactNode } from 'react'
import { cn } from '@/app/src/lib/utils'

interface CardTransform {
  rotateX: number
  rotateY: number
  scale: number
}

interface Card3DProps {
  children: ReactNode
  className?: string
  intensity?: number
  scale?: number
  imageRef?: React.RefObject<HTMLImageElement>
  disabled?: boolean
}

export function Card3D({
  children,
  className,
  intensity = 0.035,
  scale = 1.025,
  imageRef,
  disabled = false,
}: Card3DProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const animationFrameRef = useRef<number | undefined>(undefined)
  const lastMousePosition = useRef({ x: 0, y: 0 })

  useEffect(() => {
    // Vérifier si l'utilisateur préfère les animations réduites
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    if (disabled || prefersReducedMotion) {
      return
    }

    const card = cardRef.current
    const image = imageRef?.current

    if (!card) return

    let rect: DOMRect
    let centerX: number
    let centerY: number

    const updateCardTransform = (mouseX: number, mouseY: number) => {
      if (!rect) {
        rect = card.getBoundingClientRect()
        centerX = rect.left + rect.width / 2
        centerY = rect.top + rect.height / 2
      }

      const relativeX = mouseX - centerX
      const relativeY = mouseY - centerY

      const cardTransform: CardTransform = {
        rotateX: -relativeY * intensity,
        rotateY: relativeX * intensity,
        scale: scale,
      }

      const imageTransform: CardTransform = {
        rotateX: -relativeY * (intensity * 0.7),
        rotateY: relativeX * (intensity * 0.7),
        scale: scale * 1.02,
      }

      return { cardTransform, imageTransform }
    }

    const animate = () => {
      const { cardTransform, imageTransform } = updateCardTransform(
        lastMousePosition.current.x,
        lastMousePosition.current.y,
      )

      card.style.transform = `perspective(1000px) rotateX(${cardTransform.rotateX}deg) rotateY(${cardTransform.rotateY}deg) scale3d(${cardTransform.scale}, ${cardTransform.scale}, ${cardTransform.scale})`
      
      // Appliquer box-shadow sur la Card interne pour respecter le border-radius
      const firstChild = card.firstElementChild as HTMLElement | null
      if (firstChild) {
        firstChild.style.boxShadow = '0 10px 35px rgba(0, 0, 0, 0.2)'
      } else {
        card.style.boxShadow = '0 10px 35px rgba(0, 0, 0, 0.2)'
      }

      if (image) {
        image.style.transform = `perspective(1000px) rotateX(${imageTransform.rotateX}deg) rotateY(${imageTransform.rotateY}deg) scale3d(${imageTransform.scale}, ${imageTransform.scale}, ${imageTransform.scale})`
      }

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    const handleMouseMove = (e: MouseEvent) => {
      lastMousePosition.current = { x: e.clientX, y: e.clientY }
    }

    const handleMouseEnter = () => {
      card.style.transition = 'transform 0.2s ease, box-shadow 0.2s ease'
      if (image) {
        image.style.transition = 'transform 0.2s ease'
      }
      animate()
    }

    const handleMouseLeave = () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)'
      card.style.boxShadow = 'none'
      card.style.transition = 'transform 0.5s ease, box-shadow 0.5s ease'
      
      // Réinitialiser aussi la box-shadow de la Card interne
      const firstChild = card.firstElementChild as HTMLElement | null
      if (firstChild) {
        firstChild.style.boxShadow = ''
        firstChild.style.transition = 'box-shadow 0.5s ease'
      }

      if (image) {
        image.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)'
        image.style.transition = 'transform 0.5s ease'
      }
    }

    card.addEventListener('mouseenter', handleMouseEnter)
    card.addEventListener('mousemove', handleMouseMove)
    card.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }

      card.removeEventListener('mouseenter', handleMouseEnter)
      card.removeEventListener('mousemove', handleMouseMove)
      card.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [intensity, scale, imageRef, disabled])

  return (
    <div ref={cardRef} className={cn('will-change-transform rounded-xl overflow-hidden', className)}>
      {children}
    </div>
  )
}

