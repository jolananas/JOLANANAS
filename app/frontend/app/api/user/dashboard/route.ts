/**
 * 🍍 JOLANANAS - API Dashboard Utilisateur
 * =========================================
 * Endpoint pour récupérer les statistiques et données du dashboard utilisateur
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/src/lib/auth';
import { getCustomerFromToken, getCustomerAddresses, getCustomerOrders } from '@/app/src/lib/shopify/customer-accounts';
import { getShopifyAdminClient } from '@/app/src/lib/ShopifyAdminClient';
import { db } from '@/app/src/lib/db';

export const runtime = 'nodejs';

/**
 * GET /api/user/dashboard
 * Récupère toutes les statistiques du dashboard utilisateur
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.shopifyCustomerId || !session?.user?.shopifyAccessToken) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const shopifyCustomerId = session.user.shopifyCustomerId;
    const shopifyAccessToken = session.user.shopifyAccessToken;

    // Récupérer toutes les données en parallèle pour optimiser les performances
    const [
      customerResult,
      addressesResult,
      ordersResult,
      activeCart,
      recentActivity,
    ] = await Promise.all([
      // Informations client depuis Shopify
      getCustomerFromToken(shopifyAccessToken),

      // Adresses depuis Shopify
      getCustomerAddresses(shopifyCustomerId),

      // Commandes depuis Shopify
      getCustomerOrders(shopifyCustomerId),

      // Panier actif (local, lié à shopifyCustomerId une fois le schéma migré)
      db.cart.findFirst({
        where: {
          // Note: Utiliser shopifyCustomerId une fois le schéma migré
          // Pour l'instant, on ne peut pas récupérer le panier
          status: 'ACTIVE',
        },
        include: {
          items: true,
        },
        orderBy: {
          updatedAt: 'desc',
        },
      }).catch(() => null), // Ignorer l'erreur si le schéma n'est pas encore migré

      // Activité récente (optionnel - depuis DB locale si UserPreferences/ActivityLog existe)
      db.activityLog.findMany({
        where: {
          // Note: Utiliser shopifyCustomerId une fois le schéma migré
          createdAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 10,
      }).catch(() => []), // Retourner tableau vide si ActivityLog n'existe plus

    ]);

    // Vérifier les erreurs
    if (customerResult.errors.length > 0 || !customerResult.customer) {
      return NextResponse.json(
        { 
          success: false, 
          error: customerResult.errors[0]?.message || 'Erreur lors de la récupération des données' 
        },
        { status: 500 }
      );
    }

    const customer = customerResult.customer;
    const addresses = addressesResult.addresses;
    const orders = ordersResult.orders || [];

    // Calculer les statistiques
    const totalOrders = orders.length;
    const totalSpent = orders.reduce((sum: number, order: any) => sum + (order.total || 0), 0);
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    const cartItemsCount = activeCart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;
    const cartTotal = activeCart?.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0) || 0;

    // Statistiques par statut de commande
    const ordersByStatus = orders.reduce((acc: Record<string, number>, order: any) => {
      const status = order.status || 'PENDING';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Évolution des commandes sur les 6 derniers mois
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const ordersByMonth = orders
      .filter((order: any) => {
        const orderDate = new Date(order.createdAt);
        return orderDate >= sixMonthsAgo;
      })
      .reduce((acc: Record<string, { count: number; total: number }>, order: any) => {
        const orderDate = new Date(order.createdAt);
        const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
        if (!acc[monthKey]) {
          acc[monthKey] = { count: 0, total: 0 };
        }
        acc[monthKey].count += 1;
        acc[monthKey].total += order.total || 0;
        return acc;
      }, {});

    // Commandes récentes (5 dernières)
    const recentOrders = orders.slice(0, 5).map((order: any) => ({
      id: order.id,
      shopifyOrderId: order.shopifyOrderId,
      status: order.status,
      total: order.total || 0,
      currency: order.currency || 'EUR',
      createdAt: order.createdAt,
      itemsCount: order.items?.length || 0,
    }));

    // Produits les plus commandés
    const topProducts = orders
      .flatMap((order: any) => order.items || [])
      .reduce((acc: Record<string, any>, item: any) => {
        const key = item.productId;
        if (!acc[key]) {
          acc[key] = {
            productId: item.productId,
            title: item.title,
            quantity: 0,
            totalSpent: 0,
            imageUrl: item.imageUrl,
          };
        }
        acc[key].quantity += item.quantity || 0;
        acc[key].totalSpent += (item.price || 0) * (item.quantity || 0);
        return acc;
      }, {});

    const topProductsArray = Object.values(topProducts)
      .sort((a: any, b: any) => b.quantity - a.quantity)
      .slice(0, 5);

    return NextResponse.json({
      success: true,
      dashboard: {
        user: {
          id: customer.id,
          email: customer.email,
          name: customer.firstName && customer.lastName
            ? `${customer.firstName} ${customer.lastName}`
            : customer.firstName || customer.lastName || null,
          avatar: null, // Pas d'avatar dans Customer Account API par défaut
          emailVerified: customer.createdAt ? new Date(customer.createdAt) : null,
          memberSince: customer.createdAt || new Date().toISOString(),
        },
        stats: {
          totalOrders,
          totalSpent,
          averageOrderValue,
          cartItemsCount,
          cartTotal: Number(cartTotal),
          addressesCount: addresses.length,
          ordersByStatus,
        },
        charts: {
          ordersByMonth: Object.entries(ordersByMonth).map(([month, data]) => ({
            month,
            count: data.count,
            total: data.total,
          })),
        },
        recentOrders,
        topProducts: topProductsArray,
        recentActivity: (recentActivity || []).map((activity: any) => ({
          id: activity.id,
          action: activity.action,
          createdAt: activity.createdAt.toISOString(),
          metadata: activity.metadata ? JSON.parse(activity.metadata) : null,
        })),
        hasActiveCart: !!activeCart,
      },
    });

  } catch (error: unknown) {
    console.error('❌ Erreur récupération dashboard:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Une erreur est survenue lors de la récupération du dashboard',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Une erreur est survenue lors de la récupération du dashboard' 
      },
      { status: 500 }
    );
  }
}
