"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RetroGrid } from "@/components/ui/retro-grid";
import { ArrowLeft, RefreshCcw, Home, Search, Mail, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

interface ErrorLayoutProps {
  code: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  href?: string;
  showBack?: boolean; // Nouvelle option
}

export function ErrorLayout({
  code,
  title,
  description,
  actionLabel,
  onAction,
  href,
  showBack = true,
}: ErrorLayoutProps) {
  const router = useRouter();

  const handleCopyCode = () => {
    navigator.clipboard.writeText(`Erreur ${code} - Jolananas`);
    toast.success("Code erreur copié pour le support");
  };

  return (
    <div className="relative w-full min-h-screen flex flex-col items-center justify-center overflow-hidden bg-[#FEF7F0] font-sans">
      {/* 1. AMBIANCE */}
      <RetroGrid
        className="opacity-25"
        lightLineColor="#EC7B9C"
        darkLineColor="#EC7B9C"
      />

      {/* 2. LE CHIFFRE GÉANT (Interactif maintenant) */}
      <div
        onClick={handleCopyCode}
        className="absolute inset-0 flex items-center justify-center select-none z-0 cursor-help group"
        title="Copier le code erreur"
      >
        <span className="text-[35vw] font-serif font-black text-primary/5 leading-none tracking-tighter mix-blend-multiply transition-colors group-hover:text-primary/10">
          {code}
        </span>
        <Copy className="absolute opacity-0 group-hover:opacity-20 w-12 h-12 text-primary transition-opacity" />
      </div>

      {/* 3. CONTENU CENTRAL */}
      <div className="relative z-10 flex flex-col items-center text-center space-y-10 max-w-2xl px-6 animate-in fade-in zoom-in duration-700 slide-in-from-bottom-10">
        {/* Badge Système */}
        <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-black/5 bg-white/60 backdrop-blur-md shadow-sm">
          <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">
            System Alert • {code}
          </span>
        </div>

        {/* Textes Éditoriaux */}
        <div className="space-y-6">
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-foreground uppercase leading-[0.9]">
            {title}
          </h1>
          <p className="text-lg sm:text-2xl text-primary font-serif italic max-w-lg mx-auto">
            {description}
          </p>
        </div>

        {/* Zone d'Actions (Double Boutons) */}
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center items-center">
          {/* Bouton Principal (Action Spécifique) */}
          {actionLabel &&
            (href || onAction) &&
            (href ? (
              <Link href={href} className="w-full sm:w-auto">
                <ActionButton label={actionLabel} />
              </Link>
            ) : (
              <div onClick={onAction} className="w-full sm:w-auto">
                <ActionButton label={actionLabel} icon={RefreshCcw} />
              </div>
            ))}

          {/* Bouton Retour (Secondaire) */}
          {showBack && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => router.back()}
              className="w-full sm:w-auto h-14 rounded-full border-2 border-black/10 bg-transparent hover:bg-white hover:border-black text-black transition-all hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              RETOUR
            </Button>
          )}
        </div>
      </div>

      {/* 4. NAVIGATION DE SECOURS (Footer flottant) */}
      <div className="absolute bottom-12 left-0 right-0 flex justify-center z-20">
        <div className="flex items-center gap-2 sm:gap-6 px-6 py-3 bg-white/80 backdrop-blur-md rounded-full border border-black/5 shadow-lg mx-4">
          <QuickLink href="/" icon={Home} label="Accueil" />
          <div className="w-px h-4 bg-black/10" />
          <QuickLink href="/collections" icon={Search} label="Collections" />
          <div className="w-px h-4 bg-black/10" />
          <QuickLink href="/contact" icon={Mail} label="Aide" />
        </div>
      </div>

      {/* Toast Notifications - Inclus ici car les pages d'erreur ne passent pas par LayoutWrapper */}
      <Toaster position="top-center" richColors />
    </div>
  );
}

// Sous-composant Bouton "Chrome"
function ActionButton({ label, icon: Icon }: { label: string; icon?: any }) {
  return (
    <Button
      size="lg"
      className="group relative w-full sm:w-auto h-14 px-8 rounded-full bg-black text-white hover:bg-primary transition-all duration-500 shadow-xl hover:scale-105 active:scale-95 overflow-hidden border-2 border-transparent"
      style={{
        backgroundImage:
          "linear-gradient(#000, #000), linear-gradient(90deg, #EC7B9C, #F4C0AC, #ffffff, #EC7B9C)",
        backgroundOrigin: "padding-box, border-box",
        backgroundClip: "padding-box, border-box",
        backgroundSize: "100% 100%, 200% 100%",
      }}
    >
      <div
        className="absolute inset-0 animate-shine [background-size:200%_100%]"
        style={{
          backgroundImage: "inherit",
          backgroundOrigin: "inherit",
          backgroundClip: "inherit",
        }}
      />
      <span className="relative flex items-center justify-center gap-3 z-10 text-sm font-bold uppercase tracking-widest">
        {Icon && (
          <Icon className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        )}
        {label}
      </span>
    </Button>
  );
}

// Sous-composant Lien Rapide
function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: any;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2 px-2 py-1 text-sm font-medium text-muted-foreground hover:text-black transition-colors rounded-md hover:bg-black/5 active:scale-95"
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </Link>
  );
}
