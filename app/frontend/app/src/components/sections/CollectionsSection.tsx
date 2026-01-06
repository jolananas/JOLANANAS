/**
 * 🍍 JOLANANAS - Collections Section
 * ====================================
 * Section collection avec données Shopify réelles
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';

interface Collection {
  id: string;
  title: string;
  handle: string;
  description?: string;
  image?: {
    url: string;
    altText?: string;
  };
}

export function CollectionsSection() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        const response = await fetch('/api/collections?first=6');
        if (!response.ok) throw new Error('Erreur de chargement');
        
        const data = await response.json();
        const collectionsData = data.collections?.edges?.map((edge: any) => edge.node) || [];
        setCollections(collectionsData);
      } catch (err) {
        console.error('❌ Erreur collections:', err);
        setError(err instanceof Error ? err.message : 'Erreur inconnue');
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  if (loading) {
    return (
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Nos Collections
          </h2>
          <div className="flex justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-white border-t-jolananas-gold rounded-full"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Nos Collections
          </h2>
          <div className="text-center text-white/70">
            <p>❌ {error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4">
      <div className="container mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
            <Sparkles className="text-jolananas-gold mr-2 h-4 w-4" />
            <span className="text-sm font-medium text-white">Collections Exclusives</span>
          </div>

          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
            Découvrez Nos Univers <span className="text-jolananas-gold">Artisanaux</span>
          </h2>
          
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Chaque collection raconte une histoire unique, façonnée avec passion et dévoué à créer des pièces exceptionnelles
          </p>
        </motion.div>

        {/* Collections Grid */}
        {collections.length === 0 ? (
          <div className="text-center text-white/70">
            <div className="text-6xl mb-4">📂</div>
            <p>Aucune collection disponible pour le moment</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {collections.map((collection, index) => (
              <motion.div
                key={collection.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group relative bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                {/* Image ou placeholder */}
                <div className="aspect-[4/3] bg-gradient-to-br from-jolananas-peach-light to-jolananas-pink-medium relative overflow-hidden">
                  {collection.image ? (
                    <img 
                      src={collection.image.url} 
                      alt={collection.image.altText || collection.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-4xl text-jolananas-pink-deep">📂</span>
                    </div>
                  )}
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  {/* Bouton */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => window.location.href = `/collections/${collection.handle}`}
                      className="bg-white text-jolananas-pink-deep px-6 py-3 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center"
                    >
                      Découvrir
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </motion.button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-jolananas-black-ink mb-2">
                    {collection.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-4">
                    {collection.description || 'Collection artisanale exclusive JOLANANAS, créée avec passion et expertise française.'}
                  </p>

                  {/* Navigation rapide */}
                  <button
                    onClick={() => window.location.href = `/collections/${collection.handle}`}
                    className="text-jolananas-pink-medium text-sm font-medium hover:text-jolananas-pink-deep transition-colors flex items-center group"
                  >
                    Voir les produits
                    <ChevronRight className="ml-1 h-3 w-3 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>

                {/* Decoration */}
                <div className="absolute top-4 right-4 w-2 h-2 bg-jolananas-gold rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <p className="text-white/80 mb-6">Explorez toutes nos créations artisanales</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/cards/all'}
            className="bg-gradient-to-r from-jolananas-pink-medium to-jolananas-pink-deep text-white px-8 py-4 rounded-full font-medium hover:shadow-xl transition-all duration-300"
          >
            Voir Toute la Collection
          </motion.button>
        </motion.div>
      </div>
    </section>
  );
}
