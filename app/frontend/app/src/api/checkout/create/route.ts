/**
 * 🍍 JOLANANAS - API Création Checkout Personnalisé
 * ==================================================
 * Crée un panier Shopify et un draft order pour paiement sécurisé
 * Retourne les informations nécessaires pour l'intégration des paiements
 */

import { NextRequest, NextResponse } from 'next/server';
import { getShopifyClient, CartLineInput } from '@/lib/ShopifyStorefrontClient';
import { getShopifyAdminClient } from '@/lib/ShopifyAdminClient';
import { getShippingInfo } from '@/lib/shopify';
import { ENV } from '@/lib/env';
import { transformShopifyError, extractAndTransformUserErrors } from '@/app/src/lib/utils/shopify-error-handler';
import { normalizeDataForAPI, sanitizeStringForByteString } from '@/lib/utils/formatters';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * Interface pour les informations de livraison
 */
interface ShippingInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address: string;
  address2?: string;
  city: string;
  postalCode: string;
  department?: string;
  region?: string;
  country: string;
}

/**
 * Interface pour les informations de méthode de livraison
 */
interface ShippingMethod {
  type: 'standard' | 'express';
}

/**
 * Extraire l'ID numérique depuis un GID Shopify
 * Exemple: gid://shopify/ProductVariant/123456789 → 123456789
 */
function extractNumericId(gid: string): string {
  if (gid.startsWith('gid://shopify/')) {
    const parts = gid.split('/');
    return parts[parts.length - 1];
  }
  return gid;
}

/**
 * Calculer les frais de livraison
 */
async function calculateShippingCost(
  shippingMethod: 'standard' | 'express',
  subtotal: number,
  shippingInfo: ShippingInfo
): Promise<number> {
  // Récupérer les informations de livraison depuis Shopify
  // Pour l'instant, utiliser des valeurs par défaut
  // const defaultShippingInfo = {
  //   freeShippingThreshold: 50,
  //   standardShippingCost: 5.99,
  //   expressShippingCost: 12.99,
  // };
  const result = await getShippingInfo();
  if (!result.success) {
    return 0;
  }
  const defaultShippingInfo = result.data;

  // Livraison gratuite si seuil atteint
  if (subtotal >= defaultShippingInfo.freeShippingThreshold) {
    return 0;
  }

  return shippingMethod === 'express' 
    ? defaultShippingInfo.expressShippingCost 
    : defaultShippingInfo.standardShippingCost;
}

/**
 * POST /api/checkout/create
 * Crée un panier Shopify et un draft order pour paiement sécurisé
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      items, 
      shippingInfo, 
      shippingMethod = { type: 'standard' as const }
    }: { 
      items?: CartLineInput[];
      shippingInfo?: ShippingInfo;
      shippingMethod?: ShippingMethod;
    } = body;

    // DEBUG : Scanner les données reçues AVANT toute normalisation pour identifier les caractères Unicode problématiques
    if (ENV.NODE_ENV === 'development') {
      const scanForUnicode = (obj: any, path: string = ''): Array<{ path: string; char: string; code: number; value: string }> => {
        const problematic: Array<{ path: string; char: string; code: number; value: string }> = [];
        if (typeof obj === 'string') {
          for (let i = 0; i < obj.length; i++) {
            const code = obj.charCodeAt(i);
            if (code > 255) {
              problematic.push({
                path: path || 'root',
                char: obj[i],
                code: code,
                value: obj.substring(Math.max(0, i - 10), Math.min(obj.length, i + 10))
              });
            }
          }
        } else if (Array.isArray(obj)) {
          obj.forEach((item, index) => {
            problematic.push(...scanForUnicode(item, `${path}[${index}]`));
          });
        } else if (obj && typeof obj === 'object') {
          for (const key of Object.keys(obj)) {
            problematic.push(...scanForUnicode(obj[key], path ? `${path}.${key}` : key));
          }
        }
        return problematic;
      };
      
      const problematicInBody = scanForUnicode({ items, shippingInfo, shippingMethod });
      if (problematicInBody.length > 0) {
        console.error('❌ Caractères Unicode détectés dans le body de la requête AVANT normalisation (/api/checkout/create):');
        problematicInBody.forEach(p => {
          console.error(`   - Champ: "${p.path}"`);
          console.error(`     Caractère: "${p.char}" (code: ${p.code}, U+${p.code.toString(16).toUpperCase().padStart(4, '0')})`);
          console.error(`     Contexte: "${p.value}"`);
        });
      }
    }

    // Validation des données
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Le panier est vide' },
        { status: 400 }
      );
    }

    if (!shippingInfo) {
      return NextResponse.json(
        { error: 'Les informations de livraison sont requises' },
        { status: 400 }
      );
    }

    // Validation des informations de livraison
    if (!shippingInfo.email || !shippingInfo.firstName || !shippingInfo.lastName) {
      return NextResponse.json(
        { error: 'Email, prénom et nom sont requis' },
        { status: 400 }
      );
    }

    if (!shippingInfo.address || !shippingInfo.city || !shippingInfo.postalCode) {
      return NextResponse.json(
        { error: 'Adresse, ville et code postal sont requis' },
        { status: 400 }
      );
    }

    console.log('🔄 Création checkout sécurisé:', { 
      itemsCount: items.length, 
      hasShippingInfo: !!shippingInfo,
      shippingMethod: shippingMethod.type
    });

    // Vérifier que SHOPIFY_ADMIN_TOKEN est configuré
    if (!ENV.SHOPIFY_ADMIN_TOKEN) {
      return NextResponse.json(
        { error: 'SHOPIFY_ADMIN_TOKEN n\'est pas configuré. Le paiement sécurisé nécessite l\'Admin API.' },
        { status: 500 }
      );
    }

    // 1. Créer le panier Shopify via Storefront API
    const shopify = getShopifyClient();
    const cartData = await shopify.createCart(items);

    // Vérifier les erreurs GraphQL
    if (cartData.errors) {
      console.error('❌ Erreur création panier Shopify:', cartData.errors);
      const userFriendlyError = transformShopifyError(
        cartData.errors[0]?.message || 'Erreur inconnue',
        'checkout/create'
      );
      return NextResponse.json(
        { error: userFriendlyError },
        { status: 400 }
      );
    }

    // Type guard pour vérifier la structure de la réponse
    type CartCreateResponse = {
      cartCreate?: {
        cart?: any;
        userErrors?: Array<{ field: string[]; message: string }>;
      };
    };

    const cartResponse = cartData.data as CartCreateResponse;

    // Vérifier les userErrors
    if (cartResponse?.cartCreate) {
      // Adapter le format pour extractAndTransformUserErrors
      const userError = extractAndTransformUserErrors({
        userErrors: cartResponse.cartCreate.userErrors?.map(err => ({
          message: err.message,
          field: Array.isArray(err.field) ? err.field.join('.') : err.field?.[0]
        }))
      }, 'checkout/create');
      if (userError) {
        console.error('❌ UserError création panier Shopify:', cartResponse.cartCreate.userErrors);
        return NextResponse.json(
          { error: userError },
          { status: 400 }
        );
      }
    }

    if (!cartResponse?.cartCreate?.cart) {
      console.error('❌ Réponse panier invalide:', cartData);
      return NextResponse.json(
        { error: 'Réponse panier invalide' },
        { status: 500 }
      );
    }

    const cart = cartResponse.cartCreate.cart;
    const subtotal = parseFloat(cart.cost.subtotalAmount.amount);

    // 2. Calculer les frais de livraison
    const shippingCost = await calculateShippingCost(
      shippingMethod.type,
      subtotal,
      shippingInfo
    );

    // 3. Normaliser les données AVANT de les utiliser
    const normalizedShippingInfo = normalizeDataForAPI(shippingInfo);

    // 4. Créer ou mettre à jour le client dans Shopify
    const adminClient = getShopifyAdminClient();
    let customerId: string | undefined;

    try {
      const customersResponse = await adminClient.getCustomers(250);
      
      // Type guard pour la réponse customers
      type CustomersResponse = {
        customers?: Array<{ id: number | string; email?: string }>;
      };
      
      const customersData = customersResponse.data as CustomersResponse;
      const existingCustomer = customersData?.customers?.find(
        (c: any) => c.email?.toLowerCase() === normalizedShippingInfo.email.toLowerCase()
      );

      if (existingCustomer) {
        customerId = existingCustomer.id.toString();
        console.log('✅ Client existant trouvé:', customerId);
      } else {
        // Créer un nouveau client avec données normalisées
        const newCustomer = await adminClient.createCustomer({
          email: normalizedShippingInfo.email,
          first_name: normalizedShippingInfo.firstName,
          last_name: normalizedShippingInfo.lastName,
          phone: normalizedShippingInfo.phone,
          addresses: [
            {
              first_name: normalizedShippingInfo.firstName,
              last_name: normalizedShippingInfo.lastName,
              address1: normalizedShippingInfo.address,
              address2: normalizedShippingInfo.address2,
              city: normalizedShippingInfo.city,
              zip: normalizedShippingInfo.postalCode,
              country: normalizedShippingInfo.country || 'France',
              phone: normalizedShippingInfo.phone,
            },
          ],
        });

        // Type guard pour la réponse customer
        type CustomerResponse = {
          customer?: { id: number | string };
        };
        
        const customerData = newCustomer.data as CustomerResponse;
        if (customerData?.customer) {
          customerId = customerData.customer.id.toString();
          console.log('✅ Nouveau client créé:', customerId);
        }
      }
    } catch (error) {
      console.error('⚠️ Erreur lors de la gestion du client:', error);
      // Continuer même si la création du client échoue
    }

    // 5. Préparer les line items pour le draft order (nécessite des IDs numériques)
    const draftOrderLineItems = items.map(item => {
      const variantId = extractNumericId(item.merchandiseId);
      return {
        variant_id: variantId,
        quantity: item.quantity,
      };
    });

    // 6. Créer le draft order via Admin API avec données normalisées
    // CRITIQUE : Normaliser explicitement TOUTES les chaînes construites avec template literals
    // AMÉLIORÉ : Normaliser chaque chaîne individuellement avant de construire l'objet
    const shippingLineTitleRaw = shippingMethod.type === 'express' ? 'Livraison express' : 'Livraison standard';
    const shippingLineTitle = normalizeDataForAPI(shippingLineTitleRaw);
    const shippingTypeTextRaw = shippingMethod.type === 'express' ? 'Express' : 'Standard';
    const shippingTypeText = normalizeDataForAPI(shippingTypeTextRaw);
    const draftOrderNoteRaw = `Checkout personnalise - ${shippingTypeText}`;
    const draftOrderNote = normalizeDataForAPI(draftOrderNoteRaw);
    
    // Normaliser aussi le pays par défaut si nécessaire
    const defaultCountry = normalizedShippingInfo.country || 'France';
    const normalizedDefaultCountry = normalizeDataForAPI(defaultCountry);
    
    // Construire l'objet draftOrderDataRaw avec toutes les données normalisées
    // AMÉLIORÉ : Normaliser chaque champ individuellement avant de construire l'objet
    const draftOrderDataRaw = {
      line_items: draftOrderLineItems,
      customer: customerId ? { id: customerId } : {
        email: normalizeDataForAPI(normalizedShippingInfo.email),
        first_name: normalizeDataForAPI(normalizedShippingInfo.firstName),
        last_name: normalizeDataForAPI(normalizedShippingInfo.lastName),
      },
      shipping_address: {
        first_name: normalizeDataForAPI(normalizedShippingInfo.firstName),
        last_name: normalizeDataForAPI(normalizedShippingInfo.lastName),
        address1: normalizeDataForAPI(normalizedShippingInfo.address),
        address2: normalizedShippingInfo.address2 ? normalizeDataForAPI(normalizedShippingInfo.address2) : undefined,
        city: normalizeDataForAPI(normalizedShippingInfo.city),
        zip: normalizeDataForAPI(normalizedShippingInfo.postalCode),
        country: normalizedDefaultCountry,
        phone: normalizedShippingInfo.phone ? normalizeDataForAPI(normalizedShippingInfo.phone) : undefined,
      },
      shipping_line: {
        title: shippingLineTitle as string,
        price: shippingCost.toFixed(2),
      },
      note: draftOrderNote as string,
    };

    // Normaliser TOUT l'objet avant l'envoi pour éviter les erreurs ByteString
    // Faire une normalisation en profondeur sur TOUS les champs
    const normalizedDraftOrder = normalizeDataForAPI(draftOrderDataRaw);
    
    // Nettoyage supplémentaire STRICT : s'assurer que TOUS les champs string sont ASCII
    // Cette fonction traite récursivement tous les types de données (objets, arrays, primitives)
    // AMÉLIORÉ : Utilise une approche plus agressive avec boucle de remplacement forcé
    const deepClean = (obj: any, path: string = 'root'): any => {
      // Gérer null et undefined
      if (obj === null || obj === undefined) {
        return obj;
      }
      
      // Gérer les strings : utiliser sanitizeStringForByteString pour un nettoyage complet
      // AMÉLIORÉ : Vérification finale stricte avec boucle de remplacement forcé
      if (typeof obj === 'string') {
        let cleaned = sanitizeStringForByteString(obj);
        
        // Vérification finale stricte avec boucle de remplacement forcé
        let maxIterations = 10;
        let iteration = 0;
        
        while (iteration < maxIterations) {
          let foundProblematic = false;
          const newChars: string[] = [];
          
          for (let i = 0; i < cleaned.length; i++) {
            const code = cleaned.charCodeAt(i);
            if (code > 255) {
              foundProblematic = true;
              console.error(`❌ ERREUR dans deepClean (itération ${iteration + 1}): Caractère > 255 toujours présent dans "${path}" à l'index ${i}: "${cleaned[i]}" (code: ${code})`);
              // Remplacer FORCEMENT par un tiret simple si c'est un tiret Unicode, sinon un espace
              const replacement = (code === 8211 || code === 8212) ? '-' : ' ';
              newChars.push(replacement);
            } else {
              newChars.push(cleaned[i]);
            }
          }
          
          cleaned = newChars.join('');
          
          if (!foundProblematic) {
            break; // Aucun caractère problématique trouvé, sortir de la boucle
          }
          
          iteration++;
        }
        
        if (iteration >= maxIterations) {
          console.error(`❌ ERREUR CRITIQUE dans deepClean: Impossible de nettoyer complètement la chaîne dans "${path}" après ${maxIterations} itérations`);
          // Dernière tentative : remplacer TOUS les caractères > 255 par des espaces
          cleaned = cleaned.split('').map(char => {
            const code = char.charCodeAt(0);
            return code > 255 ? ' ' : char;
          }).join('');
        }
        
        // Vérification finale absolue
        for (let i = 0; i < cleaned.length; i++) {
          const code = cleaned.charCodeAt(i);
          if (code > 255) {
            console.error(`❌ ERREUR ABSOLUE dans deepClean: Caractère > 255 toujours présent dans "${path}" à l'index ${i} après toutes les tentatives`);
            cleaned = cleaned.substring(0, i) + ' ' + cleaned.substring(i + 1);
          }
        }
        
        return cleaned;
      }
      
      // Gérer les primitives non-string (number, boolean, bigint)
      if (typeof obj === 'number' || typeof obj === 'boolean' || typeof obj === 'bigint') {
        return obj;
      }
      
      // Gérer les arrays : nettoyer récursivement chaque élément
      if (Array.isArray(obj)) {
        return obj.map((item, index) => deepClean(item, `${path}[${index}]`));
      }
      
      // Gérer les objets
      if (obj && typeof obj === 'object') {
        // Ne pas nettoyer les objets spéciaux (Date, RegExp, Error, etc.)
        if (obj instanceof Date || obj instanceof RegExp || obj instanceof Error) {
          return obj;
        }
        
        // Gérer les objets null (créés avec Object.create(null))
        if (obj.constructor !== Object && obj.constructor !== Array) {
          // Pour les objets complexes, essayer de les convertir en JSON puis nettoyer
          try {
            const stringified = JSON.stringify(obj);
            const parsed = JSON.parse(stringified);
            return deepClean(parsed, path);
          } catch {
            // Si la conversion échoue, retourner tel quel
            return obj;
          }
        }
        
        // Gérer les objets simples : nettoyer récursivement toutes les valeurs ET les clés
        // AMÉLIORÉ : Normaliser aussi les clés des objets
        const cleaned: any = {};
        for (const key of Object.keys(obj)) {
          const normalizedKey = sanitizeStringForByteString(key); // Normaliser aussi les clés
          cleaned[normalizedKey] = deepClean(obj[key], `${path}.${key}`);
        }
        return cleaned;
      }
      
      // Pour tout autre type, retourner tel quel
      return obj;
    };
    
    const finalDraftOrder = deepClean(normalizedDraftOrder);

    // Log pour débogage et vérification finale
    const jsonString = JSON.stringify(finalDraftOrder);
    
    // Vérifier s'il reste des caractères problématiques avec scan caractère par caractère
    const problematic: Array<{ char: string; code: number; index: number; context: string; fieldPath?: string }> = [];
    for (let i = 0; i < jsonString.length; i++) {
      const code = jsonString.charCodeAt(i);
      if (code > 255) {
        const context = jsonString.substring(Math.max(0, i - 30), Math.min(jsonString.length, i + 30));
        // Tenter d'identifier le champ concerné
        let fieldPath = 'unknown';
        try {
          const beforeContext = jsonString.substring(0, i);
          const fieldMatches = beforeContext.match(/"([^"]+)":/g);
          if (fieldMatches && fieldMatches.length > 0) {
            // Prendre les 3 derniers champs pour avoir le chemin complet
            const recentFields = fieldMatches.slice(-3).map(m => m.replace(/"/g, '').replace(':', ''));
            fieldPath = recentFields.join('.');
          }
        } catch {
          // Ignorer les erreurs
        }
        
        problematic.push({
          char: jsonString[i],
          code: code,
          index: i,
          context: context,
          fieldPath: fieldPath
        });
      }
    }
    
    if (problematic.length > 0) {
      console.error('❌ Caractères Unicode DÉTECTÉS dans finalDraftOrder AVANT envoi:', problematic);
      problematic.forEach(p => {
        console.error(`   - Index ${p.index}: "${p.char}" (code: ${p.code}) dans champ: ${p.fieldPath}`);
        console.error(`     Contexte: "${p.context}"`);
      });
    } else if (ENV.NODE_ENV === 'development') {
      const jsonPreview = jsonString.substring(0, 200);
      console.log('🔄 Envoi draft order (preview):', jsonPreview);
      console.log('✅ Aucun caractère Unicode problématique détecté dans finalDraftOrder');
    }

    const draftOrderResponse = await adminClient.createDraftOrder(finalDraftOrder);

    if (draftOrderResponse.errors) {
      console.error('❌ Erreur création draft order:', JSON.stringify(draftOrderResponse.errors, null, 2));
      const errorMessage = draftOrderResponse.errors[0]?.message || 'Erreur lors de la création de la commande';
      
      // Vérifier si c'est une erreur ByteString
      if (errorMessage.includes('ByteString') || errorMessage.includes('character at index')) {
        console.error('⚠️ Erreur ByteString détectée - Les données contiennent encore des caractères Unicode problématiques');
        console.error('📋 Données envoyées:', JSON.stringify(finalDraftOrder, null, 2));
      }
      
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }

    // Type guard pour la réponse draft order
    type DraftOrderResponse = {
      draft_order?: {
        id: number | string;
        invoice_url?: string;
        [key: string]: any;
      };
    };
    
    const draftOrderResponseData = draftOrderResponse.data as DraftOrderResponse;
    
    if (!draftOrderResponseData?.draft_order) {
      console.error('❌ Réponse draft order invalide:', draftOrderResponse);
      return NextResponse.json(
        { error: 'Réponse draft order invalide' },
        { status: 500 }
      );
    }

    const draftOrder = draftOrderResponseData.draft_order;
    const totalAmount = subtotal + shippingCost;

    console.log('✅ Checkout créé avec succès:', {
      cartId: cart.id,
      draftOrderId: draftOrder.id,
      total: totalAmount,
    });

    // 6. Extraire les variant IDs pour Shop Pay
    // Les variant IDs sont nécessaires pour le web component shop-pay-button
    const variantIds = items.map(item => {
      // Extraire l'ID numérique depuis le GID Shopify
      // Exemple: gid://shopify/ProductVariant/123456789 → 123456789
      return extractNumericId(item.merchandiseId);
    });

    // 7. Retourner les informations pour le frontend
    return NextResponse.json({
      checkoutId: draftOrder.id.toString(),
      cartId: cart.id,
      customerId: customerId || null,
      total: totalAmount.toFixed(2),
      subtotal: subtotal.toFixed(2),
      shippingCost: shippingCost.toFixed(2),
      currency: cart.cost.totalAmount.currencyCode,
      invoiceUrl: draftOrder.invoice_url,
      // URL pour redirection PayPal si nécessaire
      paymentUrl: draftOrder.invoice_url,
      // Variant IDs pour Shop Pay (nécessaires pour le web component)
      variantIds: variantIds,
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error: unknown) {
    console.error('❌ Erreur serveur création checkout:', error);
    
    const message = error instanceof Error ? error.message : 'Erreur serveur';
    
    return NextResponse.json(
      { 
        error: message,
        traceId: `checkout-create-${Date.now()}`
      },
      { status: 500 }
    );
  }
}

