/**
 * 🍍 JOLANANAS - API Dashboard Utilisateur
 * =========================================
 * Endpoint pour récupérer les statistiques et données du dashboard utilisateur
 * Utilise uniquement Shopify APIs - plus de base de données locale
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/src/lib/auth';
import { getCustomerFromToken, getCustomerAddresses, getCustomerOrders } from '@/app/src/lib/shopify/customer-accounts';
import { getCartIdFromRequest } from '@/app/src/lib/utils/cart-storage';
import { getCart as getShopifyCart } from '@/app/src/lib/shopify/index';

export const runtime = 'nodejs';

/**
 * GET /api/user/dashboard
 * Récupère toutes les statistiques du dashboard utilisateur depuis Shopify
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
      cartId,
    ] = await Promise.all([
      // Informations client depuis Shopify
      getCustomerFromToken(shopifyAccessToken),

      // Adresses depuis Shopify
      getCustomerAddresses(shopifyCustomerId),

      // Commandes depuis Shopify
      getCustomerOrders(shopifyCustomerId),

      // Récupérer le cartId depuis les cookies
      getCartIdFromRequest(request),
    ]);

    // Récupérer le panier Shopify si un cartId existe
    let activeCart = null;
    if (cartId) {
      activeCart = await getShopifyCart(cartId);
    }

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
    const totalSpent = orders.reduce((sum: number, order: any) => {
      const orderTotal = typeof order.total === 'string' ? parseFloat(order.total) : (order.total || 0);
      return sum + orderTotal;
    }, 0);
    const averageOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;
    
    // Calculer les stats du panier depuis Shopify
    const cartItemsCount = activeCart?.totalQuantity || 0;
    const cartTotal = activeCart?.cost?.totalAmount?.amount 
      ? parseFloat(activeCart.cost.totalAmount.amount) 
      : 0;

    // Statistiques par statut de commande
    const ordersByStatus = orders.reduce((acc: Record<string, number>, order: any) => {
      const status = order.financialStatus || order.fulfillmentStatus || 'PENDING';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});

    // Évolution des commandes sur les 6 derniers mois
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const ordersByMonth = orders
      .filter((order: any) => {
        const orderDate = new Date(order.createdAt || order.processedAt);
        return orderDate >= sixMonthsAgo;
      })
      .reduce((acc: Record<string, { count: number; total: number }>, order: any) => {
        const orderDate = new Date(order.createdAt || order.processedAt);
        const monthKey = `${orderDate.getFullYear()}-${String(orderDate.getMonth() + 1).padStart(2, '0')}`;
        if (!acc[monthKey]) {
          acc[monthKey] = { count: 0, total: 0 };
        }
        acc[monthKey].count += 1;
        const orderTotal = typeof order.total === 'string' ? parseFloat(order.total) : (order.total || 0);
        acc[monthKey].total += orderTotal;
        return acc;
      }, {});

    // Commandes récentes (5 dernières)
    const recentOrders = orders.slice(0, 5).map((order: any) => ({
      id: order.id,
      shopifyOrderId: order.id,
      orderNumber: order.orderNumber || order.name,
      status: order.financialStatus || order.fulfillmentStatus || 'PENDING',
      total: typeof order.total === 'string' ? parseFloat(order.total) : (order.total || 0),
      currency: order.currencyCode || order.currency || 'EUR',
      createdAt: order.createdAt || order.processedAt || new Date().toISOString(),
      itemsCount: order.lineItems?.length || 0,
    }));

    // Produits les plus commandés (depuis les commandes Shopify)
    const topProducts = orders
      .flatMap((order: any) => order.lineItems || [])
      .reduce((acc: Record<string, any>, item: any) => {
        const key = item.variant?.product?.id || item.productId;
        if (!key) return acc;
        
        if (!acc[key]) {
          acc[key] = {
            productId: key,
            title: item.title || item.name,
            quantity: 0,
            totalSpent: 0,
            imageUrl: item.image?.url || item.variant?.image?.url || null,
          };
        }
        const quantity = item.quantity || 0;
        const price = typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0);
        acc[key].quantity += quantity;
        acc[key].totalSpent += price * quantity;
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
          ordersByMonth: Object.entries(ordersByMonth).map(([month, data]: [string, any]) => ({
            month,
            count: data.count,
            total: data.total,
          })),
        },
        recentOrders,
        topProducts: topProductsArray,
        recentActivity: [], // Plus de ActivityLog - utiliser Vercel Analytics pour les logs
        hasActiveCart: !!activeCart && (activeCart.totalQuantity || 0) > 0,
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
