"use client";

import React from "react";
import { Star, CheckCircle2, Heart, ShieldCheck, MapPin } from "lucide-react";
import { siInstagram } from "simple-icons";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const commitments = [
  {
    id: 1,
    title: "Fait Main à Albi",
    content: "Chaque création est réalisée avec soin dans mon petit atelier tarnais. Un artisanat local, loin de la production de masse.",
    icon: <MapPin className="text-primary" size={35} />,
    tag: "Artisanat Local"
  },
  {
    id: 2,
    title: "Pièces avec une Âme",
    content: "Je privilégie les petites séries et les pièces uniques. Chez Jolananas, aucun accessoire n'est tout à fait identique au suivant.",
    icon: <Heart className="text-secondary" size={35} />,
    tag: "Authenticité"
  },
  {
    id: 3,
    title: "Qualité & Confiance",
    content: "Paiements sécurisés et livraison soignée. Je m'engage personnellement à ce que votre expérience soit aussi douce que mes créations.",
    icon: <ShieldCheck className="text-green-500" size={35} />,
    tag: "Engagement"
  }
];

export function SocialProofSection({ className }: { className?: string }) {
  return (
    <section className={cn("py-24 bg-[#FEF7F0]", className)}>
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8 text-center md:text-left">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-serif font-black tracking-tighter uppercase leading-tight">
              L'engagement <br />
              <span className="text-primary italic">Jolananas.</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-md font-medium">
              Parce que derrière chaque objet se cache une passion, un temps précieux et une envie de bien faire.
            </p>
          </div>

          <div className="flex flex-col items-center md:items-end gap-4 bg-white/40 backdrop-blur-md border border-black/5 p-8 rounded-3xl shadow-sm">
            <div className="text-center md:text-right">
              <p className="text-sm font-bold uppercase tracking-widest text-black/40 mb-1">Rejoignez l'aventure</p>
              <p className="text-2xl font-serif font-black">@jolananas.officiel</p>
            </div>
            <Button 
              variant="outline" 
              className="rounded-full border-black/10 hover:bg-primary hover:text-white transition-all flex items-center gap-2"
              asChild
            >
              <a href="https://www.instagram.com/jolananas.officiel/" target="_blank" rel="noopener noreferrer">
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-primary fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>{siInstagram.title}</title>
                  <path d={siInstagram.path} />
                </svg>
                Voir les coulisses
              </a>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {commitments.map((item) => (
            <div 
              key={item.id}
              className="group relative bg-white border border-black/5 p-8 rounded-3xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 flex flex-col items-center text-center md:items-start md:text-left"
            >
              <div className="mb-6">
                {item.icon}
              </div>
              
              <div className="space-y-3 mb-8">
                <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-primary/60">
                  {item.tag}
                </span>
                <h3 className="text-xl font-serif font-black uppercase tracking-tight">
                  {item.title}
                </h3>
                <p className="text-black/60 font-medium leading-relaxed">
                  {item.content}
                </p>
              </div>

              <div className="mt-auto w-full pt-6 border-t border-black/5 flex items-center justify-center md:justify-start gap-2">
                <CheckCircle2 size={14} className="text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Engagement Jolananas</span>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 p-10 bg-white/60 backdrop-blur-sm border border-black/5 rounded-[3rem] shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:bg-primary/10 transition-colors duration-700" />
          
          <div className="relative flex flex-col md:flex-row items-center gap-10">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden border-4 border-white shadow-lg flex-shrink-0 bg-secondary/10 flex items-center justify-center font-serif text-3xl font-black text-primary">
              JM
            </div>
            
            <div className="space-y-4 text-center md:text-left">
              <p className="text-xl md:text-2xl font-serif italic text-black/80 leading-relaxed">
                "Jolananas est né de mon envie de créer des objets qui ont une âme. Ici, pas d'usine, juste mes mains, du temps et beaucoup d'amour. Merci de soutenir ce rêve artisanal dès ses premiers pas."
              </p>
              <div className="pt-2">
                <h4 className="font-serif font-black uppercase tracking-tighter text-lg">Joanna M.</h4>
                <p className="text-secondary text-xs font-bold uppercase tracking-widest">Créatrice & Fondatrice</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
