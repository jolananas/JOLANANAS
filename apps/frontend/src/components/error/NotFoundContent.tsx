import { ErrorLayout } from "@/components/error/ErrorLayout";

/**
 * NotFoundContent - Composant de contenu pour la page 404
 * Utilisé par not-found.tsx à la racine de app/
 */
export function NotFoundContent() {
  return (
    <ErrorLayout
      code="404"
      title="L'art de s'égarer."
      description="Cette page semble avoir été retirée de la collection, ou n'a jamais existé."
      actionLabel="RETOUR À L'ACCUEIL"
      href="/"
      showBack={true}
    />
  );
}
