/**
 * 🍍 JOLANANAS - Graphiques Dashboard
 * ====================================
 * Graphiques pour visualiser l'activité utilisateur avec Recharts
 */

'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { TrendingUp, ShoppingBag } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale/fr';
import { useCurrency } from '@/hooks/useCurrency';

interface DashboardChartsProps {
  ordersByMonth: Array<{
    month: string;
    count: number;
    total: number;
  }>;
}

export function DashboardCharts({ ordersByMonth }: DashboardChartsProps) {
  const { formatPrice, currency } = useCurrency();
  
  // Formater les données pour les graphiques
  const chartData = ordersByMonth
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((item) => {
      const date = parseISO(`${item.month}-01`);
      return {
        month: format(date, 'MMM yyyy', { locale: fr }),
        monthKey: item.month,
        commandes: item.count,
        total: Number(item.total.toFixed(2)),
      };
    });

  const formatCurrency = (value: number) => {
    return formatPrice(value, currency);
  };

  // Si pas de données, afficher un message
  if (chartData.length === 0) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Évolution des commandes
            </CardTitle>
            <CardDescription>
              Vos commandes sur les 6 derniers mois
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-sm">Aucune donnée disponible</p>
              <p className="text-xs mt-1">Passez votre première commande pour voir vos statistiques</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Graphique en ligne - Nombre de commandes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Évolution des commandes
          </CardTitle>
          <CardDescription>
            Nombre de commandes par mois
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="commandes" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                name="Commandes"
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Graphique en barres - Montant total */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Montant total par mois
          </CardTitle>
          <CardDescription>
            Dépenses totales par mois
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="month" 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
              />
              <YAxis 
                className="text-xs"
                tick={{ fill: 'currentColor' }}
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Bar 
                dataKey="total" 
                fill="hsl(var(--primary))"
                name="Montant (€)"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}

