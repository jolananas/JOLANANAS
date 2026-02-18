"use client";

import React, {
  useState,
  useEffect,
  Suspense,
  useRef,
  useCallback,
} from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  User,
  LogIn,
  LogOut,
  Mail,
  Package,
  MapPin,
  Settings,
  Lock,
  UserPlus,
  AlertCircle,
  CheckCircle2,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignupForm } from "@/components/auth/SignupForm";
import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";
import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";
import { AvatarUpload } from "@/components/account/AvatarUpload";
import { apiPut } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import dynamic from "next/dynamic";
import { ensureAuthenticatedSession } from "@/lib/utils/session";
import { UserDashboard } from "@/components/dashboard/UserDashboard";
import { PageContainer } from "@/components/layout/PageContainer";

// Lazy loading des composants lourds
const AddressList = dynamic(
  () =>
    import("@/components/account/AddressList").then((mod) => ({
      default: mod.AddressList,
    })),
  {
    loading: () => (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    ),
    ssr: false,
  },
);

const OrderList = dynamic(
  () =>
    import("@/components/account/OrderList").then((mod) => ({
      default: mod.OrderList,
    })),
  {
    loading: () => (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    ),
    ssr: false,
  },
);

const PreferencesForm = dynamic(
  () =>
    import("@/components/account/PreferencesForm").then((mod) => ({
      default: mod.PreferencesForm,
    })),
  {
    loading: () => (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    ),
    ssr: false,
  },
);

function AccountPageContent() {
  const { data: session, status, update: updateSession } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSyncingSession, setIsSyncingSession] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"login" | "signup" | "forgot">(
    "login",
  );
  const [emailError, setEmailError] = useState<string | null>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const hasCheckedSessionRef = useRef(false);

  // États pour la gestion du profil (initialisés de manière sûre)
  const [profileName, setProfileName] = useState(session?.user?.name || "");
  const [originalProfileName, setOriginalProfileName] = useState(
    session?.user?.name || "",
  );
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const profileSuccessTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // États pour le changement de mot de passe
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const passwordSuccessTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Détecter automatiquement quand la session devient disponible après authentification
  useEffect(() => {
    if (status === "authenticated" && session) {
      if (!hasCheckedSessionRef.current) {
        hasCheckedSessionRef.current = true;
        router.refresh();
      }
    } else if (status === "unauthenticated") {
      hasCheckedSessionRef.current = false;
    }
  }, [status, session, router]);

  // Gérer les paramètres URL
  useEffect(() => {
    const signupParam = searchParams.get("signup");
    const forgotParam = searchParams.get("forgot");

    if (forgotParam === "true") {
      setActiveTab("forgot");
    } else if (signupParam === "true") {
      setActiveTab("signup");
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
      setEmailError("Format d'email invalide");
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

    if (!validateEmail(email)) {
      setIsLoading(false);
      emailInputRef.current?.focus();
      emailInputRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    try {
      const result = await signIn("credentials", {
        email: email.trim().toLowerCase(),
        password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error === "CredentialsSignin") {
          setError("Email ou mot de passe incorrect");
        } else if (
          result.error.includes("401") ||
          result.error.includes("Session")
        ) {
          setError("Session expirée. Veuillez vous reconnecter.");
          setTimeout(() => {
            router.push("/account");
          }, 2000);
        } else {
          setError("Une erreur est survenue lors de la connexion");
        }
      } else {
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
          },
        );
        setIsSyncingSession(false);
        if (isAuthenticated) {
          router.refresh();
        } else {
          router.refresh();
        }
      }
    } catch (err) {
      setIsSyncingSession(false);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Une erreur est survenue lors de la connexion";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <PageContainer className="container py-32 md:py-48">
        <div className="flex flex-col items-center justify-center py-60">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </PageContainer>
    );
  }

  if (!session) {
    return (
      <PageContainer className="container py-32 md:py-48">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                {activeTab === "login" ? (
                  <User className="h-8 w-8 text-primary" />
                ) : (
                  <UserPlus className="h-8 w-8 text-primary" />
                )}
              </div>
              <div>
                <CardTitle className="text-2xl">
                  {activeTab === "login"
                    ? "Connexion"
                    : activeTab === "signup"
                      ? "Inscription"
                      : "Mot de passe oublié"}
                </CardTitle>
                <CardDescription>
                  {activeTab === "login"
                    ? "Connectez-vous pour accéder à votre compte"
                    : activeTab === "signup"
                      ? "Créez votre compte pour accéder à tous les avantages"
                      : "Entrez votre email pour recevoir un lien de réinitialisation"}
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              {activeTab === "forgot" ? (
                <ForgotPasswordForm
                  onSuccess={() => {
                    setActiveTab("login");
                    router.replace("/account");
                  }}
                  onBack={() => {
                    setActiveTab("login");
                    router.replace("/account");
                  }}
                />
              ) : (
                <Tabs
                  value={activeTab}
                  onValueChange={(value) =>
                    setActiveTab(value as "login" | "signup")
                  }
                  className="w-full"
                >
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
                            className={`pl-10 ${emailError ? "border-destructive" : ""}`}
                            required
                            disabled={isLoading || isSyncingSession}
                          />
                        </div>
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

                      <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading || isSyncingSession}
                      >
                        <LogIn className="h-4 w-4 mr-2" />
                        {isSyncingSession
                          ? "Synchronisation..."
                          : isLoading
                            ? "Connexion..."
                            : "Se connecter"}
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
                            setActiveTab("signup");
                            router.replace("/account?signup=true");
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
                            setActiveTab("forgot");
                            router.replace("/account?forgot=true");
                          }}
                        >
                          Mot de passe oublié ?
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

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
                          setActiveTab("login");
                          router.replace("/account");
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
      </PageContainer>
    );
  }

  const user = session?.user;
  const initials = user?.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : user?.email?.[0]?.toUpperCase() || "U";

  const isProfileModified = profileName.trim() !== originalProfileName.trim();

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isProfileModified) return;

    setIsProfileLoading(true);
    setProfileError(null);
    setProfileSuccess(false);

    const previousName = profileName;
    const trimmedName = profileName.trim();
    setOriginalProfileName(trimmedName);

    try {
      const data = await apiPut<{ success: boolean; user: { name: string } }>(
        "/api/user/profile",
        { name: trimmedName },
      );

      if (!data.success) throw new Error("Erreur lors de la mise à jour");

      await updateSession({ name: trimmedName });
      setProfileSuccess(true);
    } catch (err) {
      setProfileName(previousName);
      setOriginalProfileName(previousName);
      setProfileError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsPasswordLoading(true);
    setPasswordError(null);
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError("Les mots de passe ne correspondent pas");
      setIsPasswordLoading(false);
      return;
    }

    try {
      const data = await apiPut<{ success: boolean; message?: string }>(
        "/api/user/password",
        { currentPassword, newPassword },
      );
      if (!data.success) throw new Error("Erreur lors du changement");
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsPasswordLoading(false);
    }
  };

  return (
    <PageContainer className="container py-32 md:py-48">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback className="text-xl">{initials}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-3xl font-bold">
                  {user.name || "Mon Compte"}
                </h1>
                {session.user.emailVerified && (
                  <Badge variant="outline" className="bg-green-100 text-green-800">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Vérifié
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => signOut({ callbackUrl: "/" })}>
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-7 overflow-x-auto">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="profile">Profil</TabsTrigger>
            <TabsTrigger value="orders">Commandes</TabsTrigger>
            <TabsTrigger value="addresses">Adresses</TabsTrigger>
            <TabsTrigger value="preferences">Préférences</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Tableau de bord</CardTitle>
                <CardDescription>Vue d'ensemble de votre activité</CardDescription>
              </CardHeader>
              <CardContent>
                <UserDashboard />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Profil</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  {profileError && (
                    <div className="p-3 bg-destructive/10 text-destructive rounded">{profileError}</div>
                  )}
                  {profileSuccess && (
                    <div className="p-3 bg-green-100 text-green-800 rounded">Profil mis à jour</div>
                  )}
                  <div className="space-y-2">
                    <Label>Avatar</Label>
                    <AvatarUpload
                      currentAvatar={user.image || undefined}
                      initials={initials}
                      onSuccess={async (avatarUrl) => {
                        await updateSession({ image: avatarUrl });
                        window.location.reload();
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom</Label>
                    <Input
                      id="name"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      disabled={isProfileLoading}
                    />
                  </div>
                  <Button type="submit" disabled={isProfileLoading || !isProfileModified}>
                    Enregistrer
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card><CardContent><OrderList /></CardContent></Card>
          </TabsContent>

          <TabsContent value="addresses" className="space-y-4">
            <Card><CardContent><AddressList /></CardContent></Card>
          </TabsContent>

          <TabsContent value="preferences" className="space-y-4">
            <Card><CardContent><PreferencesForm /></CardContent></Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
             <Card><CardContent className="py-8 text-center text-muted-foreground">Les sessions sont gérées via Shopify.</CardContent></Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Changer le mot de passe</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  {passwordError && <div className="p-3 bg-destructive/10 text-destructive rounded">{passwordError}</div>}
                  {passwordSuccess && <div className="p-3 bg-green-100 text-green-800 rounded">Modifié !</div>}
                  <div className="space-y-2">
                    <Label htmlFor="curr">Actuel</Label>
                    <Input id="curr" type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new">Nouveau</Label>
                    <Input id="new" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conf">Confirmer</Label>
                    <Input id="conf" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                  </div>
                  <Button type="submit" disabled={isPasswordLoading}>Mettre à jour</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageContainer>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <PageContainer className="container py-32 md:py-48">
          <div className="flex flex-col items-center justify-center py-60">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </PageContainer>
      }
    >
      <AccountPageContent />
    </Suspense>
  );
}
