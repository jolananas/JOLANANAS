/**
 * 🍍 JOLANANAS - API Préférences Utilisateur
 * ===========================================
 * Gestion des préférences utilisateur via Shopify Customer Metafields
 * Namespace: preferences
 * Keys: language, timezone, emailNotifications, orderNotifications, marketingEmails
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/src/lib/auth';
import { getShopifyAdminClient } from '@/app/src/lib/ShopifyAdminClient';
import { z } from 'zod';

export const runtime = 'nodejs';

const PREFERENCES_NAMESPACE = 'preferences';

// Schéma de validation des préférences
const PreferencesSchema = z.object({
  language: z.string().default('fr'),
  timezone: z.string().default('Europe/Paris'),
  emailNotifications: z.boolean().default(true),
  orderNotifications: z.boolean().default(true),
  marketingEmails: z.boolean().default(false),
});

/**
 * GET /api/user/preferences
 * Récupère les préférences utilisateur depuis Shopify Metafields
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.shopifyCustomerId) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const customerId = session.user.shopifyCustomerId;
    const adminClient = getShopifyAdminClient();

    // Récupérer les metafields du client via REST Admin API
    // Note: L'endpoint REST pour les metafields d'un customer est /customers/{id}/metafields.json
    const endpoint = `/customers/${customerId}/metafields.json?namespace=${PREFERENCES_NAMESPACE}`;
    const response = await adminClient.request<{ metafields?: Array<{
      id: string;
      namespace: string;
      key: string;
      value: string;
      type: string;
    }> }>(endpoint, { method: 'GET' });

    if (response.errors || !response.data) {
      console.error('❌ Erreur récupération metafields:', response.errors);
      // Retourner les valeurs par défaut en cas d'erreur
      return NextResponse.json({
        success: true,
        preferences: {
          language: 'fr',
          timezone: 'Europe/Paris',
          emailNotifications: true,
          orderNotifications: true,
          marketingEmails: false,
        },
      });
    }

    // Extraire les préférences depuis les metafields
    const metafields = response.data.metafields || [];
    const preferences: Record<string, any> = {
      language: 'fr',
      timezone: 'Europe/Paris',
      emailNotifications: true,
      orderNotifications: true,
      marketingEmails: false,
    };

    metafields.forEach((metafield: any) => {
      const { key, value, type } = metafield;
      if (key === 'language' || key === 'timezone') {
        preferences[key] = value;
      } else if (type === 'boolean' || type === 'boolean') {
        preferences[key] = value === 'true' || value === true;
      }
    });

    return NextResponse.json({
      success: true,
      preferences,
    });

  } catch (error: unknown) {
    console.error('❌ Erreur récupération préférences:', error);
    
    // Retourner les valeurs par défaut en cas d'erreur
    return NextResponse.json({
      success: true,
      preferences: {
        language: 'fr',
        timezone: 'Europe/Paris',
        emailNotifications: true,
        orderNotifications: true,
        marketingEmails: false,
      },
    });
  }
}

/**
 * PUT /api/user/preferences
 * Met à jour les préférences utilisateur via Shopify Metafields
 */
export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.shopifyCustomerId) {
      return NextResponse.json(
        { success: false, error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validation = PreferencesSchema.partial().safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { success: false, error: 'Données invalides', details: validation.error.errors },
        { status: 400 }
      );
    }

    const customerId = session.user.shopifyCustomerId;
    const adminClient = getShopifyAdminClient();
    const preferences = validation.data;

    // Mettre à jour chaque préférence via REST Admin API Metafields
    const updatePromises = Object.entries(preferences).map(async ([key, value]) => {
      const valueString = typeof value === 'boolean' ? String(value) : String(value);
      const type = typeof value === 'boolean' ? 'boolean' : 'single_line_text_field';
      
      // Vérifier si le metafield existe déjà
      const checkEndpoint = `/customers/${customerId}/metafields.json?namespace=${PREFERENCES_NAMESPACE}&key=${key}`;
      const existing = await adminClient.request<{ metafields?: Array<{ id: string }> }>(checkEndpoint, { method: 'GET' });
      
      const metafieldData = {
        namespace: PREFERENCES_NAMESPACE,
        key,
        value: valueString,
        type,
        owner_resource: 'customer',
        owner_id: customerId,
      };

      if (existing.data?.metafields && existing.data.metafields.length > 0) {
        // Mettre à jour le metafield existant
        const metafieldId = existing.data.metafields[0].id;
        const updateEndpoint = `/metafields/${metafieldId}.json`;
        return adminClient.request(updateEndpoint, {
          method: 'PUT',
          body: JSON.stringify({ metafield: metafieldData }),
        });
      } else {
        // Créer un nouveau metafield
        const createEndpoint = `/metafields.json`;
        return adminClient.request(createEndpoint, {
          method: 'POST',
          body: JSON.stringify({ metafield: metafieldData }),
        });
      }
    });

    const results = await Promise.all(updatePromises);

    // Vérifier les erreurs
    const errors: string[] = [];
    results.forEach((result) => {
      if (result.errors && result.errors.length > 0) {
        errors.push(...result.errors.map((e: any) => e.message));
      }
    });

    if (errors.length > 0) {
      console.error('❌ Erreurs mise à jour metafields:', errors);
      return NextResponse.json(
        { success: false, error: 'Erreur lors de la mise à jour', details: errors },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Préférences mises à jour avec succès',
      preferences,
    });

  } catch (error: unknown) {
    console.error('❌ Erreur mise à jour préférences:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Erreur lors de la mise à jour des préférences',
        details: error instanceof Error ? error.message : 'Erreur inconnue',
      },
      { status: 500 }
    );
  }
}

