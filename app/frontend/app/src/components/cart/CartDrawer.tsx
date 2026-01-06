/**
 * 🍍 JOLANANAS - Cart Drawer
 * ============================
 * Panier latéral avec animations fluides
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { cn } from '@/app/src/lib/utils/cn';
import { Button } from '@/components/ui/Button';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-gradient-to-br from-jolananas-peach-light via-jolananas-pink-medium to-jolananas-pink-deep shadow-2xl z-50 overflow-hidden"
          >
            <div className="flex flex-col h-full">
              
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-white/20">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="h-6 w-6 text-white" />
                  <h2 className="text-xl font-bold text-white">Votre panier</h2>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-white hover:text-jolananas-gold"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Cart empty state */}
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingBag className="h-16 w-16 text-white/30 mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Votre panier est vide
                  </h3>
                  <p className="text-white/70 mb-6">
                    Découvrez nos créations artisanales et ajoutez vos favoris à votre panier.
                  </p>
                  <Button
                    onClick={onClose}
                    className="bg-white/10 text-white border border-white/20 hover:bg-white/20"
                  >
                    Continuer mes achats
                  </Button>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/20 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-white">
                    <span>Sous-total</span>
                    <span>0,00 €</span>
                  </div>
                  <Button className="w-full" disabled>
                    Finaliser la commande
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
