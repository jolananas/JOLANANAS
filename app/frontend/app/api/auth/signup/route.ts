/**
 * 🍍 JOLANANAS - API Création Utilisateur
 * ======================================
 * Endpoint pour créer un nouveau compte utilisateur
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/app/src/lib/db';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

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

    // 🔒 PROTECTION: Bloquer les utilisateurs de test en production
    if (process.env.NODE_ENV === 'production') {
      const emailLower = email.toLowerCase();
      const nameTrimmed = name.trim();

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

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await db.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Un compte avec cet email existe déjà' 
        },
        { status: 409 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur
    const user = await db.user.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        name: name.trim(),
        role: 'CUSTOMER',
      },
    });

    // Retourner les informations de l'utilisateur (sans mot de passe)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès',
      user: userWithoutPassword,
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

