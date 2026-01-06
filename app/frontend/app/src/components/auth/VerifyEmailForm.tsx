/**
 * 🍍 JOLANANAS - Formulaire Vérification Email
 * ============================================
 * Composant pour envoyer et vérifier l'email
 */

'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { apiPost } from '@/app/src/lib/api-client';

interface VerifyEmailFormProps {
  email?: string;
  isVerified?: boolean;
  onVerified?: () => void;
}

export function VerifyEmailForm({
  email,
  isVerified = false,
  onVerified,
}: VerifyEmailFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  const handleSendVerification = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const data = await apiPost<{ success: boolean; message?: string; error?: string; verified?: boolean; devToken?: string; devUrl?: string }>(
        '/api/auth/verify-email',
        { action: 'send' },
        {
          timeout: 10000,
          retries: 2,
        }
      );

      if (!data.success) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      if (data.verified) {
        setSuccess(true);
        if (onVerified) {
          onVerified();
        }
      } else {
        setSuccess(true);
        
        // En développement, afficher le token
        if (process.env.NODE_ENV === 'development' && data.devToken) {
          console.log('📧 Token de vérification (DEV):', data.devToken);
          console.log('🔗 URL de vérification (DEV):', data.devUrl);
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyToken = async (token: string) => {
    setIsVerifying(true);
    setError(null);

    try {
      const data = await apiPost<{ success: boolean; message?: string; error?: string }>(
        '/api/auth/verify-email',
        { action: 'verify', token },
        {
          timeout: 10000,
          retries: 2,
        }
      );

      if (!data.success) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      setSuccess(true);
      if (onVerified) {
        onVerified();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerified) {
    return (
      <div className="p-3 rounded-lg bg-green-100 text-green-800 text-sm dark:bg-green-900 dark:text-green-300 flex items-center gap-2">
        <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
        <span>Email vérifié</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3 rounded-lg bg-green-100 text-green-800 text-sm dark:bg-green-900 dark:text-green-300 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
          <span>
            Email de vérification envoyé à {email || 'votre adresse email'}. 
            Vérifiez votre boîte de réception.
          </span>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Mail className="h-4 w-4 text-muted-foreground" />
        <div className="flex-1">
          <p className="text-sm font-medium">Vérifier votre email</p>
          <p className="text-xs text-muted-foreground">
            {email || 'Votre email n\'a pas encore été vérifié'}
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleSendVerification}
          disabled={isLoading || success}
        >
          {isLoading ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Envoi...
            </>
          ) : success ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Envoyé
            </>
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Envoyer
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

