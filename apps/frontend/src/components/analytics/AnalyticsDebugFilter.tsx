/**
 * 🍍 JOLANANAS - Filtre de débogage Analytics
 * ============================================
 * Script client pour filtrer les logs de débogage Vercel Analytics
 * en développement, tout en gardant Analytics actif
 *
 * Pour réactiver les logs de débogage, supprimer ou commenter
 * ce composant dans apps/layout.tsx
 */

"use client";

import { useEffect } from "react";

/**
 * Composant qui filtre les logs de débogage Vercel Analytics
 * en développement pour garder la console propre
 *
 * Les logs de débogage Vercel Analytics sont normaux en développement
 * mais peuvent encombrer la console. Ce composant les filtre automatiquement.
 *
 * Pour voir les logs de débogage, supprimer ce composant du layout.
 */
export function AnalyticsDebugFilter() {
  useEffect(() => {
    // Ne filtrer qu'en développement
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    // Sauvegarder les fonctions console originales
    const originalLog = console.log.bind(console);
    const originalInfo = console.info.bind(console);
    const originalDebug = console.debug?.bind(console);

    // Fonction de filtrage
    const shouldFilter = (args: any[]): boolean => {
      if (!args || args.length === 0) return false;

      const firstArg = args[0];
      if (typeof firstArg === "string") {
        return firstArg.includes("[Vercel Web Analytics]");
      }

      // Vérifier aussi les objets avec des propriétés spécifiques
      if (typeof firstArg === "object" && firstArg !== null) {
        const stringified = JSON.stringify(firstArg);
        return (
          stringified.includes("Vercel Web Analytics") ||
          stringified.includes("pageview") ||
          stringified.includes("trycloudflare")
        );
      }

      return false;
    };

    // Remplacer console.log
    console.log = (...args: any[]) => {
      if (!shouldFilter(args)) {
        originalLog(...args);
      }
    };

    // Remplacer console.info
    console.info = (...args: any[]) => {
      if (!shouldFilter(args)) {
        originalInfo(...args);
      }
    };

    // Remplacer console.debug si disponible
    if (console.debug) {
      console.debug = (...args: any[]) => {
        if (!shouldFilter(args)) {
          originalDebug(...args);
        }
      };
    }

    // Restaurer les fonctions originales au démontage
    return () => {
      console.log = originalLog;
      console.info = originalInfo;
      if (console.debug && originalDebug) {
        console.debug = originalDebug;
      }
    };
  }, []);

  // Ce composant ne rend rien visuellement
  return null;
}
