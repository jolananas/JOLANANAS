/**
 * 🍍 JOLANANAS - Composant Autocomplétion Adresse
 * ==============================================
 * Composant d'autocomplétion pour les adresses françaises
 * Utilise plusieurs APIs open source :
 * - API Adresse de la France (data.gouv.fr)
 * - Photon (Komoot/OpenStreetMap) pour les lieux et enseignes
 * 
 * ⚠️ IMPORTANT : Tous les appels API sont effectués depuis le client uniquement
 * Ce composant utilise 'use client' et tous les fetch() sont côté navigateur
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { useAddressAutocomplete, type AddressSuggestion } from '@/app/src/lib/hooks/useAddressAutocomplete';
import { cn } from '@/app/src/lib/utils';

export interface AddressAutocompleteProps {
  id?: string;
  label?: string;
  value?: string;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  onSelect?: (address: AddressSuggestion) => void;
  onChange?: (value: string) => void;
  country?: string; // Si différent de 'FR', désactiver l'autocomplétion
}

export function AddressAutocomplete({
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
}: AddressAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  // Ref pour suivre si le changement vient de l'utilisateur
  const userInputRef = useRef<string>('');

  const {
    query,
    suggestions,
    isLoading,
    error: apiError,
    updateQuery,
    clearSuggestions,
  } = useAddressAutocomplete();

  // Synchroniser la valeur externe avec le query interne UNIQUEMENT si elle vient du parent
  // (pas si elle vient de l'utilisateur qui tape)
  useEffect(() => {
    // Si la valeur externe est différente de celle que l'utilisateur a tapée,
    // c'est que le parent a mis à jour la valeur (ex: après sélection)
    if (value !== userInputRef.current && value !== query) {
      updateQuery(value);
      userInputRef.current = value; // Mettre à jour la référence
    }
  }, [value, query, updateQuery]);

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

  // Désactiver l'autocomplétion si le pays n'est pas la France
  const isAutocompleteEnabled = country === 'FR';

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    
    // Mettre à jour la référence pour indiquer que le changement vient de l'utilisateur
    userInputRef.current = newValue;
    
    if (onChange) {
      onChange(newValue);
    }

    if (isAutocompleteEnabled) {
      updateQuery(newValue);
      setIsOpen(true);
      setSelectedIndex(-1);
    }
  };

  const handleSelect = (suggestion: AddressSuggestion) => {
    // Si onSelect est fourni, laisser le parent gérer la mise à jour de la valeur
    // Sinon, utiliser onChange avec le label complet
    if (onSelect) {
      onSelect(suggestion);
    } else if (onChange) {
      onChange(suggestion.label);
    }

    // Mettre à jour la référence après sélection
    const selectedValue = suggestion.label;
    userInputRef.current = selectedValue;

    clearSuggestions();
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
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
          handleSelect(suggestions[selectedIndex]);
        } else if (suggestions.length > 0) {
          handleSelect(suggestions[0]);
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

  return (
    <div ref={containerRef} className={cn('relative space-y-2', className)}>
      {label && (
        <Label htmlFor={id} className="flex items-center gap-1 text-jolananas-pink-medium">
          <MapPin className="h-4 w-4" />
          {label}
        </Label>
      )}

      <div className="relative">
        <Input
          ref={inputRef}
          id={id}
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (isAutocompleteEnabled && suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className={cn(
            'pr-10',
            displayError && 'border-destructive text-destructive',
            inputClassName
          )}
          disabled={disabled}
          required={required}
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={`${id}-suggestions`}
        />

        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Suggestions dropdown */}
        {isOpen && isAutocompleteEnabled && suggestions.length > 0 && (
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
                onClick={() => handleSelect(suggestion)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {(() => {
                        const isPlaceOrLocality = suggestion.type === 'place' || suggestion.type === 'locality';
                        
                        // Vérifier si le numéro est déjà dans le label pour éviter les doublons
                        const labelText = suggestion.street || suggestion.label;
                        const numberInLabel = suggestion.housenumber 
                          ? new RegExp(`\\b${suggestion.housenumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(labelText)
                          : false;
                        
                        if (suggestion.housenumber && !numberInLabel) {
                          // Afficher le numéro séparément seulement s'il n'est pas déjà dans le label
                          return (
                            <>
                              <span className="font-semibold text-foreground mr-1">
                                {suggestion.housenumber}
                              </span>
                              <span>{suggestion.street || suggestion.label}</span>
                              {suggestion.postcode && suggestion.city && (
                                <span className="text-muted-foreground ml-1">
                                  , {suggestion.postcode} {suggestion.city}
                                </span>
                              )}
                            </>
                          );
                        } else {
                          // Le numéro est déjà dans le label ou il n'y a pas de numéro
                          return (
                            <>
                              <span className={
                                isPlaceOrLocality 
                                  ? 'font-semibold text-foreground' 
                                  : suggestion.housenumber 
                                    ? '' 
                                    : 'italic text-muted-foreground'
                              }>
                                {suggestion.street || suggestion.label}
                                {!suggestion.housenumber && !isPlaceOrLocality && (
                                  <span className="text-xs ml-1">(sans numéro)</span>
                                )}
                                {isPlaceOrLocality && (
                                  <span className="text-xs ml-1.5 text-jolananas-pink-medium font-normal">
                                    {suggestion.type === 'place' ? '📍 Lieu' : '📍 Lieu-dit'}
                                  </span>
                                )}
                              </span>
                              {suggestion.postcode && suggestion.city && (
                                <span className="text-muted-foreground ml-1">
                                  , {suggestion.postcode} {suggestion.city}
                                </span>
                              )}
                            </>
                          );
                        }
                      })()}
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

          {/* Message d'aide si aucune suggestion mais que l'utilisateur tape */}
          {isOpen && isAutocompleteEnabled && !isLoading && suggestions.length === 0 && value.trim().length >= 3 && (
            <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover shadow-lg p-3">
              <p className="text-sm text-muted-foreground">
                Aucune adresse trouvée. Essayez de taper :
              </p>
              <ul className="text-sm text-muted-foreground mt-2 ml-4 list-disc space-y-1">
                <li>Un numéro suivi du nom de la rue (ex: "21 avenue de la République")</li>
                <li>Le nom d'une rue (ex: "avenue de la République")</li>
                <li>Un nom de lieu ou d'enseigne (ex: "Carrefour", "Gare du Nord")</li>
              </ul>
              {/^[A-Z\s]{3,}$/.test(value.trim()) && !/\d/.test(value.trim()) && (
                <div className="text-xs text-muted-foreground mt-3 pt-3 border-t space-y-2">
                  <p>
                    💡 <strong>Enseigne détectée :</strong> Si cette entreprise n'apparaît pas dans les suggestions, 
                    vous pouvez continuer à taper l'adresse complète manuellement.
                  </p>
                  <p className="italic">
                    Exemple : "{value.trim()}, 123 rue Example, 75001 Paris"
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
      </div>

      {displayError && (
        <p className="text-sm text-destructive">{displayError}</p>
      )}
    </div>
  );
}

