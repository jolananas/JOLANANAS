"use client";

import { useEffect } from "react";
import { ErrorLayout } from "@/components/error/ErrorLayout";

interface ErrorContentProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * ErrorContent - Composant de contenu pour les erreurs 500
 * Utilisé par error.tsx à la racine de app/
 */
export function ErrorContent({ error, reset }: ErrorContentProps) {
  useEffect(() => {
    // Log l'erreur vers un service d'analytics si besoin
    console.error(error);
  }, [error]);

  return (
    <ErrorLayout
      code="500"
      title="Caprice d'Atelier."
      description="Une imperfection technique inattendue. Nos artisans numériques sont sur le coup."
      actionLabel="RÉESSAYER"
      onAction={() => reset()}
    />
  );
}
