/**
 * 🍍 JOLANANAS - API Panier Persisté
 * =====================================
 * CRUD complet pour les paniers persistés
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/src/lib/auth';
import { db } from '@/app/src/lib/db';
import { getShopifyClient } from '@/lib/ShopifyStorefrontClient';
import { z } from 'zod';

export const runtime = 'nodejs';

// Schémas de validation
const AddItemSchema = z.object({
  productId: z.string().min(1),
  variantId: z.string().min(1),
  quantity: z.number().min(1).max(99),
});

const UpdateItemSchema = z.object({
  cartItemId: z.string().min(1),
  quantity: z.number().min(0).max(99),
});

/**
 * GET /api/cart
 * Récupère le panier actuel de l'utilisateur
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    // Trouver ou créer un panier
    let cart = null;
    
    try {
      if (session?.user?.shopifyCustomerId) {
        // Utilisateur connecté - rechercher son panier par shopifyCustomerId
        cart = await db.cart.findFirst({
          where: {
            shopifyCustomerId: session.user.shopifyCustomerId,
            status: 'ACTIVE',
          },
          include: {
            items: true,
          },
        });
      } else if (sessionId) {
        // Session anonyme - rechercher par sessionId
        cart = await db.cart.findFirst({
          where: {
            sessionId,
            status: 'ACTIVE',
          },
          include: {
            items: true,
          },
        });
      }

      // Créer un nouveau panier si nécessaire
      if (!cart) {
        cart = await db.cart.create({
          data: {
            shopifyCustomerId: session?.user?.shopifyCustomerId || undefined,
            sessionId: sessionId || undefined,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
          },
          include: {
            items: true,
          },
        });
      }

      // Synchroniser avec Shopify si nécessaire
      if (!cart.shopifyCartId) {
        try {
          const shopifyClient = getShopifyClient();
          const shopifyCart = await shopifyClient.createCart();
          
          if (shopifyCart.data?.cartCreate?.cart) {
            await db.cart.update({
              where: { id: cart.id },
              data: { shopifyCartId: shopifyCart.data.cartCreate.cart.id },
            });
            cart.shopifyCartId = shopifyCart.data.cartCreate.cart.id;
          }
        } catch (shopifyError) {
          console.warn('⚠️ Erreur synchronisation Shopify (non bloquant):', shopifyError);
          // Continuer sans bloquer - le panier local existe
        }
      }

      return NextResponse.json({
        success: true,
        data: cart,
      });
    } catch (dbError) {
      // Si erreur DB mais pas de session, retourner un panier vide
      if (!session?.user?.shopifyCustomerId && !sessionId) {
        console.warn('⚠️ Erreur DB sans session - retour panier vide');
        return NextResponse.json({
          success: true,
          data: {
            id: null,
            items: [],
            total: 0,
            isEmpty: true,
          },
        });
      }
      throw dbError; // Relancer l'erreur si session présente
    }

  } catch (error: unknown) {
    console.error('❌ Erreur récupération panier:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Erreur serveur'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/cart/items
 * Ajoute un article au panier
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const body = await request.json();
    const sessionId = body.sessionId;

    // Validation des données
    const validation = AddItemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Données invalides' },
        { status: 400 }
      );
    }

    const { productId, variantId, quantity } = validation.data;

    // Trouver ou créer un panier
    let cart = null;
    
    if (session?.user?.shopifyCustomerId) {
      cart = await db.cart.findFirst({
        where: {
          shopifyCustomerId: session.user.shopifyCustomerId,
          status: 'ACTIVE',
        },
      });
    } else if (sessionId) {
      cart = await db.cart.findFirst({
        where: {
          sessionId,
          status: 'ACTIVE',
        },
      });
    }

    if (!cart) {
      cart = await db.cart.create({
        data: {
          shopifyCustomerId: session?.user?.shopifyCustomerId || undefined,
          sessionId: sessionId || undefined,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    // Synchroniser avec Shopify
    const shopifyClient = getShopifyClient();
    if (!cart.shopifyCartId) {
      const shopifyCart = await shopifyClient.createCart();
      if (shopifyCart.data?.cartCreate?.cart) {
        await db.cart.update({
          where: { id: cart.id },
          data: { shopifyCartId: shopifyCart.data.cartCreate.cart.id },
        });
        cart.shopifyCartId = shopifyCart.data.cartCreate.cart.id;
      }
    }

    // Ajouter l'article au panier Shopify
    if (cart.shopifyCartId) {
      await shopifyClient.addToCart(cart.shopifyCartId, [
        {
          merchandiseId: variantId,
          quantity,
        },
      ]);
    }

    // Enregistrer en base
    const cartItem = await db.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        variantId,
        quantity,
        price: 0, // À récupérer depuis Shopify
        title: '', // À récupérer depuis Shopify
        variantTitle: '',
        imageUrl: '',
      },
    });

    // Retourner le panier complet
    const updatedCart = await db.cart.findUnique({
      where: { id: cart.id },
      include: {
        items: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedCart,
    });

  } catch (error: unknown) {
    console.error('❌ Erreur ajout au panier:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Erreur serveur'
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/cart/items
 * Met à jour la quantité d'un article
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation des données
    const validation = UpdateItemSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Données invalides' },
        { status: 400 }
      );
    }

    const { cartItemId, quantity } = validation.data;

    // Supprimer l'article si quantité = 0
    if (quantity === 0) {
      await db.cartItem.delete({
        where: { id: cartItemId },
      });
    } else {
      // Mettre à jour la quantité
      await db.cartItem.update({
        where: { id: cartItemId },
        data: { quantity },
      });
    }

    return NextResponse.json({
      success: true,
      message: quantity === 0 ? 'Article supprimé' : 'Article mis à jour',
    });

  } catch (error: unknown) {
    console.error('❌ Erreur mise à jour panier:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Erreur serveur'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/cart/items
 * Supprime un article du panier
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cartItemId = searchParams.get('cartItemId');

    if (!cartItemId) {
      return NextResponse.json(
        { success: false, error: 'ID article requis' },
        { status: 400 }
      );
    }

    await db.cartItem.delete({
      where: { id: cartItemId },
    });

    return NextResponse.json({
      success: true,
      message: 'Article supprimé du panier',
    });

  } catch (error: unknown) {
    console.error('❌ Erreur suppression panier:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Erreur serveur'
      },
      { status: 500 }
    );
  }
}
