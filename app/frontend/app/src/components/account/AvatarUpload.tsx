/**
 * 🍍 JOLANANAS - Composant Upload Avatar
 * =====================================
 * Composant pour uploader et gérer l'avatar de l'utilisateur
 */

'use client';

import React, { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { apiFetch } from '@/app/src/lib/api-client';

interface AvatarUploadProps {
  currentAvatar?: string | null;
  initials: string;
  onSuccess?: (avatarUrl: string | null) => void;
}

export function AvatarUpload({
  currentAvatar,
  initials,
  onSuccess,
}: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentAvatar || null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier le type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Format non supporté. Utilisez JPG, PNG ou WebP.');
      return;
    }

    // Vérifier la taille (2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Fichier trop volumineux. Taille maximum: 2MB.');
      return;
    }

    setError(null);

    // Créer une preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setError('Veuillez sélectionner un fichier');
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('avatar', file);

      // Pour FormData, utiliser fetch directement car apiFetch ne gère pas bien FormData
      const response = await fetch('/api/user/avatar', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Erreur lors de l\'upload');
      }

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de l\'upload');
      }

      if (data.avatar) {
        setPreview(data.avatar);
        if (onSuccess) {
          onSuccess(data.avatar);
        }
      }

      // Réinitialiser l'input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer votre avatar ?')) {
      return;
    }

    setIsUploading(true);
    setError(null);

    try {
      const { data } = await apiFetch<{ success: boolean; error?: string }>(
        '/api/user/avatar',
        {
          method: 'DELETE',
          timeout: 10000,
          retries: 2,
        }
      );

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      setPreview(null);
      if (onSuccess) {
        onSuccess(null);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          <AvatarImage src={preview || undefined} />
          <AvatarFallback className="text-xl">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
              id="avatar-upload"
              disabled={isUploading}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <Upload className="h-4 w-4 mr-2" />
              {preview && preview !== currentAvatar ? 'Changer' : 'Choisir une image'}
            </Button>
            {preview && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDelete}
                disabled={isUploading}
              >
                <X className="h-4 w-4 mr-2" />
                Supprimer
              </Button>
            )}
          </div>
          {preview && preview !== currentAvatar && (
            <Button
              type="button"
              size="sm"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? 'Upload en cours...' : 'Enregistrer'}
            </Button>
          )}
          <p className="text-xs text-muted-foreground">
            Formats acceptés: JPG, PNG, WebP. Taille maximum: 2MB
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm flex items-center gap-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

