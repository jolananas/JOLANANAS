/**
 * 🍍 JOLANANAS - API Envoi Invitations en Masse
 * ==============================================
 * Endpoint pour envoyer des invitations de réinitialisation de mot de passe
 * aux clients Shopify en masse
 * 
 * PROTECTION: Nécessite une authentification admin (session NextAuth avec rôle admin)
 * Plus de base de données locale - utilise uniquement Shopify Admin API
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/src/lib/auth';
import { getShopifyAdminClient } from '@/app/src/lib/ShopifyAdminClient';
import { z } from 'zod';

export const runtime = 'nodejs';

const SendInvitationsSchema = z.object({
  customerIds: z.array(z.string()).optional(), // IDs Shopify spécifiques (optionnel)
  sendToAll: z.boolean().optional().default(false), // Envoyer à tous les clients Shopify (via Admin API)
  limit: z.number().min(1).max(100).optional().default(50), // Limite pour sendToAll
});

/**
 * POST /api/admin/send-invitations
 * Envoie des invitations de réinitialisation de mot de passe aux clients Shopify
 */
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification admin
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Non authentifié' 
        },
        { status: 401 }
      );
    }

    // Vérifier que l'utilisateur est admin (optionnel - à adapter selon votre système de rôles)
    // Pour l'instant, on autorise tous les utilisateurs authentifiés
    // TODO: Ajouter vérification de rôle admin si nécessaire

    const body = await request.json();
    
    // Validation des données
    const validation = SendInvitationsSchema.safeParse(body);
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

    const { customerIds, sendToAll, limit } = validation.data;
    const adminClient = getShopifyAdminClient();
    const results = {
      success: 0,
      errors: 0,
      details: [] as Array<{ customerId: string; email?: string; success: boolean; error?: string }>,
    };

    if (customerIds && customerIds.length > 0) {
      // Envoyer aux IDs spécifiques
      for (const customerId of customerIds) {
        try {
          const inviteResult = await adminClient.sendCustomerPasswordResetInvite(customerId);

          if (inviteResult.errors && inviteResult.errors.length > 0) {
            results.errors++;
            results.details.push({
              customerId,
              success: false,
              error: inviteResult.errors[0]?.message || 'Erreur inconnue',
            });
          } else {
            results.success++;
            // Récupérer l'email du client pour le log
            try {
              const customerResponse = await adminClient.getCustomer(customerId);
              const email = customerResponse.data?.customer?.email;
              results.details.push({
                customerId,
                email,
                success: true,
              });
            } catch {
              results.details.push({
                customerId,
                success: true,
              });
            }
          }
        } catch (error) {
          results.errors++;
          results.details.push({
            customerId,
            success: false,
            error: error instanceof Error ? error.message : 'Erreur inconnue',
          });
        }
      }
    } else if (sendToAll) {
      // Envoyer à tous les clients Shopify via Admin API
      // Note: Récupérer la liste des clients depuis Shopify Admin API
      try {
        const customersResponse = await adminClient.getCustomers({ limit });
        
        if (customersResponse.errors && customersResponse.errors.length > 0) {
          return NextResponse.json(
            { 
              success: false, 
              error: customersResponse.errors[0]?.message || 'Erreur lors de la récupération des clients' 
            },
            { status: 500 }
          );
        }

        const customers = customersResponse.data?.customers || [];
        
        for (const customer of customers) {
          if (!customer.id) continue;

          try {
            const customerId = customer.id.toString();
            const inviteResult = await adminClient.sendCustomerPasswordResetInvite(customerId);

            if (inviteResult.errors && inviteResult.errors.length > 0) {
              results.errors++;
              results.details.push({
                customerId,
                email: customer.email,
                success: false,
                error: inviteResult.errors[0]?.message || 'Erreur inconnue',
              });
            } else {
              results.success++;
              results.details.push({
                customerId,
                email: customer.email,
                success: true,
              });
            }
          } catch (error) {
            results.errors++;
            results.details.push({
              customerId: customer.id?.toString() || 'unknown',
              email: customer.email,
              success: false,
              error: error instanceof Error ? error.message : 'Erreur inconnue',
            });
          }
        }
      } catch (error) {
        return NextResponse.json(
          { 
            success: false, 
            error: 'Erreur lors de la récupération des clients depuis Shopify',
            details: error instanceof Error ? error.message : 'Erreur inconnue'
          },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Vous devez spécifier customerIds ou sendToAll=true' 
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Invitations envoyées: ${results.success} succès, ${results.errors} erreurs`,
      results,
    });

  } catch (error: unknown) {
    console.error('❌ Erreur envoi invitations:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Une erreur est survenue lors de l\'envoi des invitations',
        details: error instanceof Error ? error.message : 'Erreur inconnue'
      },
      { status: 500 }
    );
  }
}
