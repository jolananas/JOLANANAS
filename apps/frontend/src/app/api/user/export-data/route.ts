import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import {
  getCustomerFromToken,
  getCustomerAddresses,
  getCustomerOrders,
} from "@/lib/shopify/customer-accounts";
import {
  getCartIdFromRequest,
  getCart,
} from "@/lib/utils/cart-storage";
import { getCart as getShopifyCart } from "@/lib/shopify/index";

export const runtime = "nodejs";

/**
 * GET /api/user/export-data
 * Exporte toutes les données de l'utilisateur connecté depuis Shopify
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);

    if (
      !session?.user?.shopifyCustomerId ||
      !session?.user?.shopifyAccessToken
    ) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 },
      );
    }

    // Récupérer toutes les données depuis Shopify
    const [customerResult, addressesResult, ordersResult, cartId] =
      await Promise.all([
        getCustomerFromToken(session.user.shopifyAccessToken),
        getCustomerAddresses(session.user.shopifyCustomerId),
        getCustomerOrders(session.user.shopifyCustomerId),
        getCartIdFromRequest(request),
      ]);

    if (customerResult.errors.length > 0 || !customerResult.customer) {
      return NextResponse.json(
        {
          success: false,
          error:
            customerResult.errors[0]?.message ||
            "Erreur lors de la récupération des données",
        },
        { status: 500 },
      );
    }

    const customer = customerResult.customer;
    const addresses = addressesResult.addresses;
    const orders = ordersResult.orders || [];

    // Récupérer le panier Shopify si un cartId existe
    let activeCart = null;
    if (cartId) {
      activeCart = await getShopifyCart(cartId);
    }

    // Formater les données pour l'export
    const exportData = {
      user: {
        id: customer.id,
        email: customer.email,
        name:
          customer.firstName && customer.lastName
            ? `${customer.firstName} ${customer.lastName}`
            : customer.firstName || customer.lastName || null,
        avatar: null, // Pas d'avatar dans Customer Account API par défaut
        role: "CUSTOMER",
        emailVerified: customer.createdAt ? new Date(customer.createdAt) : null,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
      },
      orders: orders.map((order: any) => ({
        id: order.id,
        shopifyOrderId: order.id,
        orderNumber: order.orderNumber || order.name,
        status: order.financialStatus || order.fulfillmentStatus || "PENDING",
        total:
          typeof order.total === "string"
            ? parseFloat(order.total)
            : order.total || 0,
        currency: order.currencyCode || order.currency || "EUR",
        createdAt:
          order.createdAt || order.processedAt || new Date().toISOString(),
        items: (order.lineItems || []).map((item: any) => ({
          productId: item.variant?.product?.id || item.productId,
          variantId: item.variant?.id || item.variantId,
          quantity: item.quantity || 0,
          price:
            typeof item.price === "string"
              ? parseFloat(item.price)
              : item.price || 0,
          title: item.title || item.name,
          variantTitle: item.variant?.title || null,
          imageUrl: item.image?.url || item.variant?.image?.url || null,
        })),
      })),
      addresses: addresses.map((addr) => ({
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
      cart: activeCart
        ? {
            id: activeCart.id,
            totalQuantity: activeCart.totalQuantity,
            total: activeCart.cost?.totalAmount?.amount
              ? parseFloat(activeCart.cost.totalAmount.amount)
              : 0,
            currency: activeCart.cost?.totalAmount?.currencyCode || "EUR",
            items:
              activeCart.lines?.edges?.map((edge: any) => ({
                id: edge.node.id,
                quantity: edge.node.quantity,
                merchandise: {
                  id: edge.node.merchandise?.id,
                  title: edge.node.merchandise?.title,
                  product: {
                    id: edge.node.merchandise?.product?.id,
                    title: edge.node.merchandise?.product?.title,
                  },
                },
              })) || [],
          }
        : null,
      preferences: null, // Les préférences sont stockées dans Shopify Metafields
      activityLogs: [], // Plus de ActivityLog - utiliser Vercel Analytics pour les logs
      exportDate: new Date().toISOString(),
      note: "Toutes les données proviennent de Shopify. Plus de base de données locale.",
    };

    // Retourner les données en JSON
    return NextResponse.json(exportData, {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="jolananas-data-export-${Date.now()}.json"`,
      },
    });
  } catch (error: unknown) {
    console.error("❌ Erreur export données:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: "Une erreur est survenue lors de l'export des données",
          details: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Une erreur est survenue lors de l'export des données",
      },
      { status: 500 },
    );
  }
}
