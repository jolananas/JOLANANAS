// Shopify Storefront API Client
// This file should only be imported and used in server-side code

import "server-only";

import { ENV } from "@/lib/env";
import {
  normalizeHeaderValue,
  normalizeDataForAPI,
  sanitizeStringForByteString,
} from "@/lib/utils/formatters";

function getShopifyConfig(): { endpoint: string; token: string } | null {
  try {
    // Utiliser ENV validé par Zod au lieu de process.env directement
    const endpoint = `https://${ENV.SHOPIFY_STORE_DOMAIN}/api/${ENV.SHOPIFY_API_VERSION}/graphql.json`;

    return {
      endpoint,
      token:
        ENV.SHOPIFY_STOREFRONT_TOKEN ||
        process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN,
    };
  } catch (error) {
    // Si la validation ENV échoue, cela signifie que les variables ne sont pas configurées
    console.error(
      "❌ Erreur de configuration Shopify:",
      error instanceof Error
        ? error.message
        : "Variables d'environnement non configurées",
    );
    return null;
  }
}

/**
 * Effectue une requête GraphQL vers Shopify avec encodage UTF-8 correct
 * Évite l'erreur "Cannot convert argument to a ByteString" avec les caractères Unicode
 */
export async function shopifyFetch<T>({
  cache = "force-cache",
  headers,
  query,
  tags,
  variables,
}: {
  cache?: RequestCache;
  headers?: HeadersInit;
  query: string;
  tags?: string[];
  variables?: Record<string, unknown>;
}): Promise<{ data: T; errors?: Array<{ message: string }> }> {
  const config = getShopifyConfig();

  if (!config) {
    // Retourner une structure avec erreur si Shopify n'est pas configuré
    console.error(
      "❌ Configuration Shopify manquante: SHOPIFY_STORE_DOMAIN ou SHOPIFY_STOREFRONT_TOKEN/SHOPIFY_STOREFRONT_ACCESS_TOKEN non configurés",
    );
    return {
      data: {} as T,
      errors: [
        {
          message:
            "Shopify environment variables are not configured. Please set SHOPIFY_STORE_DOMAIN and SHOPIFY_STOREFRONT_TOKEN (or SHOPIFY_STOREFRONT_ACCESS_TOKEN) in your .env.local file.",
        },
      ],
    };
  }

  try {
    if (ENV.NODE_ENV === "development") {
      console.log(`🔄 Requête Shopify vers: ${config.endpoint}`);
    }

    // CRITIQUE : Normaliser l'endpoint pour éviter l'erreur ByteString dans l'URL
    // L'endpoint pourrait contenir des caractères Unicode si le domaine en contient
    const normalizedEndpoint = sanitizeStringForByteString(config.endpoint);

    // CRITIQUE : Normaliser le token pour éviter l'erreur ByteString dans les headers HTTP
    // Les headers HTTP ne peuvent contenir que des caractères ASCII (0-255)
    // Selon Stack Overflow, c'est une source fréquente du problème
    // https://stackoverflow.com/questions/53905825/typeerror-cannot-convert-string-to-bytestring
    const normalizedToken = normalizeHeaderValue(String(config.token));

    // CRITIQUE : Normaliser aussi la query GraphQL si elle contient des caractères Unicode
    // La query peut être construite dynamiquement et contenir des caractères Unicode
    const normalizedQuery = normalizeDataForAPI(query);

    // Normaliser les variables GraphQL pour éviter les caractères Unicode dans le body
    const normalizedVariables = variables
      ? normalizeDataForAPI(variables)
      : undefined;

    // DEBUG : Scanner la query et les variables AVANT JSON.stringify pour identifier les caractères Unicode
    if (ENV.NODE_ENV === "development") {
      const scanForUnicode = (str: string, name: string): void => {
        for (let i = 0; i < str.length; i++) {
          const code = str.charCodeAt(i);
          if (code > 255) {
            const context = str.substring(
              Math.max(0, i - 20),
              Math.min(str.length, i + 20),
            );
            console.error(
              `❌ Caractère Unicode détecté dans ${name} à l'index ${i}: "${str[i]}" (code: ${code}, U+${code.toString(16).toUpperCase().padStart(4, "0")})`,
            );
            console.error(`   Contexte: "${context}"`);
          }
        }
      };

      scanForUnicode(normalizedQuery, "query normalisée");
      if (normalizedVariables) {
        scanForUnicode(
          JSON.stringify(normalizedVariables),
          "variables normalisées",
        );
      }
    }

    // JSON.stringify encode déjà correctement en UTF-8, mais on doit nettoyer le body final
    // pour s'assurer qu'il ne contient pas de caractères > 255
    let body = JSON.stringify({
      query: normalizedQuery,
      variables: normalizedVariables,
    });

    // AMÉLIORÉ : Nettoyer le body stringifié pour s'assurer qu'il ne contient pas de caractères > 255
    // Même si JSON.stringify encode en UTF-8, le body peut contenir des caractères Unicode dans la chaîne JSON
    // qui causent l'erreur ByteString lors de l'envoi à fetch
    body = sanitizeStringForByteString(body);

    // Vérification finale STRICTE : s'assurer qu'il n'y a plus aucun caractère > 255 dans le body
    // AMÉLIORÉ : Boucle de remplacement forcé jusqu'à ce qu'il n'y ait plus aucun caractère > 255
    let maxIterations = 10;
    let iteration = 0;

    while (iteration < maxIterations) {
      let foundProblematic = false;
      const newChars: string[] = [];

      for (let i = 0; i < body.length; i++) {
        const code = body.charCodeAt(i);
        if (code > 255) {
          foundProblematic = true;
          const context = body.substring(
            Math.max(0, i - 30),
            Math.min(body.length, i + 30),
          );
          console.error(
            `❌ ERREUR CRITIQUE dans shopifyFetch (itération ${iteration + 1}): Caractère > 255 toujours présent dans le body à l'index ${i}: "${body[i]}" (code: ${code})`,
          );
          console.error(`   Contexte: "${context}"`);
          // Remplacer FORCEMENT par un tiret simple si c'est un tiret Unicode, sinon un espace
          const replacement = code === 8211 || code === 8212 ? "-" : " ";
          newChars.push(replacement);
        } else {
          newChars.push(body[i]);
        }
      }

      body = newChars.join("");

      if (!foundProblematic) {
        break; // Aucun caractère problématique trouvé, sortir de la boucle
      }

      iteration++;
    }

    if (iteration >= maxIterations) {
      console.error(
        `❌ ERREUR CRITIQUE: Impossible de nettoyer complètement le body après ${maxIterations} itérations`,
      );
      // Dernière tentative : remplacer TOUS les caractères > 255 par des espaces
      body = body
        .split("")
        .map((char) => {
          const code = char.charCodeAt(0);
          return code > 255 ? " " : char;
        })
        .join("");
    }

    // Vérification finale absolue : s'assurer qu'il n'y a vraiment plus aucun caractère > 255
    for (let i = 0; i < body.length; i++) {
      const code = body.charCodeAt(i);
      if (code > 255) {
        console.error(
          `❌ ERREUR ABSOLUE dans shopifyFetch: Caractère > 255 toujours présent dans le body à l'index ${i} après toutes les tentatives`,
        );
        body = body.substring(0, i) + " " + body.substring(i + 1);
      }
    }

    // DEBUG : Vérifier aussi l'endpoint et les headers avant l'envoi
    if (ENV.NODE_ENV === "development") {
      const scanForUnicode = (str: string, name: string): void => {
        for (let i = 0; i < str.length; i++) {
          const code = str.charCodeAt(i);
          if (code > 255) {
            console.error(
              `❌ Caractère Unicode détecté dans ${name} à l'index ${i}: "${str[i]}" (code: ${code})`,
            );
          }
        }
      };

      scanForUnicode(normalizedEndpoint, "endpoint");
      scanForUnicode(normalizedToken, "token");
      scanForUnicode(body, "body final");
    }

    // AMÉLIORÉ : Normaliser aussi les valeurs des headers pour éviter les caractères Unicode
    // Le header Content-Type ne devrait pas contenir de caractères Unicode, mais on le normalise quand même
    const contentType = sanitizeStringForByteString("application/json");

    // Construire les headers avec toutes les valeurs normalisées
    const headers: Record<string, string> = {
      "Content-Type": contentType,
      "X-Shopify-Storefront-Access-Token": normalizedToken,
    };

    // DEBUG : Vérifier les headers avant l'envoi
    if (ENV.NODE_ENV === "development") {
      Object.entries(headers).forEach(([key, value]) => {
        for (let i = 0; i < value.length; i++) {
          const code = value.charCodeAt(i);
          if (code > 255) {
            console.error(
              `❌ Caractère Unicode détecté dans header "${key}" à l'index ${i}: "${value[i]}" (code: ${code})`,
            );
          }
        }
      });
    }

    // Construire l'objet next avec cache et tags pour Next.js ISR
    // Pour force-cache, on utilise les tags pour la revalidation à la demande (On-Demand Revalidation)
    const nextOptions: { revalidate?: number | false; tags?: string[] } = {};

    if (cache === "force-cache") {
      // Pour force-cache, on utilise les tags pour la revalidation à la demande
      // Pas de revalidate (cache indéfini) sauf si on veut un fallback
      if (tags && tags.length > 0) {
        nextOptions.tags = tags;
      }
      // Pas de revalidate = cache indéfini jusqu'à revalidation manuelle via revalidateTag
    } else if (cache === "no-store") {
      // Pour no-store, pas de cache - ne pas configurer next
      // Laisser nextOptions vide
    } else {
      // Pour les autres cas (default, reload, etc.), on peut garder un revalidate avec tags
      nextOptions.revalidate = 60; // Fallback de 60 secondes
      if (tags && tags.length > 0) {
        nextOptions.tags = tags;
      }
    }

    const result = await fetch(normalizedEndpoint, {
      method: "POST",
      headers: headers,
      body: body,
      // Next.js utilise 'next' pour le cache, pas l'option 'cache' de fetch
      next: Object.keys(nextOptions).length > 0 ? nextOptions : undefined,
    });

    if (!result.ok) {
      const errorText = await result.text();
      console.error(`❌ Shopify API HTTP Error (${result.status}):`, errorText);

      // Gérer spécifiquement l'erreur ByteString
      if (
        errorText.includes("ByteString") ||
        errorText.includes("character at index")
      ) {
        console.error(
          "⚠️ Erreur d'encodage Unicode détectée. Vérifiez les variables GraphQL.",
        );
        return {
          data: {} as T,
          errors: [
            {
              message:
                "Erreur d'encodage Unicode dans la requête. Vérifiez les caractères spéciaux dans les données.",
            },
          ],
        };
      }

      throw new Error(
        `Shopify API error: ${result.status} ${result.statusText}`,
      );
    }

    const jsonResponse = await result.json();

    // Log la réponse complète en développement pour le débogage
    if (ENV.NODE_ENV === "development" && jsonResponse.errors) {
      console.warn(
        "⚠️ Erreurs GraphQL dans la réponse Shopify:",
        JSON.stringify(jsonResponse.errors, null, 2),
      );
    }

    return jsonResponse;
  } catch (error) {
    console.error("❌ Shopify fetch error:", error);
    if (error instanceof Error) {
      console.error("Message:", error.message);

      // Gérer spécifiquement l'erreur ByteString
      if (
        error.message.includes("ByteString") ||
        error.message.includes("character at index")
      ) {
        return {
          data: {} as T,
          errors: [
            {
              message:
                "Erreur d'encodage Unicode dans la requête. Vérifiez les caractères spéciaux dans les données.",
            },
          ],
        };
      }
    }
    throw error;
  }
}
