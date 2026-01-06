/**
 * 🍍 JOLANANAS - Composant Sessions Actives
 * =========================================
 * Composant pour afficher et gérer les sessions actives de l'utilisateur
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Smartphone, Monitor, Tablet, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/AlertDialog';
import { apiGet, apiDelete } from '@/app/src/lib/api-client';
import { Badge } from '@/components/ui/Badge';

interface Session {
  id: string;
  createdAt: string;
  expires: string;
  isCurrent: boolean;
}

export function ActiveSessions() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiGet<{ success: boolean; sessions: Session[]; error?: string }>(
        '/api/user/sessions',
        {
          timeout: 10000,
          retries: 2,
        }
      );

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la récupération des sessions');
      }

      setSessions(data.sessions || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      // Envoyer la requête DELETE avec le body
      const response = await fetch('/api/user/sessions', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      const deleteData = await response.json();

      if (!response.ok || !deleteData.success) {
        throw new Error(deleteData.error || 'Erreur lors de la suppression');
      }

      // Recharger la liste
      await fetchSessions();
      setDeletingId(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression';
      alert(errorMessage);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getDeviceIcon = (index: number) => {
    // Rotation simple entre les icônes
    const icons = [Monitor, Smartphone, Tablet];
    return icons[index % icons.length];
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Chargement des sessions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 text-destructive">
        <p>{error}</p>
        <Button onClick={fetchSessions} variant="outline" className="mt-2">
          Réessayer
        </Button>
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <Monitor className="h-16 w-16 text-muted-foreground/50 mb-4" />
          <p className="text-muted-foreground">
            Aucune session active
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-2">
          <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Sécurité de vos sessions
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Vous pouvez déconnecter les autres appareils à distance. Si vous remarquez une activité suspecte, déconnectez immédiatement toutes les sessions.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {sessions.map((session, index) => {
          const DeviceIcon = getDeviceIcon(index);
          const isExpired = new Date(session.expires) < new Date();

          return (
            <Card key={session.id} className={isExpired ? 'opacity-50' : ''}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <DeviceIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {session.isCurrent ? 'Cette session' : 'Appareil'}
                        </p>
                        {session.isCurrent && (
                          <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
                            Actuelle
                          </Badge>
                        )}
                        {isExpired && (
                          <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-300">
                            Expirée
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Créée le {formatDate(session.createdAt)}
                      </p>
                      {!isExpired && (
                        <p className="text-xs text-muted-foreground">
                          Expire le {formatDate(session.expires)}
                        </p>
                      )}
                    </div>
                  </div>
                  {!session.isCurrent && !isExpired && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeletingId(session.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Déconnecter
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Déconnecter cet appareil ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action déconnectera cet appareil de votre compte. Vous devrez vous reconnecter pour y accéder à nouveau.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setDeletingId(null)}>
                            Annuler
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteSession(session.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Déconnecter
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

