"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ShoppingBag, Minus, Plus, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/Sheet"
import { Separator } from "@/components/ui/Separator"
import { Alert, AlertDescription } from "@/components/ui/Alert"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/Empty"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/Table"
import { useCart } from "@/app/src/lib/CartContext"
import { useScrollLock } from "@/app/src/hooks/useScrollLock"
import { safeJsonParse } from "@/app/src/lib/api-client"

interface ShippingInfo {
  freeShippingThreshold: number;
  deliveryDaysFrance: string;
  deliveryDaysInternational: string;
  standardShippingCost: number;
  expressShippingCost: number;
  expressDeliveryDays: string;
}

export function CartSheet() {
  const { items, removeItem, updateQuantity, totalItems, totalPrice } = useCart()
  const [open, setOpen] = useState(false)
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo | null>(null)
  // État local pour gérer les valeurs en cours de saisie pour chaque item
  const [quantityInputs, setQuantityInputs] = useState<Record<string, string>>({})
  // Référence pour stocker les timeouts de debounce
  const debounceTimeouts = useRef<Record<string, NodeJS.Timeout>>({})
  // Référence pour suivre les timestamps de dernière modification pour calculer la vitesse
  const lastChangeTimestamps = useRef<Record<string, number>>({})
  const router = useRouter()

  // Récupérer les informations de livraison depuis l'API
  useEffect(() => {
    async function fetchShippingInfo() {
      try {
        const response = await fetch('/api/shipping');
        // Utiliser safeJsonParse pour éviter l'erreur "Unexpected token '<'"
        const data = await safeJsonParse<ShippingInfo & { error?: boolean; message?: string }>(response);
        
        if (response.ok && !data.error) {
          setShippingInfo(data);
        } else {
          console.error('❌ Erreur de configuration Shopify:', data.message || 'Metafields de livraison non configurés');
          setShippingInfo(null);
        }
      } catch (error) {
        console.error('❌ Erreur lors de la récupération des informations de livraison:', error);
        setShippingInfo(null);
      }
    }
    fetchShippingInfo();
  }, []);

  // Initialiser les valeurs d'input avec les quantités actuelles quand les items changent
  useEffect(() => {
    const initialInputs: Record<string, string> = {}
    items.forEach((item) => {
      initialInputs[item.id] = item.quantity.toString()
    })
    setQuantityInputs(initialInputs)
  }, [items])

  // Calculer le délai de debounce dynamique (0-200ms) selon plusieurs paramètres
  const calculateDebounceDelay = (
    itemId: string,
    newValue: number,
    currentValue: number,
    valueLength: number,
    isMobile: boolean
  ): number => {
    // Base : 0ms pour les changements très petits (1-2 unités)
    if (Math.abs(newValue - currentValue) <= 2) {
      return 0
    }

    // Facteur 1 : Longueur de la valeur (plus c'est long, plus on attend)
    // 1 chiffre = 0ms, 2 chiffres = 50ms, 3 chiffres = 100ms
    const lengthFactor = Math.min((valueLength - 1) * 50, 100)

    // Facteur 2 : Amplitude du changement (gros saut = plus d'attente)
    // Changement < 10 = 0ms, 10-50 = 30ms, > 50 = 60ms
    const changeAmplitude = Math.abs(newValue - currentValue)
    const amplitudeFactor = changeAmplitude < 10 ? 0 : changeAmplitude < 50 ? 30 : 60

    // Facteur 3 : Mobile vs Desktop (mobile = plus réactif)
    const deviceFactor = isMobile ? -20 : 0

    // Facteur 4 : Vitesse de frappe (si l'utilisateur tape vite, délai plus court)
    const now = Date.now()
    const lastTimestamp = lastChangeTimestamps.current[itemId] || now
    const timeSinceLastChange = now - lastTimestamp
    const speedFactor = timeSinceLastChange < 100 ? -30 : timeSinceLastChange < 300 ? -15 : 0

    // Calcul du délai final (0-200ms)
    const calculatedDelay = Math.max(0, Math.min(200, lengthFactor + amplitudeFactor + deviceFactor + speedFactor))

    return calculatedDelay
  }

  // Debounce pour mettre à jour automatiquement la quantité après l'arrêt de la saisie
  useEffect(() => {
    // Détecter si on est sur mobile
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

    Object.entries(quantityInputs).forEach(([itemId, value]) => {
      const item = items.find((i) => i.id === itemId)
      if (!item) return
      
      const numericValue = parseInt(value, 10)
      const currentQuantity = item.quantity
      
      // Si la valeur est différente de la quantité actuelle et valide
      if (value && !isNaN(numericValue) && numericValue >= 1 && numericValue !== currentQuantity) {
        // Nettoyer le timeout précédent pour cet item
        if (debounceTimeouts.current[itemId]) {
          clearTimeout(debounceTimeouts.current[itemId])
        }
        
        // Calculer le délai dynamique selon les paramètres
        const delay = calculateDebounceDelay(
          itemId,
          numericValue,
          currentQuantity,
          value.length,
          isMobile
        )
        
        // Si le délai est 0, mettre à jour immédiatement
        if (delay === 0) {
          const finalQuantity = Math.min(numericValue, 999)
          updateQuantity(itemId, finalQuantity)
          setQuantityInputs((prev) => ({
            ...prev,
            [itemId]: finalQuantity.toString()
          }))
        } else {
          // Sinon, créer un timeout avec le délai calculé
          debounceTimeouts.current[itemId] = setTimeout(() => {
            const finalQuantity = Math.min(numericValue, 999)
            updateQuantity(itemId, finalQuantity)
            setQuantityInputs((prev) => ({
              ...prev,
              [itemId]: finalQuantity.toString()
            }))
            // Nettoyer le timeout après exécution
            delete debounceTimeouts.current[itemId]
          }, delay)
        }
      }
    })
    
    // Nettoyage des timeouts au démontage
    return () => {
      Object.values(debounceTimeouts.current).forEach((timeout) => clearTimeout(timeout))
      debounceTimeouts.current = {}
    }
  }, [quantityInputs, items, updateQuantity])

  // Gestion du scroll lock quand le panier est ouvert
  useScrollLock(open)

  // Gérer le changement de valeur dans l'input
  const handleQuantityInputChange = (itemId: string, value: string) => {
    // Permettre uniquement les chiffres
    const numericValue = value.replace(/[^0-9]/g, '')
    
    // Enregistrer le timestamp de cette modification
    lastChangeTimestamps.current[itemId] = Date.now()
    
    setQuantityInputs((prev) => ({
      ...prev,
      [itemId]: numericValue
    }))
  }

  // Gérer la validation et la mise à jour de la quantité
  const handleQuantityBlur = (itemId: string, currentValue: string) => {
    const numericValue = parseInt(currentValue, 10)
    
    // Si la valeur est vide ou invalide, restaurer la quantité actuelle
    if (!currentValue || isNaN(numericValue) || numericValue < 1) {
      const item = items.find((i) => i.id === itemId)
      if (item) {
        setQuantityInputs((prev) => ({
          ...prev,
          [itemId]: item.quantity.toString()
        }))
      }
      return
    }

    // Limiter à 999 pour éviter les valeurs excessives
    const finalQuantity = Math.min(numericValue, 999)
    
    // Mettre à jour l'input avec la valeur validée
    setQuantityInputs((prev) => ({
      ...prev,
      [itemId]: finalQuantity.toString()
    }))

    // Mettre à jour la quantité dans le panier
    updateQuantity(itemId, finalQuantity)
  }

  // Gérer le passage à la caisse : fermer le panier puis naviguer
  const handleCheckout = () => {
    setOpen(false)
    // Petit délai pour permettre l'animation de fermeture
    setTimeout(() => {
      router.push("/checkout")
    }, 150)
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative h-11 w-11 sm:h-9 sm:w-9 touch-manipulation text-jolananas-pink-medium hover:text-white"
          aria-label={`Panier (${totalItems})`}
        >
          <ShoppingBag className="h-5 w-5" />
          {totalItems > 0 && (
            <span className="absolute top-0 right-0 -translate-x-1/6 translate-y-1/6 h-4 w-4 sm:h-3.5 sm:w-3.5 rounded-full bg-primary text-[10px] sm:text-[9px] font-bold text-primary-foreground flex items-center justify-center">
              {totalItems}
            </span>
          )}
          <span className="sr-only">Panier ({totalItems})</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-lg flex flex-col p-4 sm:p-6" showOverlay={false}>
        <SheetHeader className="mb-4 sm:mb-6">
          <SheetTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <ShoppingBag className="h-5 w-5" />
            Panier ({totalItems})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ShoppingBag className="h-12 w-12 text-muted-foreground/50" />
                </EmptyMedia>
                <EmptyTitle>Votre panier est vide</EmptyTitle>
                <EmptyDescription>
                  Ajoutez des produits pour commencer vos achats
                </EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button asChild>
                  <Link href="/">Découvrir nos produits</Link>
                </Button>
              </EmptyContent>
            </Empty>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-auto py-2 sm:py-4 space-y-3 sm:space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3 sm:gap-4">
                  <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-md overflow-hidden bg-muted shrink-0">
                    <img
                      src={item.image || "/assets/images/collections/placeholder.svg"}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <Link
                        href={`/products/${item.handle}`}
                        className="font-semibold text-sm hover:text-primary transition-colors line-clamp-2"
                      >
                        {item.title}
                      </Link>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 sm:h-8 sm:w-8 shrink-0 touch-manipulation"
                          onClick={() => removeItem(item.id)}
                          aria-label="Supprimer"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Supprimer</span>
                        </Button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 border rounded-md">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 sm:h-8 sm:w-8 touch-manipulation"
                          onClick={() => {
                            const newQuantity = item.quantity - 1
                            updateQuantity(item.id, newQuantity)
                            setQuantityInputs((prev) => ({
                              ...prev,
                              [item.id]: newQuantity.toString()
                            }))
                          }}
                          aria-label="Diminuer"
                        >
                          <Minus className="h-3 w-3" />
                          <span className="sr-only">Diminuer</span>
                        </Button>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={quantityInputs[item.id] || item.quantity.toString()}
                          onChange={(e) => handleQuantityInputChange(item.id, e.target.value)}
                          onBlur={(e) => handleQuantityBlur(item.id, e.target.value)}
                          onKeyDown={(e) => {
                            // Si Enter est pressé, valider immédiatement
                            if (e.key === 'Enter') {
                              e.currentTarget.blur()
                              handleQuantityBlur(item.id, e.currentTarget.value)
                            }
                          }}
                          className="text-sm font-medium w-8 text-center bg-transparent border-0 outline-none focus:ring-0 p-0 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          aria-label={`Quantité pour ${item.title}`}
                          min="1"
                          max="999"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 sm:h-8 sm:w-8 touch-manipulation"
                          onClick={() => {
                            const newQuantity = item.quantity + 1
                            updateQuantity(item.id, newQuantity)
                            setQuantityInputs((prev) => ({
                              ...prev,
                              [item.id]: newQuantity.toString()
                            }))
                          }}
                          aria-label="Augmenter"
                        >
                          <Plus className="h-3 w-3" />
                          <span className="sr-only">Augmenter</span>
                        </Button>
                      </div>
                      <span className="font-semibold text-sm">{(item.price * item.quantity).toFixed(2)} EUR</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cart Summary */}
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-2">
                <Alert variant="default" className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
                  <AlertDescription className="text-xs text-blue-800 dark:text-blue-200">
                    Les frais de livraison, la TVA et le total final seront calculés lors du paiement sécurisé selon votre adresse de livraison.
                  </AlertDescription>
                </Alert>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="font-semibold">Sous-total</span>
                  <span className="font-bold text-lg text-primary">
                    {totalPrice.toFixed(2)} EUR
                  </span>
                </div>
              </div>


              <Button 
                size="lg" 
                className="w-full h-12 sm:h-10 touch-manipulation bg-gradient-to-r from-jolananas-pink-medium to-jolananas-pink-deep hover:from-jolananas-pink-deep hover:to-jolananas-pink-medium !text-white [&_svg]:!text-white shadow-glow-pink font-semibold transition-all duration-300"
                onClick={handleCheckout}
              >
                Passer la commande
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
