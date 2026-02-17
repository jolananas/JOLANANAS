"use client";

import { ErrorLayout } from "./ErrorLayout";

/**
 * MaintenanceContent - Composant pour la page de maintenance
 * Esthétique "Glitch in the Atelier"
 */
export function MaintenanceContent() {
  return (
    <ErrorLayout
      code="🔧"
      title="En coulisses."
      description="Nous préparons la prochaine collection. Revenez bientôt pour l'avant-première."
      actionLabel="RETOUR À L'ACCUEIL"
      href="/"
      showBack={false}
    />
  );
}
