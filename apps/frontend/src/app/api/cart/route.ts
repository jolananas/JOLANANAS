import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { getShopifyClient } from "@/lib/ShopifyStorefrontClient";
import {
  getCart,
  createCart,
  addToCart,
  updateCartLine,
  removeFromCart,
} from "@/lib/shopify/index";
import {
  getCartIdFromRequest,
  setCartIdInResponse,
  removeCartIdFromResponse,
} from "@/lib/utils/cart-storage";
import { z } from "zod";

export const runtime = "nodejs";

// Schémas de validation
const AddItemSchema = z.object({
  variantId: z.string().min(1),
  quantity: z.number().min(1).max(99),
});

const UpdateItemSchema = z.object({
  lineId: z.string().min(1),
  quantity: z.number().min(0).max(99),
});

/**
 * GET /api/cart
 * Récupère le panier actuel depuis Shopify
 */
export async function GET(request: NextRequest) {
  try {
    // Récupérer le cartId depuis les cookies
    let cartId = getCartIdFromRequest(request);

    // Si pas de cartId, retourner un panier vide
    if (!cartId) {
      return NextResponse.json({
        success: true,
        data: {
          id: null,
          lines: [],
          totalQuantity: 0,
          cost: {
            totalAmount: { amount: "0", currencyCode: "EUR" },
          },
          isEmpty: true,
        },
      });
    }

    // Récupérer le panier depuis Shopify
    const cart = await getCart(cartId);

    if (!cart) {
      // Panier invalide ou expiré - supprimer le cookie
      const response = NextResponse.json({
        success: true,
        data: {
          id: null,
          lines: [],
          totalQuantity: 0,
          cost: {
            totalAmount: { amount: "0", currencyCode: "EUR" },
          },
          isEmpty: true,
        },
      });
      response.headers.set(
        "Set-Cookie",
        removeCartIdFromResponse()["Set-Cookie"],
      );
      return response;
    }

    return NextResponse.json({
      success: true,
      data: cart,
    });
  } catch (error: unknown) {
    console.error("❌ Erreur récupération panier:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur serveur",
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/cart
 * Ajoute un article au panier Shopify
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();

    // Validation des données
    const validation = AddItemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Données invalides" },
        { status: 400 },
      );
    }

    const { variantId, quantity } = validation.data;

    // Récupérer ou créer le panier
    let cartId = getCartIdFromRequest(request);
    let cart = null;

    if (cartId) {
      // Récupérer le panier existant
      cart = await getCart(cartId);
    }

    // Créer un nouveau panier si nécessaire
    if (!cart || !cartId) {
      // Créer un panier avec le premier article
      const shopifyClient = getShopifyClient();
      const cartResponse = await shopifyClient.createCart([
        {
          merchandiseId: variantId,
          quantity,
        },
      ]);

      if (!cartResponse.data?.cartCreate?.cart) {
        return NextResponse.json(
          { success: false, error: "Erreur lors de la création du panier" },
          { status: 500 },
        );
      }
      cart = cartResponse.data.cartCreate.cart;
      cartId = cart.id;
    } else {
      // Ajouter l'article au panier existant
      const updatedCart = await addToCart(cartId, variantId, quantity);
      if (updatedCart) {
        cart = updatedCart;
      } else {
        return NextResponse.json(
          { success: false, error: "Erreur lors de l'ajout au panier" },
          { status: 500 },
        );
      }
    }

    // Retourner le panier avec le cookie
    const response = NextResponse.json({
      success: true,
      data: cart,
    });

    // Définir le cookie avec le cartId
    if (cartId) {
      response.headers.set(
        "Set-Cookie",
        setCartIdInResponse(cartId)["Set-Cookie"],
      );
    }

    return response;
  } catch (error: unknown) {
    console.error("❌ Erreur ajout au panier:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur serveur",
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/cart
 * Met à jour la quantité d'un article dans le panier Shopify
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation des données
    const validation = UpdateItemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: "Données invalides" },
        { status: 400 },
      );
    }

    const { lineId, quantity } = validation.data;

    // Récupérer le cartId depuis les cookies
    const cartId = getCartIdFromRequest(request);

    if (!cartId) {
      return NextResponse.json(
        { success: false, error: "Panier non trouvé" },
        { status: 404 },
      );
    }

    // Supprimer l'article si quantité = 0
    if (quantity === 0) {
      const updatedCart = await removeFromCart(cartId, lineId);
      if (!updatedCart) {
        return NextResponse.json(
          { success: false, error: "Erreur lors de la suppression" },
          { status: 500 },
        );
      }

      return NextResponse.json({
        success: true,
        data: updatedCart,
        message: "Article supprimé",
      });
    }

    // Mettre à jour la quantité
    const updatedCart = await updateCartLine(cartId, lineId, quantity);
    if (!updatedCart) {
      return NextResponse.json(
        { success: false, error: "Erreur lors de la mise à jour" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedCart,
      message: "Article mis à jour",
    });
  } catch (error: unknown) {
    console.error("❌ Erreur mise à jour panier:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur serveur",
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/cart
 * Supprime un article du panier Shopify
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lineId = searchParams.get("lineId");

    if (!lineId) {
      return NextResponse.json(
        { success: false, error: "ID ligne requis" },
        { status: 400 },
      );
    }

    // Récupérer le cartId depuis les cookies
    const cartId = getCartIdFromRequest(request);

    if (!cartId) {
      return NextResponse.json(
        { success: false, error: "Panier non trouvé" },
        { status: 404 },
      );
    }

    // Supprimer l'article du panier
    const updatedCart = await removeFromCart(cartId, lineId);
    if (!updatedCart) {
      return NextResponse.json(
        { success: false, error: "Erreur lors de la suppression" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedCart,
      message: "Article supprimé du panier",
    });
  } catch (error: unknown) {
    console.error("❌ Erreur suppression panier:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur serveur",
      },
      { status: 500 },
    );
  }
}
