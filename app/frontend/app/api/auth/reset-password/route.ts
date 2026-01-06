/**
 * 🍍 JOLANANAS - API Réinitialisation Mot de Passe
 * ================================================
 * NOTE: Cette route est désactivée car la réinitialisation de mot de passe
 * est maintenant gérée par Shopify Customer Accounts via les invitations.
 * Les clients reçoivent un email d'invitation Shopify avec un lien de réinitialisation.
 */

import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

/**
 * POST /api/auth/reset-password
 * DÉSACTIVÉ - La réinitialisation est gérée par Shopify
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      success: false,
      error: 'La réinitialisation de mot de passe est maintenant gérée par Shopify Customer Accounts.',
      message: 'Veuillez utiliser le lien de réinitialisation reçu par email depuis Shopify.',
      redirectToShopify: true,
    },
    { status: 410 } // 410 Gone - La ressource n'est plus disponible
  );
  try {
    const body = await request.json();
    
    // Validation des données
    const validation = ResetPasswordSchema.safeParse(body);
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

    const { token, email, password } = validation.data;
    const emailLower = email.toLowerCase();

    // Vérifier le token
    const verificationToken = await db.verificationToken.findUnique({
      where: {
        identifier_token: {
          identifier: `reset-password:${emailLower}`,
          token,
        },
      },
    });

    if (!verificationToken) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Token invalide ou expiré' 
        },
        { status: 400 }
      );
    }

    // Vérifier l'expiration
    if (verificationToken.expires < new Date()) {
      // Supprimer le token expiré
      await db.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: `reset-password:${emailLower}`,
            token,
          },
        },
      });

      return NextResponse.json(
        { 
          success: false, 
          error: 'Token expiré. Veuillez demander un nouveau lien de réinitialisation.' 
        },
        { status: 400 }
      );
    }

    // Rechercher l'utilisateur
    const user = await db.user.findUnique({
      where: { email: emailLower },
    });

    if (!user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Utilisateur non trouvé' 
        },
        { status: 404 }
      );
    }

    // Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Mettre à jour le mot de passe
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
      },
    });

    // Supprimer le token utilisé
    await db.verificationToken.delete({
      where: {
        identifier_token: {
          identifier: `reset-password:${emailLower}`,
          token,
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Mot de passe réinitialisé avec succès',
    });

  } catch (error: unknown) {
    console.error('❌ Erreur reset-password:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Une erreur est survenue lors de la réinitialisation',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Une erreur est survenue lors de la réinitialisation' 
      },
      { status: 500 }
    );
  }
}

