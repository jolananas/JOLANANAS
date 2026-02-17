"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RetroGrid } from "@/components/ui/retro-grid";
import { ArrowLeft, RefreshCcw, Home, Search, Mail, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { PageContainer } from "@/components/layout/PageContainer";

interface ErrorLayoutProps {
  code: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  href?: string;
  showBack?: boolean;
  fullScreen?: boolean; // Nouvelle option pour usage dans les drawers/modales
}

export function ErrorLayout({
  code,
  title,
  description,
  actionLabel,
  onAction,
  href,
  showBack = true,
  fullScreen = true,
}: ErrorLayoutProps) {
  const router = useRouter();

  return (
    <div className={cn(
      "relative w-full flex flex-col items-center justify-center overflow-hidden bg-[#FEF7F0] font-sans",
      fullScreen ? "min-h-screen" : "min-h-[400px] py-12"
    )}>
      {/* 1. AMBIANCE */}
      <RetroGrid
        className="opacity-25"
        lightLineColor="#EC7B9C"
        darkLineColor="#EC7B9C"
      />

      {/* 1.5 LASER HEIST SCENE */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none perspective-[1000px] opacity-50">
        <div className="relative w-full h-full transform-gpu">
          {/* Laser lines */}
          <Laser lineStyle={{ top: '20%', left: '-10%', width: '120%', height: '1px', transform: 'rotate(15deg) translateZ(100px)' }} />
          <Laser lineStyle={{ top: '60%', left: '-10%', width: '120%', height: '1px', transform: 'rotate(-25deg) translateZ(-50px)' }} />
          <Laser lineStyle={{ top: '40%', left: '-20%', width: '140%', height: '1px', transform: 'rotate(5deg) translateZ(200px)' }} />
          <Laser lineStyle={{ top: '80%', left: '-10%', width: '120%', height: '1px', transform: 'rotate(12deg) translateZ(50px)' }} />
          <Laser lineStyle={{ top: '0%',  left: '70%',  width: '100%', height: '1px', transform: 'rotate(90deg) translateZ(-100px)' }} />
        </div>
      </div>

      {/* 2. LE CHIFFRE GÉANT (Interactif maintenant) */}
      <div className="absolute inset-0 flex items-center justify-center select-none z-05">
        <span className="text-[35vw] font-serif font-black text-primary/5 leading-none tracking-tighter mix-blend-multiply transition-colors animate-glitch">
          {code}
        </span>
      </div>

      {/* 3. CONTENU CENTRAL */}
      <PageContainer className="relative z-10 flex flex-col items-center text-center space-y-10 max-w-2xl px-6 animate-in fade-in zoom-in duration-700 slide-in-from-bottom-10">
        {/* Badge Système */}
        <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-black/5 bg-white/50 backdrop-blur-md shadow-sm">
          <span className="w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]" />
          <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-primary">
            System Alert • {code}
          </span>
        </div>

        {/* Textes Éditoriaux */}
        <div className="space-y-6">
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-primary uppercase leading-[0.9]">
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
              className="w-full sm:w-auto h-14 rounded-full border-2 border-primary/10 backdrop-blur-md hover:border-primary text-primary transition-all hover:scale-105 active:scale-95"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              RETOUR
            </Button>
          )}
        </div>
      </PageContainer>

      {/* 4. NAVIGATION DE SECOURS (Footer flottant) */}
      <div className="absolute bottom-12 left-0 right-0 flex justify-center z-20">
        <div className="flex items-center gap-2 sm:gap-6 px-6 py-3 bg-white/75 backdrop-blur-md rounded-full border border-primary/5 shadow-md mx-4">
          <QuickLink href="/" icon={Home} label="Accueil" />
          <div className="w-px h-4 bg-primary/10" />
          <QuickLink href="/collections" icon={Search} label="Collections" />
          <div className="w-px h-4 bg-primary/10" />
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

// Sous-composant Laser
function Laser({ lineStyle }: { lineStyle: React.CSSProperties }) {
  return (
    <div
      className="absolute h-[1px] bg-primary animate-laser-flicker"
      style={{
        boxShadow: "0 0 8px #ff0000, 0 0 12px #ff0000",
        ...lineStyle,
      }}
    />
  );
}
