"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { RetroGrid } from "@/components/ui/retro-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Instagram, ArrowRight, Lock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useGatekeeperLogic } from "@/hooks/useGatekeeperLogic"; // <--- Nouveau Hook

// --- DICTIONNAIRE AMÉLIORÉ ---
const GATEKEEPER_MODES: any = {
  maintenance: {
    title: "ATELIER EN PAUSE.",
    subtitle: "Maintenance Programmée",
    description:
      "Nos artisans numériques peaufinent les détails. Réouverture imminente.",
    bgGradient: "from-orange-100/50 to-orange-50/50",
    hasNewsletter: false, // Pas besoin de capturer des mails pour une maintenance courte
  },
  coming_soon: {
    title: "PRÉLUDE.",
    subtitle: "Collection 2026",
    description:
      "L'audace douce se prépare. Rejoignez le cercle privé pour l'accès anticipé.",
    bgGradient: "from-pink-100/50 to-rose-50/50",
    hasNewsletter: true, // INDISPENSABLE ICI
  },
  private_sale: {
    title: "CERCLE PRIVÉ.",
    subtitle: "Accès Réservé",
    description: "Vente exclusive aux membres. Veuillez vous identifier.",
    bgGradient: "from-gray-200/50 to-gray-100/50",
    hasNewsletter: false,
    cta: { label: "Entrer le mot de passe", href: "/login" },
  },
};

export function SiteGatekeeper() {
  const { shouldBlock, activeMode } = useGatekeeperLogic();
  const content = GATEKEEPER_MODES[activeMode];

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch (err) {
      setStatus("error");
    }
  };

  // BLOQUER LE SCROLL PHYSIQUEMENT
  useEffect(() => {
    if (shouldBlock) {
      document.body.style.overflow = "hidden";
      document.body.style.height = "100vh";
      document.body.style.touchAction = "none";
    } else {
      document.body.style.overflow = "";
      document.body.style.height = "";
      document.body.style.touchAction = "";
    }
    return () => {
      document.body.style.overflow = "";
      document.body.style.height = "";
      document.body.style.touchAction = "";
    };
  }, [shouldBlock]);

  if (!shouldBlock || !content) return null;

  return (
    <div className="fixed inset-0 z-[99999] bg-[#FEF7F0] flex flex-col items-center justify-center overflow-hidden">
      {/* BACKGROUND */}
      <RetroGrid
        className="opacity-20"
        lightLineColor="#EC7B9C"
        darkLineColor="#EC7B9C"
      />
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-b opacity-60 pointer-events-none",
          content.bgGradient,
        )}
      />

      {/* CONTENU */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-4xl px-6 animate-in fade-in zoom-in duration-1000">
        {/* LOGO */}
        <div className="mb-10 relative w-32 h-32 md:w-40 md:h-40">
          <Image
            src="/assets/images/logo/logo-jolananas-gradient.png"
            alt="Jolananas"
            fill
            className="object-contain"
            priority
          />
        </div>

        {/* TEXTES */}
        <div className="space-y-6 mb-12">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-black/5 bg-white/40 backdrop-blur-md shadow-sm mb-4">
            <span className="w-2 h-2 rounded-full bg-primary mr-3 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {content.subtitle}
            </span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-primary uppercase leading-[0.9]">
            {content.title}
          </h1>

          <p className="text-xl md:text-2xl text-primary font-serif italic max-w-lg mx-auto leading-relaxed">
            {content.description}
          </p>
        </div>

        {/* --- ZONE D'ACTION INTELLIGENTE --- */}
        <div className="w-full max-w-md mx-auto">
          {/* CAS NEWSLETTER (Coming Soon) */}
          {content.hasNewsletter && (
            <div className="flex flex-col gap-4">
              {status === "success" ? (
                <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-green-700 animate-in fade-in zoom-in">
                  <p className="font-bold">✨ Merci !</p>
                  <p className="text-sm">
                    Vous êtes sur la liste. Surveillez vos emails.
                  </p>
                </div>
              ) : (
                <form
                  className="flex flex-col sm:flex-row gap-2 relative group"
                  onSubmit={handleSubscribe}
                >
                  <Input
                    type="email"
                    placeholder="votre@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={status === "loading"}
                    className="h-14 rounded-full border-2 border-black/10 bg-white/60 backdrop-blur-sm px-6 text-base focus-visible:ring-0 focus-visible:border-primary transition-all"
                  />
                  <Button
                    size="lg"
                    type="submit"
                    disabled={status === "loading"}
                    className="h-14 rounded-full px-8 bg-black text-white hover:bg-primary transition-all hover:scale-105 sm:absolute sm:right-1 sm:top-1 sm:h-12"
                  >
                    {status === "loading" ? "..." : "M'avertir"}
                  </Button>
                </form>
              )}
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest opacity-60">
                -10% sur votre première commande au lancement
              </p>
            </div>
          )}

          {/* CAS BOUTON SIMPLE (Maintenance / Privé) */}
          {!content.hasNewsletter && content.cta && (
            <Link href={content.cta.href}>
              <Button
                size="lg"
                className="h-14 rounded-full px-8 bg-black text-white hover:bg-primary"
              >
                {content.cta.label} <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          )}

          {/* SOCIALS (Toujours là en secours) */}
          <div className="mt-12 flex justify-center gap-6">
            <Link
              href="#"
              className="p-3 rounded-full border border-black/5 hover:bg-black hover:text-white transition-all hover:scale-110"
            >
              <Instagram size={20} />
            </Link>
            <div className="h-auto w-px bg-black/10 mx-2" />
            <p className="text-xs font-medium flex items-center text-muted-foreground">
              <Lock size={12} className="mr-2" />
              Site Sécurisé
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
