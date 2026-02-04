/**
 * 🍍 JOLANANAS - Widgets de Statistiques Dashboard
 * ================================================
 * Composants de statistiques pour le dashboard utilisateur
 */

'use client';

import React from 'react';
import { EnhancedCard } from '@/components/ui/card/EnhancedCard';
import { Package, ShoppingCart, Euro, TrendingUp, MapPin, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { useCurrency } from '@/hooks/useCurrency';

interface DashboardStatsProps {
  stats: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    cartItemsCount: number;
    cartTotal: number;
    addressesCount: number;
    ordersByStatus: Record<string, number>;
  };
  memberSince: string;
}

export function DashboardStats({ stats, memberSince }: DashboardStatsProps) {
  const { formatPrice } = useCurrency();
  
  const formatCurrency = (amount: number) => {
    return formatPrice(amount);
  };

  const memberSinceDate = new Date(memberSince);
  const memberSinceFormatted = format(memberSinceDate, 'd MMMM yyyy', { locale: fr });

  const statCards = [
    {
      title: 'Commandes totales',
      value: stats.totalOrders,
      icon: Package,
      description: 'Toutes vos commandes',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900',
    },
    {
      title: 'Total dépensé',
      value: formatCurrency(stats.totalSpent),
      icon: Euro,
      description: 'Depuis votre inscription',
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900',
    },
    {
      title: 'Panier actuel',
      value: stats.cartItemsCount,
      icon: ShoppingCart,
      description: stats.cartItemsCount > 0 
        ? `${formatCurrency(stats.cartTotal)} dans votre panier`
        : 'Votre panier est vide',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
    },
    {
      title: 'Panier moyen',
      value: formatCurrency(stats.averageOrderValue),
      icon: TrendingUp,
      description: 'Valeur moyenne par commande',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <EnhancedCard
              key={index}
              hoverEffect="spotlight"
              blobColor={`${stat.color.replace('text-', 'bg-')}/20 dark:${stat.color.replace('text-', 'bg-')}/30`}
              className="hover:shadow-lg transition-shadow"
            >
              <EnhancedCard.Header className="flex flex-row items-center justify-between space-y-0 pb-2">
                <EnhancedCard.Title className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </EnhancedCard.Title>
                <div className={`${stat.bgColor} ${stat.color} p-2 rounded-lg`}>
                  <Icon className="h-4 w-4" />
                </div>
              </EnhancedCard.Header>
              <EnhancedCard.Content>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </EnhancedCard.Content>
            </EnhancedCard>
          );
        })}
      </div>

      {/* Informations supplémentaires */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <EnhancedCard hoverEffect="spotlight" blobColor="bg-blue-600/20 dark:bg-blue-400/30">
          <EnhancedCard.Header>
            <EnhancedCard.Title className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Adresses enregistrées
            </EnhancedCard.Title>
          </EnhancedCard.Header>
          <EnhancedCard.Content>
            <div className="text-3xl font-bold">{stats.addressesCount}</div>
            <p className="text-sm text-muted-foreground mt-1">
              {stats.addressesCount === 0 
                ? 'Aucune adresse enregistrée'
                : stats.addressesCount === 1
                ? 'Adresse enregistrée'
                : 'Adresses enregistrées'}
            </p>
          </EnhancedCard.Content>
        </EnhancedCard>

        <EnhancedCard hoverEffect="spotlight" blobColor="bg-green-600/20 dark:bg-green-400/30">
          <EnhancedCard.Header>
            <EnhancedCard.Title className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Membre depuis
            </EnhancedCard.Title>
          </EnhancedCard.Header>
          <EnhancedCard.Content>
            <div className="text-2xl font-bold">{memberSinceFormatted}</div>
            <p className="text-sm text-muted-foreground mt-1">
              Merci de votre fidélité !
            </p>
          </EnhancedCard.Content>
        </EnhancedCard>
      </div>
    </div>
  );
}

