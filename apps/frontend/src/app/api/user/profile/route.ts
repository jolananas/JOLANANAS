/**
 * 🍍 JOLANANAS - API Mise à jour Profil Utilisateur
 * =================================================
 * Endpoint pour mettre à jour les informations du profil utilisateur
 */

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { z } from "zod";
import { updateCustomer } from "@/lib/shopify/customer-accounts";

export const runtime = "nodejs";

// Schéma de validation
const ProfileUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom ne peut pas dépasser 100 caractères"),
});

/**
 * PUT /api/user/profile
 * Met à jour le profil de l'utilisateur connecté
 */
export async function PUT(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);

    if (!session?.user?.shopifyCustomerId) {
      return NextResponse.json(
        { success: false, error: "Non authentifié" },
        { status: 401 },
      );
    }

    const body = await request.json();

    // Validation des données
    const validation = ProfileUpdateSchema.safeParse(body);
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

    const { name } = validation.data;

    // Extraire prénom et nom
    const nameParts = name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ");

    // Mettre à jour le client dans Shopify
    const updateResult = await updateCustomer(session.user.shopifyCustomerId, {
      firstName,
      lastName,
    });

    if (!updateResult.customer || updateResult.errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            updateResult.errors[0]?.message ||
            "Erreur lors de la mise à jour du profil",
        },
        { status: 500 },
      );
    }

    const customer = updateResult.customer;

    return NextResponse.json({
      success: true,
      message: "Profil mis à jour avec succès",
      user: {
        id: customer.id,
        email: customer.email,
        name:
          customer.firstName && customer.lastName
            ? `${customer.firstName} ${customer.lastName}`
            : customer.firstName || customer.lastName || null,
        role: "CUSTOMER",
      },
    });
  } catch (error: unknown) {
    console.error("❌ Erreur mise à jour profil:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: "Une erreur est survenue lors de la mise à jour du profil",
          details: error.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: "Une erreur est survenue lors de la mise à jour du profil",
      },
      { status: 500 },
    );
  }
}
