/**
 * 🍍 JOLANANAS - API Récupération Commandes Utilisateur
 * ======================================================
 * Endpoint pour récupérer toutes les commandes de l'utilisateur connecté
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/src/lib/auth';
import { getShopifyAdminClient } from '@/app/src/lib/ShopifyAdminClient';

export const runtime = 'nodejs';

/**
 * GET /api/user/orders
 * Récupère les commandes de l'utilisateur connecté avec pagination, filtres et recherche
 * Query params: page, limit, status, search, sortBy, sortOrder
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.shopifyCustomerId) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10', 10), 50); // Max 50 par page
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    // Récupérer les commandes depuis Shopify Admin API
    const adminClient = getShopifyAdminClient();
    const customerId = session.user.shopifyCustomerId;

    // Utiliser la méthode publique getCustomerOrders
    const ordersResponse = await adminClient.getCustomerOrders(customerId, limit, page);

    if (ordersResponse.errors) {
      return NextResponse.json(
        { 
          success: false, 
          error: ordersResponse.errors[0]?.message || 'Erreur lors de la récupération des commandes' 
        },
        { status: 500 }
      );
    }

    interface ShopifyOrder {
      id?: string | number;
      order_number?: string | number;
      name?: string;
      financial_status?: string;
      fulfillment_status?: string;
      total_price?: string;
      currency?: string;
      total_shipping_price_set?: {
        shop_money?: {
          amount?: string;
        };
      };
      total_tax?: string;
      created_at?: string;
      updated_at?: string;
      line_items?: Array<{
        id?: string | number;
        product_id?: string | number;
        variant_id?: string | number;
        quantity?: number;
        price?: string;
        title?: string;
        variant_title?: string | null;
        image?: string | null;
      }>;
      shipping_address?: {
        first_name?: string;
        last_name?: string;
        company?: string | null;
        address1?: string;
        address2?: string | null;
        city?: string;
        province?: string | null;
        country?: string;
        zip?: string;
        phone?: string | null;
      };
    }

    let orders: ShopifyOrder[] = [];
    if (ordersResponse.data) {
      const data = ordersResponse.data as { orders?: ShopifyOrder[] };
      if (data.orders && Array.isArray(data.orders)) {
        orders = data.orders;
      }
    }
    
    // Filtrer par recherche si nécessaire
    if (search) {
      orders = orders.filter((order: ShopifyOrder) => 
        order.order_number?.toString().includes(search) ||
        order.name?.includes(search) ||
        order.line_items?.some((item: { title?: string }) => item.title?.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Formater les données pour le frontend
    const formattedOrders = orders.map((order: ShopifyOrder) => ({
      id: order.id?.toString(),
      shopifyOrderId: order.id?.toString(),
      orderNumber: order.order_number || order.name,
      status: order.financial_status || order.fulfillment_status || 'PENDING',
      total: parseFloat(order.total_price || '0'),
      currency: order.currency || 'EUR',
      shippingCost: parseFloat(order.total_shipping_price_set?.shop_money?.amount || '0'),
      taxAmount: parseFloat(order.total_tax || '0'),
      createdAt: order.created_at || new Date().toISOString(),
      updatedAt: order.updated_at || new Date().toISOString(),
      items: (order.line_items || []).map((item: { 
        id?: string | number; 
        product_id?: string | number; 
        variant_id?: string | number; 
        quantity?: number; 
        price?: string; 
        title?: string; 
        variant_title?: string | null; 
        image?: string | null;
      }) => ({
        id: item.id?.toString(),
        productId: item.product_id?.toString(),
        variantId: item.variant_id?.toString(),
        quantity: item.quantity || 0,
        price: parseFloat(item.price || '0'),
        title: item.title,
        variantTitle: item.variant_title || null,
        imageUrl: item.image || null,
      })),
      shippingAddress: order.shipping_address ? {
        firstName: order.shipping_address.first_name,
        lastName: order.shipping_address.last_name,
        company: order.shipping_address.company || null,
        address1: order.shipping_address.address1,
        address2: order.shipping_address.address2 || null,
        city: order.shipping_address.city,
        province: order.shipping_address.province || null,
        country: order.shipping_address.country || 'France',
        zip: order.shipping_address.zip,
        phone: order.shipping_address.phone || null,
      } : null,
    }));

    // Calculer la pagination (Shopify ne retourne pas toujours le total, on utilise une estimation)
    const totalCount = formattedOrders.length; // Approximation
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });

  } catch (error: unknown) {
    console.error('❌ Erreur récupération commandes:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Une erreur est survenue lors de la récupération des commandes',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Une erreur est survenue lors de la récupération des commandes' 
      },
      { status: 500 }
    );
  }
}

