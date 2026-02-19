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
    .max(100, "Le nom ne peut pas dépasser 100 caractères")
    .optional(),
  phone: z
    .string()
    .regex(/^\+?[0-9\s-]{8,20}$/, "Format de téléphone invalide")
    .optional()
    .or(z.literal("")),
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

    const { name, phone } = validation.data;
    const updateData: any = {};

    if (name !== undefined) {
      // Extraire prénom et nom
      const nameParts = name.trim().split(" ");
      updateData.firstName = nameParts[0];
      updateData.lastName = nameParts.slice(1).join(" ") || "";
    }

    if (phone !== undefined) {
      updateData.phone = phone;
    }

    // Mettre à jour le client dans Shopify
    const updateResult = await updateCustomer(session.user.shopifyCustomerId, updateData);

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
