import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Récupérer le mode du site depuis les variables d'environnement
  const siteMode = process.env.SITE_MODE || "live";

  // Si le site est en mode "live", on laisse passer sans rien faire
  if (siteMode === "live") {
    return NextResponse.next();
  }

  // Liste des chemins à exclure du blocage (assets, api, images, etc.)
  const publicPaths = [
    "/_next",
    "/static",
    "/api",
    "/favicon.ico",
    "/assets",
    "/robots.txt",
    "/sitemap.xml",
  ];

  // Vérifier si le chemin demandé est public
  const isPublicPath = publicPaths.some(
    (path) =>
      request.nextUrl.pathname.startsWith(path) ||
      request.nextUrl.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|avif)$/),
  );

  // Dans tous les cas, on laisse Next.js rendre la page (car le Gatekeeper visuel est géré côté client/layout)
  // MAIS on ajoute des headers pour signifier aux robots que le site est "indisponible" ou "en travaux"
  const response = NextResponse.next();

  if (!isPublicPath) {
    // Ajouter un header Retry-After (Soft 503 signal)
    // 3600 secondes = 1 heure
    response.headers.set("Retry-After", "3600");

    // Marquer le mode pour debug ou usage conditionnel
    response.headers.set("x-site-mode", siteMode);
  }

  return response;
}

// Configurer le matcher pour optimiser les performances
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
