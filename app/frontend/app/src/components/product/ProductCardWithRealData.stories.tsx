/**
 * 🍍 JOLANANAS - Stories ProductCard avec VRAIES Données Shopify
 * ==============================================================
 * Stories qui chargement directement depuis votre API Shopify réelle
 */

import type { Meta, StoryObj } from '@storybook/react';
import { ProductCard } from './ProductCard';
import { useShopifyContext } from '../../../../.storybook/decorators/ShopifyDataDecorator';

const meta: Meta<typeof ProductCard> = {
  title: 'JOLANANAS/Product/ProductCard-RealData',
  component: ProductCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Composant ProductCard utilisant les VRAIES données Shopify de JOLANANAS en temps réel.',
      },
    },
  },
  tags: ['autodocs', 'real-data'],
  argTypes: {
    product: {
      description: 'Objet produit Shopify réel (chargé depuis votre API)',
    },
    variant: {
      control: { type: 'select' },
      options: ['default', 'compact', 'featured'],
      description: 'Variante d\'affichage du produit',
    },
    showQuickAction: {
      control: { type: 'boolean' },
      description: 'Afficher le bouton d\'action rapide',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

// Story avec le premier produit Shopify réel
export const PremierProduitShopify: Story = {
  render: (args) => {
    const { products, realShopifyData } = useShopifyContext();
    
    if (!realShopifyData.hasProducts) {
      return (
        <div className="p-8 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <p className="text-yellow-800">Chargement des produits Shopify...</p>
        </div>
      );
    }

    const premierProduit = products[0];
    
    if (!premierProduit) {
      return (
        <div className="p-8 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-red-800">Aucun produit trouvé dans votre boutique Shopify</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="text-center p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium">✅ Données Shopify Réelles</p>
          <p className="text-sm text-green-600">
            {realShopifyData.productsCount} produits • Dernière MAJ: {realShopifyData.lastUpdated}
          </p>
        </div>
        
        <ProductCard 
          {...args}
          product={premierProduit}
          showQuickAction={true}
        />
      </div>
    );
  },
  args: {},
};

// Story avec plusieurs produits Shopify réels
export const CollectionProduitsShopify: Story = {
  args: {},
  render: (args) => {
    const { products, realShopifyData } = useShopifyContext();
    
    if (!realShopifyData.hasProducts) {
      return (
        <div className="p-8 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <p className="text-yellow-800">Chargement de vos produits Shopify...</p>
        </div>
      );
    }

    // Prendre les 3 premiers produits de votre boutique
    const productsToShow = products.slice(0, 3);

    return (
      <div className="space-y-6">
        <div className="text-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-bold text-blue-900">Collection JOLANANAS</h3>
          <p className="text-blue-700">
            {realShopifyData.productsCount} produits dans votre boutique • 
            Chargés en direct depuis Shopify API
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {productsToShow.map((product, index) => (
            <div key={product.id} className="space-y-2">
              <div className="text-xs text-gray-500 font-mono">
                Produit #{index + 1}: {product.handle}
              </div>
              
              <ProductCard 
                {...args}
                product={product}
                showQuickAction={true}
                variant={index === 1 ? 'featured' : 'default'} // Le produit du milieu en featured
              />
            </div>
          ))}
        </div>
      </div>
    );
  },
};

// Story pour tester différents variants avec vraies données
export const VariantsRealData: Story = {
  args: {},
  render: (args) => {
    const { products, realShopifyData } = useShopifyContext();
    
    if (!realShopifyData.hasProducts) {
      return (
        <div className="p-8 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <p className="text-yellow-800">Chargement des produits Shopify...</p>
        </div>
      );
    }

    const productToTest = products[0];
    
    if (!productToTest) {
      return (
        <div className="p-8 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-red-800">Aucun produit disponible</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        <div className="text-center p-4 bg-purple-50 border border-purple-200 rounded-lg">
          <h3 className="text-lg font-bold text-purple-900">
            Test des Variants avec "{productToTest.title}"
          </h3>
          <p className="text-purple-700">Produit réel de votre boutique Shopify</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Default</h4>
            <ProductCard 
              product={productToTest}
              variant="default"
              showQuickAction={true}
            />
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Compact</h4>
            <ProductCard 
              product={productToTest}
              variant="compact"
              showQuickAction={false}
            />
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-gray-700">Featured</h4>
            <ProductCard 
              product={productToTest}
              variant="featured"
              showQuickAction={true}
            />
          </div>
        </div>
      </div>
    );
  },
};

// Story pour voir toutes les informations du produit Shopify
export const DebugProductData: Story = {
  args: {},
  render: (args) => {
    const { products, realShopifyData } = useShopifyContext();
    
    if (!realShopifyData.hasProducts) {
      return (
        <div className="p-8 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
          <p className="text-yellow-800">Chargement des produits Shopify...</p>
        </div>
      );
    }

    const debugProduct = products[0];
    
    if (!debugProduct) {
      return (
        <div className="p-8 bg-red-50 border border-red-200 rounded-lg text-center">
          <p className="text-red-800">Aucun produit disponible</p>
        </div>
      );
    }

    return (
      <div className="space-y-6 bg-gradient-to-br from-jolananas-gray-warm to-jolananas-white-soft p-8 rounded-lg">
        <h3 className="text-2xl font-bold text-jolananas-black-ink mb-6">
          Debug - Données Produit Shopify Réelles
        </h3>
        
        {/* Affichage du produit */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold text-jolananas-black-ink mb-4">
              Composant ProductCard
            </h4>
            <ProductCard 
              product={debugProduct}
              showQuickAction={true}
            />
          </div>
          
          <div>
            <h4 className="text-lg font-semibold text-jolananas-black-ink mb-4">
              Données Shopify JSON
            </h4>
            <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
              <pre className="text-xs text-gray-700">
                {JSON.stringify(debugProduct, null, 2)}
              </pre>
            </div>
          </div>
        </div>
        
        {/* Statistiques */}
        <div className="bg-white/50 p-4 rounded-lg">
          <h4 className="font-semibold text-jolananas-black-ink mb-2">Statistiques Boutique</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Total produits: {realShopifyData.productsCount}</li>
            <li>• Disponible: {debugProduct.availableForSale ? 'Oui' : 'Non'}</li>
            <li>• Variants: {debugProduct.variants?.edges?.length || 0}</li>
            <li>• Images: {debugProduct.images?.edges?.length || 0}</li>
            <li>• Prix: {debugProduct.priceRange?.minVariantPrice?.amount} {debugProduct.priceRange?.minVariantPrice?.currencyCode}</li>
            <li>• Dernière MAJ: {realShopifyData.lastUpdated}</li>
          </ul>
        </div>
      </div>
    );
  },
};
