/**
 * 🍍 JOLANANAS - Liste des Adresses
 * ==================================
 * Composant pour afficher et gérer la liste des adresses de l'utilisateur
 */

'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Edit, Trash2, Plus, Building2, Phone, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import dynamic from 'next/dynamic';

// Lazy loading du composant AddressForm
const AddressForm = dynamic(() => import('./AddressForm').then(mod => ({ default: mod.AddressForm })), {
  loading: () => <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>,
  ssr: false,
});
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/AlertDialog';
import { AddressListSkeleton } from './AddressListSkeleton';
import { apiGet, apiDelete, apiPut } from '@/app/src/lib/api-client';

interface Address {
  id: string;
  firstName: string;
  lastName: string;
  company?: string;
  address1: string;
  address2?: string;
  city: string;
  province?: string;
  country: string;
  zip: string;
  phone?: string;
  type: 'SHIPPING' | 'BILLING';
  isDefault?: boolean;
  createdAt: string;
  updatedAt: string;
}

export function AddressList() {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchAddresses = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiGet<{ success: boolean; addresses: Address[]; error?: string }>(
        '/api/user/addresses',
        {
          timeout: 10000,
          retries: 2,
          onRetry: (attempt) => {
            console.log(`Tentative ${attempt} de récupération des adresses...`);
          },
        }
      );

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la récupération des adresses');
      }

      setAddresses(data.addresses || []);
    } catch (err) {
      let errorMessage = 'Une erreur est survenue';
      
      if (err instanceof Error) {
        errorMessage = err.message;
        
        // Gestion spécifique des erreurs 401 (session expirée)
        if ('status' in err && (err as { status?: number }).status === 401) {
          errorMessage = 'Votre session a expiré. Veuillez vous reconnecter.';
        } else if (errorMessage.includes('timeout') || errorMessage.includes('Request timeout')) {
          errorMessage = 'La requête a pris trop de temps. Veuillez réessayer.';
        } else if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
          errorMessage = 'Erreur de connexion. Vérifiez votre connexion internet.';
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAddresses();
  }, []);

  const handleSetDefault = async (addressId: string) => {
    try {
      const data = await apiPut<{ success: boolean; message?: string; error?: string }>(
        '/api/user/addresses/set-default',
        { addressId },
        {
          timeout: 10000,
          retries: 2,
        }
      );

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la mise à jour');
      }

      // Recharger la liste
      await fetchAddresses();
    } catch (err) {
      console.error('Erreur définition adresse par défaut:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
      alert(errorMessage);
    }
  };

  const handleDelete = async (addressId: string) => {
    try {
      const data = await apiDelete<{ success: boolean; message?: string; error?: string }>(
        `/api/user/addresses?id=${addressId}`,
        {
          timeout: 10000,
          retries: 2,
        }
      );

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la suppression');
      }

      // Recharger la liste
      await fetchAddresses();
      setDeletingId(null);
    } catch (err) {
      console.error('Erreur suppression adresse:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'adresse';
      alert(errorMessage);
    }
  };

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingAddress(null);
    fetchAddresses();
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingAddress(null);
    setIsFormOpen(true);
  };

  const formatAddress = (address: Address): string => {
    const parts = [
      `${address.firstName} ${address.lastName}`,
      address.company,
      address.address1,
      address.address2,
      `${address.zip} ${address.city}`,
      address.province,
      address.country,
    ].filter(Boolean);
    return parts.join(', ');
  };

  if (isLoading) {
    return <AddressListSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-destructive/10 text-destructive">
        <p>{error}</p>
        <Button onClick={fetchAddresses} variant="outline" className="mt-2">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Mes adresses</h3>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleAddNew} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une adresse
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingAddress ? 'Modifier l\'adresse' : 'Nouvelle adresse'}
              </DialogTitle>
            </DialogHeader>
            <AddressForm
              address={editingAddress}
              mode={editingAddress ? 'edit' : 'create'}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingAddress(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {addresses.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <MapPin className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground mb-4">
              Aucune adresse enregistrée
            </p>
            <Button onClick={handleAddNew}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter une adresse
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {addresses.map((address) => (
            <Card key={address.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">
                    {address.firstName} {address.lastName}
                  </CardTitle>
                  <div className="flex gap-2">
                    {!address.isDefault && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleSetDefault(address.id)}
                        title="Définir comme adresse par défaut"
                      >
                        <Star className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    )}
                    {address.isDefault && (
                      <div className="flex items-center gap-1 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs">
                        <Star className="h-3 w-3 fill-current" />
                        Par défaut
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleEdit(address)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeletingId(address.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer l'adresse ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer cette adresse ? Cette action est irréversible.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setDeletingId(null)}>
                            Annuler
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(address.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {address.company && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Building2 className="h-4 w-4" />
                    <span>{address.company}</span>
                  </div>
                )}
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p>{address.address1}</p>
                    {address.address2 && <p>{address.address2}</p>}
                    <p>
                      {address.zip} {address.city}
                      {address.province && `, ${address.province}`}
                    </p>
                    <p>{address.country}</p>
                  </div>
                </div>
                {address.phone && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-4 w-4" />
                    <span>{address.phone}</span>
                  </div>
                )}
                <div className="pt-2 border-t">
                  <span className="text-xs text-muted-foreground">
                    {address.type === 'SHIPPING' ? 'Livraison' : 'Facturation'}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

