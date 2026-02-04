/**
 * 🍍 JOLANANAS - Shopify API Test Stories
 * ========================================
 * Stories pour tester directement vos API Shopify en temps réel
 */

import type { Meta, StoryObj } from '@storybook/react';
import React, { useState, useEffect } from 'react';
import { AlertCircle, Check } from 'lucide-react';

interface APITestResult {
  loading: boolean;
  data: any;
  error: string | null;
  requestTime: number;
}

interface APITestComponentProps {
  endpoint: string;
  title: string;
  description: string;
  params?: Record<string, any>;
}

function APITestComponent({ endpoint, title, description, params = {} }: APITestComponentProps) {
  const [result, setResult] = useState<APITestResult>({
    loading: false,
    data: null,
    error: null,
    requestTime: 0
  });

  const testAPI = async () => {
    const startTime = Date.now();
    
    setResult(prev => ({        
      ...prev,
      loading: true,
      error: null,
      data: null
    }));

    try {
      // Construire l'URL avec les paramètres
      const url = new URL(endpoint, window.location.origin);
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, String(value));
      });

      console.log('🧪 Test API:', url.toString());

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const requestTime = Date.now() - startTime;

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      setResult({
        loading: false,
        data,
        error: null,
        requestTime
      });

    } catch (error) {
      const requestTime = Date.now() - startTime;
      
      setResult({
        loading: false,
        data: null,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        requestTime
      });
    }
  };

  useEffect(() => {
    testAPI();
  }, [endpoint, JSON.stringify(params)]);

  return (
    <div className="space-y-4 p-6 bg-gradient-to-br from-jolananas-gray-warm to-jolananas-white-soft rounded-lg border">
      {/* En-tête */}
      <div className="space-y-2">
        <h3 className="text-xl font-bold text-jolananas-black-ink">{title}</h3>
        <p className="text-gray-700">{description}</p>
        <code className="text-sm text-gray-600 font-mono bg-gray-100 px-2 py-1 rounded">
          GET {endpoint}
        </code>
      </div>

      {/* Bouton de test */}
      <button
        onClick={testAPI}
        disabled={result.loading}
        className="px-4 py-2 bg-jolananas-pink-medium text-white rounded-lg hover:bg-jolananas-pink-deep disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {result.loading ? '⏳ Test en cours...' : '🔄 Retester API'}
      </button>

      {/* Résultats */}
      <div className="space-y-3">
        {/* Statut */}
        <div className="flex items-center gap-2">
          {result.loading && (
            <div className="flex items-center gap-2 text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <span className="text-sm">Chargement...</span>
            </div>
          )}
          
          {result.error && (
            <div className="flex items-center gap-2 text-red-600">
              {(AlertCircle as any)({ className: "w-4 h-4" })}
              <span className="text-sm">Erreur: {result.error}</span>
            </div>
          )}
          
          {result.data && !result.loading && (
            <div className="flex items-center gap-2 text-green-600">
              {(Check as any)({ className: "w-4 h-4" })}
              <span className="text-sm">Succès ({result.requestTime}ms)</span>
            </div>
          )}
        </div>

        {/* Données */}
        {result.data && (
          <div className="space-y-2">
            <h4 className="font-semibold text-jolananas-black-ink">Réponse JSON:</h4>
            <pre className="text-xs text-gray-700 bg-gray-100 p-3 rounded overflow-auto max-h-64">
              {JSON.stringify(result.data, null, 2)}
            </pre>
            
            {/* Statistiques rapides */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div className="bg-white/50 p-2 rounded">
                <div className="font-medium">Taille</div>
                <div>{JSON.stringify(result.data).length} caractères</div>
              </div>
              <div className="bg-white/50 p-2 rounded">
                <div className="font-medium">Time</div>
                <div>{result.requestTime}ms</div>
              </div>
              {result.data.products && (
                <div className="bg-white/50 p-2 rounded">
                  <div className="font-medium">Produits</div>
                  <div>{result.data.products.edges?.length || 0}</div>
                </div>
              )}
              {result.data.collections && (
                <div className="bg-white/50 p-2 rounded">
                  <div className="font-medium">Collections</div>
                  <div>{result.data.collections.edges?.length || 0}</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const meta: Meta<typeof APITestComponent> = {
  title: 'JOLANANAS/API/ShopifyTests',
  component: APITestComponent,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Tests en temps réel des endpoints API Shopify de JOLANANAS avec vraies données.',
      },
    },
  },
  tags: ['autodocs', 'api-test', 'real-data'],
};

export default meta;
type Story = StoryObj<typeof meta>;

// Test de l'API Produits
export const TestAPIProduits: Story = {
  args: {
    endpoint: '/api/products',
    title: '🛍️ API Produits Shopify',
    description: 'Test de récupération des produits depuis votre API Shopify réelle',
    params: { first: 10 }
  },
};

// Test avec pagination
export const TestAPIProduitsPagination: Story = {
  args: {
    endpoint: '/api/products',
    title: '🛍️ API Produits avec Pagination',
    description: 'Test de la pagination des produits (premiers 5 produits)',
    params: { first: 5 }
  },
};

// Test de l'API Collections
export const TestAPICollections: Story = {
  args: {
    endpoint: '/api/collections',
    title: '📂 API Collections Shopify',
    description: 'Test de récupération des collections depuis votre API Shopify réelle',
    params: { first: 8 }
  },
};

// Test de recherche (si disponible)
export const TestAPIRecherche: Story = {
  args: {
    endpoint: '/api/search',
    title: '🔍 API Recherche Shopify',
    description: 'Test de recherche de produits dans votre boutique Shopify',
    params: { q: 'produit', first: 5 }
  },
};

// Story combinée de tous les tests
export const TestCompletAPI: Story = {
  render: () => (
    <div className="space-y-6 p-6 bg-gradient-to-br from-jolananas-gray-warm to-jolananas-white-soft min-h-screen">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-jolananas-black-ink">
          🧪 Tests Complets API Shopify
        </h2>
        <p className="text-gray-700">
          Tests en temps réel de vos endpoints API avec vraies données de boutique
        </p>
      </div>
      
      <div className="grid gap-6">
        <APITestComponent
          endpoint="/api/products"
          title="🛍️ Produits"
          description="Récupération des produits Shopify"
          params={{ first: 12 }}
        />
        
        <APITestComponent
          endpoint="/api/collections"
          title="📂 Collections"
          description="Récupération des collections Shopify"
          params={{ first: 6 }}
        />
        
        <APITestComponent
          endpoint="/api/products"
          title="🔢 Limite et Performance"
          description="Test avec 20 produits pour voir les performances"
          params={{ first: 20 }}
        />
      </div>
      
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">
          📊 Informations sur vos Tests
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Les tests utilisent vos vraies APIs Shopify</li>
          <li>• Temps de réponse mesurés en temps réel</li>
          <li>• Données JSON complètes affichées</li>
          <li>• Statistiques automatiques générées</li>
          <li>• Actualisable à tout moment avec le bouton "🔄 Retester API"</li>
        </ul>
      </div>
    </div>
  ),
};
