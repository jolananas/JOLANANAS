import { NextRequest } from 'next/server';
import crypto from 'crypto';

interface WebhookVerificationResult {
  isValid: boolean;
  topic: string | null;
  domain: string | null;
  payload: any | null; // Le corps JSON parsé
  error?: string;
}

/**
 * Vérifie la signature HMAC de Shopify pour sécuriser les routes Webhook.
 * @param req - La requête NextRequest entrante
 * @returns Un objet contenant le statut de validation et le payload parsé
 */
export async function verifyWebhookSignature(req: NextRequest): Promise<WebhookVerificationResult> {
  try {
    const signature = req.headers.get('x-shopify-hmac-sha256');
    const topic = req.headers.get('x-shopify-topic');
    const domain = req.headers.get('x-shopify-shop-domain');
    const secret = process.env.SHOPIFY_WEBHOOK_SECRET;

    if (!secret) {
      console.error('❌ ERREUR CRITIQUE : SHOPIFY_WEBHOOK_SECRET manquant dans .env');
      return { isValid: false, topic, domain, payload: null, error: 'Configuration serveur manquante' };
    }

    if (!signature) {
      return { isValid: false, topic, domain, payload: null, error: 'Signature manquante' };
    }

    // 1. Lire le corps brut (raw body) pour le hachage
    // Note : On ne peut lire le stream qu'une seule fois.
    const rawBody = await req.text();

    // 2. Créer le hash HMAC-SHA256
    const hash = crypto
      .createHmac('sha256', secret)
      .update(rawBody, 'utf8')
      .digest('base64');

    // 3. Comparaison sécurisée (Timing Safe) pour éviter les attaques temporelles
    // On compare le hash calculé avec la signature fournie par Shopify
    const signatureBuffer = Buffer.from(signature, 'utf8');
    const hashBuffer = Buffer.from(hash, 'utf8');

    // Vérification de la longueur avant comparison (sécurité supplémentaire)
    if (signatureBuffer.length !== hashBuffer.length) {
       return { isValid: false, topic, domain, payload: null, error: 'Signature invalide (longueur)' };
    }

    const match = crypto.timingSafeEqual(signatureBuffer, hashBuffer);

    if (!match) {
      return { isValid: false, topic, domain, payload: null, error: 'Signature invalide (mismatch)' };
    }

    // 4. Si valide, on parse le JSON ici et on le retourne
    const payload = JSON.parse(rawBody);

    return {
      isValid: true,
      topic,
      domain,
      payload // On retourne le JSON prêt à l'emploi
    };

  } catch (error) {
    console.error('Erreur lors de la vérification du webhook :', error);
    return { isValid: false, topic: null, domain: null, payload: null, error: 'Erreur interne' };
  }
}
