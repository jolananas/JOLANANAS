/**
 * 🍍 JOLANANAS - Footer Consolidé
 * =================================
 * Footer hybride combinant les meilleurs éléments des deux footers
 */

'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Instagram, Facebook, Mail, Phone } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/Accordion';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/Tooltip';

interface ShopInfo {
  email: string | null;
  phone: string | null;
}

export function Footer() {
  const [shopInfo, setShopInfo] = useState<ShopInfo>({
    email: null,
    phone: null,
  });

  // Valeurs par défaut
  const defaultEmail = 'contact@jolananas.com';
  const defaultPhone = '+33 6 73 08 74 37';

  useEffect(() => {
    // Récupérer les informations de la boutique depuis Shopify
    fetch('/api/shop')
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json();
        return data;
      })
      .then((data) => {
        if (data) {
          setShopInfo({
            email: data.email || null,
            phone: data.phone || null,
          });
        }
      })
      .catch((err) => {
        console.error('Failed to fetch shop info:', err);
      });
  }, []);

  const contactEmail = shopInfo.email || defaultEmail;
  const contactPhone = shopInfo.phone || defaultPhone;
  return (
    <footer className="relative backdrop-blur-sm border-t border-jolananas-pink-medium/20 pt-12">
      {/* Background GIF comme dans HeroSection */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/images/background/bg-jolananas-fast.gif"
          alt="Background JOLANANAS"
          fill
          className="object-cover"
          priority
          unoptimized
        />
        <div className="absolute inset-0 bg-white/25"></div>
      </div>

      {/* Contenu du footer avec z-index supérieur */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 pb-32 md:pb-48 lg:pb-56">
        {/* Section "Le saviez-vous ?" */}
        <div className="tips-container mb-8">
          <h2>
            <b>LE SAVIEZ-VOUS ?</b>
          </h2>
          <p className="p">
            « <span>Jolananas</span> » se prononce : <span className="phonétique">/dʒɔ.la.na.nas/</span>
          </p>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center mb-4">
              <div className="relative w-10 h-10 md:w-12 md:h-12">
                <Image
                  src="/assets/images/logo/logo-jolananas-gradient.png"
                  alt="JOLANANAS Logo"
                  fill
                  sizes="(max-width: 768px) 40px, 48px"
                  className="object-contain"
                  priority
                />
              </div>
            </div>
            <p className="text-white/70 text-sm leading-relaxed max-w-md">
              Créations artisanales girly et utiles. Fait main avec amour en France.
            </p>
          </div>

          {/* Boutique */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold mb-4">Boutique</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/collections/nouveautes"
                  className="text-white hover:text-white/80 transition-colors"
                >
                  Nouveautés
                </Link>
              </li>
              <li>
                <Link
                  href="/collections/offres-du-moment"
                  className="text-white hover:text-white/80 transition-colors"
                >
                  Offres du moment
                </Link>
              </li>
              <li>
                <Link
                  href="/collections"
                  className="text-white hover:text-white/80 transition-colors"
                >
                  Collections
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-white hover:text-white/80 transition-colors"
                >
                  Produits
                </Link>
              </li>
            </ul>
          </div>

          {/* Informations */}
          <div className="space-y-4">
            <h4 className="text-white font-semibold mb-4">Informations</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-white hover:text-white/80 transition-colors"
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link
                  href="/livraison"
                  className="text-white hover:text-white/80 transition-colors"
                >
                  Livraison
                </Link>
              </li>
              <li>
                <Link
                  href="/retours"
                  className="text-white hover:text-white/80 transition-colors"
                >
                  Retours
                </Link>
              </li>
              <li>
                <Link
                  href="/cgv"
                  className="text-white hover:text-white/80 transition-colors"
                >
                  CGV
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-white hover:text-white/80 transition-colors"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div className="space-y-4">
            <div>
              <h4 className="text-white font-semibold mb-4">Suivez-nous</h4>
              <div className="flex space-x-4">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://instagram.com/jolananas.officiel"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-white/80 transition-colors"
                    >
                      <Instagram className="h-5 w-5" />
                      <span className="sr-only">Instagram</span>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Suivez-nous sur Instagram</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href="https://www.facebook.com/jolananas.officiel"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white hover:text-white/80 transition-colors"
                    >
                      <Facebook className="h-5 w-5" />
                      <span className="sr-only">Facebook</span>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Suivez-nous sur Facebook</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={`mailto:${contactEmail}`}
                      className="text-white hover:text-white/80 transition-colors"
                    >
                      <Mail className="h-5 w-5" />
                      <span className="sr-only">Email</span>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{contactEmail}</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <a
                      href={`tel:${contactPhone.replace(/\s/g, '')}`}
                      className="text-white hover:text-white/80 transition-colors"
                    >
                      <Phone className="h-5 w-5" />
                      <span className="sr-only">Téléphone</span>
                    </a>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{contactPhone}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Layout avec Accordion */}
        <div className="md:hidden">
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="boutique" className="border-white/20">
              <AccordionTrigger className="text-white hover:no-underline" chevronClassName="text-white">
                Boutique
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      href="/collections/nouveautes"
                      className="text-white hover:text-white/80 transition-colors block"
                    >
                      Nouveautés
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/collections/offres-du-moment"
                      className="text-white hover:text-white/80 transition-colors block"
                    >
                      Offres du moment
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/collections"
                      className="text-white hover:text-white/80 transition-colors block"
                    >
                      Collections
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/products"
                      className="text-white hover:text-white/80 transition-colors block"
                    >
                      Produits
                    </Link>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="informations" className="border-white/20">
              <AccordionTrigger className="text-white hover:no-underline" chevronClassName="text-white">
                Informations
              </AccordionTrigger>
              <AccordionContent>
                <ul className="space-y-2 text-sm">
                  <li>
                    <Link
                      href="/about"
                      className="text-white hover:text-white/80 transition-colors block"
                    >
                      À propos
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/livraison"
                      className="text-white hover:text-white/80 transition-colors block"
                    >
                      Livraison
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/retours"
                      className="text-white hover:text-white/80 transition-colors block"
                    >
                      Retours
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/cgv"
                      className="text-white hover:text-white/80 transition-colors block"
                    >
                      CGV
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/contact"
                      className="text-white hover:text-white/80 transition-colors block"
                    >
                      Contact
                    </Link>
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Réseaux sociaux sur mobile */}
          <div className="mt-6 space-y-4 text-center">
            <div className="flex items-center justify-center gap-4">
              <a
                href="https://instagram.com/jolananas.officiel"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-white/80 transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-6 w-6" />
              </a>
              <a
                href="https://www.facebook.com/jolananas.officiel"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:text-white/80 transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-6 w-6" />
              </a>
              <a
                href={`mailto:${contactEmail}`}
                className="text-white hover:text-white/80 transition-colors"
                aria-label="Email"
              >
                <Mail className="h-6 w-6" />
              </a>
              <a
                href={`tel:${contactPhone.replace(/\s/g, '')}`}
                className="text-white hover:text-white/80 transition-colors"
                aria-label="Téléphone"
              >
                <Phone className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 md:gap-0">
            <p className="text-white text-sm text-center md:text-left">
              © {new Date().getFullYear()} Jolananas. Tous droits réservés.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end items-center gap-x-4 gap-y-2 text-sm text-white">
              <Link href="/legal" className="hover:text-white/80 transition-colors whitespace-nowrap">
                Mentions légales
              </Link>
              <Link href="/privacy" className="hover:text-white/80 transition-colors whitespace-nowrap">
                Confidentialité
              </Link>
              <Link href="/terms" className="hover:text-white/80 transition-colors whitespace-nowrap">
                CGU
              </Link>
            </div>
          </div>
        </div>

        {/* Logo en bas avec espacement généreux */}
        <div className="mt-24 md:mt-32 lg:mt-40">
          <Image
            src="/assets/images/logo/logo-jolananas-argent.png"
            alt="JOLANANAS Logo"
            width={1200}
            height={300}
            className="w-full h-auto"
            priority
          />
        </div>
      </div>
      </div>
    </footer>
  );
}
