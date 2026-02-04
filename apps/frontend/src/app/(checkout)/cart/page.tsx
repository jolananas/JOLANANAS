/**
 * 🍍 JOLANANAS - Page Panier
 * ===========================
 * Page dédiée pour afficher le panier en mode page normale
 */

import { Metadata } from 'next';
import { CartPageClient } from './CartPageClient';

// Generate metadata for SEO
export const metadata: Metadata = {
  title: 'Mon panier - JOLANANAS',
  description: 'Consultez votre panier et finalisez votre commande. Découvrez nos créations artisanales faites main.',
  openGraph: {
    title: 'Mon panier - JOLANANAS',
    description: 'Consultez votre panier et finalisez votre commande.',
  },
};

export default function CartPage() {
  return <CartPageClient />;
}

