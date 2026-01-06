/**
 * 🍍 JOLANANAS - Activité Récente Dashboard
 * =========================================
 * Affichage de l'activité récente et des commandes récentes
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Package, Clock, Activity } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { useCurrency } from '@/hooks/useCurrency';
import { getOrderStatusColor, getOrderStatusLabel } from '@/lib/order-status';

interface RecentOrder {
  id: string;
  shopifyOrderId: string | null;
  status: string;
  total: number;
  currency: string;
  createdAt: string;
  itemsCount: number;
}

interface RecentActivity {
  id: string;
  action: string;
  createdAt: string;
  metadata: any;
}

interface DashboardActivityProps {
  recentOrders: RecentOrder[];
  recentActivity: RecentActivity[];
}


const getActivityLabel = (action: string) => {
  const labels: Record<string, string> = {
    LOGIN: 'Connexion',
    LOGOUT: 'Déconnexion',
    PROFILE_UPDATE: 'Mise à jour du profil',
    PASSWORD_CHANGE: 'Changement de mot de passe',
    ORDER_CREATED: 'Nouvelle commande',
    ADDRESS_ADDED: 'Adresse ajoutée',
    ADDRESS_UPDATED: 'Adresse modifiée',
    CART_UPDATED: 'Panier mis à jour',
  };
  return labels[action] || action;
};

export function DashboardActivity({ recentOrders, recentActivity }: DashboardActivityProps) {
  const { formatPrice } = useCurrency();
  
  const formatCurrency = (amount: number, currency?: string) => {
    return formatPrice(amount, currency);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Commandes récentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Commandes récentes
          </CardTitle>
          <CardDescription>
            Vos 5 dernières commandes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Package className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm">Aucune commande</p>
              <p className="text-xs mt-1">Vos commandes apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentOrders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium">
                        {order.shopifyOrderId 
                          ? `Commande #${order.shopifyOrderId.slice(-8)}`
                          : `Commande #${order.id.slice(-8)}`}
                      </p>
                      <Badge className={getOrderStatusColor(order.status)}>
                        {getOrderStatusLabel(order.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(order.createdAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                      <span>{order.itemsCount} article{order.itemsCount > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{formatCurrency(order.total, order.currency)}</p>
                    <Link href={`/account?tab=orders`}>
                      <Button variant="ghost" size="sm" className="mt-1">
                        Voir
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activité récente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activité récente
          </CardTitle>
          <CardDescription>
            Vos dernières actions sur votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentActivity.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm">Aucune activité</p>
              <p className="text-xs mt-1">Votre activité apparaîtra ici</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 p-3 border rounded-lg"
                >
                  <div className="mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      {getActivityLabel(activity.action)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.createdAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

