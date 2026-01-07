import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { ENV } from '@/app/src/lib/env';
import { TAGS } from '@/app/src/lib/constants';

// Forcer le mode dynamique pour éviter la mise en cache
export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * POST /api/revalidate
 * Endpoint sécurisé pour la revalidation manuelle
 * Utilise SHOPIFY_REVALIDATION_SECRET pour l'authentification
 */
export async function POST(req: NextRequest) {
  try {
    const revalidationSecret = ENV.SHOPIFY_REVALIDATION_SECRET;

    if (!revalidationSecret) {
      console.error('❌ SHOPIFY_REVALIDATION_SECRET non configuré');
      return NextResponse.json(
        { error: 'Revalidation secret non configuré' },
        { status: 500 }
      );
    }

    // Vérifier le secret
    const authHeader = req.headers.get('authorization');
    const secretHeader = req.headers.get('x-revalidation-secret');
    const providedSecret = authHeader?.replace('Bearer ', '') || secretHeader;

    if (!providedSecret || providedSecret !== revalidationSecret) {
      console.error('❌ Secret de revalidation invalide');
      return NextResponse.json(
        { error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Lire le body pour déterminer ce qui doit être revalidé
    const body = await req.json().catch(() => ({}));
    const { tag, path, tags } = body;

    const revalidated: string[] = [];

    // Revalidation par tag(s)
    if (tag) {
      revalidateTag(tag);
      revalidated.push(`tag:${tag}`);
      console.log(`✅ Tag "${tag}" revalidé`);
    }

    if (tags && Array.isArray(tags)) {
      tags.forEach((t: string) => {
        revalidateTag(t);
        revalidated.push(`tag:${t}`);
        console.log(`✅ Tag "${t}" revalidé`);
      });
    }

    // Revalidation par path
    if (path) {
      if (Array.isArray(path)) {
        path.forEach((p: string) => {
          revalidatePath(p);
          revalidated.push(`path:${p}`);
          console.log(`✅ Path "${p}" revalidé`);
        });
      } else {
        revalidatePath(path);
        revalidated.push(`path:${path}`);
        console.log(`✅ Path "${path}" revalidé`);
      }
    }

    // Si rien n'est spécifié, revalider tous les tags par défaut
    if (!tag && !tags && !path) {
      revalidateTag(TAGS.products);
      revalidateTag(TAGS.collections);
      revalidated.push(`tag:${TAGS.products}`, `tag:${TAGS.collections}`);
      console.log(`✅ Tags par défaut revalidés: ${TAGS.products}, ${TAGS.collections}`);
    }

    return NextResponse.json({
      revalidated: true,
      items: revalidated,
      now: Date.now(),
    });

  } catch (error) {
    console.error('❌ Erreur lors de la revalidation:', error);
    return NextResponse.json(
      {
        error: 'Erreur lors de la revalidation',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/revalidate
 * Documentation de l'endpoint
 */
export async function GET() {
  return NextResponse.json({
    message: 'Endpoint de revalidation manuelle',
    usage: {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer YOUR_REVALIDATION_SECRET',
        'Content-Type': 'application/json',
      },
      body: {
        tag: 'string (optionnel) - Tag à revalider',
        tags: 'array (optionnel) - Tags à revalider',
        path: 'string | array (optionnel) - Path(s) à revalider',
      },
      examples: [
        {
          description: 'Revalider le tag products',
          body: { tag: 'products' },
        },
        {
          description: 'Revalider plusieurs tags',
          body: { tags: ['products', 'collections'] },
        },
        {
          description: 'Revalider un path',
          body: { path: '/products' },
        },
        {
          description: 'Revalider tous les tags par défaut',
          body: {},
        },
      ],
    },
  });
}

