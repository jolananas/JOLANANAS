"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, X, User, ShoppingBag } from "lucide-react"
import { useScrollLock } from "@/app/src/hooks/useScrollLock"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/Dialog"
import { Input } from "@/components/ui/Input"
import { Button } from "@/components/ui/Button"
import { ScrollArea } from "@/components/ui/ScrollArea"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/Command"
import { Skeleton } from "@/components/ui/Skeleton"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/Empty"
import type { Product } from "@/app/src/lib/shopify/types"
import Image from "next/image"

interface SearchDialogProps {
  products: Product[]
}

export function SearchDialog({ products }: SearchDialogProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<Product[]>([])
  const router = useRouter()

  // Gestion du scroll lock quand le menu est ouvert
  useScrollLock(open)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    // Recherche améliorée avec gestion des cas limites
    const searchQuery = query.toLowerCase().trim()
    const searchTerms = searchQuery.split(/\s+/).filter(term => term.length > 0)
    
    const filtered = products.filter((product) => {
      const title = (product.title).toLowerCase()
      const description = (product.description).toLowerCase()
      const tags = (product.tags || []).map(tag => tag.toLowerCase())
      const collections = (product.collections || []).map(col => col.toLowerCase())
      
      // Recherche par termes multiples (tous les termes doivent correspondre)
      return searchTerms.every(term => 
        title.includes(term) ||
        description.includes(term) ||
        tags.some(tag => tag.includes(term)) ||
        collections.some(col => col.includes(term))
      )
    })

    // Trier par pertinence (titre en premier, puis description, puis tags)
    const sortedResults = filtered.sort((a, b) => {
      const aTitle = (a.title).toLowerCase()
      const bTitle = (b.title).toLowerCase()
      
      // Priorité aux produits dont le titre commence par la requête
      const aTitleStarts = aTitle.startsWith(searchQuery) ? 1 : 0
      const bTitleStarts = bTitle.startsWith(searchQuery) ? 1 : 0
      if (aTitleStarts !== bTitleStarts) return bTitleStarts - aTitleStarts
      
      // Puis priorité aux produits dont le titre contient la requête
      const aTitleMatch = aTitle.includes(searchQuery) ? 1 : 0
      const bTitleMatch = bTitle.includes(searchQuery) ? 1 : 0
      if (aTitleMatch !== bTitleMatch) return bTitleMatch - aTitleMatch
      
      // Enfin, trier par ordre alphabétique
      return aTitle.localeCompare(bTitle)
    })

    setResults(sortedResults)
  }, [query, products])

  const handleProductClick = (handle: string) => {
    setOpen(false)
    setQuery("")
    router.push(`/products/${handle}`)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-11 w-11 sm:h-9 sm:w-9 touch-manipulation text-jolananas-pink-medium hover:text-white"
          aria-label="Rechercher"
        >
          <Search className="h-5 w-5" />
          <span className="sr-only">Rechercher</span>
        </Button>
      </DialogTrigger>
      {open && (
        <DialogContent 
          className="fixed top-0 right-0 left-0 bottom-0 w-full sm:left-auto sm:w-2/3 lg:w-2/3 max-w-none h-full translate-x-0 translate-y-0 rounded-none border-0 p-0 bg-slate-900/95 backdrop-blur-md z-50"
          showCloseButton={false}
          showOverlay={false}
        >
        {/* Header avec icônes et bouton fermer */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-700/50">
          <div className="flex items-center gap-4">
            <User className="h-5 w-5 text-white/70 hover:text-white transition-colors cursor-pointer" />
            <ShoppingBag className="h-5 w-5 text-white/70 hover:text-white transition-colors cursor-pointer" />
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-white/70 hover:text-white transition-colors p-2.5 sm:p-2 hover:bg-slate-800 rounded-lg touch-manipulation min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 flex items-center justify-center"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Contenu principal */}
        <div className="flex flex-col h-[calc(100vh-64px)] sm:h-[calc(100vh-80px)] p-4 sm:p-6">
          {/* Titre et sous-titre */}
          <DialogHeader className="text-left mb-4 sm:mb-6">
            <DialogTitle className="text-xl sm:text-2xl font-bold text-white mb-2">
              Rechercher des produits
            </DialogTitle>
            <DialogDescription className="text-white/70 text-sm sm:text-base">
              Trouvez vos créations préférées
            </DialogDescription>
          </DialogHeader>

          {/* Barre de recherche */}
          <div className="mb-4 sm:mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-sky-400/70" />
              <Input
                placeholder="Rechercher par nom, description ou tags..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 sm:py-3 bg-slate-800/50 border-sky-400/50 text-white placeholder:text-white/50 focus:border-sky-400 focus:ring-sky-400/20 rounded-lg text-base sm:text-sm"
                autoFocus
              />
            </div>
          </div>

          {/* Liste des résultats */}
          <ScrollArea className="flex-1">
            {results.length > 0 ? (
              <div className="space-y-3">
                {results.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductClick(product.handle)}
                    className="w-full flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg hover:bg-slate-800/50 active:bg-slate-800/70 transition-all duration-200 text-left group touch-manipulation"
                  >
                    <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-lg overflow-hidden bg-slate-700/50 flex-shrink-0">
                      <Image
                        src={product.images[0] || "/assets/images/collections/placeholder.svg"}
                        alt={product.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-base text-white mb-1 line-clamp-1 group-hover:text-sky-400 transition-colors">
                        {product.title}
                      </h4>
                      {product.description && (
                        <p className="text-sm text-white/60 line-clamp-2 mb-2">
                          {product.description}
                        </p>
                      )}
                      <p className="text-base font-bold text-sky-400">
                        {product.price.toFixed(2)} {product.currency}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : query.trim() ? (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Search className="h-12 w-12 text-white/40" />
                  </EmptyMedia>
                  <EmptyTitle className="text-white">Aucun produit trouvé</EmptyTitle>
                  <EmptyDescription className="text-white/60">
                    Aucun produit trouvé pour "{query}"
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              <Empty>
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    <Search className="h-12 w-12 text-white/40" />
                  </EmptyMedia>
                  <EmptyTitle className="text-white">Rechercher des produits</EmptyTitle>
                  <EmptyDescription className="text-white/60">
                    Commencez à taper pour rechercher
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
      )}
    </Dialog>
  )
}
