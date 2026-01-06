'use client';
import React from 'react';

export function FeaturedProducts() {
  return (
    <section className="py-20 px-4 bg-white/5">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold text-white text-center mb-12">Produits vedettes</h2>
        <div className="text-center text-white/70">
          <p>Chargement des produits...</p>
        </div>
      </div>
    </section>
  );
}
