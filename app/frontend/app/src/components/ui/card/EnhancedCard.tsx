'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from '@/components/ui/Card'
import { Card3D } from './Card3D'
import { CardSpotlight } from './CardSpotlight'
import { cn } from '@/app/src/lib/utils'

export type HoverEffect = '3d' | 'spotlight' | 'none'

interface EnhancedCardProps extends React.ComponentProps<typeof Card> {
  hoverEffect?: HoverEffect
  // Props pour Card3D
  intensity?: number
  scale?: number
  imageRef?: React.RefObject<HTMLImageElement>
  // Props pour CardSpotlight
  blobColor?: string
  blurIntensity?: string
  // Désactiver les effets (pour mobile ou accessibilité)
  disabled?: boolean
  // Utiliser Card ou wrapper personnalisé
  useCard?: boolean
}

function EnhancedCardComponent({
  hoverEffect = 'none',
  className,
  children,
  intensity,
  scale,
  imageRef,
  blobColor,
  blurIntensity,
  disabled = false,
  useCard = true,
  ...cardProps
}: EnhancedCardProps) {
  // Si aucun effet ou désactivé, retourner la carte standard ou le contenu
  if (hoverEffect === 'none' || disabled) {
    if (useCard) {
      return (
        <Card className={className} {...cardProps}>
          {children}
        </Card>
      )
    }
    return <div className={className}>{children}</div>
  }

  // Appliquer l'effet 3D
  if (hoverEffect === '3d') {
    const content = useCard ? (
      <Card className={cn('h-full', className)} {...cardProps}>
        {children}
      </Card>
    ) : (
      <div className={cn('h-full', className)}>{children}</div>
    )

    return (
      <Card3D
        className="h-full"
        intensity={intensity}
        scale={scale}
        imageRef={imageRef}
        disabled={disabled}
      >
        {content}
      </Card3D>
    )
  }

  // Appliquer l'effet Spotlight
  if (hoverEffect === 'spotlight') {
    const content = useCard ? (
      <Card className={cn('h-full border-none bg-transparent', className)} {...cardProps}>
        {children}
      </Card>
    ) : (
      <div className={cn('h-full', className)}>{children}</div>
    )

    return (
      <CardSpotlight
        className="h-full"
        blobColor={blobColor}
        blurIntensity={blurIntensity}
        disabled={disabled}
      >
        {content}
      </CardSpotlight>
    )
  }

  if (useCard) {
    return (
      <Card className={className} {...cardProps}>
        {children}
      </Card>
    )
  }

  return <div className={className}>{children}</div>
}

// Exporter EnhancedCard avec toutes les sous-composantes
export const EnhancedCard = Object.assign(EnhancedCardComponent, {
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Content: CardContent,
  Footer: CardFooter,
  Action: CardAction,
})

export type { EnhancedCardProps }

