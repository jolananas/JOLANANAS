/**
 * 🍍 JOLANANAS - Client Component pour la Page Panier
 * =====================================================
 * Composant client pour la page panier (nécessaire car ShoppingCart est client)
 */

'use client';

import { ShoppingCart } from '@/components/ecommerce/cart/ShoppingCart';
import { useRouter } from 'next/navigation';

export function CartPageClient() {
  const router = useRouter();
  
  return (
    <main className="container py-8 md:py-12">
      <div className="max-w-4xl mx-auto">
        <ShoppingCart 
          isOpen={true} 
          onClose={() => router.push('/')} 
          variant="page"
        />
      </div>
    </main>
  );
}

