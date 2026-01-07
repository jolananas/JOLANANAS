/**
 * 🍍 JOLANANAS - Page Compte
 * ==========================
 * Page de gestion du compte utilisateur avec authentification NextAuth
 */

'use client';

import React, { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useSearchParams, useRouter } from 'next/navigation';
import { User, LogIn, LogOut, Mail, Package, MapPin, Settings, Lock, UserPlus, AlertCircle, CheckCircle2, Shield } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Separator } from '@/components/ui/Separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { SignupForm } from '@/components/auth/SignupForm';
import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm';
import { VerifyEmailForm } from '@/components/auth/VerifyEmailForm';
import { AvatarUpload } from '@/components/account/AvatarUpload';
import { apiPut, apiGet } from '@/app/src/lib/api-client';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { ensureAuthenticatedSession } from '@/lib/utils/session';
import { UserDashboard } from '@/components/dashboard/UserDashboard';

// Lazy loading des composants lourds
const AddressList = dynamic(() => import('@/components/account/AddressList').then(mod => ({ default: mod.AddressList })), {
  loading: () => <div className="flex flex-col items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div><p className="text-muted-foreground">Chargement...</p></div>,
  ssr: false,
});

const OrderList = dynamic(() => import('@/components/account/OrderList').then(mod => ({ default: mod.OrderList })), {
  loading: () => <div className="flex flex-col items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div><p className="text-muted-foreground">Chargement...</p></div>,
  ssr: false,
});

const PreferencesForm = dynamic(() => import('@/components/account/PreferencesForm').then(mod => ({ default: mod.PreferencesForm })), {
  loading: () => <div className="flex flex-col items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div><p className="text-muted-foreground">Chargement...</p></div>,
  ssr: false,
});

// ActiveSessions supprimé - les sessions sont maintenant gérées par Shopify Customer Accounts

function AccountPageContent() {
  const { data: session, status, update: updateSession } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncingSession, setIsSyncingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'login' | 'signup' | 'forgot'>('login');
  const [emailError, setEmailError] = useState<string | null>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const hasCheckedSessionRef = useRef(false);

  // États pour la gestion du profil (déclarés avant tous les returns conditionnels)
  const [profileName, setProfileName] = useState(session?.user?.name);
  const [originalProfileName, setOriginalProfileName] = useState(session?.user?.name);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const profileSuccessTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // États pour le changement de mot de passe (déclarés avant tous les returns conditionnels)
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const passwordSuccessTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Détecter automatiquement quand la session devient disponible après authentification
  useEffect(() => {
    // Si la session est authentifiée, s'assurer que le dashboard s'affiche
    if (status === 'authenticated' && session) {
      // Si c'est la première fois qu'on détecte la session authentifiée, forcer un refresh
      if (!hasCheckedSessionRef.current) {
        hasCheckedSessionRef.current = true;
        router.refresh();
      }
    } else if (status === 'unauthenticated') {
      // Réinitialiser le flag si l'utilisateur se déconnecte
      hasCheckedSessionRef.current = false;
    }
  }, [status, session, router]);

  // Gérer les paramètres URL
  useEffect(() => {
    const signupParam = searchParams.get('signup');
    const forgotParam = searchParams.get('forgot');
    
    if (forgotParam === 'true') {
      setActiveTab('forgot');
    } else if (signupParam === 'true') {
      setActiveTab('signup');
    }
  }, [searchParams]);

  // Validation email en temps réel
  const validateEmail = useCallback((emailValue: string): boolean => {
    if (!emailValue.trim()) {
      setEmailError(null);
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailValue)) {
      setEmailError('Format d\'email invalide');
      return false;
    }
    setEmailError(null);
    return true;
  }, []);

  // Gestion du blur sur l'email
  const handleEmailBlur = useCallback(() => {
    validateEmail(email);
  }, [email, validateEmail]);

  // Initialiser le nom du profil quand la session change
  useEffect(() => {
    if (session?.user?.name) {
      setProfileName(session.user.name);
      setOriginalProfileName(session.user.name);
    }
  }, [session?.user?.name]);

  // Auto-dismiss des messages de succès mot de passe
  useEffect(() => {
    if (passwordSuccess) {
      if (passwordSuccessTimeoutRef.current) {
        clearTimeout(passwordSuccessTimeoutRef.current);
      }
      passwordSuccessTimeoutRef.current = setTimeout(() => {
        setPasswordSuccess(false);
      }, 3000);
    }
    return () => {
      if (passwordSuccessTimeoutRef.current) {
        clearTimeout(passwordSuccessTimeoutRef.current);
      }
    };
  }, [passwordSuccess]);

  // Auto-dismiss des messages de succès profil
  useEffect(() => {
    if (profileSuccess) {
      if (profileSuccessTimeoutRef.current) {
        clearTimeout(profileSuccessTimeoutRef.current);
      }
      profileSuccessTimeoutRef.current = setTimeout(() => {
        setProfileSuccess(false);
      }, 3000);
    }
    return () => {
      if (profileSuccessTimeoutRef.current) {
        clearTimeout(profileSuccessTimeoutRef.current);
      }
    };
  }, [profileSuccess]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setEmailError(null);

    // Validation email avant soumission
    if (!validateEmail(email)) {
      setIsLoading(false);
      emailInputRef.current?.focus();
      emailInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    try {
      const result = await signIn('credentials', {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        // Gestion spécifique des erreurs
        if (result.error === 'CredentialsSignin') {
          setError('Email ou mot de passe incorrect');
        } else if (result.error.includes('401') || result.error.includes('Session')) {
          setError('Session expirée. Veuillez vous reconnecter.');
          // Rediriger après 2 secondes
          setTimeout(() => {
            router.push('/account');
          }, 2000);
        } else {
          setError('Une erreur est survenue lors de la connexion');
        }
      } else {
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
          // Session authentifiée - le dashboard s'affichera automatiquement
          router.refresh();
        } else {
          // Timeout - forcer un refresh quand même
          console.warn('Timeout lors de la synchronisation de session, refresh quand même');
          router.refresh();
        }
      }
    } catch (err) {
      setIsSyncingSession(false);
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue lors de la connexion';
      setError(errorMessage);
      
      // Si erreur réseau, afficher message spécifique
      if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        setError('Erreur de connexion. Vérifiez votre connexion internet.');
      }
    } finally {
      setIsLoading(false);
    }
  };

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

  // Utilisateur non connecté - Onglets Connexion/Inscription
  if (!session) {
    return (
      <main className="container py-12 md:py-16">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                {activeTab === 'login' ? (
                  <User className="h-8 w-8 text-primary" />
                ) : (
                  <UserPlus className="h-8 w-8 text-primary" />
                )}
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {activeTab === 'login' ? 'Connexion' : activeTab === 'signup' ? 'Inscription' : 'Mot de passe oublié'}
                </CardTitle>
                <CardDescription>
                  {activeTab === 'login'
                    ? 'Connectez-vous pour accéder à votre compte'
                    : activeTab === 'signup'
                    ? 'Créez votre compte pour accéder à tous les avantages'
                    : 'Entrez votre email pour recevoir un lien de réinitialisation'}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {activeTab === 'forgot' ? (
                <ForgotPasswordForm
                  onSuccess={() => {
                    setActiveTab('login');
                    router.replace('/account');
                  }}
                  onBack={() => {
                    setActiveTab('login');
                    router.replace('/account');
                  }}
                />
              ) : (
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')} className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-6">
                    <TabsTrigger value="login">
                      <LogIn className="h-4 w-4 mr-2" />
                      Connexion
                    </TabsTrigger>
                    <TabsTrigger value="signup">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Inscription
                    </TabsTrigger>
                  </TabsList>

                {/* Onglet Connexion */}
                <TabsContent value="login" className="space-y-4">
                  <form onSubmit={handleSignIn} className="space-y-4">
                    {error && (
                      <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                        {error}
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                        <Input
                          ref={emailInputRef}
                          id="email"
                          type="email"
                          placeholder="votre@email.com"
                          value={email}
                          onChange={(e) => {
                            setEmail(e.target.value);
                            if (emailError) {
                              validateEmail(e.target.value);
                            }
                          }}
                          onBlur={handleEmailBlur}
                          className={`pl-10 ${emailError ? 'border-destructive' : ''}`}
                          aria-invalid={!!emailError}
                          aria-describedby={emailError ? 'email-error' : undefined}
                          required
                          disabled={isLoading || isSyncingSession}
                        />
                      </div>
                      {emailError && (
                        <p id="email-error" className="text-sm text-destructive flex items-center gap-1">
                          <AlertCircle className="h-3 w-3" />
                          {emailError}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password">Mot de passe</Label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                        <Input
                          id="password"
                          type="password"
                          placeholder="••••••••"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="pl-10"
                          required
                          disabled={isLoading || isSyncingSession}
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

                  <div className="space-y-2 text-center text-sm text-muted-foreground">
                    <div>
                      <p>Pas encore de compte ?</p>
                      <Button
                        variant="link"
                        className="p-0 h-auto mt-2"
                        onClick={() => {
                          setActiveTab('signup');
                          router.replace('/account?signup=true');
                        }}
                      >
                        Créer un compte
                      </Button>
                    </div>
                    <div>
                      <Button
                        variant="link"
                        className="p-0 h-auto text-xs"
                        onClick={() => {
                          setActiveTab('forgot');
                          router.replace('/account?forgot=true');
                        }}
                      >
                        Mot de passe oublié ?
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Onglet Inscription */}
                <TabsContent value="signup" className="space-y-4">
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
                      onClick={() => {
                        setActiveTab('login');
                        router.replace('/account');
                      }}
                    >
                      Se connecter
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    );
  }

  // Utilisateur connecté - Profil
  const user = session?.user;
  const initials = user?.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || 'U';

  // Vérifier si le profil a été modifié
  const isProfileModified = profileName.trim() !== originalProfileName.trim();

  // Gestion de la mise à jour du profil avec optimistic update
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ne rien faire si aucune modification
    if (!isProfileModified) {
      return;
    }

    setIsProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(false);

    // Optimistic update : sauvegarder l'ancienne valeur
    const previousName = profileName;
    const trimmedName = profileName.trim();

    // Mise à jour optimiste immédiate
    setOriginalProfileName(trimmedName);

    try {
      const data = await apiPut<{ success: boolean; user: { name: string } }>(
        '/api/user/profile',
        { name: trimmedName },
        {
          timeout: 10000,
          retries: 2,
          onRetry: (attempt) => {
            console.log(`Tentative ${attempt} de mise à jour du profil...`);
          },
        }
      );

      if (!data.success) {
        throw new Error('Erreur lors de la mise à jour du profil');
      }

      // Mettre à jour la session NextAuth sans recharger la page
      await updateSession({
        name: trimmedName,
      });

      setProfileSuccess(true);
      setOriginalProfileName(trimmedName);
    } catch (err) {
      // Rollback en cas d'erreur
      setProfileName(previousName);
      setOriginalProfileName(previousName);
      
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setProfileError(errorMessage);

      // Gestion spécifique des erreurs 401 (session expirée)
      if (err instanceof Error && 'status' in err && (err as { status?: number }).status === 401) {
        setError('Votre session a expiré. Veuillez vous reconnecter.');
        setTimeout(() => {
          router.push('/account');
        }, 2000);
      }
    } finally {
      setIsProfileLoading(false);
    }
  };

  // Gestion du changement de mot de passe
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    // Validation côté client
    if (newPassword !== confirmPassword) {
      setPasswordError('Les mots de passe ne correspondent pas');
      setIsPasswordLoading(false);
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('Le mot de passe doit contenir au moins 6 caractères');
      setIsPasswordLoading(false);
      return;
    }

    try {
      const data = await apiPut<{ success: boolean; message?: string }>(
        '/api/user/password',
        {
          currentPassword,
          newPassword,
        },
        {
          timeout: 10000,
          retries: 2,
          onRetry: (attempt) => {
            console.log(`Tentative ${attempt} de changement de mot de passe...`);
          },
        }
      );

      if (!data.success) {
        throw new Error('Erreur lors du changement de mot de passe');
      }

      setPasswordSuccess(true);
      // Réinitialiser les champs
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setPasswordError(errorMessage);

      // Gestion spécifique des erreurs 401 (session expirée)
      if (err instanceof Error && 'status' in err && (err as { status?: number }).status === 401) {
        setError('Votre session a expiré. Veuillez vous reconnecter.');
        setTimeout(() => {
          router.push('/account');
        }, 2000);
      }
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <main className="container py-12 md:py-16">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.avatar || user.image || undefined} />
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-3xl font-bold">
                  {user.name || 'Mon Compte'}
                </h1>
                {session.user.emailVerified && (
                  <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-300">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Vérifié
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => signOut({ callbackUrl: '/login' })}>
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>

        {/* Onglets */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="addresses">Adresses</TabsTrigger>
            <TabsTrigger value="preferences">Préférences</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          {/* Onglet Dashboard */}
          <TabsContent value="dashboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Tableau de bord
                </CardTitle>
                <CardDescription>
                  Vue d'ensemble de votre compte et de votre activité
                </CardDescription>
              </CardHeader>
              <CardContent>
                <UserDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Profil */}
          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations personnelles
                </CardTitle>
                <CardDescription>
                  Gérez vos informations de profil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  {profileError && (
                    <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                      {profileError}
                    </div>
                  )}
                  {profileSuccess && (
                    <div className="p-3 rounded-lg bg-green-100 text-green-800 text-sm dark:bg-green-900 dark:text-green-300">
                      Profil mis à jour avec succès
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label>Avatar</Label>
                    <AvatarUpload
                      currentAvatar={user.avatar || user.image || undefined}
                      initials={initials}
                      onSuccess={async (avatarUrl) => {
                        await updateSession({
                          avatar: avatarUrl || undefined,
                          image: avatarUrl || undefined,
                        });
                        window.location.reload();
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom complet</Label>
                    <Input
                      id="name"
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="Votre nom"
                      disabled={isProfileLoading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email-display">Email</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="email-display"
                        type="email"
                        value={user.email}
                        disabled
                        className="bg-muted flex-1"
                      />
                      {session.user.emailVerified ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-300">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Vérifié
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-300">
                          Non vérifié
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      L'email ne peut pas être modifié
                    </p>
                    {!session.user.emailVerified && (
                      <VerifyEmailForm
                        email={user.email || undefined}
                        isVerified={false}
                        onVerified={async () => {
                          await updateSession();
                          window.location.reload();
                        }}
                      />
                    )}
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isProfileLoading || !isProfileModified || profileName.trim().length < 2}
                  >
                    {isProfileLoading ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Commandes */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Mes commandes
                </CardTitle>
                <CardDescription>
                  Historique de vos commandes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <OrderList />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Adresses */}
          <TabsContent value="addresses" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Adresses de livraison
                </CardTitle>
                <CardDescription>
                  Gérez vos adresses de livraison
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AddressList />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Préférences */}
          <TabsContent value="preferences" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Préférences
                </CardTitle>
                <CardDescription>
                  Gérez vos préférences de langue, fuseau horaire et notifications
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PreferencesForm />
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Sécurité */}
          <TabsContent value="security" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Sessions actives
                </CardTitle>
                <CardDescription>
                  Gérez vos sessions actives et déconnectez les appareils à distance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <p>Les sessions sont maintenant gérées par Shopify Customer Accounts.</p>
                  <p className="text-sm mt-2">Vous pouvez vous déconnecter depuis le menu utilisateur.</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Onglet Paramètres */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Paramètres du compte
                </CardTitle>
                <CardDescription>
                  Gérez les paramètres de votre compte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {passwordError && (
                    <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                      {passwordError}
                    </div>
                  )}
                  {passwordSuccess && (
                    <div className="p-3 rounded-lg bg-green-100 text-green-800 text-sm dark:bg-green-900 dark:text-green-300">
                      Mot de passe modifié avec succès
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Mot de passe actuel</Label>
                    <Input
                      id="current-password"
                      type="password"
                      placeholder="Votre mot de passe actuel"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      disabled={isPasswordLoading}
                      required
                      autoComplete="current-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">Nouveau mot de passe</Label>
                    <Input
                      id="new-password"
                      type="password"
                      placeholder="Minimum 6 caractères"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      disabled={isPasswordLoading}
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirmer le nouveau mot de passe</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirmer le nouveau mot de passe"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      disabled={isPasswordLoading}
                      required
                      minLength={6}
                      autoComplete="new-password"
                    />
                  </div>
                  <Button type="submit" disabled={isPasswordLoading}>
                    <Lock className="h-4 w-4 mr-2" />
                    {isPasswordLoading ? 'Modification...' : 'Modifier le mot de passe'}
                  </Button>
                </form>
                <Separator />
                <div className="space-y-4">
                  <div>
                    <p className="font-medium mb-2">Confidentialité et données</p>
                    <p className="text-sm text-muted-foreground mb-4">
                      Gérez vos données personnelles conformément au RGPD
                    </p>
                    <Button variant="outline" asChild>
                      <Link href="/account/privacy">
                        <Shield className="h-4 w-4 mr-2" />
                        Confidentialité et données
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <main className="container py-12 md:py-16">
        <div className="flex flex-col items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </main>
    }>
      <AccountPageContent />
    </Suspense>
  );
}

