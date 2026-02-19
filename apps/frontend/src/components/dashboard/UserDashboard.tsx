"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { DashboardStats } from "./DashboardStats";
import { DashboardCharts } from "./DashboardCharts";
import { DashboardActivity } from "./DashboardActivity";
import { DashboardTopProducts } from "./DashboardTopProducts";
import { Loader2 } from "lucide-react";
import { apiGet } from "@/lib/api-client";

interface DashboardData {
  user: {
    id: string;
    email: string;
    name: string | null;
    avatar: string | null;
    emailVerified: Date | null;
    memberSince: string;
    tags?: string[];
  };
  stats: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    cartItemsCount: number;
    cartTotal: number;
    addressesCount: number;
    ordersByStatus: Record<string, number>;
  };
  charts: {
    ordersByMonth: Array<{
      month: string;
      count: number;
      total: number;
    }>;
  };
  recentOrders: Array<{
    id: string;
    shopifyOrderId: string | null;
    status: string;
    total: number;
    currency: string;
    createdAt: string;
    itemsCount: number;
  }>;
  topProducts: Array<{
    productId: string;
    title: string;
    quantity: number;
    totalSpent: number;
    imageUrl: string | null;
  }>;
  recentActivity: Array<{
    id: string;
    action: string;
    createdAt: string;
    metadata: any;
  }>;
  hasActiveCart: boolean;
}

export function UserDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await apiGet<{
          success: boolean;
          dashboard: DashboardData;
        }>("/api/user/dashboard");

        if (response.success && response.dashboard) {
          setDashboardData(response.dashboard);
        } else {
          setError("Impossible de charger les données du dashboard");
        }
      } catch (err) {
        console.error("Erreur chargement dashboard:", err);
        setError(
          err instanceof Error ? err.message : "Une erreur est survenue",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-60">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Chargement du dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-destructive mb-2">Erreur</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dashboardData) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center text-center">
            <p className="text-muted-foreground">Aucune donnée disponible</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const isVIP = dashboardData.user.tags?.includes("VIP") || dashboardData.user.tags?.includes("vip");

  return (
    <div className="space-y-8">
      {/* Badge VIP si applicable */}
      {isVIP && (
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-full">
            <span className="text-xl">🌟</span>
          </div>
          <div>
            <h3 className="font-serif font-bold text-primary">Membre de l'Atelier Privé</h3>
            <p className="text-sm text-muted-foreground">Vous avez accès à nos ventes privées et offres exclusives.</p>
          </div>
        </div>
      )}

      {/* Statistiques principales */}
      <DashboardStats
        stats={dashboardData.stats}
        memberSince={dashboardData.user.memberSince}
      />

      {/* Graphiques */}
      <DashboardCharts ordersByMonth={dashboardData.charts.ordersByMonth} />

      {/* Activité et commandes récentes */}
      <DashboardActivity
        recentOrders={dashboardData.recentOrders}
        recentActivity={dashboardData.recentActivity}
      />

      {/* Produits favoris */}
      <DashboardTopProducts topProducts={dashboardData.topProducts} />
    </div>
  );
}
