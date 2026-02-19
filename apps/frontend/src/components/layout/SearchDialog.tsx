"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Package, TrendingUp, Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrency } from "@/hooks/useCurrency";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface SearchProduct {
  id: string;
  title: string;
  handle: string;
  description: string;
  featuredImage: string | null;
  images: { url: string; altText: string | null }[];
  price: number;
  currency: string;
  availableForSale: boolean;
  tags: string[];
}

const RECENTLY_VIEWED_KEY = "jolananas_recently_viewed";
const MAX_RECENT = 4;
const MAX_TAGS = 6;

/** Extrait les tags les plus fréquents du catalogue (auto, sans maintenance) */
function getTopTags(products: SearchProduct[]): { label: string; query: string }[] {
  const freq = new Map<string, number>();
  for (const p of products) {
    for (const tag of p.tags ?? []) {
      const t = tag.trim().toLowerCase();
      if (t.length < 2) continue;
      freq.set(t, (freq.get(t) ?? 0) + 1);
    }
  }
  return Array.from(freq.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_TAGS)
    .map(([tag]) => ({
      label: tag.charAt(0).toUpperCase() + tag.slice(1),
      query: tag,
    }));
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export function SearchDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [products, setProducts] = useState<SearchProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [isMac, setIsMac] = useState(false);
  const [origin, setOrigin] = useState("50% 0%");
  const [recentlyViewed, setRecentlyViewed] = useState<SearchProduct[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { formatPrice } = useCurrency();
  const router = useRouter();

  // Suggestions automatiques issues des tags du catalogue
  const topTags = useMemo(() => getTopTags(products), [products]);

  // Charge l'historique depuis localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
      if (raw) setRecentlyViewed(JSON.parse(raw));
    } catch { /* ignore */ }
  }, [open]);
  const debouncedQuery = useDebounce(query, 280);

  // Détection plateforme après mount (évite le mismatch d'hydration SSR)
  useEffect(() => {
    const ua = navigator.userAgent;
    const platform = navigator.platform ?? "";
    setIsMac(
      /Mac|iPhone|iPad|iPod/.test(platform) ||
      /Mac|iPad/.test(ua)
    );
  }, []);

  // Raccourci clavier ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeydown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        // Calcule l'origine depuis le bouton avant d'ouvrir
        if (buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect();
          setOrigin(`${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`);
        }
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, []);

  // Chargement lazy des produits au premier open
  const fetchProducts = useCallback(async () => {
    if (fetched) return;
    setLoading(true);
    try {
      const res = await fetch("/api/products", {
        next: { revalidate: 1800 },
      } as RequestInit);
      if (!res.ok) throw new Error("Erreur réseau");
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
      setFetched(true);
    } catch {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [fetched]);

  useEffect(() => {
    if (open) fetchProducts();
  }, [open, fetchProducts]);

  // Filtrage côté client intelligent
  const results = (() => {
    const q = debouncedQuery.toLowerCase().trim();
    if (!q) return [];

    const terms = q.split(/\s+/).filter((t) => t.length > 0);

    return products
      .filter((product) => {
        const title = product.title.toLowerCase();
        const desc = product.description?.toLowerCase() ?? "";
        const tags = (product.tags || []).map((t) => t.toLowerCase());
        return terms.every(
          (term) =>
            title.includes(term) ||
            desc.includes(term) ||
            tags.some((tag) => tag.includes(term))
        );
      })
      .sort((a, b) => {
        const q = debouncedQuery.toLowerCase();
        const aStarts = a.title.toLowerCase().startsWith(q) ? 2 : 0;
        const bStarts = b.title.toLowerCase().startsWith(q) ? 2 : 0;
        const aContains = a.title.toLowerCase().includes(q) ? 1 : 0;
        const bContains = b.title.toLowerCase().includes(q) ? 1 : 0;
        return bStarts + bContains - (aStarts + aContains);
      })
      .slice(0, 8);
  })();

  const handleSelect = (handle: string) => {
    // Sauvegarde dans l'historique des consultations
    const product = products.find((p) => p.handle === handle);
    if (product) {
      try {
        const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
        const prev: SearchProduct[] = raw ? JSON.parse(raw) : [];
        const next = [product, ...prev.filter((p) => p.handle !== handle)].slice(0, MAX_RECENT);
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(next));
        setRecentlyViewed(next);
      } catch { /* ignore */ }
    }
    setOpen(false);
    setQuery("");
    router.push(`/products/${handle}`);
  };

  const handleSuggestion = (q: string) => {
    setQuery(q);
  };

  const handleOpen = () => {
    // Calcule l'origine exacte depuis le centre du bouton au moment du clic
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setOrigin(`${rect.left + rect.width / 2}px ${rect.top + rect.height / 2}px`);
    }
    setOpen(true);
  };

  return (
    <>
      {/* Bouton déclencheur */}
      <Button
        ref={buttonRef}
        variant="ghost"
        size="icon"
        className="h-11 w-11 sm:h-9 sm:w-9 touch-manipulation text-primary/70 hover:text-primary hover:bg-primary/5 rounded-full"
        aria-label="Rechercher (⌘K)"
        onClick={handleOpen}
      >
        <Search className="h-5 w-5" />
        <span className="sr-only">Rechercher</span>
      </Button>

      {/* Dialog avec effet génie depuis la position du bouton */}
      <DialogPrimitive.Root
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setQuery("");
        }}
      >
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay
            className={cn(
              "fixed inset-0 z-[150] bg-black/30 backdrop-blur-[2px]",
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
              "duration-300"
            )}
          />
          <DialogPrimitive.Content
            aria-describedby="search-dialog-description"
            style={{ transformOrigin: origin }}
            className={cn(
              // Positionnement centré
              "fixed top-[50%] left-[50%] z-[150]",
              "w-full max-w-lg translate-x-[-50%] translate-y-[-50%]",
              // Apparence
              "bg-background rounded-2xl border-none shadow-2xl shadow-primary/10 overflow-hidden",
              // Animation génie — part du point d'origine (le bouton)
              "data-[state=open]:animate-in data-[state=closed]:animate-out",
              "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
              "data-[state=open]:zoom-in-0 data-[state=closed]:zoom-out-0",
              "duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
            )}
          >
            {/* Titre SR-only pour accessibilité */}
            <DialogPrimitive.Title className="sr-only">
              Rechercher des créations
            </DialogPrimitive.Title>
            <DialogPrimitive.Description id="search-dialog-description" className="sr-only">
              Recherchez parmi tous les produits Jolananas
            </DialogPrimitive.Description>

            <Command className="border-none [&_[cmdk-group-heading]]:text-muted-foreground **:data-[slot=command-input-wrapper]:h-12 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group]]:px-2 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5 [&_[cmdk-input]]:border-none [&_[cmdk-input]]:shadow-none [&_[cmdk-input]]:ring-0">
              <CommandInput
                placeholder={isMac ? "Rechercher des créations... (⌘K)" : "Rechercher des créations..."}
                value={query}
                onValueChange={setQuery}
                className="text-primary placeholder:text-primary/40"
              />

              <CommandList className="max-h-[420px] px-1">
                {/* Chargement */}
                {loading && (
                  <div className="p-4 space-y-3">
                    {[...Array(3)].map((_, i) => (
                      <div key={i} className="flex gap-3 items-center">
                        <Skeleton className="h-12 w-12 rounded-lg flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <Skeleton className="h-4 w-3/4" />
                          <Skeleton className="h-3 w-1/2" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggestions rapides */}
                {!loading && !query && (
                  <CommandGroup
                    heading={
                      <span className="flex items-center gap-1.5 text-primary/50 font-medium">
                        <TrendingUp className="h-3.5 w-3.5" />
                        Suggestions
                      </span>
                    }
                  >
                    {SUGGESTIONS.map((s) => (
                      <CommandItem
                        key={s.query}
                        value={s.query}
                        onSelect={() => handleSuggestion(s.query)}
                        className="cursor-pointer rounded-lg text-primary/80 hover:bg-primary/5 data-[selected=true]:bg-primary/5 data-[selected=true]:text-primary"
                      >
                        <Search className="h-4 w-4 text-primary/40 mr-2 flex-shrink-0" />
                        {s.label}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {/* Résultats de recherche */}
                {!loading && debouncedQuery && results.length > 0 && (
                  <CommandGroup
                    heading={
                      <span className="flex items-center gap-1.5 text-primary/50 font-medium">
                        <Sparkles className="h-3.5 w-3.5" />
                        {results.length} création{results.length > 1 ? "s" : ""} trouvée{results.length > 1 ? "s" : ""}
                      </span>
                    }
                  >
                    {results.map((product) => (
                      <CommandItem
                        key={product.id}
                        value={product.title}
                        onSelect={() => handleSelect(product.handle)}
                        className={cn(
                          "flex items-center gap-3 py-2.5 px-2 cursor-pointer rounded-xl",
                          "text-primary hover:bg-primary/5",
                          "data-[selected=true]:bg-primary/5 data-[selected=true]:text-primary"
                        )}
                      >
                        {/* Image */}
                        <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-primary/5 flex-shrink-0 border border-primary/10">
                          <Image
                            src={
                              product.featuredImage ||
                              product.images?.[0]?.url ||
                              "/assets/images/collections/placeholder.svg"
                            }
                            alt={product.title}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-primary leading-tight line-clamp-1">
                            {product.title}
                          </p>
                          <p className="text-sm font-bold text-jolananas-pink-medium mt-0.5">
                            {formatPrice(product.price)}
                          </p>
                        </div>

                        {/* Badge dispo */}
                        {product.availableForSale ? (
                          <span className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                            Dispo
                          </span>
                        ) : (
                          <span className="flex-shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary/50">
                            Épuisé
                          </span>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}

                {/* État vide */}
                {!loading && debouncedQuery && results.length === 0 && (
                  <CommandEmpty>
                    <div className="flex flex-col items-center gap-3 py-8 text-primary/50">
                      <Package className="h-10 w-10 opacity-30" />
                      <p className="text-sm font-medium">Aucune création trouvée</p>
                      <p className="text-xs">Essayez avec d'autres mots-clés</p>
                    </div>
                  </CommandEmpty>
                )}
              </CommandList>

              {/* Footer */}
              <div className="px-4 py-3 flex items-center justify-between opacity-60">
                <p className="text-[11px] text-primary/40">
                  ↑↓ naviguer · ↵ sélectionner · {isMac ? "esc" : "échap"} fermer
                </p>
                <kbd className="text-[10px] font-mono bg-primary/5 text-primary/40 px-1.5 py-0.5 rounded">
                  {isMac ? "⌘K" : "Ctrl+K"}
                </kbd>
              </div>
            </Command>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
