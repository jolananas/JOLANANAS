"use client";

import { ErrorLayout } from "./ErrorLayout";

/**
 * EmptySearchContent - Composant pour l'état vide de la recherche
 * Esthétique "Glitch in the Atelier"
 */
export function EmptySearchContent({ fullScreen = true }: { fullScreen?: boolean }) {
  return (
    <ErrorLayout
      code="?"
      title="Page Blanche."
      description="Aucune correspondance trouvée dans nos archives. Essayez un autre mot-clé ?"
      actionLabel="VOIR TOUTE LA COLLECTION"
      href="/collections"
      showBack={true}
      fullScreen={fullScreen}
    />
  );
}
