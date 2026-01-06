/**
 * 🍍 JOLANANAS - Détails d'une Commande
 * ======================================
 * Composant pour afficher les détails complets d'une commande
 */

'use client';

import React from 'react';
import { Package, MapPin, Calendar, Euro, Truck, Receipt } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/Separator';
import Image from 'next/image';
import { useCurrency } from '@/hooks/useCurrency';
import { getOrderStatusColor, getOrderStatusLabel } from '@/lib/order-status';

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

interface OrderDetailsProps {
  order: Order;
}

export function OrderDetails({ order }: OrderDetailsProps) {
  const { formatPrice: formatPriceHook } = useCurrency();
  
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatPrice = (amount: number, currency?: string): string => {
    return formatPriceHook(amount, currency || order.currency);
  };

  const subtotal = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="space-y-6">
      {/* En-tête de la commande */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-muted-foreground" />
            <span className="font-semibold">
              Commande {order.shopifyOrderId ? `#${order.shopifyOrderId}` : `#${order.id.slice(0, 8)}`}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            {formatDate(order.createdAt)}
          </div>
        </div>
        <Badge
          className={getOrderStatusColor(order.status)}
        >
          {getOrderStatusLabel(order.status)}
        </Badge>
      </div>

      {/* Articles de la commande */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Articles commandés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4">
                {item.imageUrl ? (
                  <div className="relative h-20 w-20 flex-shrink-0 rounded-md overflow-hidden border">
                    <Image
                      src={item.imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>
                ) : (
                  <div className="h-20 w-20 flex-shrink-0 rounded-md bg-muted flex items-center justify-center">
                    <Package className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium truncate">{item.title}</h4>
                  {item.variantTitle && (
                    <p className="text-sm text-muted-foreground">{item.variantTitle}</p>
                  )}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-muted-foreground">
                      Quantité: {item.quantity}
                    </span>
                    <span className="font-medium">
                      {formatPrice(item.price * item.quantity, order.currency)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Adresse de livraison */}
      {order.shippingAddress && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Adresse de livraison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-sm">
              <p className="font-medium">
                {order.shippingAddress.firstName} {order.shippingAddress.lastName}
              </p>
              {order.shippingAddress.company && (
                <p>{order.shippingAddress.company}</p>
              )}
              <p>{order.shippingAddress.address1}</p>
              {order.shippingAddress.address2 && (
                <p>{order.shippingAddress.address2}</p>
              )}
              <p>
                {order.shippingAddress.zip} {order.shippingAddress.city}
                {order.shippingAddress.province && `, ${order.shippingAddress.province}`}
              </p>
              <p>{order.shippingAddress.country}</p>
              {order.shippingAddress.phone && (
                <p className="pt-2">{order.shippingAddress.phone}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Totaux */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Récapitulatif
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Sous-total</span>
              <span>{formatPrice(subtotal, order.currency)}</span>
            </div>
            {order.shippingCost > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Truck className="h-4 w-4" />
                  Frais de livraison
                </span>
                <span>{formatPrice(order.shippingCost, order.currency)}</span>
              </div>
            )}
            {order.taxAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">TVA</span>
                <span>{formatPrice(order.taxAmount, order.currency)}</span>
              </div>
            )}
            <div className="flex justify-between font-semibold text-lg">
              <span>Total</span>
              <span>{formatPrice(order.total, order.currency)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

