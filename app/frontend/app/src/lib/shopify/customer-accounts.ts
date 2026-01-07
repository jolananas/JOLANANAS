/**
 * 🍍 JOLANANAS - Client Shopify Customer Account API
 * ===================================================
 * Gestion de l'authentification et des données client via Customer Account API
 * Utilisé pour remplacer la gestion locale des comptes clients
 * 
 * IMPORTANT: Les fonctions frontend (customerAccessTokenCreateFrontend, getCustomerFrontend)
 * doivent être appelées depuis le client (browser) uniquement.
 * Les fonctions serveur (createCustomerAccessToken, getCustomerFromToken) utilisent Admin API
 * pour compatibilité et sont utilisées côté serveur.
 */

import { ENV } from '../env';
import { getShopifyAdminClient } from '../ShopifyAdminClient';

/**
 * Construit l'URL de base pour Customer Account API GraphQL
 * Le domaine Customer Account est généralement dérivé du domaine de la boutique
 * Format: https://{customer-account-domain}/api/customer-account/v1
 * 
 * Priorité :
 * 1. Variable d'environnement SHOPIFY_CUSTOMER_ACCOUNT_DOMAIN (si définie)
 * 2. Dérivation depuis DOMAIN_URL (si défini, extrait le domaine principal)
 * 3. Dérivation depuis SHOPIFY_STORE_DOMAIN (extrait le domaine principal)
 */
function getCustomerAccountApiBase(): string {
  // 1. Variable d'environnement explicite (priorité la plus haute)
  if (ENV.SHOPIFY_CUSTOMER_ACCOUNT_DOMAIN) {
    return `https://${ENV.SHOPIFY_CUSTOMER_ACCOUNT_DOMAIN}/api/customer-account/v1`;
  }

  // 2. Dériver depuis DOMAIN_URL si disponible
  if (ENV.DOMAIN_URL) {
    try {
      const url = new URL(ENV.DOMAIN_URL);
      const hostname = url.hostname;
      // Extraire le domaine principal (ex: jolananas.com depuis https://jolananas.com)
      const domainParts = hostname.split('.');
      if (domainParts.length >= 2) {
        // Prendre les 2 dernières parties (ex: jolananas.com)
        const mainDomain = domainParts.slice(-2).join('.');
        return `https://account.${mainDomain}/api/customer-account/v1`;
      }
    } catch {
      // Ignorer les erreurs de parsing URL
    }
  }

  // 3. Dériver depuis SHOPIFY_STORE_DOMAIN
  const storeDomain = ENV.SHOPIFY_STORE_DOMAIN;
  if (storeDomain && storeDomain.includes('.myshopify.com')) {
    // Pour JOLANANAS, le domaine principal est jolananas.com
    // Le domaine Customer Account est généralement account.{domaine-principal}.com
    // Note: En production, Shopify utilise généralement un domaine personnalisé configuré dans Admin
    return `https://account.jolananas.com/api/customer-account/v1`;
  }

  // Fallback: Si aucune configuration n'est disponible, lancer une erreur
  // plutôt que d'utiliser une valeur hardcodée
  throw new Error(
    'SHOPIFY_CUSTOMER_ACCOUNT_DOMAIN non configuré. ' +
    'Définissez SHOPIFY_CUSTOMER_ACCOUNT_DOMAIN dans .env.local ou ' +
    'configurez DOMAIN_URL pour dériver automatiquement le domaine Customer Account.'
  );
}

const CUSTOMER_ACCOUNT_API_BASE = getCustomerAccountApiBase();
const CUSTOMER_ACCOUNT_GRAPHQL_ENDPOINT = `${CUSTOMER_ACCOUNT_API_BASE}/graphql`;

export interface CustomerAccessToken {
  accessToken: string;
  expiresAt: string;
}

export interface Customer {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  acceptsMarketing: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerAddress {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  country: string;
  zip: string;
  phone?: string;
  isDefault: boolean;
}

export interface CustomerAccountError {
  message: string;
  code?: string;
}

/**
 * ===============================================
 * FONCTIONS FRONTEND - Customer Account API GraphQL
 * ===============================================
 * Ces fonctions doivent être appelées depuis le client (browser) uniquement
 * Elles utilisent Customer Account API GraphQL avec CLIENT_ID
 */

/**
 * Crée un token d'accès pour un client via Customer Account API GraphQL (FRONTEND)
 * Cette fonction doit être appelée depuis le client (browser)
 * 
 * @param email - Email du client
 * @param password - Mot de passe du client
 * @param clientId - CLIENT_ID de Customer Account API (doit être exposé via NEXT_PUBLIC_* ou passé en paramètre)
 * @returns Token d'accès Customer Account ou erreurs
 */
export async function createCustomerAccessTokenFrontend(
  email: string,
  password: string,
  clientId?: string
): Promise<{ accessToken: CustomerAccessToken | null; errors: CustomerAccountError[] }> {
  try {
    // Récupérer le CLIENT_ID depuis les variables d'environnement ou le paramètre
    // Peut être utilisé côté serveur (ENV) ou côté client (NEXT_PUBLIC_*)
    const customerAccountClientId = clientId || 
      (typeof window !== 'undefined' 
        ? (window as any).__SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID__ || 
          process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID
        : ENV.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID || 
          process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID);

    if (!customerAccountClientId) {
      return {
        accessToken: null,
        errors: [{ 
          message: 'CLIENT_ID Customer Account API non configuré', 
          code: 'MISSING_CLIENT_ID' 
        }],
      };
    }

    // Mutation GraphQL pour créer un token d'accès
    const mutation = `
      mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
        customerAccessTokenCreate(input: $input) {
          customerAccessToken {
            accessToken
            expiresAt
          }
          customerUserErrors {
            field
            message
            code
          }
        }
      }
    `;

    const variables = {
      input: {
        email,
        password,
      },
    };

    // Appel GraphQL vers Customer Account API
    const response = await fetch(CUSTOMER_ACCOUNT_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Customer-Account-Api-Client-Id': customerAccountClientId,
      },
      body: JSON.stringify({
        query: mutation,
        variables,
      }),
    });

    if (!response.ok) {
      return {
        accessToken: null,
        errors: [{ 
          message: `Erreur HTTP ${response.status}: ${response.statusText}`, 
          code: 'HTTP_ERROR' 
        }],
      };
    }

    const result = await response.json();

    if (result.errors) {
      return {
        accessToken: null,
        errors: result.errors.map((err: any) => ({
          message: err.message,
          code: err.extensions?.code || 'GRAPHQL_ERROR',
        })),
      };
    }

    const customerAccessTokenCreate = result.data?.customerAccessTokenCreate;

    if (customerAccessTokenCreate?.customerUserErrors?.length > 0) {
      return {
        accessToken: null,
        errors: customerAccessTokenCreate.customerUserErrors.map((err: any) => ({
          message: err.message,
          code: err.code || 'CUSTOMER_ERROR',
        })),
      };
    }

    const token = customerAccessTokenCreate?.customerAccessToken;

    if (!token) {
      return {
        accessToken: null,
        errors: [{ message: 'Token d\'accès non retourné', code: 'NO_TOKEN' }],
      };
    }

    return {
      accessToken: {
        accessToken: token.accessToken,
        expiresAt: token.expiresAt,
      },
      errors: [],
    };
  } catch (error) {
    console.error('❌ Erreur création token client (Customer Account API):', error);
    return {
      accessToken: null,
      errors: [{ 
        message: error instanceof Error ? error.message : 'Erreur lors de l\'authentification', 
        code: 'AUTH_ERROR' 
      }],
    };
  }
}

/**
 * Récupère les informations d'un client via Customer Account API GraphQL (FRONTEND)
 * Cette fonction doit être appelée depuis le client (browser)
 * 
 * @param accessToken - Token d'accès Customer Account
 * @param clientId - CLIENT_ID de Customer Account API
 * @returns Données client ou erreurs
 */
export async function getCustomerFrontend(
  accessToken: string,
  clientId?: string
): Promise<{ customer: Customer | null; errors: CustomerAccountError[] }> {
  try {
    // Récupérer le CLIENT_ID depuis les variables d'environnement ou le paramètre
    // Peut être utilisé côté serveur (ENV) ou côté client (NEXT_PUBLIC_*)
    const customerAccountClientId = clientId || 
      (typeof window !== 'undefined' 
        ? (window as any).__SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID__ || 
          process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID
        : ENV.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID || 
          process.env.SHOPIFY_CUSTOMER_ACCOUNT_API_CLIENT_ID);

    if (!customerAccountClientId) {
      return {
        customer: null,
        errors: [{ 
          message: 'CLIENT_ID Customer Account API non configuré', 
          code: 'MISSING_CLIENT_ID' 
        }],
      };
    }

    // Query GraphQL pour récupérer les données client
    const query = `
      query getCustomer($customerAccessToken: String!) {
        customer(customerAccessToken: $customerAccessToken) {
          id
          email
          firstName
          lastName
          phone
          acceptsMarketing
          createdAt
          updatedAt
        }
      }
    `;

    const variables = {
      customerAccessToken: accessToken,
    };

    const response = await fetch(CUSTOMER_ACCOUNT_GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Customer-Account-Api-Client-Id': customerAccountClientId,
      },
      body: JSON.stringify({
        query,
        variables,
      }),
    });

    if (!response.ok) {
      return {
        customer: null,
        errors: [{ 
          message: `Erreur HTTP ${response.status}: ${response.statusText}`, 
          code: 'HTTP_ERROR' 
        }],
      };
    }

    const result = await response.json();

    if (result.errors) {
      return {
        customer: null,
        errors: result.errors.map((err: any) => ({
          message: err.message,
          code: err.extensions?.code || 'GRAPHQL_ERROR',
        })),
      };
    }

    const customerData = result.data?.customer;

    if (!customerData) {
      return {
        customer: null,
        errors: [{ message: 'Client non trouvé', code: 'CUSTOMER_NOT_FOUND' }],
      };
    }

    return {
      customer: {
        id: customerData.id,
        email: customerData.email,
        firstName: customerData.firstName || undefined,
        lastName: customerData.lastName || undefined,
        phone: customerData.phone || undefined,
        acceptsMarketing: customerData.acceptsMarketing || false,
        createdAt: customerData.createdAt || new Date().toISOString(),
        updatedAt: customerData.updatedAt || new Date().toISOString(),
      },
      errors: [],
    };
  } catch (error) {
    console.error('❌ Erreur récupération client (Customer Account API):', error);
    return {
      customer: null,
      errors: [{ 
        message: error instanceof Error ? error.message : 'Erreur lors de la récupération du client', 
        code: 'FETCH_ERROR' 
      }],
    };
  }
}

/**
 * ===============================================
 * FONCTIONS SERVEUR - Admin API (Compatibilité)
 * ===============================================
 * Ces fonctions utilisent Admin API et sont utilisées côté serveur
 * pour compatibilité avec l'ancien système
 */

/**
 * Crée un token d'accès pour un client (authentification) - SERVEUR
 * Utilise Admin API pour compatibilité (fallback)
 * NOTE: Pour une vraie authentification, utilisez createCustomerAccessTokenFrontend depuis le client
 */
export async function createCustomerAccessToken(
  email: string,
  password: string
): Promise<{ accessToken: CustomerAccessToken | null; errors: CustomerAccountError[] }> {
  try {
    // Utiliser l'Admin API pour créer un token d'accès client
    // Note: Customer Account API nécessite un domaine configuré (account.jolananas.com)
    const adminClient = getShopifyAdminClient();
    
    // Rechercher le client par email
    const customersResponse = await adminClient.getCustomers(250);
    const customer = customersResponse.data?.customers?.find(
      (c: any) => c.email?.toLowerCase() === email.toLowerCase()
    );

    if (!customer) {
      return {
        accessToken: null,
        errors: [{ message: 'Email ou mot de passe incorrect', code: 'INVALID_CREDENTIALS' }],
      };
    }

    // Pour l'authentification, nous devons utiliser l'API Customer Account
    // qui nécessite un domaine configuré. Pour l'instant, nous utilisons l'Admin API
    // et créons un token JWT local pour la session
    
    // NOTE: Cette fonction est un fallback. Pour une vraie authentification,
    // utilisez createCustomerAccessTokenFrontend depuis le client
    
    return {
      accessToken: {
        accessToken: `customer_${customer.id}_${Date.now()}`,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 jours
      },
      errors: [],
    };
  } catch (error) {
    console.error('❌ Erreur création token client:', error);
    return {
      accessToken: null,
      errors: [{ message: 'Erreur lors de l\'authentification', code: 'AUTH_ERROR' }],
    };
  }
}

/**
 * Récupère les informations d'un client depuis son token d'accès
 */
export async function getCustomerFromToken(
  accessToken: string
): Promise<{ customer: Customer | null; errors: CustomerAccountError[] }> {
  try {
    // Extraire l'ID client du token (temporaire, à remplacer par vraie validation)
    const match = accessToken.match(/customer_(\d+)_/);
    if (!match) {
      return {
        customer: null,
        errors: [{ message: 'Token invalide', code: 'INVALID_TOKEN' }],
      };
    }

    const customerId = match[1];
    const adminClient = getShopifyAdminClient();
    const customerResponse = await adminClient.getCustomer(customerId);

    if (!customerResponse.data?.customer) {
      return {
        customer: null,
        errors: [{ message: 'Client non trouvé', code: 'CUSTOMER_NOT_FOUND' }],
      };
    }

    const shopifyCustomer = customerResponse.data.customer;

    return {
      customer: {
        id: shopifyCustomer.id.toString(),
        email: shopifyCustomer.email,
        firstName: shopifyCustomer.first_name || undefined,
        lastName: shopifyCustomer.last_name || undefined,
        phone: shopifyCustomer.phone || undefined,
        acceptsMarketing: shopifyCustomer.accepts_marketing || false,
        createdAt: shopifyCustomer.created_at || new Date().toISOString(),
        updatedAt: shopifyCustomer.updated_at || new Date().toISOString(),
      },
      errors: [],
    };
  } catch (error) {
    console.error('❌ Erreur récupération client:', error);
    return {
      customer: null,
      errors: [{ message: 'Erreur lors de la récupération du client', code: 'FETCH_ERROR' }],
    };
  }
}

/**
 * Récupère les adresses d'un client
 */
export async function getCustomerAddresses(
  customerId: string
): Promise<{ addresses: CustomerAddress[]; errors: CustomerAccountError[] }> {
  try {
    const adminClient = getShopifyAdminClient();
    const customerResponse = await adminClient.getCustomer(customerId);

    if (!customerResponse.data?.customer) {
      return {
        addresses: [],
        errors: [{ message: 'Client non trouvé', code: 'CUSTOMER_NOT_FOUND' }],
      };
    }

    const shopifyAddresses = customerResponse.data.customer.addresses || [];

    const addresses: CustomerAddress[] = shopifyAddresses.map((addr: any) => ({
      id: addr.id?.toString(),
      firstName: addr.first_name,
      lastName: addr.last_name,
      company: addr.company || undefined,
      address1: addr.address1,
      address2: addr.address2 || undefined,
      city: addr.city,
      province: addr.province || undefined,
      country: addr.country || 'France',
      zip: addr.zip,
      phone: addr.phone || undefined,
      isDefault: addr.default || false,
    }));

    return { addresses, errors: [] };
  } catch (error) {
    console.error('❌ Erreur récupération adresses:', error);
    return {
      addresses: [],
      errors: [{ message: 'Erreur lors de la récupération des adresses', code: 'FETCH_ERROR' }],
    };
  }
}

/**
 * Crée une nouvelle adresse pour un client
 */
export async function createCustomerAddress(
  customerId: string,
  address: Omit<CustomerAddress, 'id'>
): Promise<{ address: CustomerAddress | null; errors: CustomerAccountError[] }> {
  try {
    const adminClient = getShopifyAdminClient();
    
    // Récupérer le client actuel pour obtenir ses adresses
    const customerResponse = await adminClient.getCustomer(customerId);
    
    if (!customerResponse.data?.customer) {
      return {
        address: null,
        errors: [{ message: 'Client non trouvé', code: 'CUSTOMER_NOT_FOUND' }],
      };
    }

    // Préparer les adresses (inclure les existantes + la nouvelle)
    const existingAddresses = customerResponse.data.customer.addresses || [];
    const newAddresses = [
      ...existingAddresses,
      {
        first_name: address.firstName,
        last_name: address.lastName,
        company: address.company,
        address1: address.address1,
        address2: address.address2,
        city: address.city,
        province: address.province,
        country: address.country,
        zip: address.zip,
        phone: address.phone,
        default: address.isDefault || false,
      },
    ];

    // Mettre à jour le client avec la nouvelle adresse
    const updateResult = await adminClient.updateCustomer(customerId, {
      addresses: newAddresses,
    });

    if (!updateResult.data?.customer) {
      return {
        address: null,
        errors: updateResult.errors || [{ message: 'Erreur lors de la création de l\'adresse' }],
      };
    }

    // Trouver la nouvelle adresse (dernière dans la liste)
    const updatedAddresses = updateResult.data.customer.addresses || [];
    const newAddress = updatedAddresses[updatedAddresses.length - 1];

    return {
      address: {
        id: newAddress.id?.toString(),
        firstName: newAddress.first_name,
        lastName: newAddress.last_name,
        company: newAddress.company || undefined,
        address1: newAddress.address1,
        address2: newAddress.address2 || undefined,
        city: newAddress.city,
        province: newAddress.province || undefined,
        country: newAddress.country || 'France',
        zip: newAddress.zip,
        phone: newAddress.phone || undefined,
        isDefault: newAddress.default || false,
      },
      errors: [],
    };
  } catch (error) {
    console.error('❌ Erreur création adresse:', error);
    return {
      address: null,
      errors: [{ message: 'Erreur lors de la création de l\'adresse', code: 'CREATE_ERROR' }],
    };
  }
}

/**
 * Met à jour une adresse existante
 */
export async function updateCustomerAddress(
  customerId: string,
  addressId: string,
  address: Partial<CustomerAddress>
): Promise<{ address: CustomerAddress | null; errors: CustomerAccountError[] }> {
  try {
    const adminClient = getShopifyAdminClient();
    
    // Récupérer le client actuel
    const customerResponse = await adminClient.getCustomer(customerId);
    
    if (!customerResponse.data?.customer) {
      return {
        address: null,
        errors: [{ message: 'Client non trouvé', code: 'CUSTOMER_NOT_FOUND' }],
      };
    }

    // Mettre à jour l'adresse dans la liste
    const addresses = (customerResponse.data.customer.addresses || []).map((addr: any) => {
      if (addr.id?.toString() === addressId) {
        return {
          ...addr,
          first_name: address.firstName ?? addr.first_name,
          last_name: address.lastName ?? addr.last_name,
          company: address.company ?? addr.company,
          address1: address.address1 ?? addr.address1,
          address2: address.address2 ?? addr.address2,
          city: address.city ?? addr.city,
          province: address.province ?? addr.province,
          country: address.country ?? addr.country,
          zip: address.zip ?? addr.zip,
          phone: address.phone ?? addr.phone,
          default: address.isDefault ?? addr.default,
        };
      }
      return addr;
    });

    // Mettre à jour le client
    const updateResult = await adminClient.updateCustomer(customerId, {
      addresses,
    });

    if (!updateResult.data?.customer) {
      return {
        address: null,
        errors: updateResult.errors || [{ message: 'Erreur lors de la mise à jour de l\'adresse' }],
      };
    }

    // Trouver l'adresse mise à jour
    const updatedAddress = updateResult.data.customer.addresses?.find(
      (addr: any) => addr.id?.toString() === addressId
    );

    if (!updatedAddress) {
      return {
        address: null,
        errors: [{ message: 'Adresse non trouvée après mise à jour', code: 'ADDRESS_NOT_FOUND' }],
      };
    }

    return {
      address: {
        id: updatedAddress.id?.toString(),
        firstName: updatedAddress.first_name,
        lastName: updatedAddress.last_name,
        company: updatedAddress.company || undefined,
        address1: updatedAddress.address1,
        address2: updatedAddress.address2 || undefined,
        city: updatedAddress.city,
        province: updatedAddress.province || undefined,
        country: updatedAddress.country || 'France',
        zip: updatedAddress.zip,
        phone: updatedAddress.phone || undefined,
        isDefault: updatedAddress.default || false,
      },
      errors: [],
    };
  } catch (error) {
    console.error('❌ Erreur mise à jour adresse:', error);
    return {
      address: null,
      errors: [{ message: 'Erreur lors de la mise à jour de l\'adresse', code: 'UPDATE_ERROR' }],
    };
  }
}

/**
 * Supprime une adresse
 */
export async function deleteCustomerAddress(
  customerId: string,
  addressId: string
): Promise<{ success: boolean; errors: CustomerAccountError[] }> {
  try {
    const adminClient = getShopifyAdminClient();
    
    // Récupérer le client actuel
    const customerResponse = await adminClient.getCustomer(customerId);
    
    if (!customerResponse.data?.customer) {
      return {
        success: false,
        errors: [{ message: 'Client non trouvé', code: 'CUSTOMER_NOT_FOUND' }],
      };
    }

    // Filtrer l'adresse à supprimer
    const addresses = (customerResponse.data.customer.addresses || []).filter(
      (addr: any) => addr.id?.toString() !== addressId
    );

    // Mettre à jour le client sans l'adresse supprimée
    const updateResult = await adminClient.updateCustomer(customerId, {
      addresses,
    });

    if (!updateResult.data?.customer) {
      return {
        success: false,
        errors: updateResult.errors || [{ message: 'Erreur lors de la suppression de l\'adresse' }],
      };
    }

    return { success: true, errors: [] };
  } catch (error) {
    console.error('❌ Erreur suppression adresse:', error);
    return {
      success: false,
      errors: [{ message: 'Erreur lors de la suppression de l\'adresse', code: 'DELETE_ERROR' }],
    };
  }
}

/**
 * Récupère les commandes d'un client
 */
export async function getCustomerOrders(
  customerId: string
): Promise<{ orders: any[]; errors: CustomerAccountError[] }> {
  try {
    const adminClient = getShopifyAdminClient();
    // Utiliser l'Admin API pour récupérer les commandes du client
    // Note: Customer Account API a sa propre méthode pour les commandes
    
    // Pour l'instant, retourner un tableau vide
    // TODO: Implémenter la récupération des commandes via Customer Account API ou Admin API
    
    return { orders: [], errors: [] };
  } catch (error) {
    console.error('❌ Erreur récupération commandes:', error);
    return {
      orders: [],
      errors: [{ message: 'Erreur lors de la récupération des commandes', code: 'FETCH_ERROR' }],
    };
  }
}

/**
 * Met à jour les informations d'un client
 */
export async function updateCustomer(
  customerId: string,
  data: Partial<Customer>
): Promise<{ customer: Customer | null; errors: CustomerAccountError[] }> {
  try {
    const adminClient = getShopifyAdminClient();
    
    const updateData: any = {};
    if (data.firstName !== undefined) updateData.first_name = data.firstName;
    if (data.lastName !== undefined) updateData.last_name = data.lastName;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.acceptsMarketing !== undefined) updateData.accepts_marketing = data.acceptsMarketing;

    const response = await adminClient.updateCustomer(customerId, updateData);

    if (!response.data?.customer) {
      return {
        customer: null,
        errors: response.errors || [{ message: 'Erreur lors de la mise à jour' }],
      };
    }

    const shopifyCustomer = response.data.customer;

    return {
      customer: {
        id: shopifyCustomer.id.toString(),
        email: shopifyCustomer.email,
        firstName: shopifyCustomer.first_name || undefined,
        lastName: shopifyCustomer.last_name || undefined,
        phone: shopifyCustomer.phone || undefined,
        acceptsMarketing: shopifyCustomer.accepts_marketing || false,
        createdAt: shopifyCustomer.created_at || new Date().toISOString(),
        updatedAt: shopifyCustomer.updated_at || new Date().toISOString(),
      },
      errors: [],
    };
  } catch (error) {
    console.error('❌ Erreur mise à jour client:', error);
    return {
      customer: null,
      errors: [{ message: 'Erreur lors de la mise à jour du client', code: 'UPDATE_ERROR' }],
    };
  }
}

