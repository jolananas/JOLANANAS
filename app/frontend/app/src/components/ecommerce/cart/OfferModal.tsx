/**
 * 🍍 JOLANANAS - Offer Modal Component
 * =====================================
 * Modales promotionnelles avec timer
 * Intègre les variantes Shadcn Studio avec design system JOLANANAS
 * Microcopy persuasive sans confirmhaming
 */

'use client';

import React, { useState, useEffect } from 'react';
import { X, Gift, Clock, Sparkles, Truck, Percent } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { useCart } from '@/lib/CartContext';
import type { Offer, BaseEcommerceProps } from '@/app/src/types/ecommerce';

interface OfferModalProps extends BaseEcommerceProps {
  offer: Offer;
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
}

export function OfferModal({ offer, isOpen, onClose, onAccept, className }: OfferModalProps) {
  const { totalPrice } = useCart();
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [hasAccepted, setHasAccepted] = useState(false);

  // Calculer le temps restant
  useEffect(() => {
    if (!isOpen || !offer.validUntil) return;

    const updateTimer = () => {
      const now = new Date();
      const end = new Date(offer.validUntil);
      const diff = Math.max(0, end.getTime() - now.getTime());
      setTimeRemaining(Math.floor(diff / 1000));
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [isOpen, offer.validUntil]);

  // Formater le temps restant
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Vérifier l'éligibilité
  const isEligible = () => {
    if (offer.conditions?.minCartValue) {
      return totalPrice >= offer.conditions.minCartValue;
    }
    return true;
  };

  // Gérer l'acceptation de l'offre
  const handleAccept = () => {
    setHasAccepted(true);
    if (onAccept) {
      onAccept();
    }
    // Fermer après un court délai
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  // Calculer le pourcentage de progression du timer
  const timerProgress = offer.validUntil
    ? Math.max(0, Math.min(100, (timeRemaining / (24 * 3600)) * 100))
    : 0;

  if (!isOpen || !offer.isActive) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {offer.type === 'discount' && <Percent className="h-5 w-5 text-jolananas-pink-medium" />}
              {offer.type === 'free-shipping' && <Truck className="h-5 w-5 text-jolananas-pink-medium" />}
              {offer.type === 'gift' && <Gift className="h-5 w-5 text-jolananas-pink-medium" />}
              {offer.type === 'bundle' && <Sparkles className="h-5 w-5 text-jolananas-pink-medium" />}
              <DialogTitle>{offer.title}</DialogTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
              aria-label="Fermer"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <DialogDescription>{offer.description}</DialogDescription>
        </DialogHeader>

        <div className={`offer-modal ${className}`}>
          {/* Timer */}
          {offer.validUntil && timeRemaining > 0 && (
            <Card className="bg-gradient-to-r from-jolananas-pink-medium/10 to-jolananas-pink-deep/10 border-jolananas-pink-medium/20 mb-4">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-jolananas-pink-medium" />
                    <span className="font-semibold">Temps restant</span>
                  </div>
                  <Badge variant="destructive" className="font-mono text-lg">
                    {formatTime(timeRemaining)}
                  </Badge>
                </div>
                <Progress value={timerProgress} className="h-2" />
              </CardContent>
            </Card>
          )}

          {/* Détails de l'offre */}
          <Card className="bg-muted/50 mb-4">
            <CardContent className="p-4 space-y-3">
              {offer.type === 'discount' && offer.value && (
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="text-lg px-3 py-1">
                    -{offer.value}%
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    sur votre commande
                  </span>
                </div>
              )}
              {offer.type === 'free-shipping' && (
                <div className="flex items-center gap-2">
                  <Truck className="h-5 w-5 text-jolananas-pink-medium" />
                  <span className="text-sm font-medium">
                    Livraison gratuite offerte
                  </span>
                </div>
              )}
              {offer.type === 'gift' && (
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-jolananas-pink-medium" />
                  <span className="text-sm font-medium">
                    Cadeau offert avec votre commande
                  </span>
                </div>
              )}

              {/* Conditions */}
              {offer.conditions && (
                <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t">
                  {offer.conditions.minCartValue && (
                    <p>
                      Valable pour les commandes de {offer.conditions.minCartValue}€ minimum
                    </p>
                  )}
                  {offer.validUntil && (
                    <p>
                      Offre valable jusqu'au {new Date(offer.validUntil).toLocaleDateString('fr-FR')}
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Éligibilité */}
          {!isEligible() && offer.conditions?.minCartValue && (
            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                Ajoutez encore {(offer.conditions.minCartValue - totalPrice).toFixed(2)}€ à votre panier 
                pour bénéficier de cette offre.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-2">
            {hasAccepted ? (
              <div className="text-center py-4">
                <p className="text-green-600 font-semibold mb-2">
                  ✓ Offre appliquée avec succès !
                </p>
                <p className="text-sm text-muted-foreground">
                  L'offre a été ajoutée à votre panier.
                </p>
              </div>
            ) : (
              <>
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-jolananas-pink-medium to-jolananas-pink-deep hover:from-jolananas-pink-deep hover:to-jolananas-pink-medium text-white"
                  onClick={handleAccept}
                  disabled={!isEligible()}
                >
                  {isEligible() ? (
                    <>
                      <Gift className="mr-2 h-4 w-4" />
                      Profiter de l'offre
                    </>
                  ) : (
                    'Panier insuffisant'
                  )}
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={onClose}
                >
                  Non merci
                </Button>
              </>
            )}
          </div>

          {/* Microcopy de réassurance */}
          <p className="text-xs text-center text-muted-foreground mt-4">
            Cette offre est limitée dans le temps. Profitez-en maintenant !
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

