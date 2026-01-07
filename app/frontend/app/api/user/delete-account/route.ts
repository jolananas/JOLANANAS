/**
 * 🍍 JOLANANAS - API Suppression Compte Utilisateur (RGPD)
 * =========================================================
 * Endpoint pour supprimer le compte utilisateur dans Shopify uniquement
 * Plus de base de données locale - tout est géré par Shopify
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/src/lib/auth';
import { z } from 'zod';
import { authenticateCustomer } from '@/app/src/lib/shopify/auth';
import { getShopifyAdminClient } from '@/app/src/lib/ShopifyAdminClient';

export const runtime = 'nodejs';

const DeleteAccountSchema = z.object({
  confirm: z.literal(true, {
    errorMap: () => ({ message: 'Vous devez confirmer la suppression' }),
  }),
  password: z.string().min(1, 'Le mot de passe est requis pour confirmer la suppression'),
});

/**
 * DELETE /api/user/delete-account
 * Supprime le compte utilisateur dans Shopify
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.shopifyCustomerId || !session?.user?.email) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validation des données
    const validation = DeleteAccountSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Données invalides',
          details: validation.error.errors 
        },
        { status: 400 }
      );
    }

    const { password } = validation.data;

    // Vérifier le mot de passe en s'authentifiant
    const authResult = await authenticateCustomer(session.user.email, password);
    
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: 'Mot de passe incorrect' },
        { status: 401 }
      );
    }

    // Supprimer le client dans Shopify via Admin API
    const adminClient = getShopifyAdminClient();
    const deleteResult = await adminClient.deleteCustomer(session.user.shopifyCustomerId);

    if (deleteResult.errors && deleteResult.errors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: deleteResult.errors[0]?.message || 'Erreur lors de la suppression du compte' 
        },
        { status: 500 }
      );
    }

    // Note: Les paniers Shopify sont automatiquement supprimés quand le client est supprimé
    // Les préférences dans Metafields sont également supprimées automatiquement

    return NextResponse.json({
      success: true,
      message: 'Compte supprimé avec succès. Toutes vos données ont été supprimées de Shopify.',
    });

  } catch (error: unknown) {
    console.error('❌ Erreur suppression compte:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Une erreur est survenue lors de la suppression du compte',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Une erreur est survenue lors de la suppression du compte' 
      },
      { status: 500 }
    );
  }
}
