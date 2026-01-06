/**
 * 🍍 JOLANANAS - API Gestion Adresses Utilisateur
 * ================================================
 * CRUD complet pour les adresses de livraison/facturation
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/src/lib/auth';
import { z } from 'zod';
import { 
  getCustomerAddresses, 
  createCustomerAddress, 
  updateCustomerAddress, 
  deleteCustomerAddress 
} from '@/app/src/lib/shopify/customer-accounts';

export const runtime = 'nodejs';

// Schéma de validation
const AddressSchema = z.object({
  firstName: z.string().min(1, 'Le prénom est requis'),
  lastName: z.string().min(1, 'Le nom est requis'),
  company: z.string().optional(),
  address1: z.string().min(1, 'L\'adresse est requise'),
  address2: z.string().optional(),
  city: z.string().min(1, 'La ville est requise'),
  province: z.string().optional(),
  country: z.string().min(2, 'Le code pays est requis').max(2, 'Le code pays doit être à 2 lettres'),
  zip: z.string().min(1, 'Le code postal est requis'),
  phone: z.string().optional(),
  type: z.enum(['SHIPPING', 'BILLING']).default('SHIPPING'),
  isDefault: z.boolean().optional(),
});

/**
 * GET /api/user/addresses
 * Récupère toutes les adresses de l'utilisateur connecté
 */
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.shopifyCustomerId) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer les adresses depuis Shopify
    const result = await getCustomerAddresses(session.user.shopifyCustomerId);

    if (result.errors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.errors[0]?.message || 'Erreur lors de la récupération des adresses' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      addresses: result.addresses,
    });

  } catch (error: unknown) {
    console.error('❌ Erreur récupération adresses:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Une erreur est survenue lors de la récupération des adresses' 
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/addresses
 * Crée une nouvelle adresse pour l'utilisateur connecté
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.shopifyCustomerId) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validation des données
    const validation = AddressSchema.safeParse(body);
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

    const addressData = validation.data;
    const { isDefault, type, ...addressFields } = addressData;

    // Créer l'adresse dans Shopify
    const result = await createCustomerAddress(session.user.shopifyCustomerId, {
      firstName: addressFields.firstName,
      lastName: addressFields.lastName,
      company: addressFields.company,
      address1: addressFields.address1,
      address2: addressFields.address2,
      city: addressFields.city,
      province: addressFields.province,
      country: addressFields.country,
      zip: addressFields.zip,
      phone: addressFields.phone,
      isDefault: isDefault ?? false,
    });

    if (result.errors.length > 0 || !result.address) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.errors[0]?.message || 'Erreur lors de la création de l\'adresse' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Adresse créée avec succès',
      address: result.address,
    }, { status: 201 });

  } catch (error: unknown) {
    console.error('❌ Erreur création adresse:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Une erreur est survenue lors de la création de l\'adresse',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Une erreur est survenue lors de la création de l\'adresse' 
      },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/user/addresses?id=xxx
 * Met à jour une adresse existante
 */
export async function PUT(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.shopifyCustomerId) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get('id');

    if (!addressId) {
      return NextResponse.json(
        { success: false, error: 'ID d\'adresse requis (paramètre ?id=xxx)' },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Validation des données
    const validation = AddressSchema.safeParse(body);
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

    const addressData = validation.data;
    const { isDefault, type, ...addressFields } = addressData;

    // Mettre à jour l'adresse dans Shopify
    const result = await updateCustomerAddress(session.user.shopifyCustomerId, addressId, {
      firstName: addressFields.firstName,
      lastName: addressFields.lastName,
      company: addressFields.company,
      address1: addressFields.address1,
      address2: addressFields.address2,
      city: addressFields.city,
      province: addressFields.province,
      country: addressFields.country,
      zip: addressFields.zip,
      phone: addressFields.phone,
      isDefault: isDefault ?? false,
    });

    if (result.errors.length > 0 || !result.address) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.errors[0]?.message || 'Erreur lors de la mise à jour de l\'adresse' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Adresse mise à jour avec succès',
      address: result.address,
    });

  } catch (error: unknown) {
    console.error('❌ Erreur mise à jour adresse:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Une erreur est survenue lors de la mise à jour de l\'adresse',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Une erreur est survenue lors de la mise à jour de l\'adresse' 
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/addresses?id=xxx
 * Supprime une adresse
 */
export async function DELETE(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.shopifyCustomerId) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get('id');

    if (!addressId) {
      return NextResponse.json(
        { success: false, error: 'ID d\'adresse requis (paramètre ?id=xxx)' },
        { status: 400 }
      );
    }

    // Supprimer l'adresse dans Shopify
    const result = await deleteCustomerAddress(session.user.shopifyCustomerId, addressId);

    if (!result.success || result.errors.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.errors[0]?.message || 'Erreur lors de la suppression de l\'adresse' 
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Adresse supprimée avec succès',
    });

  } catch (error: unknown) {
    console.error('❌ Erreur suppression adresse:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Une erreur est survenue lors de la suppression de l\'adresse',
          details: error.message 
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: false, 
        error: 'Une erreur est survenue lors de la suppression de l\'adresse' 
      },
      { status: 500 }
    );
  }
}

