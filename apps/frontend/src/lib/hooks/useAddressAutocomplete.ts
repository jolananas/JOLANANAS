import { useState, useEffect, useCallback, useRef } from 'react';

export interface AddressSuggestion {
  label: string;
  street: string;
  housenumber?: string;
  postcode: string;
  city: string;
  context?: string;
  department?: string; // Code du département (ex: "83")
  departmentName?: string; // Nom du département (ex: "Var")
  region?: string; // Nom de la région (ex: "Provence-Alpes-Côte d'Azur")
  coordinates?: [number, number]; // [longitude, latitude]
  type?: string; // Type de résultat : 'housenumber', 'street', 'locality', 'place'
}

interface ApiAdresseFeature {
  properties: {
    label: string;
    name: string;
    housenumber?: string;
    postcode: string;
    city: string;
    context?: string;
    type: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

interface ApiAdresseResponse {
  features: ApiAdresseFeature[];
}

// Interface pour Photon (OpenStreetMap)
interface PhotonFeature {
  geometry: {
    coordinates: [number, number]; // [longitude, latitude]
  };
  properties: {
    name: string;
    country?: string;
    city?: string;
    postcode?: string;
    street?: string;
    housenumber?: string;
    osm_key?: string; // Ex: "shop", "amenity", "tourism"
    osm_value?: string; // Ex: "supermarket", "restaurant"
    type?: string; // Type de lieu
  };
}

interface PhotonResponse {
  features: PhotonFeature[];
}

// Interface pour Nominatim (OpenStreetMap)
interface NominatimResult {
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: [string, string, string, string];
  lat: string;
  lon: string;
  display_name: string;
  class: string; // Ex: "shop", "amenity", "office"
  type: string; // Ex: "supermarket", "restaurant"
  importance: number;
  icon?: string;
  address?: {
    house_number?: string;
    road?: string;
    postcode?: string;
    city?: string;
    town?: string;
    village?: string;
    country?: string;
    country_code?: string;
  };
}

/**
 * Hook pour l'autocomplétion d'adresses françaises
 */
export function useAddressAutocomplete() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Recherche de lieux via Photon (OpenStreetMap) - Open Source
   * ⚠️ Appel API côté client uniquement
   */
  const searchPlacesPhoton = useCallback(async (searchQuery: string, signal: AbortSignal): Promise<AddressSuggestion[]> => {
    // Vérifier que nous sommes côté client
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      // Améliorer les paramètres de recherche :
      // - Augmenter la limite à 15 pour plus de résultats
      // - Ne pas limiter par bbox pour avoir plus de résultats
      // - Utiliser lang=fr pour les résultats français
      // - Photon recherche automatiquement dans les noms, enseignes, POI
      const url = `https://photon.komoot.io/api/?q=${encodedQuery}&limit=15&lang=fr`;

      const response = await fetch(url, {
        signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        return [];
      }

      const data: PhotonResponse = await response.json();

      // Transformer les résultats Photon en AddressSuggestion
      return data.features
        .filter((feature) => {
          // Filtrer pour la France uniquement (mais être très permissif pour les enseignes)
          const country = feature.properties.country;
          const name = (feature.properties.name).toLowerCase();
          const queryLower = searchQuery.toLowerCase();
          const queryWords = queryLower.split(/\s+/);
          
          // Vérifier si le nom correspond (exact, partiel, ou contient les mots clés)
          const nameMatches = name.includes(queryLower) || 
                             queryLower.includes(name) ||
                             queryWords.some(word => name.includes(word));
          
          // Accepter si :
          // 1. Pays = France
          // 2. Pas de pays mais le nom correspond bien (pour les enseignes)
          // 3. Pas de pays mais c'est un commerce/enseigne (osm_key)
          const isShopOrBusiness = feature.properties.osm_key === 'shop' || 
                                   feature.properties.osm_key === 'amenity' ||
                                   feature.properties.osm_key === 'office';
          
          return !country || 
                 country === 'FR' || 
                 country === 'France' || 
                 country.toLowerCase() === 'france' ||
                 (nameMatches && !country) || // Accepter si le nom correspond bien
                 (isShopOrBusiness && nameMatches); // Accepter les commerces même sans pays si le nom correspond
        })
        .map((feature) => {
          const name = feature.properties.name;
          const city = feature.properties.city;
          const postcode = feature.properties.postcode;
          const street = feature.properties.street;
          const housenumber = feature.properties.housenumber;
          const osmKey = feature.properties.osm_key;
          const osmValue = feature.properties.osm_value;

          // Construire le label : pour les enseignes, prioriser le nom
          let label = name;
          if (street && (osmKey === 'shop' || osmKey === 'amenity' || osmKey === 'office')) {
            // Pour les commerces/enseignes, afficher : "Nom Enseigne, Rue, Ville"
            if (housenumber && street) {
              label = `${name}, ${housenumber} ${street}`;
            } else if (street) {
              label = `${name}, ${street}`;
            }
          } else if (street) {
            // Pour les adresses normales
            label = housenumber ? `${housenumber} ${street}` : street;
          }
          
          // Ajouter code postal et ville
          if (postcode && city) {
            label += `, ${postcode} ${city}`;
          } else if (city) {
            label += `, ${city}`;
          } else if (postcode) {
            label += `, ${postcode}`;
          }

          // Déterminer le type selon osm_key/osm_value
          let type = 'place';
          if (osmKey === 'shop' || osmKey === 'amenity' || osmKey === 'office' || osmKey === 'craft') {
            type = 'place'; // Enseigne, commerce ou point d'intérêt
          } else if (osmKey === 'tourism') {
            type = 'place'; // Lieu touristique
          }

          return {
            label,
            street: street || name,
            housenumber,
            postcode: postcode,
            city: city,
            type,
            coordinates: feature.geometry.coordinates,
          };
        })
        // Prioriser les résultats avec un nom qui correspond exactement à la requête
        .sort((a, b) => {
          const queryLower = searchQuery.toLowerCase();
          const aNameMatch = a.street.toLowerCase().includes(queryLower) || a.label.toLowerCase().includes(queryLower);
          const bNameMatch = b.street.toLowerCase().includes(queryLower) || b.label.toLowerCase().includes(queryLower);
          
          if (aNameMatch && !bNameMatch) return -1;
          if (!aNameMatch && bNameMatch) return 1;
          return 0;
        });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return [];
      }
      console.warn('Erreur Photon (non bloquant):', err);
      return [];
    }
  }, []);

  /**
   * Recherche de lieux via Nominatim (OpenStreetMap) - Open Source
   * ⚠️ Appel API côté client uniquement
   * Nominatim peut avoir des données différentes de Photon
   */
  const searchPlacesNominatim = useCallback(async (searchQuery: string, signal: AbortSignal): Promise<AddressSuggestion[]> => {
    // Vérifier que nous sommes côté client
    if (typeof window === 'undefined') {
      return [];
    }

    try {
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      // Paramètres Nominatim :
      // - format=json : format JSON
      // - countrycodes=fr : France uniquement
      // - limit=15 : limite de résultats (augmenté)
      // - addressdetails=1 : détails d'adresse complets
      // - extratags=1 : tags supplémentaires
      // - dedupe=1 : déduplication automatique
      const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&countrycodes=fr&limit=15&addressdetails=1&extratags=1&dedupe=1`;

      const response = await fetch(url, {
        signal,
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'JOLANANAS-AddressAutocomplete/1.0', // Requis par Nominatim
        },
      });

      if (!response.ok) {
        return [];
      }

      const data: NominatimResult[] = await response.json();

      // Transformer les résultats Nominatim en AddressSuggestion
      return data
        .filter((result) => {
          // Filtrer pour la France uniquement (mais être permissif pour les enseignes)
          const countryCode = result.address?.country_code;
          const displayName = (result.display_name).toLowerCase();
          const queryLower = searchQuery.toLowerCase();
          const queryWords = queryLower.split(/\s+/);
          
          // Vérifier si le nom correspond
          const nameMatches = displayName.includes(queryLower) ||
                             queryLower.includes(displayName) ||
                             queryWords.some(word => displayName.includes(word));
          
          // Accepter si :
          // 1. Pays = France
          // 2. Pas de pays mais le nom correspond bien
          // 3. C'est un commerce/enseigne (class = shop, amenity, office)
          const isShopOrBusiness = result.class === 'shop' || 
                                  result.class === 'amenity' ||
                                  result.class === 'office';
          
          return !countryCode || 
                 countryCode.toLowerCase() === 'fr' ||
                 (nameMatches && !countryCode) ||
                 (isShopOrBusiness && nameMatches);
        })
        .map((result) => {
          const name = result.display_name.split(',')[0] || result.display_name;
          const address = result.address || {};
          const city = address.city || address.town || address.village;
          const postcode = address.postcode;
          const street = address.road;
          const housenumber = address.house_number;

          // Construire le label
          let label = name;
          if (street && (result.class === 'shop' || result.class === 'amenity' || result.class === 'office')) {
            // Pour les commerces/enseignes, afficher : "Nom Enseigne, Rue, Ville"
            if (housenumber && street) {
              label = `${name}, ${housenumber} ${street}`;
            } else if (street) {
              label = `${name}, ${street}`;
            }
          } else if (street) {
            // Pour les adresses normales
            label = housenumber ? `${housenumber} ${street}` : street;
          }

          // Ajouter code postal et ville
          if (postcode && city) {
            label += `, ${postcode} ${city}`;
          } else if (city) {
            label += `, ${city}`;
          } else if (postcode) {
            label += `, ${postcode}`;
          }

          // Déterminer le type
          let type = 'place';
          if (result.class === 'shop' || result.class === 'amenity' || result.class === 'office' || result.class === 'craft') {
            type = 'place'; // Enseigne, commerce ou point d'intérêt
          } else if (result.class === 'tourism') {
            type = 'place'; // Lieu touristique
          }

          const lon = parseFloat(result.lon);
          const lat = parseFloat(result.lat);
          
          return {
            label,
            street: street || name,
            housenumber,
            postcode: postcode,
            city: city,
            type,
            coordinates: [lon, lat] as [number, number],
          };
        })
        // Prioriser les résultats avec un nom qui correspond exactement à la requête
        .sort((a, b) => {
          const queryLower = searchQuery.toLowerCase();
          const aNameMatch = a.street.toLowerCase().includes(queryLower) || a.label.toLowerCase().includes(queryLower);
          const bNameMatch = b.street.toLowerCase().includes(queryLower) || b.label.toLowerCase().includes(queryLower);
          
          if (aNameMatch && !bNameMatch) return -1;
          if (!aNameMatch && bNameMatch) return 1;
          return 0;
        });
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return [];
      }
      console.warn('Erreur Nominatim (non bloquant):', err);
      return [];
    }
  }, []);

  /**
   * Recherche avec variations de noms pour améliorer la détection
   * Génère plusieurs variantes de la requête pour recherche plus flexible
   */
  const generateSearchVariations = useCallback((searchQuery: string): string[] => {
    const trimmed = searchQuery.trim();
    const variations: string[] = [trimmed]; // Recherche exacte d'abord

    // Si plusieurs mots, générer des variations
    const words = trimmed.split(/\s+/).filter(w => w.length > 0);
    
    if (words.length > 1) {
      // Recherche sans espaces
      variations.push(words.join(''));
      
      // Recherche avec chaque mot individuellement (surtout le premier qui est souvent l'enseigne)
      words.forEach((word, index) => {
        if (word.length >= 3) {
          variations.push(word);
          // Si c'est le premier mot (probablement l'enseigne), le prioriser
          if (index === 0) {
            variations.push(word); // Ajouter deux fois pour plus de poids
          }
        }
      });
      
      // Recherche avec les premiers mots (enseigne + ville)
      if (words.length >= 2) {
        variations.push(words.slice(0, 2).join(' ')); // Ex: "Leclerc Albi"
        variations.push(words[0] + ' ' + words[1]); // Variante avec espace
      }
      
      // Recherche avec les 2 premiers mots si plus de 2 mots
      if (words.length > 2) {
        variations.push(words.slice(0, 2).join(' '));
      }
    }

    // Retirer les doublons tout en préservant l'ordre (la première occurrence est prioritaire)
    const seen = new Set<string>();
    return variations.filter(v => {
      const lower = v.toLowerCase();
      if (seen.has(lower)) {
        return false;
      }
      seen.add(lower);
      return true;
    });
  }, []);

  /**
   * Recherche d'adresses via l'API Adresse de la France
   * ⚠️ Appel API côté client uniquement
   */
  const searchAddresses = useCallback(async (searchQuery: string) => {
    // Vérifier que nous sommes côté client
    if (typeof window === 'undefined') {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    // Annuler la requête précédente si elle existe
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Ne pas rechercher si la requête est trop courte
    if (searchQuery.trim().length < 3) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    // Créer un nouveau AbortController
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    setIsLoading(true);
    setError(null);

    try {
      const encodedQuery = encodeURIComponent(searchQuery.trim());
      // Augmenter la limite pour compenser le filtrage des résultats sans numéro
      const url = `https://api-adresse.data.gouv.fr/search/?q=${encodedQuery}&limit=15&autocomplete=1`;

      // Générer des variations de recherche pour améliorer la détection
      const searchVariations = generateSearchVariations(searchQuery);
      const primaryQuery = searchVariations[0]; // Requête principale (exacte)

      // Recherches parallèles : API Adresse + Photon + Nominatim (pour les lieux/enseignes)
      // ⚠️ Tous les appels sont effectués depuis le client uniquement
      const [addressResponse, placesPhotonResults, placesNominatimResults] = await Promise.allSettled([
        fetch(url, {
          signal,
          headers: {
            'Accept': 'application/json',
          },
        }),
        searchPlacesPhoton(primaryQuery, signal),
        searchPlacesNominatim(primaryQuery, signal),
      ]);

      // Si plusieurs mots, faire des recherches supplémentaires avec les variations
      let additionalPhotonResults: AddressSuggestion[] = [];
      let additionalNominatimResults: AddressSuggestion[] = [];
      
      if (searchVariations.length > 1) {
        // Recherches supplémentaires avec les variations (sans la première qui est déjà faite)
        const variationPromises = searchVariations.slice(1).map(variation => 
          Promise.allSettled([
            searchPlacesPhoton(variation, signal),
            searchPlacesNominatim(variation, signal),
          ])
        );

        const variationResults = await Promise.all(variationPromises);
        
        variationResults.forEach(([photonResult, nominatimResult]) => {
          if (photonResult.status === 'fulfilled') {
            additionalPhotonResults.push(...photonResult.value);
          }
          if (nominatimResult.status === 'fulfilled') {
            additionalNominatimResults.push(...nominatimResult.value);
          }
        });
      }

      // Traiter les résultats de l'API Adresse
      let addressSuggestions: AddressSuggestion[] = [];
      
      if (addressResponse.status === 'fulfilled' && addressResponse.value.ok) {
        const data: ApiAdresseResponse = await addressResponse.value.json();

        // Vérifier si la requête contient un numéro (ex: "21 avenue" ou "avenue 21")
        const queryHasNumber = /\d+/.test(searchQuery.trim());

      // Transformer les résultats en suggestions
      // Si la requête contient un numéro, prioriser les résultats avec numéro
      // Sinon, accepter tous les résultats (rues, voies, etc.)
      const formattedSuggestions: AddressSuggestion[] = data.features
        .map((feature) => {
          // Extraire le numéro de voie depuis housenumber ou depuis le label
          let housenumber = feature.properties.housenumber;
          
          // Si pas de housenumber dans les propriétés, essayer de l'extraire du label
          // Format typique du label: "21 Rue Example, 75001 Paris"
          if (!housenumber && feature.properties.label) {
            const labelMatch = feature.properties.label.match(/^(\d+[a-zA-Z]?)\s/);
            if (labelMatch) {
              housenumber = labelMatch[1];
            }
          }
          
          return { feature, housenumber };
        })
        .filter(({ housenumber, feature }) => {
          // Si la requête contient un numéro, ne garder que les résultats avec numéro
          if (queryHasNumber) {
            return housenumber && housenumber.trim().length > 0;
          }
          // Sinon, accepter tous les résultats valides :
          // - Adresses avec numéro (housenumber)
          // - Rues (street)
          // - Lieux-dits et lieux (locality)
          // - Enseignes et points d'intérêt (place)
          // Exclure seulement les résultats de type "municipality" qui sont trop génériques
          const validTypes = ['housenumber', 'street', 'locality', 'place'];
          return validTypes.includes(feature.properties.type) || 
                 (housenumber && housenumber.trim().length > 0) ||
                 (feature.properties.name && feature.properties.name.trim().length > 0);
        })
        .map(({ feature, housenumber }) => {
          // Extraire le département et la région depuis le context
          // Format typique: "83, Var, Provence-Alpes-Côte d'Azur"
          let department: string | undefined;
          let departmentName: string | undefined;
          let region: string | undefined;
          
          if (feature.properties.context) {
            const contextParts = feature.properties.context.split(',').map(part => part.trim());
            if (contextParts.length >= 1) {
              department = contextParts[0]; // Code département (ex: "83")
            }
            if (contextParts.length >= 2) {
              departmentName = contextParts[1]; // Nom département (ex: "Var")
            }
            if (contextParts.length >= 3) {
              region = contextParts.slice(2).join(', '); // Région (peut contenir des virgules)
            }
          }
          
          const street = feature.properties.name;
          const postcode = feature.properties.postcode;
          const city = feature.properties.city;
          const featureType = feature.properties.type;
          
          // Construire un label amélioré selon le type de résultat
          let formattedLabel = feature.properties.label;
          
          // Pour les lieux/enseignes (place, locality), utiliser le label tel quel
          if (featureType === 'place' || featureType === 'locality') {
            // Pour les lieux et enseignes, le label de l'API est généralement bien formaté
            formattedLabel = feature.properties.label;
          } else {
            // Pour les adresses et rues, gérer le numéro de voie
            // Format: "21 Rue Example, 75001 Paris"
            // Éviter les doublons : si le numéro est déjà dans le label, l'utiliser tel quel
            const numberAlreadyInLabel = housenumber && feature.properties.label
              ? new RegExp(`\\b${housenumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`).test(feature.properties.label)
              : false;
            
            // Si le numéro n'est pas déjà dans le label, le construire
            if (!numberAlreadyInLabel && housenumber && street) {
              // Construire le label avec le numéro en premier
              formattedLabel = `${housenumber} ${street}`.trim();
              if (postcode && city) {
                formattedLabel += `, ${postcode} ${city}`;
              } else if (postcode) {
                formattedLabel += `, ${postcode}`;
              } else if (city) {
                formattedLabel += `, ${city}`;
              }
            } else if (!numberAlreadyInLabel && housenumber && !street && feature.properties.label) {
              // Si on a un numéro mais pas de nom de rue, utiliser le label original
              // mais s'assurer que le numéro est au début
              if (!feature.properties.label.startsWith(housenumber)) {
                formattedLabel = `${housenumber} ${feature.properties.label}`.trim();
              }
            }
          }
          
          return {
            label: formattedLabel,
            street: street,
            housenumber: housenumber,
            postcode: postcode,
            city: city,
            context: feature.properties.context,
            department,
            departmentName,
            region,
            coordinates: feature.geometry.coordinates,
            type: featureType, // Inclure le type pour l'affichage
          };
        })
        // Trier : prioriser intelligemment selon le type et la présence de numéro
        .sort((a, b) => {
          if (queryHasNumber) {
            // Si la requête a un numéro, prioriser les résultats avec numéro
            if (a.housenumber && !b.housenumber) return -1;
            if (!a.housenumber && b.housenumber) return 1;
          }
          
          // Prioriser les adresses (housenumber) > rues (street) > lieux (place/locality)
          const typePriority: Record<string, number> = {
            'housenumber': 1,
            'street': 2,
            'place': 3,
            'locality': 4,
          };
          const aPriority = typePriority[a.type] || 5;
          const bPriority = typePriority[b.type] || 5;
          
          if (aPriority !== bPriority) {
            return aPriority - bPriority;
          }
          
          return 0;
        })
        // Limiter à 8 résultats finaux après filtrage (augmenté pour compenser le filtrage moins strict)
        .slice(0, 8);
        
        addressSuggestions = formattedSuggestions;
      }

      // Récupérer les résultats Photon (lieux/enseignes)
      const placesPhotonSuggestions = placesPhotonResults.status === 'fulfilled' 
        ? [...placesPhotonResults.value, ...additionalPhotonResults]
        : additionalPhotonResults;

      // Récupérer les résultats Nominatim (lieux/enseignes)
      const placesNominatimSuggestions = placesNominatimResults.status === 'fulfilled'
        ? [...placesNominatimResults.value, ...additionalNominatimResults]
        : additionalNominatimResults;

      // Fusionner tous les résultats de lieux
      const placesSuggestions = [...placesPhotonSuggestions, ...placesNominatimSuggestions];

      // Détecter si la requête ressemble à une enseigne (majuscules, pas de numéro)
      // Ex: "CARREFOUR", "LECLERC"
      const looksLikeBusiness = /^[A-Z\s]{3,}$/.test(searchQuery.trim()) && !/\d/.test(searchQuery.trim());

      // Fusionner les résultats : si c'est une enseigne, prioriser Photon
      // Sinon, adresses d'abord, puis lieux/enseignes
      const allSuggestions = looksLikeBusiness
        ? [...placesSuggestions, ...addressSuggestions] // Prioriser Photon pour les enseignes
        : [...addressSuggestions, ...placesSuggestions]; // Prioriser API Adresse pour les adresses

      // Dédupliquer par label (éviter les doublons entre APIs)
      const uniqueSuggestions = Array.from(
        new Map(allSuggestions.map(item => [item.label, item])).values()
      );

      // Calculer un score de correspondance pour chaque suggestion
      const queryLower = searchQuery.toLowerCase();
      const queryWords = queryLower.split(/\s+/).filter(w => w.length > 0);
      
      const suggestionsWithScore = uniqueSuggestions.map(suggestion => {
        const labelLower = (suggestion.label).toLowerCase();
        const streetLower = (suggestion.street).toLowerCase();
        const cityLower = (suggestion.city).toLowerCase();
        
        let score = 0;
        
        // Correspondance exacte du nom (score le plus élevé)
        if (labelLower === queryLower || streetLower === queryLower) {
          score += 100;
        }
        // Correspondance exacte au début
        else if (labelLower.startsWith(queryLower) || streetLower.startsWith(queryLower)) {
          score += 80;
        }
        // Correspondance partielle (contient la requête complète)
        else if (labelLower.includes(queryLower) || streetLower.includes(queryLower)) {
          score += 60;
        }
        // Correspondance avec tous les mots de la requête (important pour "Leclerc Albi")
        else {
          const allWordsMatch = queryWords.every(word => 
            labelLower.includes(word) || streetLower.includes(word) || cityLower.includes(word)
          );
          
          if (allWordsMatch) {
            // Si tous les mots matchent, score élevé
            score += 50;
            // Bonus si le premier mot (enseigne) est au début
            if (queryWords.length > 0 && (labelLower.startsWith(queryWords[0]) || streetLower.startsWith(queryWords[0]))) {
              score += 20;
            }
            // Bonus si la ville correspond (pour "Leclerc Albi")
            if (queryWords.length > 1 && cityLower.includes(queryWords[queryWords.length - 1])) {
              score += 15;
            }
          } else {
            // Correspondance partielle avec quelques mots
            const matchingWords = queryWords.filter(word => 
              labelLower.includes(word) || streetLower.includes(word) || cityLower.includes(word)
            );
            score += matchingWords.length * 15;
            
            // Bonus si le premier mot (enseigne) matche
            if (queryWords.length > 0 && (labelLower.includes(queryWords[0]) || streetLower.includes(queryWords[0]))) {
              score += 10;
            }
          }
        }
        
        // Bonus pour les résultats avec numéro si la requête en contient un
        const queryHasNumber = /\d+/.test(searchQuery.trim());
        if (queryHasNumber && suggestion.housenumber) {
          score += 10;
        }
        
        // Bonus pour les résultats de type "place" (enseignes/commerces)
        if (suggestion.type === 'place') {
          score += 5;
        }
        
        return { suggestion, score };
      });

      // Trier par score puis par type
      const queryHasNumber = /\d+/.test(searchQuery.trim());
      const sortedSuggestions = suggestionsWithScore
        .sort((a, b) => {
          // D'abord par score (correspondance)
          if (a.score !== b.score) {
            return b.score - a.score; // Score décroissant
          }
          
          // Ensuite par type si même score
          if (queryHasNumber) {
            if (a.suggestion.housenumber && !b.suggestion.housenumber) return -1;
            if (!a.suggestion.housenumber && b.suggestion.housenumber) return 1;
          }
          
          const typePriority: Record<string, number> = {
            'housenumber': 1,
            'street': 2,
            'place': 3,
            'locality': 4,
          };
          const aPriority = typePriority[a.suggestion.type] || 5;
          const bPriority = typePriority[b.suggestion.type] || 5;
          
          return aPriority - bPriority;
        })
        .map(item => item.suggestion)
        .slice(0, 10); // Limiter à 10 résultats

      setSuggestions(sortedSuggestions);
    } catch (err) {
      // Ignorer les erreurs d'annulation
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }

      console.error('Erreur lors de la recherche d\'adresse:', err);
      setError('Impossible de charger les suggestions d\'adresse');
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchPlacesPhoton, searchPlacesNominatim, generateSearchVariations]);

  /**
   * Mise à jour de la requête avec debounce
   */
  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);

    // Annuler le debounce précédent
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Débouncer la recherche (300ms)
    debounceTimeoutRef.current = setTimeout(() => {
      searchAddresses(newQuery);
    }, 300);
  }, [searchAddresses]);

  /**
   * Réinitialiser les suggestions
   */
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setQuery('');
    setError(null);
  }, []);

  /**
   * Nettoyage à la destruction du composant
   */
  useEffect(() => {
    return () => {
      // Annuler la requête en cours
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      // Nettoyer le debounce
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  return {
    query,
    suggestions,
    isLoading,
    error,
    updateQuery,
    clearSuggestions,
    searchAddresses,
  };
}

