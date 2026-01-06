/**
 * 🍍 JOLANANAS - Checkout Page Component
 * =======================================
 * Page de checkout sécurisée
 * Redirige vers le paiement sécurisé (PCI-DSS compliant)
 * Utilise uniquement les données réelles du CartContext
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Truck, CheckCircle2, ShoppingBag, Lock, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Separator } from '@/components/ui/Separator';
import { Progress } from '@/components/ui/Progress';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import { AddressAutocomplete } from '@/components/ui/AddressAutocomplete';
import { useCart } from '@/lib/CartContext';
import { OrderSummary } from './OrderSummary';
import { safeJsonParse } from '@/app/src/lib/api-client';
import { normalizeDataForAPI } from '@/lib/utils/formatters';
import { safeFetchJSON } from '@/lib/utils/safe-fetch';
import { transformShopifyError } from '@/app/src/lib/utils/shopify-error-handler';
import type { BaseEcommerceProps } from '@/app/src/types/ecommerce';
import type { AddressSuggestion } from '@/app/src/lib/hooks/useAddressAutocomplete';

interface CheckoutPageProps extends BaseEcommerceProps {
  onComplete?: () => void;
}

type CheckoutStep = 'shipping' | 'redirecting';

// Liste des pays organisés par continent
const COUNTRIES_BY_CONTINENT = {
  Europe: [
    { code: 'FR', name: 'France' },
    { code: 'BE', name: 'Belgique' },
    { code: 'CH', name: 'Suisse' },
    { code: 'LU', name: 'Luxembourg' },
    { code: 'DE', name: 'Allemagne' },
    { code: 'ES', name: 'Espagne' },
    { code: 'IT', name: 'Italie' },
    { code: 'PT', name: 'Portugal' },
    { code: 'GB', name: 'Royaume-Uni' },
    { code: 'IE', name: 'Irlande' },
    { code: 'NL', name: 'Pays-Bas' },
    { code: 'AT', name: 'Autriche' },
    { code: 'SE', name: 'Suède' },
    { code: 'NO', name: 'Norvège' },
    { code: 'DK', name: 'Danemark' },
    { code: 'FI', name: 'Finlande' },
    { code: 'PL', name: 'Pologne' },
    { code: 'CZ', name: 'République tchèque' },
    { code: 'GR', name: 'Grèce' },
  ],
  Amérique: [
    { code: 'US', name: 'États-Unis' },
    { code: 'CA', name: 'Canada' },
    { code: 'MX', name: 'Mexique' },
    { code: 'BR', name: 'Brésil' },
    { code: 'AR', name: 'Argentine' },
    { code: 'CL', name: 'Chili' },
  ],
  Asie: [
    { code: 'JP', name: 'Japon' },
    { code: 'CN', name: 'Chine' },
    { code: 'KR', name: 'Corée du Sud' },
    { code: 'IN', name: 'Inde' },
    { code: 'SG', name: 'Singapour' },
    { code: 'TH', name: 'Thaïlande' },
    { code: 'VN', name: 'Viêt Nam' },
  ],
  Afrique: [
    { code: 'ZA', name: 'Afrique du Sud' },
    { code: 'MA', name: 'Maroc' },
    { code: 'TN', name: 'Tunisie' },
    { code: 'EG', name: 'Égypte' },
  ],
  Océanie: [
    { code: 'AU', name: 'Australie' },
    { code: 'NZ', name: 'Nouvelle-Zélande' },
  ],
};

// Liste plate de tous les pays pour le sélecteur
const ALL_COUNTRIES = Object.values(COUNTRIES_BY_CONTINENT).flat();

// Fonction pour obtenir le code pays depuis le nom
const getCountryCode = (countryName: string): string => {
  const country = ALL_COUNTRIES.find(c => 
    c.name === countryName || 
    c.name.toLowerCase() === countryName.toLowerCase() ||
    c.code === countryName
  );
  return country?.code || countryName;
};

// Fonction pour obtenir le nom du pays depuis le code
// CRITIQUE : Normaliser le résultat pour éviter les caractères Unicode > 255
const getCountryName = (countryCode: string): string => {
  const country = ALL_COUNTRIES.find(c => c.code === countryCode);
  const countryName = country?.name || countryCode;
  // Normaliser pour garantir qu'aucun caractère Unicode > 255 ne passe
  return normalizeDataForAPI(countryName);
};

export function CheckoutPage({ className, onComplete }: CheckoutPageProps) {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [addressHasNumber, setAddressHasNumber] = useState(true); // Suivre si l'adresse a un numéro

  // Données du formulaire
  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    address2: '',
    city: '',
    postalCode: '',
    department: '',
    region: '',
    country: 'FR', // Code pays par défaut (France)
  });

  // Vérifier si le pays est la France
  const isFrance = shippingData.country === 'FR' || shippingData.country === 'France';

  // Validation
  const validateShipping = () => {
    const newErrors: Record<string, string> = {};
    
    if (!shippingData.firstName.trim()) {
      newErrors.firstName = 'Le prénom est requis';
    }
    if (!shippingData.lastName.trim()) {
      newErrors.lastName = 'Le nom est requis';
    }
    if (!shippingData.email.trim()) {
      newErrors.email = 'L\'adresse e-mail est requise';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingData.email)) {
      newErrors.email = 'L\'adresse e-mail n\'est pas valide';
    }
    if (!shippingData.address.trim()) {
      newErrors.address = 'L\'adresse est requise';
    }
    if (!shippingData.city.trim()) {
      newErrors.city = 'La ville est requise';
    }
    if (!shippingData.postalCode.trim()) {
      newErrors.postalCode = 'Le code postal est requis';
    }
    if (!shippingData.country.trim()) {
      newErrors.country = 'Le pays est requis';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Rediriger vers le paiement sécurisé
  const handleRedirectToShopifyCheckout = async () => {
    if (!validateShipping()) {
      return;
    }

    setIsRedirecting(true);
    setCurrentStep('redirecting');
    setErrors({});

    try {
      // Convertir les items du panier local en format Shopify
      const cartLines = items.map(item => {
        // Vérifier que le variantId est bien un ID de variant et non un ID de produit
        const variantId = item.variantId;
        
        // Log pour debugging
        if (process.env.NODE_ENV === 'development') {
          console.log('🛒 Item panier:', {
            productId: item.productId,
            variantId: variantId,
            isProductId: variantId?.includes('gid://shopify/Product/') && !variantId?.includes('ProductVariant'),
            isVariantId: variantId?.includes('gid://shopify/ProductVariant/'),
          });
        }
        
        // Si c'est un ID de produit au lieu d'un ID de variant, on ne peut pas l'utiliser
        if (variantId?.includes('gid://shopify/Product/') && !variantId?.includes('ProductVariant')) {
          console.error('❌ Erreur: ID de produit utilisé au lieu d\'un ID de variant:', variantId);
          throw new Error('Erreur: Le produit sélectionné nécessite de choisir une variante. Veuillez retourner à la page produit.');
        }
        
        return {
          merchandiseId: variantId,
          quantity: item.quantity,
        };
      });

      // Préparer les informations de livraison pour l'API
      // CRITIQUE : Normaliser le nom du pays AVANT de l'utiliser (getCountryName peut retourner des noms avec tirets Unicode)
      const countryNameRaw = getCountryName(shippingData.country) || shippingData.country;
      const countryNameNormalized = normalizeDataForAPI(countryNameRaw);
      
      const shippingInfo = {
        firstName: shippingData.firstName,
        lastName: shippingData.lastName,
        email: shippingData.email,
        phone: shippingData.phone || undefined,
        address: shippingData.address,
        address2: shippingData.address2 || undefined,
        city: shippingData.city,
        postalCode: shippingData.postalCode,
        department: isFrance ? (shippingData.department || undefined) : undefined,
        region: isFrance ? (shippingData.region || undefined) : undefined,
        country: countryNameNormalized,
      };

      // DEBUG : Scanner les données AVANT normalisation pour identifier les caractères Unicode problématiques
      if (process.env.NODE_ENV === 'development') {
        const scanForUnicode = (obj: any, path: string = ''): Array<{ path: string; char: string; code: number; value: string }> => {
          const problematic: Array<{ path: string; char: string; code: number; value: string }> = [];
          if (typeof obj === 'string') {
            for (let i = 0; i < obj.length; i++) {
              const code = obj.charCodeAt(i);
              if (code > 255) {
                problematic.push({
                  path: path || 'root',
                  char: obj[i],
                  code: code,
                  value: obj.substring(Math.max(0, i - 10), Math.min(obj.length, i + 10))
                });
              }
            }
          } else if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
              problematic.push(...scanForUnicode(item, `${path}[${index}]`));
            });
          } else if (obj && typeof obj === 'object') {
            for (const key of Object.keys(obj)) {
              problematic.push(...scanForUnicode(obj[key], path ? `${path}.${key}` : key));
            }
          }
          return problematic;
        };
        
        const problematicBefore = scanForUnicode(shippingInfo);
        if (problematicBefore.length > 0) {
          console.warn('⚠️ Caractères Unicode détectés AVANT normalisation dans shippingInfo:');
          problematicBefore.forEach(p => {
            console.warn(`   - Champ: "${p.path}"`);
            console.warn(`     Caractère: "${p.char}" (code: ${p.code}, U+${p.code.toString(16).toUpperCase().padStart(4, '0')})`);
            console.warn(`     Contexte: "${p.value}"`);
          });
        }
      }

      // Normaliser toutes les données pour éviter les erreurs ByteString
      const normalizedShippingInfo = normalizeDataForAPI(shippingInfo);
      const normalizedCartLines = normalizeDataForAPI(cartLines);
      
      // DEBUG : Scanner les données APRÈS normalisation pour vérifier que la normalisation a fonctionné
      if (process.env.NODE_ENV === 'development') {
        const scanForUnicode = (obj: any, path: string = ''): Array<{ path: string; char: string; code: number; value: string }> => {
          const problematic: Array<{ path: string; char: string; code: number; value: string }> = [];
          if (typeof obj === 'string') {
            for (let i = 0; i < obj.length; i++) {
              const code = obj.charCodeAt(i);
              if (code > 255) {
                problematic.push({
                  path: path || 'root',
                  char: obj[i],
                  code: code,
                  value: obj.substring(Math.max(0, i - 10), Math.min(obj.length, i + 10))
                });
              }
            }
          } else if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
              problematic.push(...scanForUnicode(item, `${path}[${index}]`));
            });
          } else if (obj && typeof obj === 'object') {
            for (const key of Object.keys(obj)) {
              problematic.push(...scanForUnicode(obj[key], path ? `${path}.${key}` : key));
            }
          }
          return problematic;
        };
        
        const problematicAfter = scanForUnicode(normalizedShippingInfo);
        if (problematicAfter.length > 0) {
          console.error('❌ ERREUR : Caractères Unicode toujours présents APRÈS normalisation dans normalizedShippingInfo:');
          problematicAfter.forEach(p => {
            console.error(`   - Champ: "${p.path}"`);
            console.error(`     Caractère: "${p.char}" (code: ${p.code}, U+${p.code.toString(16).toUpperCase().padStart(4, '0')})`);
            console.error(`     Contexte: "${p.value}"`);
          });
        } else {
          console.log('✅ Aucun caractère Unicode problématique détecté dans normalizedShippingInfo après normalisation');
        }
      }

      // Créer le panier Shopify via l'API avec les informations client
      // Utiliser safeFetchJSON pour normalisation automatique
      const response = await safeFetchJSON('/api/cart/create', {
        lines: normalizedCartLines,
        shippingInfo: normalizedShippingInfo,
      });

      if (!response.ok) {
        // Utiliser safeJsonParse pour éviter l'erreur "Unexpected token '<'"
        const errorData = await safeJsonParse<{ error?: string }>(response);
        // L'erreur est déjà transformée par l'API, on l'utilise directement
        const errorMessage = errorData.error || 'Erreur lors de la création du panier';
        throw new Error(errorMessage);
      }

      // Utiliser safeJsonParse pour éviter l'erreur "Unexpected token '<'"
      const cartData = await safeJsonParse<{ checkoutUrl?: string }>(response);

      if (!cartData.checkoutUrl) {
        throw new Error('URL de checkout non disponible');
      }

      // Rediriger vers le paiement sécurisé
      window.location.href = cartData.checkoutUrl;

    } catch (error) {
      console.error('❌ Erreur lors de la redirection vers le paiement sécurisé:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      // L'erreur de l'API est déjà transformée par l'API route
      // On ne re-transforme que si c'est une erreur technique Shopify (contient gid://shopify/)
      const userFriendlyError = errorMessage.includes('gid://shopify/') 
        ? transformShopifyError(errorMessage, 'CheckoutPage')
        : errorMessage; // Utiliser directement si déjà transformée
      setErrors({ 
        submit: userFriendlyError
      });
      setIsRedirecting(false);
      setCurrentStep('shipping');
    }
  };

  // Calculer la progression
  const progress = currentStep === 'shipping' ? 50 : 100;

  // Si le panier est vide, afficher un message
  if (items.length === 0) {
    return (
      <div className="container py-12 md:py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-2xl mx-auto"
        >
          <Card className="bg-gradient-to-br from-jolananas-peach-light/50 via-jolananas-pink-medium/50 to-jolananas-pink-deep/50 backdrop-blur-md border-jolananas-pink-medium/30 shadow-xl">
            <CardContent className="p-8 md:p-12 text-center">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                className="mb-6"
              >
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-jolananas-pink-medium to-jolananas-pink-deep mb-4 shadow-glow-pink">
                  <ShoppingBag className="h-10 w-10 text-white" />
                </div>
              </motion.div>
              
              <h2 className="font-serif text-3xl font-bold text-jolananas-black-ink mb-3">
                Votre panier est vide
              </h2>
              <p className="text-muted-foreground mb-6 text-lg">
                Découvrez nos créations artisanales et commencez votre shopping.
              </p>
              
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-jolananas-pink-medium to-jolananas-pink-deep text-white hover:from-jolananas-pink-deep hover:to-jolananas-pink-medium shadow-glow-pink font-semibold"
              >
                <Link href="/products">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Continuez vos achats
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`checkout-page ${className}`}>
      <div className="container py-8 md:py-12">
        {/* Progress Bar */}
        <Card className="border-0 shadow-none bg-transparent mb-8">
          <CardHeader>
            <CardTitle className="font-serif text-3xl font-bold tracking-tight text-jolananas-pink-medium">
              Finaliser la commande
            </CardTitle>
            <CardDescription>
              Remplissez vos informations de livraison, puis vous serez redirigé vers la page de paiement sécurisé.
            </CardDescription>
          </CardHeader>
        </Card>
        
        <div className="mb-6">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-jolananas-pink-medium mt-2 text-center font-medium">
            Étape 1 sur 2
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Formulaire principal */}
          <div className="lg:col-span-2 space-y-6">
            {currentStep === 'shipping' && (
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Truck className="h-5 w-5 text-jolananas-pink-medium" />
                    <CardTitle className="text-jolananas-pink-medium">Informations de livraison</CardTitle>
                  </div>
                  <CardDescription>
                    Ces informations seront utilisées pour la livraison de votre commande.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-jolananas-pink-medium">
                        Prénom <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="firstName"
                        placeholder="Votre prénom"
                      value={shippingData.firstName}
                      onChange={(e) => setShippingData({ ...shippingData, firstName: e.target.value })}
                      className={errors.firstName ? 'border-destructive' : ''}
                      disabled={isRedirecting}
                    />
                      {errors.firstName && (
                        <p className="text-xs text-destructive">{errors.firstName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-jolananas-pink-medium">
                        Nom <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="lastName"
                        placeholder="Votre nom"
                      value={shippingData.lastName}
                      onChange={(e) => setShippingData({ ...shippingData, lastName: e.target.value })}
                      className={errors.lastName ? 'border-destructive' : ''}
                      disabled={isRedirecting}
                    />
                      {errors.lastName && (
                        <p className="text-xs text-destructive">{errors.lastName}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-jolananas-pink-medium">
                      E-mail <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={shippingData.email}
                      onChange={(e) => setShippingData({ ...shippingData, email: e.target.value })}
                      className={errors.email ? 'border-destructive' : ''}
                      disabled={isRedirecting}
                    />
                    {errors.email && (
                      <p className="text-xs text-destructive">{errors.email}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-jolananas-pink-medium">Téléphone <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="06 12 34 56 78"
                      value={shippingData.phone}
                      onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                      disabled={isRedirecting}
                    />
                    <p className="text-xs text-muted-foreground">
                      Pour vous contacter en cas de problème avec votre commande
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country" className="text-jolananas-pink-medium">
                      Pays <span className="text-destructive">*</span>
                    </Label>
                    <Select
                      value={shippingData.country}
                      onValueChange={(value) => {
                        // Réinitialiser département et région si on change de pays (seulement pour la France)
                        const newIsFrance = value === 'FR';
                        setShippingData({
                          ...shippingData,
                          country: value,
                          department: newIsFrance ? shippingData.department : '',
                          region: newIsFrance ? shippingData.region : '',
                        });
                      }}
                      disabled={isRedirecting}
                    >
                      <SelectTrigger className={errors.country ? 'border-destructive' : ''}>
                        <SelectValue placeholder="Sélectionner un pays">
                          {getCountryName(shippingData.country) || shippingData.country}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {Object.entries(COUNTRIES_BY_CONTINENT).map(([continent, countries]) => (
                          <div key={continent}>
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                              {continent}
                            </div>
                            {countries.map((country) => (
                              <SelectItem key={country.code} value={country.code}>
                                {country.name}
                              </SelectItem>
                            ))}
                          </div>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.country && (
                      <p className="text-xs text-destructive">{errors.country}</p>
                    )}
                  </div>
                  {isFrance ? (
                    <AddressAutocomplete
                      id="address"
                      label="Adresse"
                      value={shippingData.address}
                      placeholder="Commencez à taper votre adresse, rue ou nom de lieu..."
                      required
                      error={errors.address}
                      country="FR"
                    onChange={(value) => {
                      setShippingData({ ...shippingData, address: value });
                      // Réinitialiser l'état si l'utilisateur modifie manuellement l'adresse
                      if (!value || value.trim().length === 0) {
                        setAddressHasNumber(true);
                      }
                    }}
                    onSelect={(suggestion) => {
                      // CRITIQUE : Normaliser toutes les données de suggestion pour éviter les caractères Unicode > 255
                      // L'API Adresse Data Gouv peut retourner des tirets Unicode dans les noms de rues, villes, etc.
                      const normalizedStreet = normalizeDataForAPI(suggestion.street);
                      const normalizedCity = normalizeDataForAPI(suggestion.city);
                      const normalizedLabel = normalizeDataForAPI(suggestion.label);
                      const normalizedHousenumber = normalizeDataForAPI(suggestion.housenumber);
                      const normalizedPostcode = normalizeDataForAPI(suggestion.postcode);
                      const normalizedDepartmentName = normalizeDataForAPI(suggestion.departmentName);
                      const normalizedDepartment = normalizeDataForAPI(suggestion.department);
                      const normalizedRegion = normalizeDataForAPI(suggestion.region);
                      
                      // Détecter si l'adresse a un numéro
                      const hasNumber = !!(normalizedHousenumber && normalizedHousenumber.trim().length > 0);
                      setAddressHasNumber(hasNumber);
                      
                      // Construire l'adresse uniquement avec la rue et le numéro (sans code postal ni ville)
                      // L'API fournit déjà street, housenumber, postcode et city séparément
                      const streetAddress = normalizedHousenumber 
                        ? `${normalizedHousenumber} ${normalizedStreet}`.trim()
                        : normalizedStreet || normalizedLabel;
                      
                      // Retirer le code postal et la ville du label si présents (fallback de sécurité)
                      // Format typique: "21 Rue Example 75001 Paris" -> "21 Rue Example"
                      let cleanAddress = streetAddress;
                      if (normalizedPostcode && cleanAddress.includes(normalizedPostcode)) {
                        cleanAddress = cleanAddress.replace(new RegExp(`\\s*${normalizedPostcode}\\s*`, 'g'), '').trim();
                      }
                      if (normalizedCity && cleanAddress.includes(normalizedCity)) {
                        cleanAddress = cleanAddress.replace(new RegExp(`\\s*${normalizedCity}\\s*$`, 'g'), '').trim();
                      }
                      
                      // Normaliser l'adresse finale pour garantir qu'elle ne contient que des caractères ASCII
                      const finalAddress = normalizeDataForAPI(cleanAddress);
                      
                      // Remplir automatiquement les champs (adresse sans code postal ni ville)
                      setShippingData({
                        ...shippingData,
                        address: finalAddress,
                        city: normalizedCity || shippingData.city,
                        postalCode: normalizedPostcode || shippingData.postalCode,
                        department: normalizedDepartmentName || normalizedDepartment || shippingData.department,
                        region: normalizedRegion || shippingData.region,
                      });
                    }}
                    disabled={isRedirecting}
                  />
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="address" className="text-jolananas-pink-medium">
                        Adresse <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="address"
                        type="text"
                        placeholder="Numéro et nom de rue"
                        value={shippingData.address}
                        onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                        className={errors.address ? 'border-destructive' : ''}
                        disabled={isRedirecting}
                        required
                      />
                      {errors.address && (
                        <p className="text-xs text-destructive">{errors.address}</p>
                      )}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="address2" className="text-jolananas-pink-medium">Complément d'adresse <span className="text-muted-foreground text-xs">(optionnel)</span></Label>
                    <Input
                      id="address2"
                      placeholder="Appartement, étage, etc."
                      value={shippingData.address2}
                      onChange={(e) => setShippingData({ ...shippingData, address2: e.target.value })}
                      disabled={isRedirecting}
                    />
                    {!addressHasNumber && isFrance && (
                      <p className="text-xs text-muted-foreground flex items-start gap-1.5 mt-1">
                        <span className="text-jolananas-pink-medium mt-0.5">💡</span>
                        <span>
                          <strong className="text-foreground">Conseil :</strong> Votre adresse n'a pas de numéro de voie. 
                          Nous vous recommandons d'ajouter des détails dans ce champ (numéro de boîte aux lettres, 
                          numéro de porte, bâtiment, résidence, etc.) pour faciliter la livraison.
                        </span>
                      </p>
                    )}
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2 sm:col-span-1">
                      <Label htmlFor="postalCode" className="text-jolananas-pink-medium">
                        {isFrance ? 'Code postal' : shippingData.country === 'US' || shippingData.country === 'CA' ? 'ZIP Code' : 'Code postal'} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="postalCode"
                        placeholder={isFrance ? "75001" : shippingData.country === 'US' ? "10001" : shippingData.country === 'CA' ? "K1A 0A6" : "Code postal"}
                        value={shippingData.postalCode}
                        onChange={(e) => setShippingData({ ...shippingData, postalCode: e.target.value })}
                        className={errors.postalCode ? 'border-destructive' : ''}
                        disabled={isRedirecting}
                      />
                      {errors.postalCode && (
                        <p className="text-xs text-destructive">{errors.postalCode}</p>
                      )}
                      {isFrance && (
                        <p className="text-xs text-muted-foreground">
                          Rempli automatiquement lors de la sélection d'une adresse
                        </p>
                      )}
                    </div>
                    <div className="space-y-2 sm:col-span-2">
                      <Label htmlFor="city" className="text-jolananas-pink-medium">
                        {isFrance ? 'Ville' : shippingData.country === 'US' || shippingData.country === 'CA' ? 'City' : 'Ville'} <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="city"
                        placeholder={isFrance ? "Paris" : shippingData.country === 'US' ? "New York" : shippingData.country === 'CA' ? "Toronto" : "Ville"}
                        value={shippingData.city}
                        onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                        className={errors.city ? 'border-destructive' : ''}
                        disabled={isRedirecting}
                      />
                      {errors.city && (
                        <p className="text-xs text-destructive">{errors.city}</p>
                      )}
                      {isFrance && (
                        <p className="text-xs text-muted-foreground">
                          Rempli automatiquement lors de la sélection d'une adresse
                        </p>
                      )}
                    </div>
                  </div>
                  {isFrance && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="department" className="text-jolananas-pink-medium">
                          Département <span className="text-muted-foreground text-xs">(optionnel)</span>
                        </Label>
                        <Input
                          id="department"
                          placeholder="Paris"
                          value={shippingData.department}
                          onChange={(e) => setShippingData({ ...shippingData, department: e.target.value })}
                          disabled={isRedirecting}
                        />
                        <p className="text-xs text-muted-foreground">
                          Rempli automatiquement lors de la sélection d'une adresse
                        </p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="region" className="text-jolananas-pink-medium">
                          Région <span className="text-muted-foreground text-xs">(optionnel)</span>
                        </Label>
                        <Input
                          id="region"
                          placeholder="Île-de-France"
                          value={shippingData.region}
                          onChange={(e) => setShippingData({ ...shippingData, region: e.target.value })}
                          disabled={isRedirecting}
                        />
                        <p className="text-xs text-muted-foreground">
                          Rempli automatiquement lors de la sélection d'une adresse
                        </p>
                      </div>
                    </div>
                  )}


                  {errors.submit && (
                    <Alert variant="destructive">
                      <AlertDescription>{errors.submit}</AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            <div className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => router.push('/cart')}
                disabled={isRedirecting}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Retour au panier
              </Button>
              <Button
                size="lg"
                onClick={handleRedirectToShopifyCheckout}
                disabled={isRedirecting}
                className="bg-gradient-to-r from-jolananas-pink-medium to-jolananas-pink-deep hover:from-jolananas-pink-deep hover:to-jolananas-pink-medium !text-white [&_svg]:!text-white shadow-glow-pink font-semibold transition-all duration-300"
              >
                {isRedirecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirection vers le paiement sécurisé...
                  </>
                ) : (
                  <>
                    Continuer vers le paiement sécurisé
                    <Lock className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Récapitulatif */}
          <div>
            <OrderSummary hideShippingAlert={true} />
          </div>
        </div>
      </div>
    </div>
  );
}

