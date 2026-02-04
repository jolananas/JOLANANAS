/**
 * 🍍 JOLANANAS - Mega Footer Component
 * =====================================
 * Footer amélioré avec variantes Shadcn Studio
 * Intègre newsletter, liens organisés, réseaux sociaux
 * Design responsive avec design system JOLANANAS
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook, Mail, Phone, Heart, Gift, Truck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LoadingDots } from '@/components/ui/loadingdots';
// getAllCollections est server-only, utiliser l'API route à la place

interface MegaFooterProps {
  className?: string;
}

export function MegaFooter({ className }: MegaFooterProps) {
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [collections, setCollections] = useState<Array<{ handle: string; title: string }>>([]);

  // Charger les collections réelles depuis l'API route
  React.useEffect(() => {
    fetch('/api/collections')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCollections(data.map((col: any) => ({ handle: col.handle, title: col.title })));
        }
      })
      .catch((error) => {
        console.error('Erreur lors du chargement des collections:', error);
      });
  }, []);

  // Gérer l'inscription à la newsletter
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubscribing(true);

    try {
      // TODO: Implémenter l'API newsletter
      // await fetch('/api/newsletter', { method: 'POST', body: JSON.stringify({ email }) });
      
      alert('Merci pour votre inscription ! Vous recevrez bientôt nos meilleures offres.');
      setEmail('');
    } catch (error) {
      console.error('Erreur lors de l\'inscription:', error);
    } finally {
      setIsSubscribing(false);
    }
  };

  return (
    <footer className={`mega-footer bg-gradient-to-br from-jolananas-dark-deep via-jolananas-dark to-jolananas-dark-medium text-white ${className}`}>
      <div className="container py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand & Description */}
          <div className="space-y-4">
            <div className="flex items-center mb-4">
              <div className="relative w-12 h-12">
                <Image
                  src="/assets/images/logo/logo-jolananas-gradient.png"
                  alt="JOLANANAS Logo"
                  fill
                  sizes="48px"
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed">
              Créations artisanales girly et utiles. Fait main avec amour en France.
            </p>
            <div className="flex items-center gap-2 text-sm text-white/70">
              <Heart className="h-4 w-4 text-jolananas-pink-medium" />
              <span>Fait avec passion</span>
            </div>
          </div>

          {/* Collections */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-lg mb-4">Collections</h4>
            <ul className="space-y-2 text-sm">
              {collections.length > 0 ? (
                collections.slice(0, 6).map((collection) => (
                  <li key={collection.handle}>
                    <Link
                      href={`/collections/${collection.handle}`}
                      className="text-white/70 hover:text-jolananas-pink-medium transition-colors"
                    >
                      {collection.title}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-white/50">Chargement des collections <LoadingDots size="sm" /></li>
              )}
              <li>
                <Link
                  href="/products"
                  className="text-white/70 hover:text-jolananas-pink-medium transition-colors font-medium"
                >
                  Tous les produits
                </Link>
              </li>
            </ul>
          </div>

          {/* Informations */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-lg mb-4">Informations</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/pages/about"
                  className="text-white/70 hover:text-jolananas-pink-medium transition-colors"
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link
                  href="/pages/contact"
                  className="text-white/70 hover:text-jolananas-pink-medium transition-colors"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/CGU — JOLANANAS.md"
                  className="text-white/70 hover:text-jolananas-pink-medium transition-colors"
                >
                  Conditions générales
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/CGV — JOLANANAS.md"
                  className="text-white/70 hover:text-jolananas-pink-medium transition-colors"
                >
                  Conditions de vente
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/Politique de Confidentialité — JOLANANAS.md"
                  className="text-white/70 hover:text-jolananas-pink-medium transition-colors"
                >
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/Politique de Cookies — JOLANANAS.md"
                  className="text-white/70 hover:text-jolananas-pink-medium transition-colors"
                >
                  Cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter & Contact */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold text-lg mb-4">Restez informé</h4>
            
            {/* Newsletter */}
            <form onSubmit={handleNewsletterSubmit} className="space-y-2">
              <Input
                type="email"
                placeholder="Votre adresse e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
                required
              />
              <Button
                type="submit"
                disabled={isSubscribing}
                className="w-full bg-jolananas-pink-medium hover:bg-jolananas-pink-deep"
              >
                {isSubscribing ? <>Inscription <LoadingDots size="sm" /></> : 'S\'inscrire'}
              </Button>
              <p className="text-xs text-white/50">
                Recevez nos meilleures offres et nouveautés. Un e-mail par semaine maximum.
              </p>
            </form>

            <Separator className="bg-white/20 my-4" />

            {/* Contact */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-white/70">
                <Mail className="h-4 w-4" />
                <a href="mailto:contact@jolananas.com" className="hover:text-jolananas-pink-medium transition-colors">
                  contact@jolananas.com
                </a>
              </div>
              <div className="flex items-center gap-2 text-white/70">
                <Phone className="h-4 w-4" />
                <a href="tel:+33673087437" className="hover:text-jolananas-pink-medium transition-colors">
                  +33 6 73 08 74 37
                </a>
              </div>
            </div>

            {/* Réseaux sociaux */}
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/jolananas.officiel"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-jolananas-pink-medium transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.facebook.com/jolananas.officiel"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/70 hover:text-jolananas-pink-medium transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <Separator className="bg-white/20 my-8" />

        {/* Garanties */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="flex items-center gap-2 text-sm text-white/70">
            <Gift className="h-5 w-5 text-jolananas-pink-medium" />
            <span>Emballage cadeau offert</span>
          </div>
        </div>

        <Separator className="bg-white/20 mb-6" />

        {/* Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-white/50">
          <p>
            © {new Date().getFullYear()} JOLANANAS. Tous droits réservés.
          </p>
          <p className="text-center md:text-right">
            Créations artisanales faites main en France 🇫🇷
          </p>
        </div>
      </div>
    </footer>
  );
}

