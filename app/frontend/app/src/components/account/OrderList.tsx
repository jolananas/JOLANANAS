/**
 * 🍍 JOLANANAS - Liste des Commandes
 * ===================================
 * Composant pour afficher la liste des commandes de l'utilisateur
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Package, ChevronRight, Calendar, Euro, Search, Filter, ChevronLeft, ChevronDown, ArrowUpDown } from 'lucide-react';
import { useCurrency } from '@/hooks/useCurrency';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/Pagination';
import { Skeleton } from '@/components/ui/Skeleton';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/Empty';
import { Alert, AlertDescription } from '@/components/ui/Alert';
import dynamic from 'next/dynamic';

// Lazy loading du composant OrderDetails (peut être lourd avec beaucoup d'items)
const OrderDetails = dynamic(() => import('./OrderDetails').then(mod => ({ default: mod.OrderDetails })), {
  loading: () => <div className="flex items-center justify-center py-8"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div></div>,
  ssr: false,
});
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/Dialog';
import { OrderListSkeleton } from './OrderListSkeleton';
import { apiGet } from '@/app/src/lib/api-client';

interface OrderItem {
  id: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  title: string;
  variantTitle?: string;
  imageUrl?: string;
}

interface ShippingAddress {
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
}

interface Order {
  id: string;
  shopifyOrderId?: string;
  status: string;
  total: number;
  currency: string;
  shippingCost: number;
  taxAmount: number;
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
  shippingAddress?: ShippingAddress | null;
}

import { getOrderStatusColor, getOrderStatusLabel } from '@/lib/order-status';

export function OrderList() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const limit = 10;
  
  // Filtres
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'total' | 'status'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchOrders();
  }, [page, statusFilter, searchQuery, sortBy, sortOrder]);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Construire les paramètres de requête
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      if (statusFilter !== 'ALL') {
        params.append('status', statusFilter);
      }

      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
      }

      const data = await apiGet<{ 
        success: boolean; 
        orders: Order[]; 
        pagination?: {
          page: number;
          limit: number;
          totalCount: number;
          totalPages: number;
          hasNextPage: boolean;
          hasPreviousPage: boolean;
        };
        error?: string;
      }>(
        `/api/user/orders?${params.toString()}`,
        {
          timeout: 10000,
          retries: 2,
          onRetry: (attempt) => {
            console.log(`Tentative ${attempt} de récupération des commandes...`);
          },
        }
      );

      if (!data.success) {
        throw new Error(data.error || 'Erreur lors de la récupération des commandes');
      }

      setOrders(data.orders || []);
      
      if (data.pagination) {
        setTotalPages(data.pagination.totalPages);
        setTotalCount(data.pagination.totalCount);
      }
    } catch (err) {
      let errorMessage = 'Une erreur est survenue';
      
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

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsOpen(true);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const { formatPrice: formatPriceHook } = useCurrency();
  
  const formatPrice = (amount: number, currency?: string): string => {
    return formatPriceHook(amount, currency);
  };

  if (isLoading) {
    return <OrderListSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          <p className="mb-2">{error}</p>
          <Button onClick={fetchOrders} variant="outline" size="sm">
            Réessayer
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  if (orders.length === 0) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Package className="h-12 w-12 text-muted-foreground/50" />
          </EmptyMedia>
          <EmptyTitle>Aucune commande</EmptyTitle>
          <EmptyDescription>
            Vous n'avez pas encore passé de commande
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button asChild>
            <a href="/products">Découvrir nos produits</a>
          </Button>
        </EmptyContent>
      </Empty>
    );
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // Reset à la première page lors d'une recherche
    fetchOrders();
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
  };

  const handleSortChange = (value: string) => {
    const [field, order] = value.split('-');
    setSortBy(field as 'createdAt' | 'total' | 'status');
    setSortOrder(order as 'asc' | 'desc');
    setPage(1);
  };

  return (
    <>
      {/* Filtres et recherche */}
      <div className="space-y-4 mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Rechercher par numéro de commande ou produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit" variant="outline">
            <Search className="h-4 w-4 mr-2" />
            Rechercher
          </Button>
        </form>

        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tous les statuts" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">Tous les statuts</SelectItem>
                <SelectItem value="PENDING">En attente</SelectItem>
                <SelectItem value="PAID">Payée</SelectItem>
                <SelectItem value="PROCESSING">En traitement</SelectItem>
                <SelectItem value="SHIPPED">Expédiée</SelectItem>
                <SelectItem value="DELIVERED">Livrée</SelectItem>
                <SelectItem value="CANCELLED">Annulée</SelectItem>
                <SelectItem value="REFUNDED">Remboursée</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <Select value={`${sortBy}-${sortOrder}`} onValueChange={handleSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt-desc">Plus récentes</SelectItem>
                <SelectItem value="createdAt-asc">Plus anciennes</SelectItem>
                <SelectItem value="total-desc">Montant décroissant</SelectItem>
                <SelectItem value="total-asc">Montant croissant</SelectItem>
                <SelectItem value="status-asc">Statut A-Z</SelectItem>
                <SelectItem value="status-desc">Statut Z-A</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Card key={order.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Commande {order.shopifyOrderId ? `#${order.shopifyOrderId}` : `#${order.id.slice(0, 8)}`}
                  </CardTitle>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDate(order.createdAt)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Euro className="h-4 w-4" />
                      {formatPrice(order.total, order.currency)}
                    </div>
                  </div>
                </div>
                <Badge
                  className={getOrderStatusColor(order.status)}
                >
                  {getOrderStatusLabel(order.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {order.items.length} {order.items.length > 1 ? 'articles' : 'article'}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewDetails(order)}
                >
                  Voir les détails
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page > 1) setPage(p => p - 1);
                }}
                className={page === 1 ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (page <= 3) {
                pageNum = i + 1;
              } else if (page >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = page - 2 + i;
              }
              return (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(pageNum);
                    }}
                    isActive={page === pageNum}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              );
            })}
            {totalPages > 5 && page < totalPages - 2 && (
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
            )}
            <PaginationItem>
              <PaginationNext 
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  if (page < totalPages) setPage(p => p + 1);
                }}
                className={page === totalPages ? 'pointer-events-none opacity-50' : ''}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Détails de la commande {selectedOrder?.shopifyOrderId ? `#${selectedOrder.shopifyOrderId}` : `#${selectedOrder?.id.slice(0, 8)}`}
            </DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <OrderDetails order={selectedOrder} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

