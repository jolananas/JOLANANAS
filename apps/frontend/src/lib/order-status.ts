import { 
  Clock, 
  CheckCircle, 
  Loader2, 
  Truck, 
  PackageCheck, 
  XCircle, 
  RotateCcw,
  type LucideIcon 
} from 'lucide-react';

/**
 * Couleurs des statuts de commande - Palette JOLANANAS
 * Utilise les couleurs personnalisées définies dans tailwind.config.js
 * Note: Les classes Tailwind avec tirets imbriqués peuvent nécessiter un redémarrage du serveur
 */
export const ORDER_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-[#FEF3C7] text-[#92400E] dark:bg-[#92400E] dark:text-[#FEF3C7]',
  PAID: 'bg-[#DBEAFE] text-[#1E40AF] dark:bg-[#1E3A8A] dark:text-[#DBEAFE]',
  PROCESSING: 'bg-[#F3E8FF] text-[#6B21A8] dark:bg-[#6B21A8] dark:text-[#F3E8FF]',
  SHIPPED: 'bg-[#E0E7FF] text-[#3730A3] dark:bg-[#3730A3] dark:text-[#E0E7FF]',
  DELIVERED: 'bg-[#D1FAE5] text-[#065F46] dark:bg-[#065F46] dark:text-[#D1FAE5]',
  CANCELLED: 'bg-[#FEE2E2] text-[#991B1B] dark:bg-[#991B1B] dark:text-[#FEE2E2]',
  REFUNDED: 'bg-[#F3F4F6] text-[#374151] dark:bg-[#374151] dark:text-[#F3F4F6]',
};

/**
 * Labels français des statuts de commande
 */
export const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING: 'En attente',
  PAID: 'Payée',
  PROCESSING: 'En traitement',
  SHIPPED: 'Expédiée',
  DELIVERED: 'Livrée',
  CANCELLED: 'Annulée',
  REFUNDED: 'Remboursée',
};

/**
 * Icônes Lucide pour chaque statut
 */
export const ORDER_STATUS_ICONS: Record<string, LucideIcon> = {
  PENDING: Clock,
  PAID: CheckCircle,
  PROCESSING: Loader2,
  SHIPPED: Truck,
  DELIVERED: PackageCheck,
  CANCELLED: XCircle,
  REFUNDED: RotateCcw,
};

/**
 * Obtient la couleur d'un statut avec fallback
 */
export function getOrderStatusColor(status: string): string {
  return ORDER_STATUS_COLORS[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
}

/**
 * Obtient le label d'un statut avec fallback
 */
export function getOrderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status] || status;
}

/**
 * Obtient l'icône d'un statut avec fallback
 */
export function getOrderStatusIcon(status: string): LucideIcon | undefined {
  return ORDER_STATUS_ICONS[status];
}

/**
 * Vérifie si un statut est valide
 */
export function isValidOrderStatus(status: string): boolean {
  return status in ORDER_STATUS_COLORS;
}


