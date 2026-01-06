/**
 * 🍍 JOLANANAS - Formulaire Préférences Utilisateur
 * ==================================================
 * Composant pour gérer les préférences utilisateur
 * Note: Les préférences sont stockées uniquement dans localStorage car Shopify ne gère pas nativement les préférences utilisateur.
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Globe, Clock, Mail, Bell, Save } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Switch } from '@/components/ui/Switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/RadioGroup';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Skeleton } from '@/components/ui/Skeleton';

interface Preferences {
  language: string;
  timezone: string;
  emailNotifications: boolean;
  orderNotifications: boolean;
  marketingEmails: boolean;
}

interface PreferencesFormProps {
  onSuccess?: () => void;
}

const LANGUAGES = [
  { value: 'fr', label: 'Français' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
];

const TIMEZONES = [
  { value: 'Europe/Paris', label: 'Europe/Paris (GMT+1)' },
  { value: 'Europe/London', label: 'Europe/London (GMT+0)' },
  { value: 'America/New_York', label: 'America/New_York (GMT-5)' },
  { value: 'America/Los_Angeles', label: 'America/Los_Angeles (GMT-8)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (GMT+9)' },
];

export function PreferencesForm({ onSuccess }: PreferencesFormProps) {
  const [preferences, setPreferences] = useState<Preferences>({
    language: 'fr',
    timezone: 'Europe/Paris',
    emailNotifications: true,
    orderNotifications: true,
    marketingEmails: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [originalPreferences, setOriginalPreferences] = useState<Preferences | null>(null);

  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = () => {
    setIsLoading(true);
    setError(null);

    try {
      // Récupérer les préférences depuis localStorage
      const stored = localStorage.getItem('userPreferences');
      
      if (stored) {
        const parsedPreferences = JSON.parse(stored) as Preferences;
        setPreferences(parsedPreferences);
        setOriginalPreferences(parsedPreferences);
      } else {
        // Utiliser les valeurs par défaut
        setOriginalPreferences(preferences);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
      // En cas d'erreur, utiliser les valeurs par défaut
      setOriginalPreferences(preferences);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (originalPreferences) {
      const changed = JSON.stringify(preferences) !== JSON.stringify(originalPreferences);
      setHasChanges(changed);
    }
  }, [preferences, originalPreferences]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!hasChanges) {
      return;
    }

    setIsSaving(true);
    setError(null);
    setSuccess(false);

    try {
      // Sauvegarder uniquement dans localStorage
      // Note: Shopify ne gère pas nativement les préférences utilisateur
      localStorage.setItem('userPreferences', JSON.stringify(preferences));

      setSuccess(true);
      setOriginalPreferences(preferences);
      setHasChanges(false);

      if (onSuccess) {
        onSuccess();
      }

      // Auto-dismiss après 3 secondes
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Skeleton className="h-8 w-8 rounded-full" />
        <Skeleton className="h-4 w-48" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert>
          <AlertDescription>Préférences mises à jour avec succès</AlertDescription>
        </Alert>
      )}

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="language" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Langue
          </Label>
          <Select
            value={preferences.language}
            onValueChange={(value) => setPreferences({ ...preferences, language: value })}
          >
            <SelectTrigger id="language">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGES.map((lang) => (
                <SelectItem key={lang.value} value={lang.value}>
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="timezone" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Fuseau horaire
          </Label>
          <Select
            value={preferences.timezone}
            onValueChange={(value) => setPreferences({ ...preferences, timezone: value })}
          >
            <SelectTrigger id="timezone">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TIMEZONES.map((tz) => (
                <SelectItem key={tz.value} value={tz.value}>
                  {tz.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-4 pt-4 border-t">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </Label>
            <div className="space-y-3 pl-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Notifications email</p>
                  <p className="text-xs text-muted-foreground">
                    Recevoir des notifications par email
                  </p>
                </div>
                <Switch
                  checked={preferences.emailNotifications}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, emailNotifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Notifications de commande</p>
                  <p className="text-xs text-muted-foreground">
                    Recevoir des notifications pour vos commandes
                  </p>
                </div>
                <Switch
                  checked={preferences.orderNotifications}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, orderNotifications: checked })
                  }
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">Emails marketing</p>
                  <p className="text-xs text-muted-foreground">
                    Recevoir des offres et actualités
                  </p>
                </div>
                <Switch
                  checked={preferences.marketingEmails}
                  onCheckedChange={(checked) =>
                    setPreferences({ ...preferences, marketingEmails: checked })
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isSaving || !hasChanges}
        className="w-full"
      >
        <Save className="h-4 w-4 mr-2" />
        {isSaving ? 'Enregistrement...' : 'Enregistrer les préférences'}
      </Button>
    </form>
  );
}

