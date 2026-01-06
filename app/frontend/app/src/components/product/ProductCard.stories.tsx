/**
 * 🍍 JOLANANAS - ProductCard Stories
 * ==================================
 * Stories pour le composant ProductCard utilisant les vraies données Shopify
 * AUCUNE donnée mockée autorisée - seules les vraies données de production
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ProductCard } from './ProductCard';
import { withShopifyData } from '../../../../.storybook/decorators/ShopifyDataDecorator';

const meta: Meta<typeof ProductCard> = {
  title: 'JOLANANAS/Product/ProductCard',
  component: ProductCard,
  decorators: [withShopifyData], // Utilise les vraies données Shopify
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Composant ProductCard pour afficher les produits JOLANANAS avec le design signature du storefront.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    product: {
      description: 'Objet produit Shopify avec toutes les données nécessaires - automatiquement alimentée par le décorateur ShopifyDataDecorator',
      control: { type: 'object' }
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// =============================================================================
// STORY AVEC VRAIES DONNÉES SHOPIFY - AUTOMATIQUE
// =============================================================================

export const WithRealShopifyData: Story = {
  name: 'Données Shopify Réelles',
  parameters: {
    docs: {
      description: {
        story: 'Cette story utilise automatiquement les vraies données de votre boutique Shopify via le décorateur withShopifyData. Aucune donnée factice n\'est utilisée.',
      },
    },
  },
  render: (args) => {
    // Cette story sera automatiquement alimentée par le décorateur ShopifyDataDecorator
    // qui charge les vraies données depuis l'API Shopify
    return <ProductCard {...args} />;
  },
};

// =============================================================================
// STORIES DE STRUCTURE ET VARIANTES AVEC DONNÉES RÉELLES
// =============================================================================

export const DefaultLayout: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Layout par défaut avec toutes les informations produit. Utilise les vraies données Shopify automatiquement.',
      },
    },
  },
};

export const ProductDetails: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Affichage détaillé avec toutes les informations produit. Utilise les vraies données Shopify automatiquement.',
      },
    },
  },
};

export const Interactive: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Version interactive avec toutes les actions disponibles. Utilise les vraies données Shopify automatiquement.',
      },
    },
  },
};

// =============================================================================
// NOTES IMPORTANTES
// =============================================================================

/**
 * IMPORTANT - RÈGLES STRICTES :
 * 
 * ✅ UTILISE LES VRAIES DONNÉES SHOPIFY :
 * - Toutes les stories sont automatiquement alimentées par le décorateur withShopifyData
 * - Les données viennent directement de votre boutique Shopify via API
 * - Aucune donnée mockée, factice ou exemple n'est autorisée
 * 
 * ❌ INTERDICTION STRICTE :
 * - Pas de données constantes ou hardcodées
 * - Pas de mocks, fake data, test data, ou placeholders
 * - Pas de données d'exemple dans les stories
 * 
 * 🔄 DONNÉES RÉELLES :
 * - Produits, prix, images, variantes = données de production Shopify
 * - Structure des données conforme au GraphQL Shopify
 * - Devises toujours en EUR comme configurées
 * 
 * Si l'API Shopify n'est pas disponible, les stories affichent une erreur
 * au lieu d'utiliser des données factices.
 */