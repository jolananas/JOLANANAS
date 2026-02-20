"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const STORAGE_KEY = "jolananas_gatekeeper_bypass";

export function useGatekeeperLogic() {
  // 1. Initialiser directement avec la valeur env pour éviter le flash blanc
  // Utilisation de NEXT_PUBLIC_ pour l'accès client
  const [shouldBlock, setShouldBlock] = useState(() => {
    const mode = process.env.NEXT_PUBLIC_SITE_MODE;
    return mode;
  });

  const searchParams = useSearchParams();

  useEffect(() => {
    // 2. Vérification Client
    const mode = process.env.NEXT_PUBLIC_SITE_MODE;

    // Si on est en "live", on ne bloque jamais
    if (mode === "live") {
      setShouldBlock(false);
      return;
    }

    // 3. Vérifier le Bypass (Passage Secret) - UNIQUEMENT EN DEV
    const isDev = process.env.NODE_ENV === "development";
    const unlockKey = searchParams.get("unlock");
    const isBypassed = localStorage.getItem(STORAGE_KEY) === "true";

    if (isDev && (unlockKey === "admin" || isBypassed)) {
      localStorage.setItem(STORAGE_KEY, "true");
      setShouldBlock(false);
    } else {
      setShouldBlock(true);
    }
  }, [searchParams]);

  return { shouldBlock, activeMode: process.env.NEXT_PUBLIC_SITE_MODE };
}
