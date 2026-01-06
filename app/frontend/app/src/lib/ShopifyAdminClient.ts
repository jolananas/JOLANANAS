/**
 * 🍍 JOLANANAS - Client Shopify Admin API (Privé)
 * ================================================
 * Client REST pour l'API privée Shopify Admin
 * Accès complet aux commandes, clients, inventaire, webhooks
 * 
 * ⚠️ SERVER-ONLY : Ce fichier ne peut être utilisé que côté serveur
 */

import 'server-only';

import { ENV } from './env';
import { normalizeDataForAPI, sanitizeStringForByteString, normalizeHeaderValue } from './utils/formatters';

// Configuration Admin API (privée)
const ADMIN_CONFIG = {
  domain: ENV.SHOPIFY_STORE_DOMAIN,
  adminToken: ENV.SHOPIFY_ADMIN_TOKEN!,
  apiVersion: ENV.SHOPIFY_API_VERSION,
};

// Vérification de la configuration en développement
if (ENV.NODE_ENV === 'development') {
  if (!ADMIN_CONFIG.adminToken || ADMIN_CONFIG.adminToken.length < 20) {
    console.warn('⚠️ SHOPIFY_ADMIN_TOKEN semble invalide ou manquant. Vérifiez votre fichier .env.local');
  } else {
    // Masquer le token pour la sécurité (afficher seulement les 10 premiers caractères)
    const tokenPreview = ADMIN_CONFIG.adminToken.substring(0, 10) + '...';
    console.log('✅ Shopify Admin API configuré:', {
      domain: ADMIN_CONFIG.domain,
      apiVersion: ADMIN_CONFIG.apiVersion,
      tokenPreview: tokenPreview,
    });
  }
}

export interface AdminConfig {
  domain: string;
  adminToken: string;
  apiVersion: string;
}

export interface AdminResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export class ShopifyAdminClient {
  private config: AdminConfig;
  private baseUrl: string;

  constructor(config: AdminConfig = ADMIN_CONFIG) {
    this.config = config;
    this.baseUrl = `https://${this.config.domain}/admin/api/${this.config.apiVersion}`;
    
    console.log('✅ Shopify Admin Client initialisé:', this.config.domain);
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<AdminResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      
      // Normaliser le body JSON pour éviter les erreurs ByteString
      // CRITIQUE : Nettoyer AVANT JSON.stringify si possible, sinon nettoyer après
      let normalizedBody: BodyInit | null | undefined = options.body;
      if (normalizedBody && typeof normalizedBody === 'string') {
        // Créer une variable locale de type string pour TypeScript
        let bodyString: string = normalizedBody;
        // Vérifier s'il y a des caractères > 255 AVANT nettoyage pour le débogage
        const problematicChars: Array<{ index: number; char: string; code: number; context: string; jsonPath: string }> = [];
        for (let i = 0; i < bodyString.length; i++) {
          const code = bodyString.charCodeAt(i);
          if (code > 255) {
            // Identifier le chemin dans le JSON pour faciliter le débogage
            let jsonPath = 'unknown';
            try {
              const beforeContext = bodyString.substring(0, i);
              // Chercher tous les champs JSON avant l'index problématique
              const fieldMatches = beforeContext.match(/"([^"]+)":/g);
              if (fieldMatches && fieldMatches.length > 0) {
                // Prendre les 3 derniers champs pour avoir le chemin complet
                const recentFields = fieldMatches.slice(-3).map(m => m.replace(/"/g, '').replace(':', ''));
                jsonPath = recentFields.join('.');
              }
            } catch {
              // Ignorer les erreurs de parsing
            }
            
            problematicChars.push({
              index: i,
              char: bodyString[i],
              code: code,
              context: bodyString.substring(Math.max(0, i - 30), Math.min(bodyString.length, i + 30)),
              jsonPath: jsonPath
            });
          }
        }
        
        if (problematicChars.length > 0) {
          console.error('❌ Caractères > 255 détectés dans request body AVANT nettoyage:', problematicChars);
          problematicChars.forEach(p => {
            console.error(`   - Index ${p.index}: "${p.char}" (code: ${p.code}, U+${p.code.toString(16).toUpperCase().padStart(4, '0')})`);
            console.error(`     Chemin JSON: "${p.jsonPath}"`);
            console.error(`     Contexte: "${p.context}"`);
          });
          console.error('📋 Contexte complet (premiers 500 caractères):', bodyString.substring(0, 500));
        }
        
        // CRITIQUE : Utiliser sanitizeStringForByteString pour un nettoyage complet et fiable
        // Cette fonction garantit le remplacement du caractère 8211 et de tous les autres caractères > 255
        bodyString = sanitizeStringForByteString(bodyString);
        
        // Vérification supplémentaire : remplacer tous les caractères > 255 restants (double sécurité)
        bodyString = bodyString.split('').map((char, index) => {
          const code = char.charCodeAt(0);
          if (code > 255) {
            const context = bodyString.substring(Math.max(0, index - 30), Math.min(bodyString.length, index + 30));
            console.warn(`⚠️ Remplacement caractère à l'index ${index} après sanitizeStringForByteString: "${char}" (code: ${code})`);
            console.warn(`   Contexte: "${context}"`);
            // Remplacer par un tiret simple pour les tirets Unicode, sinon un espace
            if (code === 8211 || code === 8212) return '-';
            return ' ';
          }
          return char;
        }).join('');
        
        // Vérification finale STRICTE : s'assurer qu'il n'y a plus aucun caractère > 255
        const finalCheck = bodyString.split('').findIndex((c) => c.charCodeAt(0) > 255);
        if (finalCheck !== -1) {
          const char = bodyString[finalCheck];
          const context = bodyString.substring(Math.max(0, finalCheck - 30), Math.min(bodyString.length, finalCheck + 30));
          console.error(`❌ ERREUR CRITIQUE dans request: Caractère > 255 toujours présent à l'index ${finalCheck}: "${char}" (code: ${char.charCodeAt(0)})`);
          console.error(`   Contexte: "${context}"`);
          // Remplacer par un tiret simple si c'est un tiret Unicode, sinon un espace
          const replacement = (char.charCodeAt(0) === 8211 || char.charCodeAt(0) === 8212) ? '-' : ' ';
          bodyString = bodyString.substring(0, finalCheck) + replacement + bodyString.substring(finalCheck + 1);
        }
        
        // Assigner la string nettoyée à normalizedBody
        normalizedBody = bodyString;
      }
      
      // CRITIQUE : Normaliser les headers HTTP pour éviter l'erreur ByteString
      // Les headers HTTP ne peuvent contenir que des caractères ASCII (0-255)
      // Selon Stack Overflow, c'est une source fréquente du problème
      // https://stackoverflow.com/questions/53905825/typeerror-cannot-convert-string-to-bytestring
      const normalizedAdminToken = normalizeHeaderValue(this.config.adminToken);
      
      // Normaliser tous les headers personnalisés si présents
      let normalizedCustomHeaders: Record<string, string> = {};
      if (options.headers) {
        if (options.headers instanceof Headers) {
          options.headers.forEach((value, key) => {
            normalizedCustomHeaders[key] = normalizeHeaderValue(value);
          });
        } else if (Array.isArray(options.headers)) {
          options.headers.forEach(([key, value]) => {
            normalizedCustomHeaders[key] = normalizeHeaderValue(value as string);
          });
        } else {
          Object.entries(options.headers).forEach(([key, value]) => {
            normalizedCustomHeaders[key] = normalizeHeaderValue(value as string);
          });
        }
      }
      
      let response: Response;
      let attempts = 0;
      const maxRetries = 5;

      while (true) {
        attempts++;
        response = await fetch(url, {
          ...options,
          body: normalizedBody,
          headers: {
            'Content-Type': 'application/json',
            'X-Shopify-Access-Token': normalizedAdminToken,
            ...normalizedCustomHeaders,
          },
        });

        if (response.status === 429 && attempts <= maxRetries) {
          const retryAfter = response.headers.get('Retry-After');
          const delay = retryAfter 
            ? parseInt(retryAfter, 10) * 1000 
            : 1000 * Math.pow(2, attempts - 1);
          
          console.warn(`⚠️ Shopify Admin API Rate Limit (429). Retrying in ${delay}ms... (Attempt ${attempts}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        break;
      }

      if (!response.ok) {
        // AMÉLIORÉ : Récupérer plus de détails sur l'erreur pour le débogage
        let errorData: any = {};
        let errorText = '';
        
        try {
          errorText = await response.text();
          errorData = JSON.parse(errorText);
        } catch {
          // Si le parsing JSON échoue, utiliser le texte brut
          errorData = { message: errorText || 'Erreur Admin API' };
        }
        
        // Log détaillé pour le débogage
        console.error(`❌ Erreur Shopify Admin API (${response.status}):`);
        console.error(`   URL: ${url}`);
        console.error(`   Status: ${response.status} ${response.statusText}`);
        console.error(`   Response:`, errorData);
        
        // Messages d'erreur spécifiques selon le code de statut
        let errorMessage = `HTTP ${response.status}: `;
        
        if (response.status === 401) {
          errorMessage += 'Token d\'accès invalide ou expiré. Vérifiez SHOPIFY_ADMIN_TOKEN.';
        } else if (response.status === 403) {
          errorMessage += 'Accès refusé. Vérifiez les permissions de l\'app Shopify (scopes Admin API).';
          console.error('');
          console.error('❌ ERREUR 403 : Permissions Admin API manquantes');
          console.error('');
          console.error('📋 Scopes Admin API requis (OBLIGATOIRES) :');
          console.error('   ✅ write_draft_orders - Créer et modifier des commandes brouillons');
          console.error('   ✅ read_customers - Lire les informations des clients');
          console.error('   ✅ write_customers - Créer et modifier des clients');
          console.error('');
          console.error('🔧 Instructions pour corriger :');
          console.error('   1. Accédez à Shopify Admin → Settings → Apps and sales channels → Develop apps');
          console.error('   2. Sélectionnez votre app (ou créez-en une nouvelle)');
          console.error('   3. Cliquez sur "Configure Admin API scopes"');
          console.error('   4. Cochez les scopes requis : write_draft_orders, read_customers, write_customers');
          console.error('   5. Cliquez sur "Save"');
          console.error('   6. ⚠️ IMPORTANT : Installez ou réinstallez l\'app pour obtenir l\'approbation du marchand');
          console.error('      → API credentials → Admin API access token → Install app');
          console.error('   7. Générez un nouveau token Admin si nécessaire');
          console.error('   8. Ajoutez le token dans .env.local comme SHOPIFY_ADMIN_TOKEN');
          console.error('   9. Redémarrez le serveur');
          console.error('');
          console.error('📖 Guide détaillé : app/docs/Configuration Admin API — JOLANANAS.md');
          console.error('');
        } else if (response.status === 404) {
          errorMessage += 'Ressource non trouvée. Vérifiez l\'URL et la version de l\'API.';
        } else if (errorData.errors) {
          errorMessage += Array.isArray(errorData.errors) 
            ? errorData.errors.map((e: any) => e.message || e).join(', ')
            : JSON.stringify(errorData.errors);
        } else if (errorData.message) {
          errorMessage += errorData.message;
        } else {
          errorMessage += 'Erreur Admin API';
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return { data };

    } catch (error: any) {
      console.error('❌ Erreur Shopify Admin:', error);
      
      const errors = [{ message: error.message || 'Erreur Admin API' }];
      return { errors };
    }
  }

  // ===============================================
  // COMMANDES ADMIN
  // ===============================================

  async getOrders(first: number = 50, financialStatus?: string) {
    let endpoint = `/orders.json?limit=${first}`;
    
    if (financialStatus) {
      endpoint += `&financial_status=${financialStatus}`;
    }

    return this.request(endpoint);
  }

  async getOrder(orderId: string) {
    const endpoint = `/orders/${orderId}.json`;
    return this.request(endpoint);
  }

  async updateOrder(orderId: string, orderData: any) {
    const endpoint = `/orders/${orderId}.json`;
    
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify({ order: orderData }),
    });
  }

  // ===============================================
  // CLIENTS ADMIN
  // ===============================================

  async getCustomers(first: number = 50): Promise<AdminResponse<{ customers?: any[] }>> {
    const endpoint = `/customers.json?limit=${first}`;
    return this.request<{ customers?: any[] }>(endpoint);
  }

  async getCustomer(customerId: string) {
    const endpoint = `/customers/${customerId}.json`;
    return this.request(endpoint);
  }

  async getCustomerOrders(customerId: string, limit: number = 50, page: number = 1): Promise<AdminResponse<{ orders: any[] }>> {
    const endpoint = `/orders.json?customer_id=${customerId}&limit=${limit}&page=${page}`;
    return this.request<{ orders: any[] }>(endpoint);
  }

  async deleteCustomer(customerId: string): Promise<AdminResponse<{ customer?: { id: string } }>> {
    const endpoint = `/customers/${customerId}.json`;
    return this.request<{ customer?: { id: string } }>(endpoint, {
      method: 'DELETE',
    });
  }

  async createCustomer(customerData: any) {
    const endpoint = `/customers.json`;
    
    // Normaliser toutes les données avant JSON.stringify pour éviter les erreurs ByteString
    const normalizedCustomer = normalizeDataForAPI(customerData);
    
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify({ customer: normalizedCustomer }),
    });
  }

  async updateCustomer(customerId: string, customerData: any): Promise<AdminResponse<{ customer?: any }>> {
    const endpoint = `/customers/${customerId}.json`;
    
    // Normaliser toutes les données avant JSON.stringify pour éviter les erreurs ByteString
    const normalizedCustomer = normalizeDataForAPI(customerData);
    
    return this.request<{ customer?: any }>(endpoint, {
      method: 'PUT',
      body: JSON.stringify({ customer: normalizedCustomer }),
    });
  }

  /**
   * Envoie une invitation au client pour activer son compte
   * Utilise l'endpoint /customers/{id}/send_invite.json
   * 
   * @param customerId - ID du client Shopify
   * @param customMessage - Message personnalisé pour l'invitation (optionnel)
   * @returns Réponse Admin API
   */
  async sendCustomerInvite(
    customerId: string,
    customMessage?: string
  ): Promise<AdminResponse<{ customerInvite?: { to: string; from: string; subject: string; custom_message?: string } }>> {
    const endpoint = `/customers/${customerId}/send_invite.json`;
    
    const inviteData: any = {};
    if (customMessage) {
      inviteData.custom_message = customMessage;
    }
    
    return this.request<{ customerInvite?: { to: string; from: string; subject: string; custom_message?: string } }>(endpoint, {
      method: 'POST',
      body: JSON.stringify({ customer_invite: inviteData }),
    });
  }

  /**
   * Envoie une invitation de réinitialisation de mot de passe au client
   * Utilise l'endpoint /customers/{id}/send_invite.json avec reset_password
   * 
   * @param customerId - ID du client Shopify
   * @returns Réponse Admin API
   */
  async sendCustomerPasswordResetInvite(
    customerId: string
  ): Promise<AdminResponse<{ customerInvite?: { to: string; from: string; subject: string } }>> {
    const endpoint = `/customers/${customerId}/send_invite.json`;
    
    // Envoyer une invitation avec réinitialisation de mot de passe
    return this.request<{ customerInvite?: { to: string; from: string; subject: string } }>(endpoint, {
      method: 'POST',
      body: JSON.stringify({ 
        customer_invite: {
          // Shopify enverra automatiquement une invitation de réinitialisation
        }
      }),
    });
  }

  /**
   * Recherche un client par email
   * 
   * @param email - Email du client à rechercher
   * @returns Client trouvé ou null
   */
  async findCustomerByEmail(email: string): Promise<{ customer?: any } | null> {
    try {
      const customersResponse = await this.getCustomers(250);
      const customer = customersResponse.data?.customers?.find(
        (c: any) => c.email?.toLowerCase() === email.toLowerCase()
      );
      
      return customer ? { customer } : null;
    } catch (error) {
      console.error('❌ Erreur recherche client par email:', error);
      return null;
    }
  }

  // ===============================================
  // INVENTAIRE ADMIN
  // ===============================================

  async getInventoryLevels(locationIds: string[], inventoryItemIds?: string[]) {
    let endpoint = '/inventory_levels.json';
    const params = new URLSearchParams();
    
    locationIds.forEach(id => params.append('location_ids[]', id));
    if (inventoryItemIds) {
      inventoryItemIds.forEach(id => params.append('inventory_item_ids[]', id));
    }
    
    endpoint += `?${params.toString()}`;
    return this.request(endpoint);
  }

  async setInventoryLevel(locationId: string, inventoryItemId: string, available: number) {
    const endpoint = '/inventory_levels/set.json';
    
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify({
        location_id: locationId,
        inventory_item_id: inventoryItemId,
        available,
      }),
    });
  }

  // ===============================================
  // PRODUITS ADMIN
  // ===============================================

  async getProducts(first: number = 50, publishedStatus?: string) {
    let endpoint = `/products.json?limit=${first}`;
    
    if (publishedStatus) {
      endpoint += `&published_status=${publishedStatus}`;
    }

    return this.request(endpoint);
  }

  async getProduct(productId: string) {
    const endpoint = `/products/${productId}.json`;
    return this.request(endpoint);
  }

  async updateProduct(productId: string, productData: any) {
    const endpoint = `/products/${productId}.json`;
    
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify({ product: productData }),
    });
  }

  async deleteProduct(productId: string) {
    const endpoint = `/products/${productId}.json`;
    
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // ===============================================
  // COLLECTIONS ADMIN
  // ===============================================

  async getCollections(first: number = 50) {
    const endpoint = `/collections.json?limit=${first}`;
    return this.request(endpoint);
  }

  async getCollection(collectionId: string) {
    const endpoint = `/collections/${collectionId}.json`;
    return this.request(endpoint);
  }

  async updateCollection(collectionId: string, collectionData: any) {
    const endpoint = `/collections/${collectionId}.json`;
    
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify({ collection: collectionData }),
    });
  }

  // ===============================================
  // WEBHOOKS ADMIN
  // ===============================================

  async getWebhooks() {
    const endpoint = '/webhooks.json';
    return this.request(endpoint);
  }

  async createWebhook(webhookData: any) {
    const endpoint = '/webhooks.json';
    
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify({ webhook: webhookData }),
    });
  }

  async updateWebhook(webhookId: string, webhookData: any) {
    const endpoint = `/webhooks/${webhookId}.json`;
    
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify({ webhook: webhookData }),
    });
  }

  async deleteWebhook(webhookId: string) {
    const endpoint = `/webhooks/${webhookId}.json`;
    
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  // ===============================================
  // LOCATIONS ADMIN
  // ===============================================

  async getLocations() {
    const endpoint = '/locations.json';
    return this.request(endpoint);
  }

  async getLocation(locationId: string) {
    const endpoint = `/locations/${locationId}.json`;
    return this.request(endpoint);
  }

  // ===============================================
  // FULFILLMENT ADMIN
  // ===============================================

  async getFulfillments(orderId: string) {
    const endpoint = `/orders/${orderId}/fulfillments.json`;
    return this.request(endpoint);
  }

  async createFulfillment(orderId: string, fulfillmentData: any) {
    const endpoint = `/orders/${orderId}/fulfillments.json`;
    
    return this.request(endpoint, {
      method: 'POST',
      body: JSON.stringify({ fulfillment: fulfillmentData }),
    });
  }

  // ===============================================
  // ANALYTICS ADMIN
  // ===============================================

  async getAnalytics(dateFrom: string, dateTo: string) {
    const endpoint = '/analytics.json';
    const params = new URLSearchParams({
      from: dateFrom,
      to: dateTo,
    });
    
    return this.request(`${endpoint}?${params.toString()}`);
  }

  async getRevenue(startDate: string, endDate: string) {
    const endpoint = '/reports/sales.json';
    const params = new URLSearchParams({
      since: startDate,
      until: endDate,
    });
    
    return this.request(`${endpoint}?${params.toString()}`);
  }

  // ===============================================
  // DRAFT ORDERS ADMIN
  // ===============================================

  /**
   * Créer un draft order (commande brouillon)
   * Utilisé pour créer un checkout sécurisé avant paiement
   */
  async createDraftOrder(draftOrderData: {
    line_items: Array<{
      variant_id: string;
      quantity: number;
      price?: string;
    }>;
    customer?: {
      id?: string;
      email?: string;
      first_name?: string;
      last_name?: string;
    };
    shipping_address?: {
      first_name: string;
      last_name: string;
      address1: string;
      address2?: string;
      city: string;
      zip: string;
      country: string;
      phone?: string;
    };
    shipping_line?: {
      title: string;
      price: string;
    };
    note?: string;
    tags?: string;
  }) {
    const endpoint = '/draft_orders.json';
    
    // Normaliser toutes les données avant JSON.stringify pour éviter les erreurs ByteString
    const normalizedDraftOrder = normalizeDataForAPI(draftOrderData);
    
    // Vérifier s'il reste des caractères Unicode problématiques dans le JSON stringifié
    let jsonString = JSON.stringify({ draft_order: normalizedDraftOrder });
    
    // Identifier les caractères problématiques AVANT nettoyage pour le débogage
    const problematicBefore: Array<{ char: string; code: number; index: number; context: string }> = [];
    for (let i = 0; i < jsonString.length; i++) {
      const code = jsonString.charCodeAt(i);
      if (code > 255) {
        problematicBefore.push({
          char: jsonString[i],
          code: code,
          index: i,
          context: jsonString.substring(Math.max(0, i - 30), Math.min(jsonString.length, i + 30))
        });
      }
    }
    if (problematicBefore.length > 0) {
      console.error('❌ Caractères Unicode détectés AVANT nettoyage dans createDraftOrder:', problematicBefore);
      // AMÉLIORÉ : Tenter d'identifier le champ concerné avec une méthode plus précise
      // Logger le chemin complet du champ pour faciliter le débogage
      problematicBefore.forEach(p => {
        try {
          const beforeContext = jsonString.substring(0, p.index);
          // Chercher tous les champs JSON avant l'index problématique
          const fieldMatches = beforeContext.match(/"([^"]+)":/g);
          if (fieldMatches && fieldMatches.length > 0) {
            // Prendre les 5 derniers champs pour avoir le chemin complet (ex: draft_order.shipping_address.city)
            const recentFields = fieldMatches.slice(-5).map(m => m.replace(/"/g, '').replace(':', ''));
            const fieldPath = recentFields.join('.');
            console.error(`   🔍 Champ probable: "${fieldPath}"`);
            console.error(`   📍 Index: ${p.index}`);
            console.error(`   🔤 Caractère: "${p.char}" (code: ${p.code}, U+${p.code.toString(16).toUpperCase().padStart(4, '0')})`);
            console.error(`   📝 Contexte: "${p.context}"`);
            
            // AMÉLIORÉ : Tenter d'extraire la valeur complète du champ
            try {
              const afterContext = jsonString.substring(p.index, Math.min(jsonString.length, p.index + 100));
              const valueMatch = afterContext.match(/^[^"]*"([^"]*)"?/);
              if (valueMatch) {
                console.error(`   💾 Valeur du champ: "${valueMatch[0].substring(0, 50)}"`);
              }
            } catch {
              // Ignorer les erreurs
            }
          }
        } catch {
          // Ignorer les erreurs
        }
      });
    }
    
    // Nettoyer TOUS les caractères Unicode problématiques dans la string JSON
    // CRITIQUE : Utiliser sanitizeStringForByteString pour un nettoyage complet et fiable
    // Cette fonction garantit le remplacement du caractère 8211 et de tous les autres caractères > 255
    let cleanedJsonString = sanitizeStringForByteString(jsonString);
    
    // Vérification supplémentaire : remplacer tous les caractères > 255 restants (double sécurité)
    cleanedJsonString = cleanedJsonString.split('').map((char, index) => {
      const code = char.charCodeAt(0);
      if (code > 255) {
        console.warn(`⚠️ Caractère Unicode détecté après sanitizeStringForByteString à l'index ${index}: "${char}" (code: ${code})`);
        // Remplacer les tirets Unicode par des tirets simples
        if (code === 8211 || code === 8212) return '-';
        // Remplacer les autres caractères par un espace
        return ' ';
      }
      return char;
    }).join('');
    
    // Vérifier qu'il ne reste plus de caractères > 255 avec scan caractère par caractère
    const stillProblematic: Array<{ char: string; code: number; index: number; context: string }> = [];
    for (let i = 0; i < cleanedJsonString.length; i++) {
      const code = cleanedJsonString.charCodeAt(i);
      if (code > 255) {
        stillProblematic.push({
          char: cleanedJsonString[i],
          code: code,
          index: i,
          context: cleanedJsonString.substring(Math.max(0, i - 30), Math.min(cleanedJsonString.length, i + 30))
        });
      }
    }
    
    if (stillProblematic.length > 0) {
      console.error('❌ Caractères problématiques toujours présents après nettoyage dans createDraftOrder:', stillProblematic);
      // Forcer le remplacement caractère par caractère pour tous les caractères > 255
      cleanedJsonString = cleanedJsonString.split('').map((char, index) => {
        const code = char.charCodeAt(0);
        if (code > 255) {
          console.error(`❌ FORCEMENT remplacement caractère à l'index ${index}: "${char}" (code: ${code})`);
          if (code === 8211 || code === 8212) return '-';
          return ' ';
        }
        return char;
      }).join('');
    }
    
    // Vérification finale : s'assurer qu'il n'y a plus aucun caractère > 255
    // AMÉLIORÉ : Boucle de remplacement forcé jusqu'à ce qu'il n'y ait plus aucun caractère > 255
    let maxIterations = 10;
    let iteration = 0;
    
    while (iteration < maxIterations) {
      const finalCheck = cleanedJsonString.split('').findIndex((c) => c.charCodeAt(0) > 255);
      if (finalCheck === -1) {
        break; // Aucun caractère problématique trouvé, sortir de la boucle
      }
      
      const char = cleanedJsonString[finalCheck];
      const context = cleanedJsonString.substring(Math.max(0, finalCheck - 30), Math.min(cleanedJsonString.length, finalCheck + 30));
      console.error(`❌ ERREUR CRITIQUE dans createDraftOrder (itération ${iteration + 1}): Caractère > 255 toujours présent à l'index ${finalCheck}: "${char}" (code: ${char.charCodeAt(0)})`);
      console.error(`   Contexte: "${context}"`);
      
      // Remplacer FORCEMENT par un tiret simple si c'est un tiret Unicode, sinon un espace
      const replacement = (char.charCodeAt(0) === 8211 || char.charCodeAt(0) === 8212) ? '-' : ' ';
      cleanedJsonString = cleanedJsonString.substring(0, finalCheck) + replacement + cleanedJsonString.substring(finalCheck + 1);
      
      iteration++;
    }
    
    if (iteration >= maxIterations) {
      console.error(`❌ ERREUR CRITIQUE: Impossible de nettoyer complètement le JSON après ${maxIterations} itérations`);
      // Dernière tentative : remplacer TOUS les caractères > 255 par des espaces
      cleanedJsonString = cleanedJsonString.split('').map(char => {
        const code = char.charCodeAt(0);
        return code > 255 ? ' ' : char;
      }).join('');
    }
    
    // AMÉLIORÉ : Couche de sécurité finale - Parse et re-stringify le JSON pour s'assurer qu'il est valide
    // Cette étape garantit que le JSON est valide et ne contient plus aucun caractère Unicode problématique
    try {
      const parsed = JSON.parse(cleanedJsonString);
      // Re-stringify pour s'assurer que le JSON est propre
      cleanedJsonString = JSON.stringify(parsed);
      
      // Vérification finale absolue après parse/re-stringify
      const absoluteFinalCheck = cleanedJsonString.split('').findIndex((c) => c.charCodeAt(0) > 255);
      if (absoluteFinalCheck !== -1) {
        console.error(`❌ ERREUR ABSOLUE dans createDraftOrder: Caractère > 255 toujours présent après parse/re-stringify à l'index ${absoluteFinalCheck}`);
        // Remplacer par un espace en dernier recours
        cleanedJsonString = cleanedJsonString.substring(0, absoluteFinalCheck) + ' ' + cleanedJsonString.substring(absoluteFinalCheck + 1);
        // Re-stringify une dernière fois
        try {
          const finalParsed = JSON.parse(cleanedJsonString);
          cleanedJsonString = JSON.stringify(finalParsed);
        } catch {
          console.error(`❌ ERREUR: Impossible de parser le JSON après remplacement final`);
        }
      }
    } catch (parseError) {
      console.error(`❌ ERREUR lors du parse/re-stringify du JSON nettoyé:`, parseError);
      // Si le parse échoue, utiliser la chaîne nettoyée telle quelle
    }
    
    return this.request(endpoint, {
      method: 'POST',
      body: cleanedJsonString,
    });
  }

  /**
   * Récupérer un draft order par ID
   */
  async getDraftOrder(draftOrderId: string) {
    const endpoint = `/draft_orders/${draftOrderId}.json`;
    return this.request(endpoint);
  }

  /**
   * Convertir un draft order en commande finale après paiement réussi
   */
  async completeDraftOrder(
    draftOrderId: string,
    paymentData?: {
      payment_gateway?: string;
      payment_status?: 'paid' | 'pending' | 'refunded';
      transaction_id?: string;
    }
  ) {
    const endpoint = `/draft_orders/${draftOrderId}/complete.json`;
    
    const body: any = {};
    if (paymentData) {
      body.payment_pending = paymentData.payment_status === 'pending';
    }
    
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  }

  /**
   * Supprimer un draft order
   */
  async deleteDraftOrder(draftOrderId: string) {
    const endpoint = `/draft_orders/${draftOrderId}.json`;
    
    return this.request(endpoint, {
      method: 'DELETE',
    });
  }

  /**
   * Mettre à jour un draft order
   */
  async updateDraftOrder(draftOrderId: string, draftOrderData: any) {
    const endpoint = `/draft_orders/${draftOrderId}.json`;
    
    return this.request(endpoint, {
      method: 'PUT',
      body: JSON.stringify({ draft_order: draftOrderData }),
    });
  }

  /**
   * Récupère la liste des devises activées sur la boutique
   * Utilise l'endpoint /admin/api/{version}/currencies.json
   * Retourne un tableau vide si l'API n'est pas disponible ou si multi-currency n'est pas activé
   */
  async getEnabledCurrencies(): Promise<AdminResponse<{ currencies: Array<{ currency: string; rate_updated_at: string }> }>> {
    const endpoint = `/currencies.json`;
    
    try {
      return await this.request<{ currencies: Array<{ currency: string; rate_updated_at: string }> }>(endpoint, {
        method: 'GET',
      });
    } catch (error) {
      console.warn('⚠️ Impossible de récupérer les devises activées via Admin API:', error);
      // Retourner une réponse vide plutôt que de lancer une erreur
      return {
        data: { currencies: [] },
      };
    }
  }
}

// Instance singleton pour l'API Admin
let adminClient: ShopifyAdminClient | null = null;

export function getShopifyAdminClient(): ShopifyAdminClient {
  if (!adminClient) {
    adminClient = new ShopifyAdminClient();
  }
  return adminClient;
}

export default ShopifyAdminClient;
