"use client";

import { useState, useEffect } from "react";

export function usePreloaderLogic() {
  // isLoading = Le processus est en cours
  // show = Le composant est visible (permet l'animation de sortie avant le démontage)
  const [loadingState, setLoadingState] = useState<{
    isLoading: boolean;
    show: boolean;
  }>({
    isLoading: true,
    show: true,
  });

  useEffect(() => {
    const startTime = Date.now();
    const MIN_DURATION = 1500; // 1.5 secondes minimum

    const initLoad = async () => {
      try {
        // 1. Check API (Health Check Shopify ou DB)
        // On fait un fetch léger pour "réveiller" le backend si nécessaire
        await fetch("/api/health/db", { method: "HEAD" }).catch(() => null);

        // Simulation de chargement des assets critiques (images)
        await document.fonts.ready;
      } catch (e) {
        console.warn("Preloader check passed with warnings");
      }

      // 2. Calcul du temps restant pour respecter les 1.5s
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_DURATION - elapsedTime);

      // 3. Attente et Déclenchement de la sortie
      setTimeout(() => {
        // Étape 1 : On déclenche l'animation (isLoading: false)
        setLoadingState((prev) => ({ ...prev, isLoading: false }));

        // Étape 2 : On supprime le composant du DOM après l'animation (800ms de transition)
        setTimeout(() => {
          setLoadingState((prev) => ({ ...prev, show: false }));
        }, 800);
      }, remainingTime);
    };

    initLoad();
  }, []);

  return loadingState;
}
