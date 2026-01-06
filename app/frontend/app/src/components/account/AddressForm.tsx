/**
 * 🍍 JOLANANAS - Formulaire Adresse
 * =================================
 * Composant réutilisable pour créer/modifier une adresse
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Building2, Phone, Save, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Checkbox } from '@/components/ui/Checkbox';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/Form';
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete';
import { apiPost, apiPut } from '@/app/src/lib/api-client';
import type { AddressSuggestion } from '@/app/src/lib/hooks/useAddressAutocomplete';

interface Address {
  id?: string;
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
  type?: 'SHIPPING' | 'BILLING';
  isDefault?: boolean;
}

interface AddressFormProps {
  address?: Address | null;
  onSuccess?: () => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

// Liste des pays européens principaux
const COUNTRIES = [
  { code: 'FR', name: 'France' },
  { code: 'BE', name: 'Belgique' },
  { code: 'CH', name: 'Suisse' },
  { code: 'LU', name: 'Luxembourg' },
  { code: 'DE', name: 'Allemagne' },
  { code: 'ES', name: 'Espagne' },
  { code: 'IT', name: 'Italie' },
  { code: 'PT', name: 'Portugal' },
  { code: 'NL', name: 'Pays-Bas' },
  { code: 'GB', name: 'Royaume-Uni' },
];

export function AddressForm({
  address,
  onSuccess,
  onCancel,
  mode = 'create',
}: AddressFormProps) {
  const [formData, setFormData] = useState<Address>({
    firstName: '',
    lastName: '',
    company: '',
    address1: '',
    address2: '',
    city: '',
    province: '',
    country: 'FR',
    zip: '',
    phone: '',
    type: 'SHIPPING',
    isDefault: false,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const firstErrorFieldRef = useRef<HTMLInputElement | null>(null);

  // Initialiser le formulaire avec les données de l'adresse si en mode édition
  useEffect(() => {
    if (address && mode === 'edit') {
      setFormData({
        firstName: address.firstName,
        lastName: address.lastName,
        company: address.company,
        address1: address.address1,
        address2: address.address2,
        city: address.city,
        province: address.province,
        country: address.country || 'FR',
        zip: address.zip,
        phone: address.phone,
        type: address.type || 'SHIPPING',
        isDefault: address.isDefault || false,
      });
    }
  }, [address, mode]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      errors.firstName = 'Le prénom est requis';
    }

    if (!formData.lastName.trim()) {
      errors.lastName = 'Le nom est requis';
    }

    if (!formData.address1.trim()) {
      errors.address1 = 'L\'adresse est requise';
    }

    if (!formData.city.trim()) {
      errors.city = 'La ville est requise';
    }

    if (!formData.country || formData.country.length !== 2) {
      errors.country = 'Le pays est requis';
    }

    if (!formData.zip.trim()) {
      errors.zip = 'Le code postal est requis';
    }

    setFieldErrors(errors);
    
    // Scroll vers le premier champ en erreur
    if (Object.keys(errors).length > 0) {
      const firstErrorKey = Object.keys(errors)[0];
      const firstErrorElement = document.getElementById(firstErrorKey === 'firstName' ? 'firstName' : 
        firstErrorKey === 'lastName' ? 'lastName' :
        firstErrorKey === 'address1' ? 'address1' :
        firstErrorKey === 'city' ? 'city' :
        firstErrorKey === 'zip' ? 'zip' : 'country');
      
      if (firstErrorElement) {
        setTimeout(() => {
          firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstErrorElement.focus();
        }, 100);
      }
    }
    
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const addressData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        company: formData.company?.trim() || undefined,
        address1: formData.address1.trim(),
        address2: formData.address2?.trim() || undefined,
        city: formData.city.trim(),
        province: formData.province?.trim() || undefined,
        country: formData.country,
        zip: formData.zip.trim(),
        phone: formData.phone?.trim() || undefined,
        type: formData.type || 'SHIPPING',
        isDefault: formData.isDefault || false,
      };

      let data: { success: boolean; error?: string; details?: Array<{ path: string[]; message: string }> };

      if (mode === 'edit' && address?.id) {
        data = await apiPut<typeof data>(
          `/api/user/addresses?id=${address.id}`,
          addressData,
          {
            timeout: 10000,
            retries: 2,
            onRetry: (attempt) => {
              console.log(`Tentative ${attempt} de mise à jour de l'adresse...`);
            },
          }
        );
      } else {
        data = await apiPost<typeof data>(
          '/api/user/addresses',
          addressData,
          {
            timeout: 10000,
            retries: 2,
            onRetry: (attempt) => {
              console.log(`Tentative ${attempt} de création de l'adresse...`);
            },
          }
        );
      }

      if (!data.success) {
        if (data.details && Array.isArray(data.details)) {
          const serverErrors: Record<string, string> = {};
          data.details.forEach((detail: { path: string[]; message: string }) => {
            if (detail.path && detail.path.length > 0) {
              serverErrors[detail.path[0]] = detail.message;
            }
          });
          setFieldErrors(serverErrors);
          
          // Scroll vers le premier champ en erreur
          const firstErrorKey = Object.keys(serverErrors)[0];
          if (firstErrorKey) {
            const firstErrorElement = document.getElementById(firstErrorKey);
            if (firstErrorElement) {
              setTimeout(() => {
                firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                firstErrorElement.focus();
              }, 100);
            }
          }
        }
        
        const errorMessage = data.error || 'Une erreur est survenue';
        setError(errorMessage);
        return;
      }

      // Succès
      if (onSuccess) {
        onSuccess();
      }

      // Réinitialiser le formulaire si création
      if (mode === 'create') {
        setFormData({
          firstName: '',
          lastName: '',
          company: '',
          address1: '',
          address2: '',
          city: '',
          province: '',
          country: 'FR',
          zip: '',
          phone: '',
          type: 'SHIPPING',
          isDefault: false,
        });
      }
    } catch (err) {
      let errorMessage = 'Une erreur est survenue. Veuillez réessayer.';
      
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

  const handleChange = (field: keyof Address, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
    // Effacer l'erreur du champ modifié
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Prénom *</Label>
          <Input
            id="firstName"
            type="text"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className={fieldErrors.firstName ? 'border-destructive' : ''}
            disabled={isLoading}
            required
          />
          {fieldErrors.firstName && (
            <p className="text-sm text-destructive">{fieldErrors.firstName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Nom *</Label>
          <Input
            id="lastName"
            type="text"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className={fieldErrors.lastName ? 'border-destructive' : ''}
            disabled={isLoading}
            required
          />
          {fieldErrors.lastName && (
            <p className="text-sm text-destructive">{fieldErrors.lastName}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="company">
          <Building2 className="inline h-4 w-4 mr-1" />
          Entreprise <span className="text-muted-foreground text-xs">(optionnel)</span>
        </Label>
        <Input
          id="company"
          type="text"
          value={formData.company}
          onChange={(e) => handleChange('company', e.target.value)}
          disabled={isLoading}
        />
      </div>

      <AddressAutocomplete
        id="address1"
        label="Adresse *"
        value={formData.address1}
        placeholder="Commencez à taper votre adresse..."
        disabled={isLoading}
        required
        error={fieldErrors.address1}
        country={formData.country}
        onChange={(value) => handleChange('address1', value)}
        onSelect={(suggestion) => {
          // Remplir automatiquement les champs ville et code postal
          handleChange('address1', suggestion.label);
          if (suggestion.city) {
            handleChange('city', suggestion.city);
          }
          if (suggestion.postcode) {
            handleChange('zip', suggestion.postcode);
          }
        }}
      />

      <div className="space-y-2">
        <Label htmlFor="address2">Complément d'adresse <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
        <Input
          id="address2"
          type="text"
          value={formData.address2}
          onChange={(e) => handleChange('address2', e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="city">Ville *</Label>
          <Input
            id="city"
            type="text"
            value={formData.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className={fieldErrors.city ? 'border-destructive' : ''}
            disabled={isLoading}
            required
          />
          {fieldErrors.city && (
            <p className="text-sm text-destructive">{fieldErrors.city}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="zip">Code postal *</Label>
          <Input
            id="zip"
            type="text"
            value={formData.zip}
            onChange={(e) => handleChange('zip', e.target.value)}
            className={fieldErrors.zip ? 'border-destructive' : ''}
            disabled={isLoading}
            required
          />
          {fieldErrors.zip && (
            <p className="text-sm text-destructive">{fieldErrors.zip}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="province">Région/Province <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
          <Input
            id="province"
            type="text"
            value={formData.province}
            onChange={(e) => handleChange('province', e.target.value)}
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Pays *</Label>
          <Select
            value={formData.country}
            onValueChange={(value) => handleChange('country', value)}
            disabled={isLoading}
          >
            <SelectTrigger className={fieldErrors.country ? 'border-destructive' : ''}>
              <SelectValue placeholder="Sélectionner un pays" />
            </SelectTrigger>
            <SelectContent>
              {COUNTRIES.map((country) => (
                <SelectItem key={country.code} value={country.code}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.country && (
            <p className="text-sm text-destructive">{fieldErrors.country}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">
          <Phone className="inline h-4 w-4 mr-1" />
          Téléphone <span className="text-muted-foreground text-xs">(optionnel)</span>
        </Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center gap-2 pt-2 pb-4 border-t">
        <Checkbox
          id="isDefault"
          checked={formData.isDefault || false}
          onCheckedChange={(checked) => handleChange('isDefault', checked as boolean)}
          disabled={isLoading}
        />
        <Label htmlFor="isDefault" className="flex items-center gap-2 cursor-pointer">
          <Star className="h-4 w-4 text-primary" />
          Définir comme adresse par défaut
        </Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          <Save className="h-4 w-4 mr-2" />
          {isLoading ? 'Enregistrement...' : mode === 'edit' ? 'Mettre à jour' : 'Enregistrer'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            <X className="h-4 w-4 mr-2" />
            Annuler
          </Button>
        )}
      </div>
    </form>
  );
}

