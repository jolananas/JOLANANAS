/**
 * 🍍 JOLANANAS - Webhook Commandes Shopify
 * ====================================================
 * Traitement des nouvelles commandes Shopify sans stockage DB
 * Les commandes sont déjà stockées dans Shopify - pas besoin de duplication locale
 */

import { NextRequest, NextResponse } from "next/server";
import { ENV } from "@/lib/env";
import { validateWebhookHMAC } from "@/lib/utils/formatters.server";
import { normalizeDataForAPI } from "@/lib/utils/formatters";

/**
 * POST /api/webhooks/orders/create
 * Traite les nouvelles commandes Shopify
 *
 * Note: Les commandes sont déjà stockées dans Shopify.
 * Ce webhook sert uniquement à déclencher des actions (notifications, logs, etc.)
 */
export async function POST(request: NextRequest) {
  try {
    // Lire le body comme Buffer pour éviter les problèmes de caractères Unicode
    const bodyBuffer = await request.arrayBuffer();
    const bodyBytes = Buffer.from(bodyBuffer);
    const bodyRaw = bodyBytes.toString("utf8");
    const signature = request.headers.get("x-shopify-hmac-sha256");

    // Vérification de la signature HMAC
    if (
      !signature ||
      !ENV.SHOPIFY_WEBHOOK_SECRET ||
      !validateWebhookHMAC(bodyBytes, signature, ENV.SHOPIFY_WEBHOOK_SECRET)
    ) {
      console.log("❌ Webhook orders/create: Signature invalide");
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Normaliser le body pour éliminer les caractères Unicode problématiques
    const body = normalizeDataForAPI(bodyRaw);
    const orderData = normalizeDataForAPI(JSON.parse(body));

    const orderId = orderData.id;
    const orderNumber = orderData.order_number || orderData.name;
    const customerEmail = orderData.email;
    const totalPrice = orderData.total_price;

    console.log("📦 Nouvelle commande Shopify:", {
      id: orderId,
      orderNumber,
      email: customerEmail,
      total: totalPrice,
      currency: orderData.currency,
    });

    // Traitement de la commande (sans stockage DB)
    await processNewOrder(orderData);

    console.log("✅ Commande traitée:", orderId);

    return NextResponse.json({
      success: true,
      message: "Webhook traité avec succès",
      orderId: orderId.toString(),
    });
  } catch (error: unknown) {
    console.error("❌ Erreur webhook orders/create:", error);

    return NextResponse.json(
      {
        error: "Erreur traitement commande",
        message: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 },
    );
  }
}

/**
 * Traite une nouvelle commande Shopify
 * Actions possibles :
 * - Envoyer des notifications (email, SMS, etc.)
 * - Logger l'événement pour analytics
 * - Déclencher des actions métier (stock, marketing, etc.)
 *
 * Note: Les données de commande sont déjà dans Shopify et peuvent être récupérées via Orders API
 */
async function processNewOrder(orderData: any) {
  try {
    const {
      id: shopifyOrderId,
      email,
      total_price,
      currency,
      created_at,
      line_items,
      customer,
      shipping_address,
      billing_address,
    } = orderData;

    const shopifyCustomerId = customer?.id?.toString() || null;

    // Logger l'événement pour analytics (Vercel Analytics, logs serveur, etc.)
    console.log("📊 Commande créée:", {
      shopifyOrderId: shopifyOrderId.toString(),
      shopifyCustomerId,
      email,
      total: total_price,
      currency,
      itemsCount: line_items?.length || 0,
      createdAt: created_at,
    });

    // TODO: Actions optionnelles à implémenter selon les besoins :
    // - Envoyer un email de confirmation au client
    // - Envoyer une notification au service client
    // - Mettre à jour des métriques analytics
    // - Déclencher des workflows marketing (abandoned cart recovery, etc.)
    // - Synchroniser avec des systèmes externes (ERP, comptabilité, etc.)

    // Exemple : Envoyer une notification si nécessaire
    // if (ENV.RESEND_API_KEY) {
    //   await sendOrderConfirmationEmail(email, orderData);
    // }
  } catch (error: unknown) {
    console.error("❌ Erreur traitement commande:", error);
    // Ne pas throw l'erreur pour éviter que Shopify retry indéfiniment
    // Les erreurs sont loggées pour debugging
  }
}
