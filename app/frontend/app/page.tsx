/**
 * 🍍 JOLANANAS - Page d'Accueil
 * ==============================
 * Page d'accueil avec chargement des produits côté client via API
 */

import { HomePageClient } from '@/app/src/components/pages/HomePageClient';

export default function HomePage() {
  return <HomePageClient />;
}

// Données statiques pour SSR
export async function generateMetadata() {
  return {
    title: 'JOLANANAS - Créations Manuelles Hautes Gammes',
    description: 'Découvrez les créations artisanales exclusives de JOLANANAS. Bijoux personnalisés et accessoires haut de gamme.',
    openGraph: {
      title: 'JOLANANAS - Accueil',
      description: 'Découvrez les créations artisanales exclusives de JOLANANAS.',
    },
  };
}