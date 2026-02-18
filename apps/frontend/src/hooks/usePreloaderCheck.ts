'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

export interface PreloaderStatus {
  fonts: boolean
  assets: boolean
  api: boolean
  database: boolean
  isComplete: boolean
  error: string | null
}

const MAX_TIMEOUT = 10000 // 10 secondes maximum
const FONT_CHECK_INTERVAL = 500 // Optimisé : vérification toutes les 500ms (au lieu de 100ms)
const API_TIMEOUT = 5000 // 5 secondes pour l'API
const STATUS_CHECK_INTERVAL = 500 // Optimisé : vérification toutes les 500ms (au lieu de 200ms)

/**
 * Vérifie si une police est chargée
 */
function checkFontLoaded(fontFamily: string): boolean {
  if (typeof document === 'undefined') return false
  
  try {
    // Vérifier via Font Loading API
    if (document.fonts && document.fonts.check) {
      return document.fonts.check(`16px "${fontFamily}"`)
    }
    
    // Fallback : vérifier si la police est dans la liste des polices disponibles
    const availableFonts = document.fonts ? Array.from(document.fonts) : []
    return availableFonts.some(font => font.family === fontFamily)
  } catch (error) {
    console.warn(`Erreur lors de la vérification de la police ${fontFamily}:`, error)
    return false
  }
}

/**
 * Vérifie le chargement d'une image
 */
function checkImageLoaded(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve(false)
      return
    }

    const img = new Image()
    const timeout = setTimeout(() => {
      resolve(false)
    }, 3000) // Timeout de 3 secondes pour les images

    img.onload = () => {
      clearTimeout(timeout)
      resolve(true)
    }

    img.onerror = () => {
      clearTimeout(timeout)
      resolve(false)
    }

    img.src = src
  })
}

/**
 * Test de connexion API Shopify
 */
async function checkShopifyAPI(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    const response = await fetch('/api/products?first=1', {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      return false
    }

    const data = await response.json()
    // Vérifier que la réponse contient bien des données
    return Array.isArray(data) || (data && typeof data === 'object')
  } catch (error) {
    console.warn('Erreur lors de la vérification API Shopify:', error)
    return false
  }
}

/**
 * Test de connexion base de données
 */
async function checkDatabase(): Promise<boolean> {
  try {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

    const response = await fetch('/api/health/db', {
      method: 'GET',
      signal: controller.signal,
      cache: 'no-store',
    })

    clearTimeout(timeoutId)

    return response.ok
  } catch (error) {
    console.warn('Erreur lors de la vérification de la base de données:', error)
    // En mode dégradé, on considère que c'est OK si l'API n'est pas disponible
    // Le site peut fonctionner sans DB pour certaines fonctionnalités
    return true // Mode dégradé : on continue même si la DB n'est pas accessible
  }
}

export function usePreloaderCheck() {
  const [status, setStatus] = useState<PreloaderStatus>({
    fonts: false,
    assets: false,
    api: false,
    database: false,
    isComplete: false,
    error: null,
  })

  // Refs pour éviter les re-renders inutiles
  const statusRef = useRef<PreloaderStatus>(status)
  const lastUpdateRef = useRef<number>(0)
  const updateThrottle = 100 // Throttle de 100ms pour les mises à jour de statut

  // Mise à jour du ref à chaque changement
  useEffect(() => {
    statusRef.current = status
  }, [status])

  // Fonction de mise à jour optimisée avec throttle
  const updateStatus = useCallback((updater: (prev: PreloaderStatus) => PreloaderStatus) => {
    const now = Date.now()
    if (now - lastUpdateRef.current < updateThrottle) {
      // Utiliser requestAnimationFrame pour différer la mise à jour
      requestAnimationFrame(() => {
        setStatus(updater)
        lastUpdateRef.current = Date.now()
      })
    } else {
      setStatus(updater)
      lastUpdateRef.current = now
    }
  }, [])

  // Ref pour éviter les appels simultanés à checkFonts
  const isCheckingFontsRef = useRef(false)
  const fontsLoadedRef = useRef(false)
  const lastFontCheckRef = useRef<number>(0)
  const FONT_CHECK_THROTTLE = 200 // Throttle de 200ms entre les vérifications

  // Vérification des polices
  const checkFonts = useCallback(() => {
    // Si les polices sont déjà chargées, ne rien faire
    if (fontsLoadedRef.current) {
      return true
    }

    // Throttle : éviter les vérifications trop fréquentes
    const now = Date.now()
    if (now - lastFontCheckRef.current < FONT_CHECK_THROTTLE) {
      return false
    }

    // Éviter les appels simultanés
    if (isCheckingFontsRef.current) {
      return false
    }

    isCheckingFontsRef.current = true
    lastFontCheckRef.current = now
    
    const googleFonts = ['Inter', 'Poppins', 'Montserrat']
    const localFont = 'weather sunday - personal use'
    
    const allFontsLoaded = 
      googleFonts.every(font => checkFontLoaded(font)) &&
      checkFontLoaded(localFont)

    if (allFontsLoaded) {
      fontsLoadedRef.current = true
    }

    updateStatus(prev => ({ ...prev, fonts: allFontsLoaded }))
    isCheckingFontsRef.current = false
    return allFontsLoaded
  }, [updateStatus])

  // Vérification des assets
  const checkAssets = useCallback(async () => {
    const criticalAssets = [
      '/assets/images/logo/logo-jolananas-gradient.png',
    ]

    try {
      const results = await Promise.all(
        criticalAssets.map(asset => checkImageLoaded(asset))
      )

      const allAssetsLoaded = results.every(loaded => loaded)
      updateStatus(prev => ({ ...prev, assets: allAssetsLoaded }))
      return allAssetsLoaded
    } catch (error) {
      console.warn('Erreur lors de la vérification des assets:', error)
      // En mode dégradé, on continue même si certains assets ne sont pas chargés
      updateStatus(prev => ({ ...prev, assets: true }))
      return true
    }
  }, [updateStatus])

  // Vérification API Shopify
  const checkAPI = useCallback(async () => {
    const apiLoaded = await checkShopifyAPI()
    updateStatus(prev => ({ ...prev, api: apiLoaded }))
    return apiLoaded
  }, [updateStatus])

  // Vérification base de données
  const checkDB = useCallback(async () => {
    const dbLoaded = await checkDatabase()
    updateStatus(prev => ({ ...prev, database: dbLoaded }))
    return dbLoaded
  }, [updateStatus])

  // Vérification complète
  useEffect(() => {
    let mounted = true
    let fontCheckInterval: NodeJS.Timeout | null = null
    let statusCheckInterval: NodeJS.Timeout | null = null
    let rafId: number | null = null
    const startTime = Date.now()

    const performChecks = async () => {
      // Vérification initiale des polices (avant de démarrer l'intervalle)
      const initialFontsLoaded = checkFonts()
      if (initialFontsLoaded) {
        fontsLoadedRef.current = true
      }

      // Vérifier les assets
      await checkAssets()

      // Vérifier l'API Shopify (en parallèle)
      checkAPI().catch(() => {
        // Erreur déjà gérée dans la fonction
      })

      // Vérifier la base de données (en parallèle)
      checkDB().catch(() => {
        // Erreur déjà gérée dans la fonction
      })

      // Vérifier les polices avec un intervalle optimisé seulement si elles ne sont pas déjà chargées
      if (!fontsLoadedRef.current) {
        fontCheckInterval = setInterval(() => {
          if (!mounted || fontsLoadedRef.current) {
            if (fontCheckInterval) {
              clearInterval(fontCheckInterval)
              fontCheckInterval = null
            }
            return
          }
          const fontsLoaded = checkFonts()
          if (fontsLoaded) {
            fontsLoadedRef.current = true
            if (fontCheckInterval) {
              clearInterval(fontCheckInterval)
              fontCheckInterval = null
            }
          }
        }, FONT_CHECK_INTERVAL)
      }

      // Vérification périodique de l'état complet avec intervalle optimisé (500ms au lieu de 200ms)
      // Utiliser un ref pour suivre si tout est complet et arrêter l'intervalle immédiatement
      let isCompleteRef = false
      statusCheckInterval = setInterval(() => {
        if (!mounted || isCompleteRef) {
          if (statusCheckInterval) {
            clearInterval(statusCheckInterval)
            statusCheckInterval = null
          }
          return
        }

        // Vérifier directement si tout est complet avant d'utiliser requestAnimationFrame
        const currentStatus = statusRef.current
        const isComplete = currentStatus.fonts && currentStatus.assets && currentStatus.api && currentStatus.database
        const elapsed = Date.now() - startTime
        const forceComplete = elapsed >= MAX_TIMEOUT
        const finalIsComplete = isComplete || forceComplete

        if (finalIsComplete) {
          isCompleteRef = true
          if (fontCheckInterval) {
            clearInterval(fontCheckInterval)
            fontCheckInterval = null
          }
          if (statusCheckInterval) {
            clearInterval(statusCheckInterval)
            statusCheckInterval = null
          }
          fontsLoadedRef.current = true
          // Mettre à jour le statut une dernière fois
          updateStatus(prev => ({
            ...prev,
            isComplete: true,
          }))
          return
        }

        // Utiliser requestAnimationFrame seulement si nécessaire
        if (rafId !== null) {
          cancelAnimationFrame(rafId)
        }

        rafId = requestAnimationFrame(() => {
          if (!mounted || isCompleteRef) return

          updateStatus(prev => {
            const isComplete = prev.fonts && prev.assets && prev.api && prev.database
            
            // Timeout de sécurité : après 10 secondes, on considère que c'est bon
            const elapsed = Date.now() - startTime
            const forceComplete = elapsed >= MAX_TIMEOUT

            const finalIsComplete = isComplete || forceComplete

            if (finalIsComplete) {
              isCompleteRef = true
            }

            return {
              ...prev,
              isComplete: finalIsComplete,
            }
          })
        })
      }, STATUS_CHECK_INTERVAL)
    }

    performChecks()

    return () => {
      mounted = false
      if (fontCheckInterval) clearInterval(fontCheckInterval)
      if (statusCheckInterval) clearInterval(statusCheckInterval)
      if (rafId !== null) cancelAnimationFrame(rafId)
    }
  }, [checkFonts, checkAssets, checkAPI, checkDB, updateStatus])

  return status
}

