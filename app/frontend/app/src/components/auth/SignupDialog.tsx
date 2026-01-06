/**
 * 🍍 JOLANANAS - Modal d'inscription réutilisable
 * =============================================
 * Dialog modal pour l'inscription utilisateur, utilisable depuis n'importe quelle page
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { UserPlus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { SignupForm } from './SignupForm';
import { Button } from '@/components/ui/Button';

interface SignupDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  redirectAfterSuccess?: boolean;
  redirectTo?: string;
}

export function SignupDialog({
  trigger,
  open: controlledOpen,
  onOpenChange,
  redirectAfterSuccess = true,
  redirectTo = '/account',
}: SignupDialogProps) {
  const router = useRouter();
  const { status, data: session } = useSession();
  const [internalOpen, setInternalOpen] = useState(false);
  
  // Utiliser le state contrôlé si fourni, sinon utiliser le state interne
  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = onOpenChange || setInternalOpen;

  // Fermer automatiquement le dialog quand la session est authentifiée
  useEffect(() => {
    if (status === 'authenticated' && session && isOpen) {
      // Fermer le dialog après un court délai pour permettre la transition
      const timer = setTimeout(() => {
        setIsOpen(false);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [status, session, isOpen, setIsOpen]);

  const handleSuccess = () => {
    // Le dialog se fermera automatiquement via le useEffect quand la session sera authentifiée
    // Si la redirection est activée, elle sera gérée par SignupForm
    // On ne ferme pas immédiatement pour éviter un flash
  };

  const defaultTrigger = (
    <Button variant="default">
      <UserPlus className="h-4 w-4 mr-2" />
      Créer un compte
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      {!trigger && <DialogTrigger asChild>{defaultTrigger}</DialogTrigger>}
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <UserPlus className="h-5 w-5 text-primary" />
            </div>
            Créer un compte
          </DialogTitle>
          <DialogDescription>
            Créez votre compte pour accéder à tous les avantages
          </DialogDescription>
        </DialogHeader>
        
        <SignupForm
          onSuccess={handleSuccess}
          redirectAfterSuccess={redirectAfterSuccess}
          redirectTo={redirectTo}
        />
      </DialogContent>
    </Dialog>
  );
}

