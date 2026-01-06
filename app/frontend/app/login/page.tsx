/**
 * 🍍 JOLANANAS - Page de Connexion
 * ================================
 * Page dédiée pour la connexion utilisateur
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSession, signIn } from 'next-auth/react';
import { LogIn, Mail, Lock, User } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Separator } from '@/components/ui/Separator';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Progress } from '@/components/ui/Progress';
import { Skeleton } from '@/components/ui/Skeleton';
import Link from 'next/link';
import { ensureAuthenticatedSession } from '@/lib/utils/session';

export default function LoginPage() {
  const router = useRouter();
  const { data: session, status, update: updateSession } = useSession();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncingSession, setIsSyncingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isRedirectingRef = useRef(false);

  // Rediriger si déjà connecté ou après authentification réussie
  useEffect(() => {
    if (status === 'authenticated' && session && !isRedirectingRef.current) {
      isRedirectingRef.current = true;
      router.push('/account');
      router.refresh();
    }
  }, [status, session, router]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email ou mot de passe incorrect');
        setIsLoading(false);
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
        router.push('/account');
        router.refresh();
      } else {
        // Timeout - rediriger quand même (la session devrait se synchroniser côté serveur)
        console.warn('Timeout lors de la synchronisation de session, redirection quand même');
        router.push('/account');
        router.refresh();
      }
    } catch (err) {
      setIsSyncingSession(false);
      setError('Une erreur est survenue lors de la connexion');
      setIsLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <main className="container py-12 md:py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-20">
              <Skeleton className="h-12 w-12 rounded-full mb-4" />
              <Skeleton className="h-4 w-32 mb-2" />
              <Skeleton className="h-4 w-24" />
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  return (
    <main className="container py-12 md:py-16">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <LogIn className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Connexion</CardTitle>
              <CardDescription>
                Connectez-vous à votre compte JOLANANAS
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading && (
              <div className="mb-4">
                <Progress value={undefined} className="h-2" />
              </div>
            )}
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || isSyncingSession}>
                <LogIn className="h-4 w-4 mr-2" />
                {isSyncingSession 
                  ? 'Synchronisation...' 
                  : isLoading 
                  ? 'Connexion...' 
                  : 'Se connecter'}
              </Button>
            </form>

            <Separator className="my-6" />

            <div className="text-center text-sm text-muted-foreground">
              <p>Pas encore de compte ?</p>
              <Button
                variant="link"
                className="p-0 h-auto mt-2"
                asChild
              >
                <Link href="/register">
                  Créer un compte
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

