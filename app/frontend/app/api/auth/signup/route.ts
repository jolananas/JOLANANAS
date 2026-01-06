/**
 * 🍍 JOLANANAS - API Création Utilisateur (Consolidé)
 * ==================================================
 * Endpoint pour créer un nouveau compte utilisateur dans Shopify et localement.
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/src/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { createCustomer, checkEmailExists } from '@/app/src/lib/shopify/auth';

const SignupSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(6, 'Mot de passe trop court (min 6 caractères)'),
  name: z.string().min(2, 'Nom requis'),
});

// Patterns d'emails de test à bloquer
const TEST_EMAIL_PATTERNS = [
  /^exemple@/i,
  /@exemple\./i,
  /^test@/i,
  /@test\./i,
  /^demo@/i,
  /@demo\./i,
  /^fake@/i,
  /@fake\./i,
  /^mock@/i,
  /@mock\./i,
  /^user@test\./i,
  /^admin@test\./i,
  /@example\.com$/i,
  /@test\.com$/i,
  /@demo\.com$/i,
  /@fake\.com$/i,
  /@mock\.com$/i,
  /@localhost$/i,
  /@127\.0\.0\.1$/i,
];

// Noms de test à bloquer
const TEST_NAME_PATTERNS = [
  /^exemple$/i,
  /^test$/i,
  /^demo$/i,
  /^fake$/i,
  /^mock$/i,
  /^user$/i,
  /^admin$/i,
  /test user/i,
  /demo user/i,
];

function isTestEmail(email: string): boolean {
  return TEST_EMAIL_PATTERNS.some(pattern => pattern.test(email));
}

function isTestName(name: string): boolean {
  return TEST_NAME_PATTERNS.some(pattern => pattern.test(name));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // 1. Validation des données
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
    const emailLower = email.toLowerCase();
    const nameTrimmed = name.trim();

    // 2. 🔒 PROTECTION: Bloquer les utilisateurs de test en production
    if (process.env.NODE_ENV === 'production') {
      if (isTestEmail(emailLower) || isTestName(nameTrimmed)) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Les comptes de test ne sont pas autorisés en production' 
          },
          { status: 403 }
        );
      }
    }

    // 3. Vérifier si l'utilisateur existe déjà (Shopify & Local)
    const emailExistsInShopify = await checkEmailExists(emailLower);
    const existingLocalUser = await db.user.findUnique({
      where: { email: emailLower },
    });

    if (emailExistsInShopify || existingLocalUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Un compte avec cet email existe déjà' 
        },
        { status: 409 }
      );
    }

    // 4. Création dans Shopify (Customer Account API)
    const nameParts = nameTrimmed.split(' ');
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(' ') || '.'; // LastName requis par Shopify

    const createResult = await createCustomer(
      emailLower,
      password,
      firstName,
      lastName
    );

    if (!createResult.success || !createResult.customer) {
      return NextResponse.json(
        { 
          success: false,
          error: createResult.errors?.[0]?.message || 'Erreur lors de la création du compte Shopify'
        },
        { status: 500 }
      );
    }

    // 5. Création locale (Synchronisation DB)
    const hashedPassword = await bcrypt.hash(password, 12);
    const localUser = await db.user.create({
      data: {
        email: emailLower,
        password: hashedPassword,
        name: nameTrimmed,
        shopifyCustomerId: createResult.customer.id.toString(),
        role: 'CUSTOMER',
      },
    });

    // 6. Réponse finale
    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès',
      user: {
        id: localUser.id,
        shopifyId: createResult.customer.id,
        email: localUser.email,
        name: localUser.name,
        role: localUser.role,
      },
      accessToken: createResult.accessToken,
    });

  } catch (error: unknown) {
    console.error('❌ Erreur API Signup:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Erreur serveur'
      },
      { status: 500 }
    );
  }
}
