"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

const STORAGE_KEY = "jolananas_gatekeeper_bypass";

export function useGatekeeperLogic() {
  const [shouldBlock, setShouldBlock] = useState(false);
  const searchParams = useSearchParams();

  useEffect(() => {
    // 1. Vérifier la clé .env
    const mode = process.env.SITE_MODE || "live";

    // Si on est en "live", on ne bloque jamais
    if (mode === "live") {
      setShouldBlock(false);
      return;
    }

    // 2. Vérifier le Bypass (Passage Secret) - UNIQUEMENT EN DEV
    // Si l'URL contient ?unlock=admin OU si le navigateur a déjà le cookie
    // ET que nous sommes en environnement de développement
    const isDev = process.env.NODE_ENV === "development";
    const unlockKey = searchParams.get("unlock");
    const isBypassed = localStorage.getItem(STORAGE_KEY) === "true";

    if (isDev && (unlockKey === "admin" || isBypassed)) {
      localStorage.setItem(STORAGE_KEY, "true"); // On mémorise l'accès
      setShouldBlock(false); // On laisse passer
    } else {
      setShouldBlock(true); // On bloque
    }
  }, [searchParams]);

  return { shouldBlock, activeMode: process.env.SITE_MODE };
}
