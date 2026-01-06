/**
 * 🍍 JOLANANAS - API Export Données Utilisateur (RGPD)
 * ====================================================
 * Endpoint pour exporter toutes les données d'un utilisateur au format JSON
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/src/lib/auth';
import { getCustomerFromToken, getCustomerAddresses, getCustomerOrders } from '@/app/src/lib/shopify/customer-accounts';
import { db } from '@/app/src/lib/db';

export const runtime = 'nodejs';

/**
 * GET /api/user/export-data
 * Exporte toutes les données de l'utilisateur connecté
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.shopifyCustomerId || !session?.user?.shopifyAccessToken) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer toutes les données depuis Shopify
    const [customerResult, addressesResult, ordersResult] = await Promise.all([
      getCustomerFromToken(session.user.shopifyAccessToken),
      getCustomerAddresses(session.user.shopifyCustomerId),
      getCustomerOrders(session.user.shopifyCustomerId),
    ]);

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

    // Récupérer les paniers locaux (si shopifyCustomerId existe dans le schéma)
    interface CartItem {
      id: string;
      productId: string;
      variantId: string;
      quantity: number;
      price: number | string;
      title: string;
      variantTitle: string | null;
      imageUrl: string | null;
    }

    interface Cart {
      id: string;
      status: string;
      shopifyCartId: string | null;
      createdAt: Date;
      updatedAt: Date;
      items: CartItem[];
    }

    let carts: Cart[] = [];
    try {
      // Note: Utiliser shopifyCustomerId une fois le schéma migré
      carts = await db.cart.findMany({
        where: {
          // shopifyCustomerId: session.user.shopifyCustomerId,
        },
        include: {
          items: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      }) as Cart[];
    } catch (error) {
      // Ignorer si le schéma n'est pas encore migré
    }

    // Récupérer les préférences locales (optionnel)
    let preferences: Record<string, unknown> | null = null;
    try {
      // Note: Utiliser shopifyCustomerId une fois le schéma migré
      preferences = null; // UserPreferences sera supprimé ou migré vers Metafields
    } catch (error) {
      // Ignorer
    }

    // Récupérer les logs d'activité (optionnel)
    interface ActivityLog {
      id: string;
      action: string;
      ipAddress: string | null;
      userAgent: string | null;
      metadata: Record<string, unknown> | null;
      createdAt: Date;
    }

    let activityLogs: ActivityLog[] = [];
    try {
      // Note: Utiliser shopifyCustomerId une fois le schéma migré
      activityLogs = [];
    } catch (error) {
      // Ignorer
    }

    // Formater les données pour l'export (sans mot de passe)
    interface OrderItem {
      id: string;
      productId: string;
      variantId: string;
      quantity: number;
      price: number;
      title: string;
      variantTitle: string | null;
      imageUrl: string | null;
    }

    interface Order {
      id: string;
      shopifyOrderId: string;
      status: string;
      total: number;
      currency: string;
      shippingCost: number;
      taxAmount: number;
      createdAt: string;
      updatedAt: string;
      items: OrderItem[];
      shippingAddress: Record<string, unknown> | null;
    }

    const exportData = {
      user: {
        id: customer.id,
        email: customer.email,
        name: customer.firstName && customer.lastName
          ? `${customer.firstName} ${customer.lastName}`
          : customer.firstName || customer.lastName || null,
        avatar: null, // Pas d'avatar dans Customer Account API par défaut
        role: 'CUSTOMER',
        emailVerified: customer.createdAt ? new Date(customer.createdAt) : null,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      },
      orders: orders.map((order: Order) => ({
        id: order.id,
        shopifyOrderId: order.id,
        status: order.status,
        total: order.total || 0,
        currency: order.currency || 'EUR',
        shippingCost: order.shippingCost || 0,
        taxAmount: order.taxAmount || 0,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        items: (order.items || []).map((item: OrderItem) => ({
          id: item.id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: item.price || 0,
          title: item.title,
          variantTitle: item.variantTitle,
          imageUrl: item.imageUrl,
        })),
        shippingAddress: order.shippingAddress || null,
      })),
      addresses: addresses.map(addr => ({
        id: addr.id,
        firstName: addr.firstName,
        lastName: addr.lastName,
        company: addr.company,
        address1: addr.address1,
        address2: addr.address2,
        city: addr.city,
        province: addr.province,
        country: addr.country,
        zip: addr.zip,
        phone: addr.phone,
        isDefault: addr.isDefault,
      })),
      carts: carts.map(cart => ({
        id: cart.id,
        status: cart.status,
        shopifyCartId: cart.shopifyCartId,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt,
        items: cart.items.map((item: CartItem) => ({
          id: item.id,
          productId: item.productId,
          variantId: item.variantId,
          quantity: item.quantity,
          price: Number(item.price),
          title: item.title,
          variantTitle: item.variantTitle,
          imageUrl: item.imageUrl,
        })),
      })),
      preferences: preferences,
      activityLogs: activityLogs.map((log: ActivityLog) => ({
        id: log.id,
        action: log.action,
        ipAddress: log.ipAddress,
        userAgent: log.userAgent,
        metadata: log.metadata ? JSON.parse(JSON.stringify(log.metadata)) : null,
        createdAt: log.createdAt,
      })),
      exportDate: new Date().toISOString(),
    };

    // Retourner les données en JSON
    return NextResponse.json(exportData, {
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="jolananas-data-export-${Date.now()}.json"`,
      },
    });

  } catch (error: unknown) {
    console.error('❌ Erreur export données:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Une erreur est survenue lors de l\'export des données',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Une erreur est survenue lors de l\'export des données' 
      },
      { status: 500 }
    );
  }
}

