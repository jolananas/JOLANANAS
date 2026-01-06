/**
 * 🍍 JOLANANAS - API Création Utilisateur avec Shopify Customer Accounts
 * =======================================================================
 * Endpoint pour créer un nouveau compte utilisateur dans Shopify
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createCustomer, checkEmailExists } from '@/app/src/lib/shopify/auth';

const SignupSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court (min 6 caractères)'),
  name: z.string().min(2, 'Nom requis'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validation des données
    const validation = SignupSchema.safeParse(body);
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

    const { email, password, name } = validation.data;

    // Vérifier si l'utilisateur existe déjà dans Shopify
    const emailExists = await checkEmailExists(email.toLowerCase());

    if (emailExists) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Un compte avec cet email existe déjà' 
        },
        { status: 409 }
      );
    }

    // Extraire prénom et nom
    const nameParts = name.trim().split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ');

    // Créer le client dans Shopify via Customer Account API
    const createResult = await createCustomer(
      email.toLowerCase(),
      password,
      firstName,
      lastName
    );

    if (!createResult.success || !createResult.customer) {
      return NextResponse.json(
        { 
          success: false,
          error: createResult.errors?.[0]?.message || 'Erreur lors de la création du compte'
        },
        { status: 500 }
      );
    }

    // Retourner les informations du client (sans mot de passe)
    const { password: _, ...customerWithoutPassword } = createResult.customer as any;

    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès',
      user: {
        id: createResult.customer.id,
        email: createResult.customer.email,
        name: createResult.customer.firstName && createResult.customer.lastName
          ? `${createResult.customer.firstName} ${createResult.customer.lastName}`
          : createResult.customer.firstName || createResult.customer.lastName || null,
        role: 'CUSTOMER',
      },
      accessToken: createResult.accessToken,
    });

  } catch (error: unknown) {
    console.error('❌ Erreur création utilisateur:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Erreur serveur'
      },
      { status: 500 }
    );
  }
}
