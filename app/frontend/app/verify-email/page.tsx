/**
 * 🍍 JOLANANAS - Page Vérification Email
 * ======================================
 * Page pour vérifier l'email avec un token
 */

'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';
import { Badge } from '@/components/ui/Badge';
import { apiPost } from '@/app/src/lib/api-client';
import Link from 'next/link';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();
  const [token, setToken] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    const emailParam = searchParams.get('email');
    
    if (tokenParam && emailParam) {
      setToken(tokenParam);
      // Vérifier automatiquement si token présent
      handleVerify(tokenParam);
    }
  }, [searchParams]);

  const handleVerify = async (verifyToken?: string) => {
    const tokenToVerify = verifyToken || token;
    
    if (!tokenToVerify) {
      setError('Token manquant');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const data = await apiPost<{ success: boolean; message?: string; error?: string }>(
        '/api/auth/verify-email',
        { action: 'verify', token: tokenToVerify },
        {
          timeout: 10000,
          retries: 2,
        }
      );

      if (!data.success) {
        throw new Error(data.error || 'Une erreur est survenue');
      }

      setSuccess(true);
      
      // Mettre à jour la session
      await updateSession();
      
      // Rediriger vers la page compte après 2 secondes
      setTimeout(() => {
        router.push('/account');
      }, 2000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
    } finally {
      setIsVerifying(false);
    }
  };

  if (success) {
    return (
      <main className="container py-12 md:py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-2xl">Email vérifié</CardTitle>
                <CardDescription>
                  Votre email a été vérifié avec succès. Vous allez être redirigé vers votre compte.
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full">
                <Link href="/account">Accéder à mon compte</Link>
              </Button>
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
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Vérification de l'email</CardTitle>
              <CardDescription>
                {token ? 'Vérification en cours...' : 'Entrez le token reçu par email'}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {!token && (
              <div className="space-y-2">
                <Label htmlFor="token">Token de vérification</Label>
                <Input
                  id="token"
                  type="text"
                  placeholder="Token reçu par email"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  disabled={isVerifying}
                />
                <Button
                  type="button"
                  className="w-full"
                  onClick={() => handleVerify()}
                  disabled={isVerifying || !token}
                >
                  {isVerifying ? 'Vérification...' : 'Vérifier'}
                </Button>
              </div>
            )}

            {isVerifying && (
              <div className="flex flex-col items-center justify-center py-8">
                <Skeleton className="h-8 w-8 rounded-full mb-4" />
                <Skeleton className="h-4 w-32" />
              </div>
            )}

            <div className="text-center text-sm">
              <Button variant="link" asChild className="p-0 h-auto">
                <Link href="/account">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Retour à mon compte
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <main className="container py-12 md:py-16">
        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Skeleton className="h-12 w-12 rounded-full mb-4" />
            <Skeleton className="h-4 w-32" />
          </CardContent>
        </Card>
      </main>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}

