/**
 * 🍍 JOLANANAS - Authentification Shopify Customer Accounts
 * ==========================================================
 * Fonctions d'authentification utilisant Shopify Customer Account API
 * Remplace l'authentification locale avec NextAuth Credentials
 */

import { 
  createCustomerAccessToken, 
  createCustomerAccessTokenFrontend,
  getCustomerFromToken,
  getCustomerFrontend,
  type Customer,
  type CustomerAccessToken 
} from './customer-accounts';
import { getShopifyAdminClient } from '../ShopifyAdminClient';
import { ENV } from '../env';

export interface AuthResult {
  success: boolean;
  customer?: Customer;
  accessToken?: CustomerAccessToken;
  errors?: Array<{ message: string; code?: string }>;
}

/**
 * Authentifie un client avec email et mot de passe
 * Utilise Shopify Customer Account API GraphQL (frontend) si CLIENT_ID disponible,
 * sinon utilise Admin API (fallback serveur)
 */
export async function authenticateCustomer(
  email: string,
  password: string
): Promise<AuthResult> {
  try {
    // Essayer d'utiliser Customer Account API GraphQL si CLIENT_ID disponible
    const clientId = ENV.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID;
    
    if (clientId) {
      // Utiliser Customer Account API GraphQL (vraie authentification)
      const tokenResult = await createCustomerAccessTokenFrontend(email, password, clientId);

      if (tokenResult.errors.length > 0 || !tokenResult.accessToken) {
        return {
          success: false,
          errors: tokenResult.errors,
        };
      }

      // Récupérer les informations du client depuis le token
      const customerResult = await getCustomerFrontend(tokenResult.accessToken.accessToken, clientId);

      if (customerResult.errors.length > 0 || !customerResult.customer) {
        return {
          success: false,
          errors: customerResult.errors,
        };
      }

      return {
        success: true,
        customer: customerResult.customer,
        accessToken: tokenResult.accessToken,
      };
    } else {
      // Fallback : utiliser Admin API (ancien système)
      console.warn('⚠️ SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID non configuré, utilisation Admin API (fallback)');
      
      const tokenResult = await createCustomerAccessToken(email, password);

      if (tokenResult.errors.length > 0 || !tokenResult.accessToken) {
        return {
          success: false,
          errors: tokenResult.errors,
        };
      }

      // Récupérer les informations du client depuis le token
      const customerResult = await getCustomerFromToken(tokenResult.accessToken.accessToken);

      if (customerResult.errors.length > 0 || !customerResult.customer) {
        return {
          success: false,
          errors: customerResult.errors,
        };
      }

      return {
        success: true,
        customer: customerResult.customer,
        accessToken: tokenResult.accessToken,
      };
    }
  } catch (error) {
    console.error('❌ Erreur authentification client:', error);
    return {
      success: false,
      errors: [{ message: 'Erreur lors de l\'authentification', code: 'AUTH_ERROR' }],
    };
  }
}

/**
 * Récupère les informations d'un client depuis son token d'accès
 */
export async function getCustomerFromAccessToken(
  accessToken: string
): Promise<Customer | null> {
  try {
    const result = await getCustomerFromToken(accessToken);
    return result.customer || null;
  } catch (error) {
    console.error('❌ Erreur récupération client depuis token:', error);
    return null;
  }
}

/**
 * Crée un nouveau client dans Shopify
 * Utilisé lors de l'inscription
 */
export async function createCustomer(
  email: string,
  password: string,
  firstName?: string,
  lastName?: string,
  phone?: string
): Promise<AuthResult> {
  try {
    const adminClient = getShopifyAdminClient();

    // Créer le client via Admin API
    const createResult = await adminClient.createCustomer({
      email: email.toLowerCase(),
      first_name: firstName,
      last_name: lastName,
      phone: phone,
      password: password,
      password_confirmation: password,
      send_email_welcome: false, // Ne pas envoyer l'email de bienvenue automatiquement
    });

    if (!createResult.data?.customer) {
      return {
        success: false,
        errors: createResult.errors || [{ message: 'Erreur lors de la création du compte' }],
      };
    }

    const shopifyCustomer = createResult.data.customer;

    // Créer un token d'accès pour le nouveau client
    const tokenResult = await createCustomerAccessToken(email, password);

    const customer: Customer = {
      id: shopifyCustomer.id.toString(),
      email: shopifyCustomer.email || email,
      firstName: shopifyCustomer.first_name || firstName,
      lastName: shopifyCustomer.last_name || lastName,
      phone: shopifyCustomer.phone || phone,
      acceptsMarketing: shopifyCustomer.accepts_marketing || false,
      createdAt: shopifyCustomer.created_at || new Date().toISOString(),
      updatedAt: shopifyCustomer.updated_at || new Date().toISOString(),
    };

    return {
      success: true,
      customer,
      accessToken: tokenResult.accessToken || undefined,
    };
  } catch (error) {
    console.error('❌ Erreur création client:', error);
    return {
      success: false,
      errors: [{ message: 'Erreur lors de la création du compte', code: 'CREATE_ERROR' }],
    };
  }
}

/**
 * Vérifie si un email existe déjà dans Shopify
 */
export async function checkEmailExists(email: string): Promise<boolean> {
  try {
    const adminClient = getShopifyAdminClient();
    const customersResponse = await adminClient.getCustomers(250);
    
    const exists = customersResponse.data?.customers?.some(
      (c: any) => c.email?.toLowerCase() === email.toLowerCase()
    );

    return exists || false;
  } catch (error) {
    console.error('❌ Erreur vérification email:', error);
    return false;
  }
}

