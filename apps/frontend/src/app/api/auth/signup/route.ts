import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createCustomer, checkEmailExists } from "@/lib/shopify/auth";

const SignupSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Mot de passe trop court (min 6 caractères)"),
  name: z.string().min(2, "Nom requis"),
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
  return TEST_EMAIL_PATTERNS.some((pattern) => pattern.test(email));
}

function isTestName(name: string): boolean {
  return TEST_NAME_PATTERNS.some((pattern) => pattern.test(name));
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
          error: "Données invalides",
          details: validation.error.errors,
        },
        { status: 400 },
      );
    }

    const { email, password, name } = validation.data;
    const emailLower = email.toLowerCase();
    const nameTrimmed = name.trim();

    // 2. 🔒 PROTECTION: Bloquer les utilisateurs de test en production
    if (process.env.NODE_ENV === "production") {
      if (isTestEmail(emailLower) || isTestName(nameTrimmed)) {
        return NextResponse.json(
          {
            success: false,
            error: "Les comptes de test ne sont pas autorisés en production",
          },
          { status: 403 },
        );
      }
    }

    // 3. Vérifier si l'utilisateur existe déjà dans Shopify
    const emailExistsInShopify = await checkEmailExists(emailLower);

    if (emailExistsInShopify) {
      return NextResponse.json(
        {
          success: false,
          error: "Un compte avec cet email existe déjà",
        },
        { status: 409 },
      );
    }

    // 4. Création dans Shopify (Customer Account API uniquement)
    const nameParts = nameTrimmed.split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || "."; // LastName requis par Shopify

    const createResult = await createCustomer(
      emailLower,
      password,
      firstName,
      lastName,
    );

    if (!createResult.success || !createResult.customer) {
      return NextResponse.json(
        {
          success: false,
          error:
            createResult.errors?.[0]?.message ||
            "Erreur lors de la création du compte Shopify",
        },
        { status: 500 },
      );
    }

    // 5. Réponse finale (plus de création locale)
    return NextResponse.json({
      success: true,
      message: "Compte créé avec succès dans Shopify",
      user: {
        shopifyId: createResult.customer.id,
        email: createResult.customer.email,
        name:
          createResult.customer.firstName && createResult.customer.lastName
            ? `${createResult.customer.firstName} ${createResult.customer.lastName}`
            : createResult.customer.firstName ||
              createResult.customer.lastName ||
              nameTrimmed,
      },
      accessToken: createResult.accessToken,
      note: "Le compte est maintenant géré entièrement par Shopify Customer Account API",
    });
  } catch (error: unknown) {
    console.error("❌ Erreur API Signup:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Erreur serveur",
      },
      { status: 500 },
    );
  }
}
