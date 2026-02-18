'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { UserPlus, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ensureAuthenticatedSession } from '@/lib/utils/session';

interface SignupFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  redirectAfterSuccess?: boolean;
  redirectTo?: string;
}

export function SignupForm({
  onSuccess,
  onError,
  redirectAfterSuccess = true,
  redirectTo = '/account',
}: SignupFormProps) {
  const router = useRouter();
  const { data: session, status, update: updateSession } = useSession();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isSyncingSession, setIsSyncingSession] = useState(false);
  const isRedirectingRef = useRef(false);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validation nom
    if (!name.trim()) {
      errors.name = 'Le nom est requis';
    } else if (name.trim().length < 2) {
      errors.name = 'Le nom doit contenir au moins 2 caractères';
    }

    // Validation email
    if (!email.trim()) {
      errors.email = 'L\'email est requis';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = 'Format d\'email invalide';
    }

    // Validation mot de passe
    if (!password) {
      errors.password = 'Le mot de passe est requis';
    } else if (password.length < 6) {
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    }

    // Validation confirmation mot de passe
    if (!confirmPassword) {
      errors.confirmPassword = 'La confirmation du mot de passe est requise';
    } else if (password !== confirmPassword) {
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    // Validation côté client
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
          name: name.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Gérer les erreurs de validation du serveur
        if (data.details && Array.isArray(data.details)) {
          const serverErrors: Record<string, string> = {};
          data.details.forEach((detail: { path: string[]; message: string }) => {
            if (detail.path && detail.path.length > 0) {
              serverErrors[detail.path[0]] = detail.message;
            }
          });
          setFieldErrors(serverErrors);
        }
        
        const errorMessage = data.error || 'Une erreur est survenue lors de l\'inscription';
        setError(errorMessage);
        
        if (onError) {
          onError(errorMessage);
        }
        return;
      }

      // Succès - Connecter automatiquement l'utilisateur
      try {
        const signInResult = await signIn('credentials', {
          email: email.trim().toLowerCase(),
          password,
          redirect: false,
        });

        if (signInResult?.error) {
          // Si la connexion automatique échoue, rediriger quand même vers la page de connexion
          console.error('Erreur lors de la connexion automatique:', signInResult.error);
          setError('Compte créé avec succès. Veuillez vous connecter.');
          
          if (redirectAfterSuccess) {
            setTimeout(() => {
              router.push(redirectTo);
            }, 1500);
          }
          return;
        }

        // Synchroniser la session avec polling pour garantir l'authentification
        setIsSyncingSession(true);
        
        const isAuthenticated = await ensureAuthenticatedSession(
          () => ({ status, data: session }),
          async () => {
            const updatedSession = await updateSession();
            return updatedSession || null;
          },
          {
            maxAttempts: 15,
            interval: 200,
            timeout: 5000,
          }
        );

        setIsSyncingSession(false);

        if (isAuthenticated) {
          // Session authentifiée - rediriger vers le dashboard
          if (onSuccess) {
            onSuccess();
          }

          if (redirectAfterSuccess) {
            router.push(redirectTo);
            router.refresh();
          }
        } else {
          // Timeout - rediriger quand même (la session devrait se synchroniser côté serveur)
          console.warn('Timeout lors de la synchronisation de session, redirection quand même');
          if (onSuccess) {
            onSuccess();
          }
          
          if (redirectAfterSuccess) {
            router.push(redirectTo);
            router.refresh();
          }
        }
      } catch (signInError) {
        // Erreur lors de la connexion automatique
        console.error('Erreur lors de la connexion automatique:', signInError);
        setIsSyncingSession(false);
        setError('Compte créé avec succès. Veuillez vous connecter.');
        
        if (redirectAfterSuccess) {
          setTimeout(() => {
            router.push(redirectTo);
          }, 1500);
        }
      }
    } catch (err) {
      const errorMessage = 'Une erreur est survenue lors de l\'inscription. Veuillez réessayer.';
      setError(errorMessage);
      
      if (onError) {
        onError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="signup-name">Nom complet</Label>
        <div className="relative">
          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            id="signup-name"
            type="text"
            placeholder="Votre nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`pl-10 ${fieldErrors.name ? 'border-destructive' : ''}`}
            aria-invalid={!!fieldErrors.name}
            disabled={isLoading}
            required
          />
        </div>
        {fieldErrors.name && (
          <p className="text-sm text-destructive">{fieldErrors.name}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            id="signup-email"
            type="email"
            placeholder="votre@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`pl-10 ${fieldErrors.email ? 'border-destructive' : ''}`}
            aria-invalid={!!fieldErrors.email}
            disabled={isLoading}
            required
          />
        </div>
        {fieldErrors.email && (
          <p className="text-sm text-destructive">{fieldErrors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-password">Mot de passe</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            id="signup-password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`pl-10 ${fieldErrors.password ? 'border-destructive' : ''}`}
            aria-invalid={!!fieldErrors.password}
            disabled={isLoading}
            required
          />
        </div>
        {fieldErrors.password && (
          <p className="text-sm text-destructive">{fieldErrors.password}</p>
        )}
        <p className="text-xs text-muted-foreground">
          Minimum 6 caractères
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="signup-confirm-password">Confirmer le mot de passe</Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
          <Input
            id="signup-confirm-password"
            type="password"
            placeholder="••••••••"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`pl-10 ${fieldErrors.confirmPassword ? 'border-destructive' : ''}`}
            aria-invalid={!!fieldErrors.confirmPassword}
            disabled={isLoading}
            required
          />
        </div>
        {fieldErrors.confirmPassword && (
          <p className="text-sm text-destructive">{fieldErrors.confirmPassword}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading || isSyncingSession}>
        <UserPlus className="h-4 w-4 mr-2" />
        {isSyncingSession 
          ? 'Connexion en cours...' 
          : isLoading 
          ? 'Inscription en cours...' 
          : 'Créer mon compte'}
      </Button>
    </form>
  );
}

