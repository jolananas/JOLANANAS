/**
 * 🍍 JOLANANAS - Cart Drawer générique
 * ======================================
 * Cart drawer simplifié pour les fichiers externes
 */

'use client';

import React from 'react';

interface CartDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  children?: React.ReactNode;
}

export function CartDrawer({ isOpen = false, onClose, children }: CartDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white p-6 shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Panier</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>
        {children || (
          <div className="text-center text-gray-500">
            Panier vide
          </div>
        )}
      </div>
    </div>
  );
}
