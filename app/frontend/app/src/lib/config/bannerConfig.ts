/**
 * Configuration centralisée des messages de bandeau d'informations
 * Permet de gérer facilement les promotions, notifications et messages contextuels
 */

export type BannerType = 'promotion' | 'info' | 'warning' | 'success';

export interface BannerLink {
  href: string;
  label: string;
}

export interface BannerMessage {
  id: string;
  type: BannerType;
  title: string;
  description?: string;
  link?: BannerLink;
  dismissible: boolean;
  priority: number;
  startDate?: Date;
  endDate?: Date;
  icon?: string;
}

/**
 * Messages de bandeau disponibles
 * Priorité : Plus le nombre est élevé, plus le message est prioritaire
 */
const bannerMessages: BannerMessage[] = [
  {
    id: 'free-shipping-50',
    type: 'promotion',
    title: 'Livraison gratuite dès 50€ d\'achat !',
    description: 'Profitez de la livraison offerte sur toutes vos commandes',
    link: {
      href: '/products',
      label: 'Découvrir'
    },
    dismissible: true,
    priority: 3,
    icon: '🎉'
  },
  {
    id: 'express-delivery',
    type: 'info',
    title: 'Livraison express disponible',
    description: 'Recevez votre commande dès demain avec notre service express',
    dismissible: true,
    priority: 2,
    icon: '⚡'
  },
  {
    id: 'welcome-discount',
    type: 'promotion',
    title: 'Bienvenue ! Profitez de 10% de réduction',
    description: 'Code promo : BIENVENUE10 sur votre première commande',
    link: {
      href: '/products',
      label: 'En profiter'
    },
    dismissible: true,
    priority: 2,
    icon: '👋'
  }
];

/**
 * Détermine quel message de bandeau afficher selon le contexte
 * @param context - Contexte utilisateur (panier, première visite, etc.)
 * @returns Le message de bandeau à afficher ou null
 */
export function getBannerMessage(context?: {
  isFirstVisit?: boolean;
  cartTotal?: number;
  hasAbandonedCart?: boolean;
  isMaintenanceMode?: boolean;
}): BannerMessage | null {
  // 1. Vérifier les notifications critiques (maintenance)
  if (context?.isMaintenanceMode) {
    return {
      id: 'maintenance',
      type: 'warning',
      title: 'Maintenance programmée',
      description: 'Le site sera temporairement indisponible pour maintenance',
      dismissible: false,
      priority: 10,
      icon: '🛠️'
    };
  }

  // 2. Filtrer les messages actifs (selon dates)
  const now = new Date();
  const activeMessages = bannerMessages.filter(msg => {
    if (msg.startDate && now < msg.startDate) return false;
    if (msg.endDate && now > msg.endDate) return false;
    return true;
  });

  // 3. Messages contextuels selon l'utilisateur et le panier
  const cartTotal = context?.cartTotal || 0;
  const freeShippingThreshold = 50;

  // Si le panier est proche du seuil de livraison gratuite (entre 30€ et 50€)
  if (cartTotal >= 30 && cartTotal < freeShippingThreshold) {
    const remaining = freeShippingThreshold - cartTotal;
    return {
      id: 'free-shipping-close',
      type: 'promotion',
      title: `Plus que ${remaining.toFixed(0)}€ pour la livraison gratuite !`,
      description: 'Ajoutez des articles à votre panier',
      link: {
        href: '/products',
        label: 'Continuer mes achats'
      },
      dismissible: true,
      priority: 5,
      icon: '🚚'
    };
  }

  // Si le panier a déjà atteint le seuil de livraison gratuite
  if (cartTotal >= freeShippingThreshold) {
    return {
      id: 'free-shipping-achieved',
      type: 'success',
      title: 'Livraison gratuite activée !',
      description: 'Votre commande bénéficie de la livraison gratuite',
      link: {
        href: '/cart',
        label: 'Finaliser ma commande'
      },
      dismissible: true,
      priority: 4,
      icon: '✅'
    };
  }

  // Message de bienvenue pour les nouveaux visiteurs
  if (context?.isFirstVisit) {
    const welcomeMsg = activeMessages.find(m => m.id === 'welcome-discount');
    if (welcomeMsg) return welcomeMsg;
  }

  // Panier abandonné
  if (context?.hasAbandonedCart) {
    return {
      id: 'abandoned-cart',
      type: 'promotion',
      title: 'Vous avez des articles dans votre panier',
      description: 'Finalisez votre commande et profitez de la livraison gratuite',
      link: {
        href: '/cart',
        label: 'Voir mon panier'
      },
      dismissible: true,
      priority: 4,
      icon: '🛒'
    };
  }

  // 4. Messages de promotion généraux (par priorité)
  if (activeMessages.length > 0) {
    // Trier par priorité décroissante
    const sortedMessages = activeMessages.sort((a, b) => b.priority - a.priority);
    return sortedMessages[0];
  }

  return null;
}

/**
 * Vérifie si un message de bandeau a été fermé par l'utilisateur
 * @param bannerId - ID du message de bandeau
 * @returns true si le message a été fermé
 */
export function isBannerDismissed(bannerId: string): boolean {
  if (typeof window === 'undefined') return false;
  
  const dismissedKey = `jolananas-banner-dismissed-${bannerId}`;
  const dismissed = localStorage.getItem(dismissedKey);
  
  if (!dismissed) return false;
  
  // Vérifier si la date de fermeture est encore valide (24h)
  const dismissedDate = new Date(dismissed);
  const now = new Date();
  const hoursDiff = (now.getTime() - dismissedDate.getTime()) / (1000 * 60 * 60);
  
  return hoursDiff < 24;
}

/**
 * Marque un message de bandeau comme fermé
 * @param bannerId - ID du message de bandeau
 */
export function dismissBanner(bannerId: string): void {
  if (typeof window === 'undefined') return;
  
  const dismissedKey = `jolananas-banner-dismissed-${bannerId}`;
  localStorage.setItem(dismissedKey, new Date().toISOString());
}

/**
 * Réinitialise tous les bandeaux fermés (utile pour les tests)
 */
export function resetDismissedBanners(): void {
  if (typeof window === 'undefined') return;
  
  const keys = Object.keys(localStorage);
  keys.forEach(key => {
    if (key.startsWith('jolananas-banner-dismissed-')) {
      localStorage.removeItem(key);
    }
  });
}

