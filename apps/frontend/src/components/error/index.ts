/**
 * Error Components - Système de gestion des erreurs "Glitch in the Atelier"
 *
 * Architecture:
 * - ErrorLayout: Composant master réutilisable pour toutes les pages d'erreur
 * - NotFoundContent: Contenu de la page 404
 * - ErrorContent: Contenu de la page 500 (error boundary)
 */

export { ErrorLayout } from "./ErrorLayout";
export { NotFoundContent } from "./NotFoundContent";
export { ErrorContent } from "./ErrorContent";
export { EmptyCartContent } from "./EmptyCartContent";
export { EmptySearchContent } from "./EmptySearchContent";
export { MaintenanceContent } from "./MaintenanceContent";
