/**
 * 🍍 JOLANANAS - API Changement Mot de Passe
 * ===========================================
 * Endpoint pour changer le mot de passe de l'utilisateur connecté
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/src/lib/auth';
import { z } from 'zod';
import { authenticateCustomer } from '@/app/src/lib/shopify/auth';
import { getShopifyAdminClient } from '@/app/src/lib/ShopifyAdminClient';

export const runtime = 'nodejs';

// Schéma de validation
const PasswordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Mot de passe actuel requis'),
  newPassword: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

/**
 * PUT /api/user/password
 * Change le mot de passe de l'utilisateur connecté
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
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
    const validation = PasswordChangeSchema.safeParse(body);
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

    const { currentPassword, newPassword } = validation.data;

    // Vérifier l'ancien mot de passe en s'authentifiant
    const authResult = await authenticateCustomer(session.user.email, currentPassword);
    
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, error: 'Mot de passe actuel incorrect' },
        { status: 401 }
      );
    }

    // Mettre à jour le mot de passe dans Shopify via Admin API
    const adminClient = getShopifyAdminClient();
    const updateResult = await adminClient.updateCustomer(session.user.shopifyCustomerId, {
      password: newPassword,
      password_confirmation: newPassword,
    });

    if (updateResult.errors && updateResult.errors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: updateResult.errors[0]?.message || 'Erreur lors de la mise à jour du mot de passe' 
        },
        { status: 500 }
      );
    }

    // Vérifier que la réponse contient bien un customer
    const updateData = updateResult.data as { customer?: unknown } | undefined;
    if (!updateData || !updateData.customer) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Erreur lors de la mise à jour du mot de passe' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Mot de passe modifié avec succès',
    });

  } catch (error: unknown) {
    console.error('❌ Erreur changement mot de passe:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Une erreur est survenue lors du changement de mot de passe',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Une erreur est survenue lors du changement de mot de passe' 
      },
      { status: 500 }
    );
  }
}

