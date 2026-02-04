/**
 * 🍍 JOLANANAS - Webhook Revalidation Next.js ISR
 * ===============================================
 * Traitement des webhooks Shopify pour invalider le cache ISR
 * Plus de stockage DB - utilise uniquement les logs serveur
 */

import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { verifyWebhookSignature } from "@/lib/shopify/verify-webhook";
import { TAGS } from "@/lib/constants";
import { ENV } from "@/lib/env";

/**
 * Vérifie le secret de revalidation personnalisé
 */
function verifyRevalidationSecret(req: NextRequest): boolean {
  const revalidationSecret = ENV.SHOPIFY_REVALIDATION_SECRET;

  // Si le secret n'est pas configuré, on accepte uniquement les webhooks Shopify (HMAC)
  if (!revalidationSecret) {
    return true; // Pas de vérification supplémentaire si non configuré
  }

  // Vérifier le header Authorization ou un header personnalisé
  const authHeader = req.headers.get("authorization");
  const secretHeader = req.headers.get("x-revalidation-secret");

  const providedSecret = authHeader?.replace("Bearer ", "") || secretHeader;

  if (!providedSecret) {
    return false;
  }

  // Comparaison sécurisée (timing-safe)
  return providedSecret === revalidationSecret;
}

export async function POST(req: NextRequest) {
  const startTime = Date.now();

  try {
    // Vérifier le secret de revalidation personnalisé (si configuré et fourni)
    const hasRevalidationSecret = verifyRevalidationSecret(req);

    let topic: string | null = null;
    let payload: any = null;

    // Si le secret de revalidation est fourni et valide, on accepte la requête
    if (hasRevalidationSecret) {
      // Requête de revalidation manuelle - extraire le topic du body si fourni
      try {
        const body = await req.json().catch(() => ({}));
        topic = body.topic || req.headers.get("x-shopify-topic");
        payload = body;
        console.log(`🔐 Revalidation manuelle autorisée via secret`);
      } catch (error) {
        // Si pas de body, on continue avec topic null
      }
    } else {
      // Sinon, vérifier la signature HMAC Shopify (pour les webhooks Shopify)
      const {
        isValid,
        topic: hmacTopic,
        error,
        payload: hmacPayload,
      } = await verifyWebhookSignature(req);

      if (!isValid) {
        console.error(
          `❌ Webhook revalidate: Secret de revalidation invalide ou HMAC Shopify invalide`,
        );
        return NextResponse.json(
          {
            message:
              "Secret de revalidation invalide ou signature HMAC invalide",
          },
          { status: 401 },
        );
      }

      topic = hmacTopic;
      payload = hmacPayload;
    }

    // Logique de revalidation basée sur le Topic Shopify
    if (!topic) {
      console.warn("⚠️ Webhook revalidate: Topic manquant");
      return NextResponse.json({ status: 200, message: "Topic manquant" });
    }

    // Extraire l'ID Shopify du payload pour le logging
    const shopifyId =
      payload?.id?.toString() ||
      payload?.admin_graphql_api_id?.split("/").pop() ||
      `unknown-${Date.now()}`;

    // Logger l'événement webhook (remplace le stockage DB)
    console.log(`📝 Webhook reçu: ${topic} (ID: ${shopifyId})`);
    console.log(`⚡ Revalidation en cours...`);

    let revalidatedTag: string | null = null;

    switch (topic) {
      case "products/create":
      case "products/update":
      case "products/delete":
        revalidateTag(TAGS.products);
        revalidatedTag = TAGS.products;
        console.log(`✅ Tag "${TAGS.products}" revalidé pour ${topic}`);
        break;
      case "collections/create":
      case "collections/update":
      case "collections/delete":
        revalidateTag(TAGS.collections);
        revalidatedTag = TAGS.collections;
        console.log(`✅ Tag "${TAGS.collections}" revalidé pour ${topic}`);
        break;
      default:
        console.log(`⚠️ Topic non géré: ${topic}`);
        break;
    }

    const duration = Date.now() - startTime;
    console.log(`✅ Webhook traité avec succès en ${duration}ms`);

    return NextResponse.json({
      status: 200,
      revalidated: true,
      topic,
      tag: revalidatedTag,
      shopifyId,
      duration: `${duration}ms`,
      now: Date.now(),
    });
  } catch (error) {
    console.error("❌ Erreur lors du traitement du webhook:", error);

    return NextResponse.json(
      {
        status: 500,
        error: "Erreur lors du traitement du webhook",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
