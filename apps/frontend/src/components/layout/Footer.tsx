"use client";

import { useState } from "react";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
// IMPORTS SIMPLE ICONS
import {
  siVisa,
  siMastercard,
  siPaypal,
  siStripe,
  siApplepay,
  siGooglepay,
  siInstagram,
  siFacebook,
  siX,
} from "simple-icons";

// Petit composant Helper pour afficher l'icône SimpleIcon
const BrandIcon = ({
  icon,
  className,
  style,
}: {
  icon: any;
  className?: string;
  style?: any;
}) => (
  <svg
    role="img"
    viewBox="0 0 24 24"
    className={className}
    style={style}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>{icon.title}</title>
    <path d={icon.path} />
  </svg>
);

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      id="footer"
      className="relative pt-20 pb-10 overflow-hidden"
      style={{
        backgroundImage: "url(/assets/images/background/bg-jolananas-fast.gif)",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* 1. OVERLAY (Flou + Couleur Marque) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backdropFilter: "blur(12px)",
          WebkitBackdropFilter: "blur(12px)",
          backgroundColor: "rgba(254, 247, 240, 0.675)", // Plus opaque pour la lisibilité
        }}
      />

      {/* 2. ÉLÉMENT DÉCORATIF "BIG TYPO" (Arrière-plan) */}
      <div className="absolute bottom-[-5%] left-0 w-full overflow-hidden pointer-events-none select-none opacity-[0.03]">
        <h1 className="text-[15vw] font-black leading-none text-black tracking-tighter text-center whitespace-nowrap">
          JOLANANAS
        </h1>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* --- SECTION HAUTE : NEWSLETTER & MARQUE --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-20">
          {/* Colonne Marque (Large) */}
          <div className="lg:col-span-5 space-y-8 flex flex-col items-center text-center lg:items-start lg:text-left">
            <Link href="/" className="inline-block">
              <Image
                src="/assets/images/logo/logo-jolananas-argent.png"
                alt="Logo – Jolananas"
                width={200}
                height={50}
                className="h-12 w-auto"
              />
            </Link>
            <p className="text-lg text-white leading-relaxed max-w-md font-medium mx-auto lg:mx-0">
              L'art de la fantaisie. <br />
              Des créations artisanales uniques, pensées pour révéler votre
              personnalité avec élégance et audace.
            </p>

            {/* SOCIALS (Mise à jour Simple Icons) */}
            <div className="flex gap-4 pt-2 justify-center lg:justify-start">
              {[
                { icon: siInstagram, href: "#" },
                { icon: siFacebook, href: "#" },
                { icon: siX, href: "#" },
              ].map((item, i) => (
                <Link
                  key={i}
                  href={item.href}
                  className="w-10 h-10 rounded-full flex items-center justify-center bg-white/50 backdrop-blur-xl hover:bg-primary text-primary hover:text-white transition-all duration-300 group"
                >
                  <BrandIcon
                    icon={item.icon}
                    className="w-4 h-4 group-hover:scale-110 transition-transform"
                  />
                </Link>
              ))}
            </div>
          </div>

          {/* Colonne Newsletter (Mise en avant) */}
          <div className="lg:col-span-7 bg-white/40 backdrop-blur-sm border border-white/50 p-8 rounded-3xl text-center lg:text-left">
            <h3 className="text-2xl text-primary font-serif font-bold mb-2">
              Rejoignez le club
            </h3>
            <p className="text-primary/80 mb-6">
              Recevez nos exclusivités et -10% sur votre première commande.
            </p>

            <NewsletterForm />
            <p className="text-xs text-muted-foreground mt-4 opacity-70">
              En vous inscrivant, vous acceptez notre politique de
              confidentialité. Désinscription à tout moment.
            </p>
          </div>
        </div>

        <Separator className="bg-black/5 mb-16" />

        {/* --- SECTION BASSE : LIENS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-20 text-center md:text-left">
          {/* Groupe 1 */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white indent-2 mix-blend-difference">
              Collections
            </h4>
            <ul className="space-y-4">
              {[
                "Toutes les collections",
                "Nouveautés",
                "Best Sellers",
                "Éditions Limitées",
              ].map((item) => (
                <li key={item}>
                  <Link
                    href="/collections"
                    className="text-white hover:text-primary transition-colors text-sm font-medium hover:translate-x-1 inline-block duration-200 mix-blend-difference"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Groupe 2 */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white indent-2 mix-blend-difference">
              La Maison
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/a-propos"
                  className="text-white hover:text-primary transition-colors text-sm font-medium hover:translate-x-1 inline-block duration-200 mix-blend-difference"
                >
                  Notre Histoire
                </Link>
              </li>
              <li>
                <Link
                  href="/presse"
                  className="text-white hover:text-primary transition-colors text-sm font-medium hover:translate-x-1 inline-block duration-200 mix-blend-difference"
                >
                  Presse
                </Link>
              </li>
            </ul>
          </div>

          {/* Groupe 3 */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white indent-2 mix-blend-difference">
              Support
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/contact"
                  className="text-white hover:text-primary transition-colors text-sm font-medium hover:translate-x-1 inline-block duration-200 mix-blend-difference"
                >
                  Service Client
                </Link>
              </li>
              <li>
                <Link
                  href="/livraison"
                  className="text-white hover:text-primary transition-colors text-sm font-medium hover:translate-x-1 inline-block duration-200 mix-blend-difference"
                >
                  Livraison & Retours
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-white hover:text-primary transition-colors text-sm font-medium hover:translate-x-1 inline-block duration-200 mix-blend-difference"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Groupe 4 */}
          <div className="space-y-6">
            <h4 className="text-xs font-bold uppercase tracking-[0.2em] text-white indent-2 mix-blend-difference">
              Légal
            </h4>
            <ul className="space-y-4">
              <li>
                <Link
                  href="/mentions-legales/CGV"
                  className="text-white hover:text-primary transition-colors text-sm font-medium hover:translate-x-1 inline-block duration-200 mix-blend-difference"
                >
                  CGV
                </Link>
              </li>
              <li>
                <Link
                  href="/mentions-legales/confidentialite"
                  className="text-white hover:text-primary transition-colors text-sm font-medium hover:translate-x-1 inline-block duration-200 mix-blend-difference"
                >
                  Confidentialité
                </Link>
              </li>
              <li>
                <Link
                  href="/mentions-legales"
                  className="text-white hover:text-primary transition-colors text-sm font-medium hover:translate-x-1 inline-block duration-200 mix-blend-difference"
                >
                  Mentions Légales
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* --- FOOTER BOTTOM --- */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8">
          {/* COPYRIGHT */}
          <p className="text-xs text-center md:text-left font-medium text-black uppercase tracking-wider opacity-40">
            © {currentYear} SARL JOLANANAS. Fait avec 🩷 en 🇫🇷
            <br />
            <span className="text-[10px]">Réalisation : Aïssa BELKOUSSA</span>
          </p>

          {/* LOGOS PAIEMENT (Simple Icons) */}
          <div className="flex items-center gap-5">
              {[
                siVisa,
                siMastercard,
                siPaypal,
                siStripe,
                siApplepay,
                siGooglepay,
              ].map((icon) => (
                <div
                  key={icon.slug}
                  className="group relative flex items-center justify-center opacity-40"
                  title={`Paiement sécurisé via ${icon.title}`}
                >
                  {/* Icône en mode "CurrentColor" pour le gris, mais on applique la vraie couleur hex au survol via style */}
                  <BrandIcon
                    icon={icon}
                    className="h-6 w-auto transition-colors duration-300 text-black"
                  />
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* --- FOOTER BOTTOM LOGO (Full Width) --- */}
      <div className="hidden md:block absolute mt-12 bottom-0 left-0 right-0 overflow-hidden z-10 pointer-events-none">
        <div className="relative w-full h-64 translate-y-1/2">
            <Image
            src="/assets/images/logo/logo-jolananas-gradient.png"
            alt="JOLANANAS Logo"
            fill
            className="object-contain object-top"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
      </div>

    </footer>
  );
}

function NewsletterForm() {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState<string>("idle");
  
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setStatus("loading");
  
      try {
        const response = await fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
  
        if (response.ok) {
          setStatus("success");
          setEmail("");
        } else {
          setStatus("error");
        }
      } catch (error) {
        setStatus("error");
      }
    };
  
    if (status === "success") {
      return (
          <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-green-700 animate-in fade-in zoom-in">
              <p className="font-bold flex items-center gap-2">
                  <span className="text-xl">✨</span> Bienvenue au club !
              </p>
              <p className="text-sm opacity-90">
                  Surveillez votre boîte mail pour votre code promo.
              </p>
          </div>
      );
    }
  
    return (
      <form
        className="flex flex-col sm:flex-row gap-3 relative"
        onSubmit={handleSubmit}
      >
        <Input
          type="email"
          placeholder="votre@email.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={status === "loading" || status === "success"}
          className="bg-white/80 text-primary placeholder:text-primary/70 border-transparent h-12 rounded-xl focus:ring-primary/20 backdrop-blur-sm"
        />
        <Button
          type="submit"
          size="lg"
          disabled={status === "loading" || status === "success"}
          className="h-12 rounded-xl bg-primary text-white hover:bg-primary/80 px-8 transition-all duration-300 group shadow-lg shadow-primary/20"
        >
          {status === "loading" ? "..." : "S'inscrire"}
          {status !== "loading" && <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-2 transition-all duration-300" />}
        </Button>
      </form>
    );
  }
