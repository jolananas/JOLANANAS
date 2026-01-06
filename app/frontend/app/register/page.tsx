/**
 * 🍍 JOLANANAS - Page d'Inscription
 * ================================
 * Page dédiée pour l'inscription utilisateur
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { UserPlus, LogIn } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Separator } from '@/components/ui/Separator';
import { SignupForm } from '@/components/auth/SignupForm';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  // Rediriger si déjà connecté
  React.useEffect(() => {
    if (status === 'authenticated' && session) {
      router.push('/account');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return (
      <main className="container py-12 md:py-16">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
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
              <UserPlus className="h-8 w-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl">Créer un compte</CardTitle>
              <CardDescription>
                Inscrivez-vous pour accéder à tous les avantages
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <SignupForm
              redirectAfterSuccess={true}
              redirectTo="/account"
            />

            <Separator className="my-6" />

            <div className="text-center text-sm text-muted-foreground">
              <p>Vous avez déjà un compte ?</p>
              <Button
                variant="link"
                className="p-0 h-auto mt-2"
                asChild
              >
                <Link href="/login">
                  <LogIn className="h-4 w-4 mr-2" />
                  Se connecter
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

