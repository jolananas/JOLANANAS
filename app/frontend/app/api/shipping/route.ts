import { NextRequest, NextResponse } from 'next/server';
import { getShippingInfo } from '@/app/src/lib/shopify/index';

export const dynamic = 'force-dynamic';

/**
 * GET /api/shipping
 * Récupère les informations de livraison depuis Shopify
 * 
 * Codes de réponse :
 * - 200 : Succès
 * - 503 : Service Unavailable (configuration manquante, Shopify indisponible, metafields non configurés)
 * - 500 : Erreur serveur interne (erreur inattendue)
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🔄 Récupération des informations de livraison...');
    
    const result = await getShippingInfo();
    
    // Succès
    if (result.success) {
      // Vérification supplémentaire pour éviter d'afficher un succès avec des données incomplètes
      if (result.data.freeShippingThreshold === undefined || isNaN(result.data.freeShippingThreshold)) {
        // Ce cas ne devrait plus se produire avec le système de fallback, mais on le garde par sécurité
        console.error('❌ ERREUR: Données de livraison incomplètes (freeShippingThreshold manquant ou invalide)');
        // Utiliser les valeurs par défaut même dans ce cas
        const defaultShippingInfo = {
          freeShippingThreshold: 50,
          deliveryDaysFrance: '3-5 jours ouvrés',
          deliveryDaysInternational: '7-14 jours ouvrés',
          standardShippingCost: 5.99,
          expressShippingCost: 12.99,
          expressDeliveryDays: '1-2 jours ouvrés',
        };
        console.warn('⚠️ Utilisation des valeurs par défaut pour les informations de livraison');
        return NextResponse.json(defaultShippingInfo, {
          headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
          },
        });
      }
      
      console.log(`✅ Informations de livraison récupérées: seuil gratuit ${result.data.freeShippingThreshold}€`);
      
      return NextResponse.json(result.data, {
        headers: {
          'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
        },
      });
    }
    
    // Gestion des erreurs avec codes HTTP appropriés
    const { error } = result;
    
    // Erreurs de configuration ou service indisponible → 503
    if (error.type === 'CONFIGURATION' || error.type === 'GRAPHQL' || error.type === 'METAFIELDS_MISSING') {
      console.error(`❌ Erreur ${error.type}:`, error.message);
      
      const responseBody: {
        error: true;
        message: string;
        type: string;
        details?: string;
        missingFields?: string[];
        requiredFields?: string[];
      } = {
        error: true,
        message: error.message,
        type: error.type,
      };
      
      if (error.type === 'CONFIGURATION' && error.details) {
        responseBody.details = error.details;
        responseBody.message = 'Configuration Shopify manquante. Veuillez configurer SHOPIFY_STORE_DOMAIN et SHOPIFY_STOREFRONT_TOKEN (ou SHOPIFY_STOREFRONT_ACCESS_TOKEN) dans votre fichier .env.local';
      }
      
      if (error.type === 'GRAPHQL' && error.details) {
        responseBody.details = error.details;
        responseBody.message = 'Erreur lors de la communication avec Shopify. Vérifiez votre configuration et la disponibilité du service Shopify.';
      }
      
      if (error.type === 'METAFIELDS_MISSING') {
        responseBody.missingFields = error.missingFields;
        responseBody.requiredFields = error.missingFields;
        responseBody.message = 'Les informations de livraison ne sont pas configurées dans Shopify. Veuillez configurer les metafields de livraison dans l\'admin Shopify (Namespace: shipping).';
      }
      
      return NextResponse.json(responseBody, {
        status: 503, // Service Unavailable
        headers: {
          'Cache-Control': 'no-store, must-revalidate', // Ne pas cacher les erreurs
        },
      });
    }
    
    // Erreurs de validation → 503 (configuration incorrecte)
    if (error.type === 'VALIDATION') {
      console.error(`❌ Erreur de validation:`, error.message, `(field: ${error.field}, value: ${error.value})`);
      
      return NextResponse.json(
        {
          error: true,
          message: error.message,
          type: error.type,
          field: error.field,
          value: error.value,
          details: `Le metafield '${error.field}' a une valeur invalide: "${error.value}". Veuillez corriger cette valeur dans l'admin Shopify.`,
        },
        {
          status: 503, // Service Unavailable (configuration incorrecte)
          headers: {
            'Cache-Control': 'no-store, must-revalidate',
          },
        }
      );
    }
    
    // Erreur inconnue → 500
    console.error(`❌ Erreur inconnue:`, error.message, error.details);
    
    return NextResponse.json(
      {
        error: true,
        message: 'Erreur lors de la récupération des informations de livraison depuis Shopify.',
        type: error.type,
        details: error.details || error.message,
      },
      {
        status: 500, // Internal Server Error
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );

  } catch (error: unknown) {
    // Erreur inattendue (exception non gérée)
    console.error('❌ Erreur serveur shipping info (exception non gérée):', error);
    
    return NextResponse.json(
      { 
        error: true,
        message: 'Erreur inattendue lors de la récupération des informations de livraison.',
        type: 'UNKNOWN',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
        },
      }
    );
  }
}

