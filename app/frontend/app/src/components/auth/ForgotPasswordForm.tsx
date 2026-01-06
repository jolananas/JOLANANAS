/**
 * 🍍 JOLANANAS - Formulaire Mot de Passe Oublié
 * ============================================
 * Composant pour demander une réinitialisation de mot de passe
 */

'use client';

import React, { useState } from 'react';
import { Mail, ArrowLeft, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { apiPost } from '@/app/src/lib/api-client';

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onBack?: () => void;
}

export function ForgotPasswordForm({
  onSuccess,
  onBack,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const validateEmail = (emailValue: string): boolean => {
    if (!emailValue.trim()) {
      setEmailError('L\'email est requis');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      setEmailError('Format d\'email invalide');
      return false;
    }
    setEmailError(null);
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!validateEmail(email)) {
      return;
    }

    setIsLoading(true);

    try {
      const data = await apiPost<{ success: boolean; message?: string; error?: string; devToken?: string; devUrl?: string }>(
        '/api/auth/forgot-password',
        { email: email.trim().toLowerCase() },
        {
          timeout: 10000,
          retries: 2,
        }
      );

      if (!data.success) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      setSuccess(true);
      
      // En développement, afficher le token
      if (process.env.NODE_ENV === 'development' && data.devToken) {
        console.log('🔐 Token de réinitialisation (DEV):', data.devToken);
        console.log('🔗 URL de réinitialisation (DEV):', data.devUrl);
      }

      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 3000);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
            Si cet email existe, un lien de réinitialisation a été envoyé. 
            Vérifiez votre boîte de réception.
          </span>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="forgot-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            id="forgot-email"
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (emailError) {
                validateEmail(e.target.value);
              }
            }}
            onBlur={() => validateEmail(email)}
            className={`pl-10 ${emailError ? 'border-destructive' : ''}`}
            aria-invalid={!!emailError}
            disabled={isLoading || success}
            required
          />
        </div>
        {emailError && (
          <p className="text-sm text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" />
            {emailError}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Nous vous enverrons un lien pour réinitialiser votre mot de passe
        </p>
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading || success}
      >
        {isLoading ? 'Envoi en cours...' : success ? 'Email envoyé' : 'Envoyer le lien de réinitialisation'}
      </Button>

      {onBack && (
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={onBack}
          disabled={isLoading}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour à la connexion
        </Button>
      )}
    </form>
  );
}

