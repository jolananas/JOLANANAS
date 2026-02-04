/**
 * 🍍 JOLANANAS - Custom Checkout Page Component
 * =============================================
 * Page de checkout entièrement personnalisée avec design/UX custom
 * Utilise shadcn/ui pour tous les composants
 * Intègre Shop Pay et PayPal via Shopify
 * Crée automatiquement les commandes dans Shopify après paiement réussi
 */

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  ArrowLeft,
  ShoppingBag,
  Loader2,
  Mail,
  User,
  MapPin,
  Phone,
  Truck,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AddressAutocomplete } from "@/components/ui/addressautocomplete";
import { LoadingDots } from "@/components/ui/loadingdots";
import { useCart } from "@/components/providers/CartProvider";
import { OrderSummary } from "./OrderSummary";
import {
  ShippingMethodSelector,
  type ShippingMethodType,
} from "./ShippingMethodSelector";
import { PaymentButtons } from "./PaymentButtons";
import { usePayment } from "@/hooks/usePayment";
import { useCurrency } from "@/hooks/useCurrency";
import { normalizeDataForAPI } from "@/lib/utils/formatters";
import { safeFetchJSON } from "@/lib/utils/safe-fetch";
import { safeJsonParse } from "@/lib/api-client";
import { transformShopifyError } from "@/lib/utils/shopify-error-handler";
import type { BaseEcommerceProps } from "@/types/ecommerce";
import type { AddressSuggestion } from "@/lib/hooks/useAddressAutocomplete";

interface CustomCheckoutPageProps extends BaseEcommerceProps {
  onComplete?: () => void;
}

interface ShippingInfo {
  freeShippingThreshold: number;
  deliveryDaysFrance: string;
  deliveryDaysInternational: string;
  standardShippingCost: number;
  expressShippingCost: number;
  expressDeliveryDays: string;
}

// Liste des pays organisés par continent
const COUNTRIES_BY_CONTINENT = {
  Europe: [
    { code: "FR", name: "France" },
    { code: "BE", name: "Belgique" },
    { code: "CH", name: "Suisse" },
    { code: "LU", name: "Luxembourg" },
    { code: "DE", name: "Allemagne" },
    { code: "ES", name: "Espagne" },
    { code: "IT", name: "Italie" },
    { code: "PT", name: "Portugal" },
    { code: "GB", name: "Royaume-Uni" },
    { code: "IE", name: "Irlande" },
    { code: "NL", name: "Pays-Bas" },
    { code: "AT", name: "Autriche" },
    { code: "SE", name: "Suède" },
    { code: "NO", name: "Norvège" },
    { code: "DK", name: "Danemark" },
    { code: "FI", name: "Finlande" },
    { code: "PL", name: "Pologne" },
    { code: "CZ", name: "République tchèque" },
    { code: "GR", name: "Grèce" },
  ],
  Amérique: [
    { code: "US", name: "États-Unis" },
    { code: "CA", name: "Canada" },
    { code: "MX", name: "Mexique" },
    { code: "BR", name: "Brésil" },
    { code: "AR", name: "Argentine" },
    { code: "CL", name: "Chili" },
  ],
  Asie: [
    { code: "JP", name: "Japon" },
    { code: "CN", name: "Chine" },
    { code: "KR", name: "Corée du Sud" },
    { code: "IN", name: "Inde" },
    { code: "SG", name: "Singapour" },
    { code: "TH", name: "Thaïlande" },
    { code: "VN", name: "Viêt Nam" },
  ],
  Afrique: [
    { code: "ZA", name: "Afrique du Sud" },
    { code: "MA", name: "Maroc" },
    { code: "TN", name: "Tunisie" },
    { code: "EG", name: "Égypte" },
  ],
  Océanie: [
    { code: "AU", name: "Australie" },
    { code: "NZ", name: "Nouvelle-Zélande" },
  ],
};

const ALL_COUNTRIES = Object.values(COUNTRIES_BY_CONTINENT).flat();

// Fonction pour obtenir le nom du pays depuis le code
// CRITIQUE : Normaliser le résultat pour éviter les caractères Unicode > 255
const getCountryName = (countryCode: string): string => {
  const country = ALL_COUNTRIES.find((c) => c.code === countryCode);
  const countryName = country?.name || countryCode;
  // Normaliser pour garantir qu'aucun caractère Unicode > 255 ne passe
  return normalizeDataForAPI(countryName);
};

// Schéma de validation Zod
const checkoutSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  email: z.string().email("L'adresse e-mail n'est pas valide"),
  phone: z.string().optional(),
  address: z.string().min(1, "L'adresse est requise"),
  address2: z.string().optional(),
  city: z.string().min(1, "La ville est requise"),
  postalCode: z.string().min(1, "Le code postal est requis"),
  department: z.string().optional(),
  region: z.string().optional(),
  country: z.string().min(1, "Le pays est requis"),
  newsletter: z.boolean(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "Vous devez accepter les conditions générales",
  }),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

type CheckoutStep = "form" | "payment" | "processing" | "success";

export function CustomCheckoutPage({
  className,
  onComplete,
}: CustomCheckoutPageProps) {
  const router = useRouter();
  const { items, totalPrice, clearCart } = useCart();
  const { currency } = useCurrency();
  const [shippingMethod, setShippingMethod] =
    useState<ShippingMethodType>("standard");
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null);
  const [checkoutData, setCheckoutData] = useState<{
    checkoutId: string;
    paymentUrl?: string;
    cartId?: string;
    variantIds?: string[];
  } | null>(null);
  const [isCreatingCheckout, setIsCreatingCheckout] = useState(false);
  const [addressHasNumber, setAddressHasNumber] = useState(true);
  const [currentStep, setCurrentStep] = useState<CheckoutStep>("form");

  // Formulaire avec react-hook-form
  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      address: "",
      address2: "",
      city: "",
      postalCode: "",
      department: "",
      region: "",
      country: "FR",
      newsletter: false,
      acceptTerms: false,
    },
  });

  const isFrance = form.watch("country") === "FR";

  // Récupérer les informations de livraison depuis l'API
  useEffect(() => {
    async function fetchShippingInfo() {
      try {
        const response = await fetch("/api/shipping");
        const data = await safeJsonParse<
          ShippingInfo & { error?: boolean; message?: string }
        >(response);

        if (response.ok && !data.error) {
          setShippingInfo(data);
        } else {
          console.error(
            "❌ Erreur de configuration Shopify:",
            data.message || "Metafields de livraison non configurés",
          );
          setShippingInfo(null);
        }
      } catch (error) {
        console.error(
          "❌ Erreur lors de la récupération des informations de livraison:",
          error,
        );
        setShippingInfo(null);
      }
    }
    fetchShippingInfo();
  }, []);

  // Calculer le total avec frais de livraison
  const calculateShippingCost = (): number => {
    if (!shippingInfo) return 0;
    const isFreeShipping = totalPrice >= shippingInfo.freeShippingThreshold;
    if (isFreeShipping) return 0;
    return shippingMethod === "express"
      ? shippingInfo.expressShippingCost
      : shippingInfo.standardShippingCost;
  };

  const shippingCost = calculateShippingCost();
  const total = totalPrice + shippingCost;

  // Créer le checkout
  const createCheckout = async (formData: CheckoutFormData) => {
    setIsCreatingCheckout(true);

    try {
      // Convertir les items du panier
      const cartLines = items.map((item) => {
        const variantId = item.variantId;

        if (
          variantId?.includes("gid://shopify/Product/") &&
          !variantId?.includes("ProductVariant")
        ) {
          throw new Error(
            "Erreur: Le produit sélectionné nécessite de choisir une variante.",
          );
        }

        return {
          merchandiseId: variantId,
          quantity: item.quantity,
        };
      });

      // Préparer les informations de livraison
      // CRITIQUE : Normaliser TOUS les champs AVANT de les utiliser pour éviter les caractères Unicode > 255
      // Normaliser chaque champ individuellement pour garantir qu'aucun caractère Unicode ne passe
      const countryNameRaw =
        getCountryName(formData.country) || formData.country;
      const countryNameNormalized = normalizeDataForAPI(countryNameRaw);

      // Normaliser tous les champs du formulaire individuellement
      const shippingInfoData = {
        firstName: normalizeDataForAPI(formData.firstName),
        lastName: normalizeDataForAPI(formData.lastName),
        email: normalizeDataForAPI(formData.email),
        phone: formData.phone ? normalizeDataForAPI(formData.phone) : undefined,
        address: normalizeDataForAPI(formData.address),
        address2: formData.address2
          ? normalizeDataForAPI(formData.address2)
          : undefined,
        city: normalizeDataForAPI(formData.city),
        postalCode: normalizeDataForAPI(formData.postalCode),
        department:
          isFrance && formData.department
            ? normalizeDataForAPI(formData.department)
            : undefined,
        region:
          isFrance && formData.region
            ? normalizeDataForAPI(formData.region)
            : undefined,
        country: countryNameNormalized,
      };

      // DEBUG : Scanner les données AVANT normalisation pour identifier les caractères Unicode problématiques
      if (process.env.NODE_ENV === "development") {
        const scanForUnicode = (
          obj: any,
          path: string = "",
        ): Array<{
          path: string;
          char: string;
          code: number;
          value: string;
        }> => {
          const problematic: Array<{
            path: string;
            char: string;
            code: number;
            value: string;
          }> = [];
          if (typeof obj === "string") {
            for (let i = 0; i < obj.length; i++) {
              const code = obj.charCodeAt(i);
              if (code > 255) {
                problematic.push({
                  path: path || "root",
                  char: obj[i],
                  code: code,
                  value: obj.substring(
                    Math.max(0, i - 10),
                    Math.min(obj.length, i + 10),
                  ),
                });
              }
            }
          } else if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
              problematic.push(...scanForUnicode(item, `${path}[${index}]`));
            });
          } else if (obj && typeof obj === "object") {
            for (const key of Object.keys(obj)) {
              problematic.push(
                ...scanForUnicode(obj[key], path ? `${path}.${key}` : key),
              );
            }
          }
          return problematic;
        };

        const problematicBefore = scanForUnicode(shippingInfoData);
        if (problematicBefore.length > 0) {
          console.warn(
            "⚠️ Caractères Unicode détectés AVANT normalisation dans shippingInfoData (CustomCheckoutPage):",
          );
          problematicBefore.forEach((p) => {
            console.warn(`   - Champ: "${p.path}"`);
            console.warn(
              `     Caractère: "${p.char}" (code: ${p.code}, U+${p.code.toString(16).toUpperCase().padStart(4, "0")})`,
            );
            console.warn(`     Contexte: "${p.value}"`);
          });
        }
      }

      // Normaliser toutes les données avant l'envoi
      const normalizedShippingInfo = normalizeDataForAPI(shippingInfoData);
      const normalizedItems = normalizeDataForAPI(cartLines);
      const normalizedShippingMethod = normalizeDataForAPI({
        type: shippingMethod,
      });

      // DEBUG : Scanner les données APRÈS normalisation pour vérifier que la normalisation a fonctionné
      if (process.env.NODE_ENV === "development") {
        const scanForUnicode = (
          obj: any,
          path: string = "",
        ): Array<{
          path: string;
          char: string;
          code: number;
          value: string;
        }> => {
          const problematic: Array<{
            path: string;
            char: string;
            code: number;
            value: string;
          }> = [];
          if (typeof obj === "string") {
            for (let i = 0; i < obj.length; i++) {
              const code = obj.charCodeAt(i);
              if (code > 255) {
                problematic.push({
                  path: path || "root",
                  char: obj[i],
                  code: code,
                  value: obj.substring(
                    Math.max(0, i - 10),
                    Math.min(obj.length, i + 10),
                  ),
                });
              }
            }
          } else if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
              problematic.push(...scanForUnicode(item, `${path}[${index}]`));
            });
          } else if (obj && typeof obj === "object") {
            for (const key of Object.keys(obj)) {
              problematic.push(
                ...scanForUnicode(obj[key], path ? `${path}.${key}` : key),
              );
            }
          }
          return problematic;
        };

        const problematicAfter = scanForUnicode(normalizedShippingInfo);
        if (problematicAfter.length > 0) {
          console.error(
            "❌ ERREUR : Caractères Unicode toujours présents APRÈS normalisation dans normalizedShippingInfo (CustomCheckoutPage):",
          );
          problematicAfter.forEach((p) => {
            console.error(`   - Champ: "${p.path}"`);
            console.error(
              `     Caractère: "${p.char}" (code: ${p.code}, U+${p.code.toString(16).toUpperCase().padStart(4, "0")})`,
            );
            console.error(`     Contexte: "${p.value}"`);
          });
        } else {
          console.log(
            "✅ Aucun caractère Unicode problématique détecté dans normalizedShippingInfo après normalisation (CustomCheckoutPage)",
          );
        }
      }

      // Créer le checkout via l'API avec safeFetchJSON pour normalisation automatique
      const response = await safeFetchJSON("/api/checkout/create", {
        items: normalizedItems,
        shippingInfo: normalizedShippingInfo,
        shippingMethod: normalizedShippingMethod,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || "Erreur lors de la création du checkout sécurisé",
        );
      }

      const data = await response.json();
      setCheckoutData({
        checkoutId: data.checkoutId,
        paymentUrl: data.paymentUrl,
        cartId: data.cartId,
        variantIds: data.variantIds || [], // Variant IDs pour Shop Pay
      });

      // Passer à l'étape de paiement
      setCurrentStep("payment");
    } catch (error) {
      console.error("❌ Erreur création checkout:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erreur inconnue";
      const userFriendlyError = errorMessage.includes("gid://shopify/")
        ? transformShopifyError(errorMessage, "CustomCheckoutPage")
        : errorMessage;
      form.setError("root", { message: userFriendlyError });
      setCurrentStep("form");
    } finally {
      setIsCreatingCheckout(false);
    }
  };

  // Soumettre le formulaire
  const onSubmit = async (data: CheckoutFormData) => {
    await createCheckout(data);
  };

  // Si le panier est vide
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
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-jolananas-pink-medium to-jolananas-pink-deep mb-4 shadow-glow-pink">
                <ShoppingBag className="h-10 w-10 text-white" />
              </div>

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
                </Link>
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`custom-checkout-page ${className}`}>
      <div className="container py-8 md:py-12">
        {/* Header */}
        <div className="mb-8">
          <Button variant="ghost" asChild className="mb-4">
            <Link href="/cart">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour au panier
            </Link>
          </Button>

          <Card className="border-0 shadow-none bg-transparent">
            <CardHeader>
              <CardTitle className="font-serif text-3xl font-bold tracking-tight text-jolananas-pink-medium">
                Finaliser la commande
              </CardTitle>
              <CardDescription>
                {currentStep === "form" ? (
                  "Remplissez vos informations de livraison"
                ) : currentStep === "payment" ? (
                  "Choisissez votre méthode de paiement"
                ) : (
                  <>
                    Traitement en cours <LoadingDots size="sm" />
                  </>
                )}
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Barre de progression */}
          <div className="mt-4">
            <Progress
              value={
                currentStep === "form"
                  ? 50
                  : currentStep === "payment"
                    ? 75
                    : 100
              }
              className="h-2"
            />
            <p className="text-sm text-jolananas-pink-medium mt-2 text-center font-medium">
              {currentStep === "form" ? (
                "Étape 1 sur 2 : Informations de livraison"
              ) : currentStep === "payment" ? (
                "Étape 2 sur 2 : Paiement"
              ) : (
                <>
                  Finalisation <LoadingDots size="sm" />
                </>
              )}
            </p>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Formulaire principal */}
          <motion.div
            className="lg:col-span-2 space-y-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {currentStep === "form" && (
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-6"
                >
                  {/* Section Contact */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <User className="h-5 w-5 text-jolananas-pink-medium" />
                        <CardTitle className="text-jolananas-pink-medium">
                          Contact
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <FormField
                          control={form.control}
                          name="firstName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-jolananas-pink-medium">
                                Prénom{" "}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Votre prénom" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="lastName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-jolananas-pink-medium">
                                Nom <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Votre nom" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-jolananas-pink-medium flex items-center gap-2">
                              <Mail className="h-4 w-4" />
                              E-mail <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="votre@email.com"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Vous recevrez la confirmation de commande à cette
                              adresse
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-jolananas-pink-medium flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              Téléphone{" "}
                              <span className="text-muted-foreground text-xs">
                                (optionnel)
                              </span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="06 12 34 56 78"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>
                              Pour vous contacter en cas de problème avec votre
                              commande
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Section Livraison */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-jolananas-pink-medium" />
                        <CardTitle className="text-jolananas-pink-medium">
                          Livraison
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-jolananas-pink-medium">
                              Pays <span className="text-destructive">*</span>
                            </FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={(value) => {
                                field.onChange(value);
                                if (value !== "FR") {
                                  form.setValue("department", "");
                                  form.setValue("region", "");
                                }
                              }}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionner un pays">
                                    {getCountryName(field.value) || field.value}
                                  </SelectValue>
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="max-h-[300px]">
                                {Object.entries(COUNTRIES_BY_CONTINENT).map(
                                  ([continent, countries]) => (
                                    <div key={continent}>
                                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                                        {continent}
                                      </div>
                                      {countries.map((country) => (
                                        <SelectItem
                                          key={country.code}
                                          value={country.code}
                                        >
                                          {country.name}
                                        </SelectItem>
                                      ))}
                                    </div>
                                  ),
                                )}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {isFrance ? (
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-jolananas-pink-medium">
                                Adresse{" "}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <AddressAutocomplete
                                  id="address"
                                  label=""
                                  value={field.value}
                                  placeholder="Commencez à taper votre adresse..."
                                  required
                                  country="FR"
                                  onChange={(value) => {
                                    field.onChange(value);
                                    if (!value || value.trim().length === 0) {
                                      setAddressHasNumber(true);
                                    }
                                  }}
                                  onSelect={(suggestion) => {
                                    // CRITIQUE : Normaliser toutes les données de suggestion pour éviter les caractères Unicode > 255
                                    // L'API Adresse Data Gouv peut retourner des tirets Unicode dans les noms de rues, villes, etc.
                                    const normalizedStreet =
                                      normalizeDataForAPI(suggestion.street);
                                    const normalizedCity = normalizeDataForAPI(
                                      suggestion.city,
                                    );
                                    const normalizedLabel = normalizeDataForAPI(
                                      suggestion.label,
                                    );
                                    const normalizedHousenumber =
                                      normalizeDataForAPI(
                                        suggestion.housenumber,
                                      );
                                    const normalizedPostcode =
                                      normalizeDataForAPI(suggestion.postcode);
                                    const normalizedDepartmentName =
                                      normalizeDataForAPI(
                                        suggestion.departmentName,
                                      );
                                    const normalizedDepartment =
                                      normalizeDataForAPI(
                                        suggestion.department,
                                      );
                                    const normalizedRegion =
                                      normalizeDataForAPI(suggestion.region);

                                    const hasNumber = !!(
                                      normalizedHousenumber &&
                                      normalizedHousenumber.trim().length > 0
                                    );
                                    setAddressHasNumber(hasNumber);

                                    const streetAddress = normalizedHousenumber
                                      ? `${normalizedHousenumber} ${normalizedStreet}`.trim()
                                      : normalizedStreet || normalizedLabel;

                                    let cleanAddress = streetAddress;
                                    if (
                                      normalizedPostcode &&
                                      cleanAddress.includes(normalizedPostcode)
                                    ) {
                                      cleanAddress = cleanAddress
                                        .replace(
                                          new RegExp(
                                            `\\s*${normalizedPostcode}\\s*`,
                                            "g",
                                          ),
                                          "",
                                        )
                                        .trim();
                                    }
                                    if (
                                      normalizedCity &&
                                      cleanAddress.includes(normalizedCity)
                                    ) {
                                      cleanAddress = cleanAddress
                                        .replace(
                                          new RegExp(
                                            `\\s*${normalizedCity}\\s*$`,
                                            "g",
                                          ),
                                          "",
                                        )
                                        .trim();
                                    }

                                    // Normaliser l'adresse finale pour garantir qu'elle ne contient que des caractères ASCII
                                    const finalAddress =
                                      normalizeDataForAPI(cleanAddress);

                                    form.setValue("address", finalAddress);
                                    form.setValue("city", normalizedCity);
                                    form.setValue(
                                      "postalCode",
                                      normalizedPostcode,
                                    );
                                    form.setValue(
                                      "department",
                                      normalizedDepartmentName ||
                                        normalizedDepartment,
                                    );
                                    form.setValue("region", normalizedRegion);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ) : (
                        <FormField
                          control={form.control}
                          name="address"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-jolananas-pink-medium">
                                Adresse{" "}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="Numéro et nom de rue"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}

                      <FormField
                        control={form.control}
                        name="address2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-jolananas-pink-medium">
                              Complément d'adresse{" "}
                              <span className="text-muted-foreground text-xs">
                                (optionnel)
                              </span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Appartement, étage, etc."
                                {...field}
                              />
                            </FormControl>
                            {!addressHasNumber && isFrance && (
                              <FormDescription>
                                💡 <strong>Conseil :</strong> Votre adresse n'a
                                pas de numéro de voie. Nous vous recommandons
                                d'ajouter des détails dans ce champ pour
                                faciliter la livraison.
                              </FormDescription>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid gap-4 sm:grid-cols-3">
                        <FormField
                          control={form.control}
                          name="postalCode"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-1">
                              <FormLabel className="text-jolananas-pink-medium">
                                Code postal{" "}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="75001" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="city"
                          render={({ field }) => (
                            <FormItem className="sm:col-span-2">
                              <FormLabel className="text-jolananas-pink-medium">
                                Ville{" "}
                                <span className="text-destructive">*</span>
                              </FormLabel>
                              <FormControl>
                                <Input placeholder="Paris" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {isFrance && (
                        <div className="grid gap-4 sm:grid-cols-2">
                          <FormField
                            control={form.control}
                            name="department"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-jolananas-pink-medium">
                                  Département{" "}
                                  <span className="text-muted-foreground text-xs">
                                    (optionnel)
                                  </span>
                                </FormLabel>
                                <FormControl>
                                  <Input placeholder="75" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="region"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel className="text-jolananas-pink-medium">
                                  Région{" "}
                                  <span className="text-muted-foreground text-xs">
                                    (optionnel)
                                  </span>
                                </FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Île-de-France"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Section Méthode de livraison */}
                  <ShippingMethodSelector
                    value={shippingMethod}
                    onChange={setShippingMethod}
                    shippingInfo={shippingInfo}
                    subtotal={totalPrice}
                  />

                  {/* Newsletter et CGV */}
                  <Card>
                    <CardContent className="pt-6 space-y-4">
                      <FormField
                        control={form.control}
                        name="newsletter"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                Envoyez-moi des nouvelles et des offres par
                                e-mail
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="acceptTerms"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel className="text-sm font-normal cursor-pointer">
                                J'accepte les{" "}
                                <Link
                                  href="/cgv"
                                  className="text-jolananas-pink-medium hover:underline"
                                >
                                  conditions générales de vente
                                </Link>
                                <span className="text-destructive"> *</span>
                              </FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </CardContent>
                  </Card>

                  {/* Erreur globale */}
                  {form.formState.errors.root && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        {form.formState.errors.root?.message && (
                          <>
                            <strong className="mt-1 block">
                              {form.formState.errors.root.message}
                            </strong>
                            <span className="text-xs mt-2 block text-muted-foreground">
                              {form.formState.errors.root.message.includes(
                                "variante",
                              ) ||
                              form.formState.errors.root.message.includes(
                                "variant",
                              )
                                ? "Veuillez retourner à la page produit et sélectionner une variante."
                                : form.formState.errors.root.message.includes(
                                      "panier",
                                    ) ||
                                    form.formState.errors.root.message.includes(
                                      "cart",
                                    )
                                  ? "Votre panier semble être vide. Veuillez ajouter des produits."
                                  : "Veuillez vérifier vos informations et réessayer. Si le problème persiste, contactez notre support."}
                            </span>
                          </>
                        )}
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Bouton Continuer */}
                  {!checkoutData && (
                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-gradient-to-r from-jolananas-pink-medium to-jolananas-pink-deep text-white hover:from-jolananas-pink-deep hover:to-jolananas-pink-medium shadow-glow-pink font-semibold"
                      disabled={isCreatingCheckout}
                    >
                      {isCreatingCheckout ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Préparation du paiement <LoadingDots size="sm" />
                        </>
                      ) : (
                        <>
                          <Truck className="mr-2 h-5 w-5" />
                          Continuer vers le paiement
                        </>
                      )}
                    </Button>
                  )}
                </form>
              </Form>
            )}

            {currentStep === "payment" && checkoutData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="text-jolananas-pink-medium">
                      Informations validées ✓
                    </CardTitle>
                    <CardDescription>
                      Vos informations ont été enregistrées. Choisissez
                      maintenant votre méthode de paiement.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setCurrentStep("form");
                        setCheckoutData(null);
                      }}
                      className="w-full"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Modifier les informations
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </motion.div>

          {/* Sidebar avec résumé et paiement */}
          <motion.div
            className="lg:col-span-1 space-y-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <OrderSummary
              showItems={true}
              shippingCost={shippingCost}
              shippingThreshold={shippingInfo?.freeShippingThreshold}
              hideShippingAlert={true}
            />

            {checkoutData && currentStep === "payment" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <PaymentButtons
                  checkoutData={checkoutData}
                  total={total}
                  subtotal={totalPrice}
                  shippingCost={shippingCost}
                  currency={currency}
                  disabled={isCreatingCheckout}
                />
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
