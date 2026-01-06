/**
 * 🍍 JOLANANAS - Composant Autocomplétion Adresse avec Système de Numéro
 * =======================================================================
 * Version améliorée avec système en deux étapes :
 * 1. Sélection de la rue (avec ou sans numéro)
 * 2. Ajout/modification du numéro après sélection
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Loader2, Edit2, X } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Button } from '@/components/ui/Button';
import { useAddressAutocomplete, type AddressSuggestion } from '@/app/src/lib/hooks/useAddressAutocomplete';
import { cn } from '@/app/src/lib/utils';

export interface AddressAutocompleteWithNumberProps {
  id?: string;
  label?: string;
  value?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  onSelect?: (address: AddressSuggestion & { finalAddress: string }) => void;
  onChange?: (value: string) => void;
  country?: string;
  // Mode : 'inline' (numéro dans le même champ) ou 'separate' (champ séparé)
  numberMode?: 'inline' | 'separate';
}

export function AddressAutocompleteWithNumber({
  id = 'address',
  label,
  value = '',
  placeholder = 'Commencez à taper votre adresse...',
  className,
  inputClassName,
  disabled = false,
  required = false,
  error,
  onSelect,
  onChange,
  country = 'FR',
  numberMode = 'separate',
}: AddressAutocompleteWithNumberProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [selectedStreet, setSelectedStreet] = useState<AddressSuggestion | null>(null);
  const [streetNumber, setStreetNumber] = useState<string>('');
  const [isEditingNumber, setIsEditingNumber] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const numberInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const userInputRef = useRef<string>('');

  const {
    query,
    suggestions,
    isLoading,
    error: apiError,
    updateQuery,
    clearSuggestions,
  } = useAddressAutocomplete();

  const isAutocompleteEnabled = country === 'FR';

  // Extraire le numéro de la valeur actuelle si elle existe
  useEffect(() => {
    if (value && !selectedStreet) {
      // Essayer d'extraire le numéro et la rue de la valeur
      const match = value.match(/^(\d+[a-zA-Z]?)\s+(.+)$/);
      if (match) {
        setStreetNumber(match[1]);
        // Chercher la rue correspondante
        updateQuery(match[2]);
      }
    }
  }, [value, selectedStreet, updateQuery]);

  // Synchroniser la valeur externe
  useEffect(() => {
    if (value !== userInputRef.current && value !== query && !selectedStreet) {
      updateQuery(value);
      userInputRef.current = value;
    }
  }, [value, query, updateQuery, selectedStreet]);

  // Fermer les suggestions quand on clique en dehors
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Construire l'adresse finale
  const buildFinalAddress = (street: AddressSuggestion, number: string): string => {
    if (number.trim()) {
      return `${number.trim()} ${street.street || street.label}`.trim();
    }
    return street.street || street.label;
  };

  // Gérer la sélection d'une rue
  const handleStreetSelect = (suggestion: AddressSuggestion) => {
    // Si la suggestion a déjà un numéro, l'utiliser
    const number = suggestion.housenumber || streetNumber;
    
    setSelectedStreet(suggestion);
    setStreetNumber(number);
    setIsEditingNumber(numberMode === 'separate' && !number);
    setIsOpen(false);
    setSelectedIndex(-1);

    const finalAddress = buildFinalAddress(suggestion, number);
    userInputRef.current = finalAddress;

    if (onChange) {
      onChange(finalAddress);
    }

    if (onSelect) {
      onSelect({
        ...suggestion,
        housenumber: number || suggestion.housenumber,
        finalAddress,
      });
    }

    clearSuggestions();
    
    // Focus sur le champ numéro si mode séparé
    if (numberMode === 'separate' && numberInputRef.current && !number) {
      setTimeout(() => numberInputRef.current?.focus(), 100);
    }
  };

  // Gérer le changement de numéro
  const handleNumberChange = (newNumber: string) => {
    setStreetNumber(newNumber);
    
    if (selectedStreet) {
      const finalAddress = buildFinalAddress(selectedStreet, newNumber);
      userInputRef.current = finalAddress;
      
      if (onChange) {
        onChange(finalAddress);
      }
    }
  };

  // Réinitialiser la sélection
  const handleReset = () => {
    setSelectedStreet(null);
    setStreetNumber('');
    setIsEditingNumber(false);
    userInputRef.current = '';
    
    if (onChange) {
      onChange('');
    }
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Gérer la saisie dans le champ principal
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Si une rue est sélectionnée et qu'on tape, réinitialiser
    if (selectedStreet && newValue !== buildFinalAddress(selectedStreet, streetNumber)) {
      handleReset();
    }
    
    userInputRef.current = newValue;
    
    if (onChange) {
      onChange(newValue);
    }

    if (isAutocompleteEnabled && !selectedStreet) {
      updateQuery(newValue);
      setIsOpen(true);
      setSelectedIndex(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0 || selectedStreet) {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleStreetSelect(suggestions[selectedIndex]);
        } else if (suggestions.length > 0) {
          handleStreetSelect(suggestions[0]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Scroll vers la suggestion sélectionnée
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionsRef.current) {
      const selectedElement = suggestionsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth',
        });
      }
    }
  }, [selectedIndex]);

  const displayError = error || apiError;
  const isStreetSelected = selectedStreet !== null;

  return (
    <div ref={containerRef} className={cn('relative space-y-2', className)}>
      {label && (
        <Label htmlFor={id} className="flex items-center gap-1 text-jolananas-pink-medium">
          <MapPin className="h-4 w-4" />
          {label}
        </Label>
      )}

      {/* Mode séparé : Afficher la rue sélectionnée + champ numéro */}
      {isStreetSelected && numberMode === 'separate' ? (
        <div className="space-y-3">
          {/* Rue sélectionnée */}
          <div className="flex items-center gap-2 p-3 rounded-md border bg-muted/50">
            <MapPin className="h-4 w-4 text-jolananas-pink-medium flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {selectedStreet.street || selectedStreet.label}
              </p>
              {selectedStreet.postcode && selectedStreet.city && (
                <p className="text-xs text-muted-foreground">
                  {selectedStreet.postcode} {selectedStreet.city}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 w-8 p-0"
              aria-label="Changer de rue"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Champ numéro */}
          <div className="space-y-2">
            <Label htmlFor={`${id}-number`} className="text-sm">
              Numéro de voie <span className="text-muted-foreground text-xs">(optionnel)</span>
            </Label>
            <div className="flex items-center gap-2">
              <Input
                ref={numberInputRef}
                id={`${id}-number`}
                type="text"
                value={streetNumber}
                onChange={(e) => handleNumberChange(e.target.value)}
                placeholder={selectedStreet.housenumber || "Ex: 21, 21B"}
                className="w-24"
                disabled={disabled}
              />
              <p className="text-xs text-muted-foreground flex-1">
                {streetNumber 
                  ? `Adresse complète : ${buildFinalAddress(selectedStreet, streetNumber)}`
                  : 'Ajoutez un numéro pour compléter l\'adresse'}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Mode inline ou pas de rue sélectionnée : Champ principal */
        <div className="relative">
          <Input
            ref={inputRef}
            id={id}
            type="text"
            value={isStreetSelected && numberMode === 'inline' 
              ? buildFinalAddress(selectedStreet!, streetNumber)
              : value}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (isAutocompleteEnabled && suggestions.length > 0 && !isStreetSelected) {
                setIsOpen(true);
              }
            }}
            placeholder={placeholder}
            className={cn(
              'pr-10',
              displayError && 'border-destructive',
              inputClassName
            )}
            disabled={disabled}
            required={required}
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-haspopup="listbox"
            aria-controls={`${id}-suggestions`}
          />

          {isStreetSelected && numberMode === 'inline' && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingNumber(true)}
              className="absolute right-10 top-1/2 -translate-y-1/2 h-8 w-8 p-0"
              aria-label="Modifier le numéro"
            >
              <Edit2 className="h-4 w-4" />
            </Button>
          )}

          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Suggestions dropdown */}
          {isOpen && isAutocompleteEnabled && suggestions.length > 0 && !isStreetSelected && (
            <div
              ref={suggestionsRef}
              id={`${id}-suggestions`}
              role="listbox"
              className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg max-h-60 overflow-auto"
            >
              {suggestions.map((suggestion, index) => (
                <button
                  key={`${suggestion.label}-${index}`}
                  type="button"
                  role="option"
                  aria-selected={selectedIndex === index}
                  className={cn(
                    'w-full text-left px-4 py-2 hover:bg-accent focus:bg-accent focus:outline-none transition-colors',
                    selectedIndex === index && 'bg-accent'
                  )}
                  onClick={() => handleStreetSelect(suggestion)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {suggestion.housenumber ? (
                          <>
                            <span className="font-semibold text-foreground mr-1">
                              {suggestion.housenumber}
                            </span>
                            <span>{suggestion.street || suggestion.label}</span>
                          </>
                        ) : (
                          <>
                            <span className="italic">{suggestion.street || suggestion.label}</span>
                            <span className="text-xs ml-2 text-muted-foreground">
                              (vous pourrez ajouter le numéro après)
                            </span>
                          </>
                        )}
                        {suggestion.postcode && suggestion.city && (
                          <span className="text-muted-foreground ml-1">
                            , {suggestion.postcode} {suggestion.city}
                          </span>
                        )}
                      </div>
                      {suggestion.context && (
                        <div className="text-xs text-muted-foreground truncate">
                          {suggestion.context}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Message d'aide */}
          {isOpen && isAutocompleteEnabled && !isLoading && suggestions.length === 0 && value.trim().length >= 3 && (
            <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg p-3">
              <p className="text-sm text-muted-foreground">
                Aucune adresse trouvée. Essayez de taper le nom de la rue (ex: "avenue de la République").
              </p>
            </div>
          )}
        </div>
      )}

      {/* Message d'aide pour les pays non-FR */}
      {!isAutocompleteEnabled && country !== 'FR' && (
        <p className="text-xs text-muted-foreground mt-1">
          L'autocomplétion est disponible uniquement pour les adresses françaises
        </p>
      )}

      {displayError && (
        <p className="text-sm text-destructive">{displayError}</p>
      )}
    </div>
  );
}

