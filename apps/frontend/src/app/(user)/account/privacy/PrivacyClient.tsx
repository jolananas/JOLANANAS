"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Download,
  Trash2,
  AlertTriangle,
  Lock,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alertdialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiGet, apiDelete } from "@/lib/api-client";
import { signOut } from "next-auth/react";
import { PageContainer } from "@/components/layout/PageContainer";

export function PrivacyClient() {
  const { data: session } = useSession();
  const router = useRouter();
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleExportData = async () => {
    setIsExporting(true);

    try {
      const response = await fetch("/api/user/export-data");

      if (!response.ok) {
        throw new Error("Erreur lors de l'export");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `jolananas-data-export-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Erreur export:", err);
      alert("Erreur lors de l'export des données");
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) {
      setDeleteError("Le mot de passe est requis");
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const deleteResponse = await fetch("/api/user/delete-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          confirm: true,
          password: deletePassword,
        }),
      });

      const deleteData = await deleteResponse.json();

      if (!deleteResponse.ok || !deleteData.success) {
        throw new Error(deleteData.error || "Erreur lors de la suppression");
      }

      await signOut({ redirect: true, callbackUrl: "/" });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Une erreur est survenue";
      setDeleteError(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  if (!session) {
    return (
      <PageContainer className="container py-32 md:py-48">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">
                Veuillez vous connecter pour accéder à cette page.
              </p>
              <Button asChild className="mt-4">
                <a href="/account">Se connecter</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer className="container py-32 md:py-48">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="font-serif text-3xl font-bold mb-2">
            Confidentialité et Données
          </h1>
          <p className="text-muted-foreground">
            Gérez vos données personnelles conformément au RGPD
          </p>
        </div>

        {/* Export Données */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Exporter mes données
            </CardTitle>
            <CardDescription>
              Téléchargez toutes vos données personnelles au format JSON
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Vous pouvez télécharger toutes vos données personnelles stockées
              sur notre plateforme, incluant vos commandes, adresses,
              préférences et historique d'activité.
            </p>
            <Button
              onClick={handleExportData}
              disabled={isExporting}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              {isExporting ? "Export en cours..." : "Télécharger mes données"}
            </Button>
          </CardContent>
        </Card>

        {/* Suppression Compte */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Supprimer mon compte
            </CardTitle>
            <CardDescription>
              Suppression définitive de votre compte et anonymisation de vos
              données
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-destructive">
                    Cette action est irréversible
                  </p>
                  <p className="text-sm text-muted-foreground">
                    La suppression de votre compte entraînera :
                  </p>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 ml-2">
                    <li>La suppression de votre compte utilisateur</li>
                    <li>
                      L'anonymisation de vos commandes (conservées pour
                      historique)
                    </li>
                    <li>La suppression de vos adresses personnelles</li>
                    <li>
                      La suppression de vos préférences et données personnelles
                    </li>
                    <li>La suppression de votre avatar</li>
                  </ul>
                </div>
              </div>
            </div>

            <AlertDialog
              open={showDeleteDialog}
              onOpenChange={setShowDeleteDialog}
            >
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Supprimer mon compte
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                  <AlertDialogDescription>
                    Pour confirmer la suppression de votre compte, veuillez
                    entrer votre mot de passe. Cette action est définitive et
                    irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4 py-4">
                  {deleteError && (
                    <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
                      {deleteError}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="delete-password">Mot de passe</Label>
                    <Input
                      id="delete-password"
                      type="password"
                      placeholder="Votre mot de passe"
                      value={deletePassword}
                      onChange={(e) => {
                        setDeletePassword(e.target.value);
                        setDeleteError(null);
                      }}
                      disabled={isDeleting}
                    />
                  </div>
                </div>
                <AlertDialogFooter>
                  <AlertDialogCancel
                    onClick={() => {
                      setShowDeleteDialog(false);
                      setDeletePassword("");
                      setDeleteError(null);
                    }}
                  >
                    Annuler
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || !deletePassword}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {isDeleting ? "Suppression..." : "Supprimer définitivement"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </CardContent>
        </Card>

        {/* Informations RGPD */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Vos droits RGPD
            </CardTitle>
            <CardDescription>
              Conformément au Règlement Général sur la Protection des Données
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Droit d'accès
              </h3>
              <p className="text-sm text-muted-foreground">
                Vous avez le droit d'accéder à toutes vos données personnelles.
                Utilisez le bouton "Télécharger mes données" ci-dessus.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Download className="h-4 w-4" />
                Droit à la portabilité
              </h3>
              <p className="text-sm text-muted-foreground">
                Vous pouvez exporter vos données dans un format structuré et
                lisible par machine (JSON).
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Trash2 className="h-4 w-4" />
                Droit à l'effacement
              </h3>
              <p className="text-sm text-muted-foreground">
                Vous pouvez demander la suppression de vos données personnelles
                à tout moment. Notez que certaines données peuvent être
                conservées pour des raisons légales ou commerciales.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold flex items-center gap-2">
                <Lock className="h-4 w-4" />
                Sécurité des données
              </h3>
              <p className="text-sm text-muted-foreground">
                Vos données sont stockées de manière sécurisée et ne sont jamais
                partagées avec des tiers sans votre consentement explicite.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
