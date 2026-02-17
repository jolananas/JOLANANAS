"use client";

import { ErrorLayout } from "./ErrorLayout";

/**
 * EmptyCartContent - Composant pour l'état vide du panier
 * Esthétique "Glitch in the Atelier"
 */
export function EmptyCartContent({ fullScreen = true }: { fullScreen?: boolean }) {
  return (
    <ErrorLayout
      code="🛒"
      title="Le vide est chic."
      description="Votre panier attend sa première pièce de collection. Une touche de fantaisie ?"
      actionLabel="DÉCOUVRIR LES NOUVEAUTÉS"
      href="/collections"
      showBack={true}
      fullScreen={fullScreen}
    />
  );
}
