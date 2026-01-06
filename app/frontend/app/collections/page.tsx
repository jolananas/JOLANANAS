import { Metadata } from 'next';
import { CollectionsListClient } from '@/app/src/components/pages/CollectionsListClient';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Toutes nos Collections - JOLANANAS',
  description: 'Découvrez toutes nos collections exclusives de produits artisanaux et authentiques.',
  openGraph: {
    title: 'Toutes nos Collections - JOLANANAS',
    description: 'Découvrez toutes nos collections exclusives de produits artisanaux et authentiques.',
  },
};

export default function CollectionsPage() {
  return <CollectionsListClient />;
}

