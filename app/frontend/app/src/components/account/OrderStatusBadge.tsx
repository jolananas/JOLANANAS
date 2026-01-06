/**
 * 🍍 JOLANANAS - Badge de Statut de Commande
 * ===========================================
 * Composant réutilisable pour afficher les statuts de commande
 * avec icônes et animations alignés avec le thème JOLANANAS
 */

'use client';

import React from 'react';
import { Badge } from '@/components/ui/Badge';
import { 
  getOrderStatusColor, 
  getOrderStatusLabel, 
  getOrderStatusIcon 
} from '@/lib/order-status';
import { cn } from '@/app/src/lib/utils/cn';

interface OrderStatusBadgeProps {
  status: string;
  showIcon?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export function OrderStatusBadge({ 
  status, 
  showIcon = true, 
  className,
  size = 'md',
  animated = false
}: OrderStatusBadgeProps) {
  const Icon = getOrderStatusIcon(status);
  const colors = getOrderStatusColor(status);
  const label = getOrderStatusLabel(status);

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5 [&>svg]:h-3 [&>svg]:w-3',
    md: 'text-xs px-2 py-0.5 [&>svg]:h-3.5 [&>svg]:w-3.5',
    lg: 'text-sm px-2.5 py-1 [&>svg]:h-4 [&>svg]:w-4',
  };

  return (
    <Badge
      className={cn(
        colors,
        sizeClasses[size],
        animated && 'animate-status-pulse',
        'transition-all duration-200 hover:scale-105',
        className
      )}
    >
      {showIcon && Icon && (
        <Icon 
          className={cn(
            'mr-1.5',
            status === 'PROCESSING' && 'animate-spin'
          )} 
        />
      )}
      {label}
    </Badge>
  );
}


