/**
 * 🍍 JOLANANAS - Product Thumbnail Card Component
 * ===============================================
 * Composant de miniature premium avec style Card inspiré de shadcnstudio.com
 * Effets hover sophistiqués, ombres et indicateurs visuels pour l'image active
 */

'use client';

import React from 'react';
import Image from 'next/image';
import { cn } from '@/app/src/lib/utils';

interface ProductThumbnailCardProps {
  image: string;
  alt: string;
  isActive: boolean;
  onClick: () => void;
  index: number;
}

export function ProductThumbnailCard({
  image,
  alt,
  isActive,
  onClick,
  index,
}: ProductThumbnailCardProps) {
  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label={`Voir l'image ${index + 1}`}
      tabIndex={0}
      role="button"
      className={cn(
        // Base Card styles
        'group relative aspect-square overflow-hidden rounded-xl border-2 bg-card shadow-sm',
        'transition-all duration-300 ease-in-out',
        'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-jolananas-pink-medium focus-visible:ring-offset-2',
        // Hover effects
        'hover:scale-105 hover:shadow-lg hover:border-jolananas-pink-medium/50',
        // Active state
        isActive
          ? 'border-jolananas-pink-medium ring-2 ring-jolananas-pink-medium ring-offset-2 shadow-md'
          : 'border-border hover:border-jolananas-pink-medium/50',
      )}
    >
      {/* Image container */}
      <div className="relative h-full w-full">
        <Image
          src={image}
          alt={alt}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
          sizes="(max-width: 768px) 25vw, 12.5vw"
          priority={index < 4}
        />
        
        {/* Overlay hover effect */}
        <div
          className={cn(
            'absolute inset-0 bg-black/5 opacity-0 transition-opacity duration-300',
            'group-hover:opacity-100',
            isActive && 'opacity-0',
          )}
          aria-hidden="true"
        />
        
        {/* Active indicator overlay */}
        {isActive && (
          <div
            className="absolute inset-0 border-2 border-jolananas-pink-medium rounded-xl"
            aria-hidden="true"
          />
        )}
      </div>
    </button>
  );
}

