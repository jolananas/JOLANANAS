import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { ArrowRight, Heart, Scissors, Sparkles } from "lucide-react";

export const metadata = {
  title: "Notre Histoire | JOLANANAS",
  description: "Découvrez l'histoire de Jolananas, une marque passionnée par le fait-main, l'authenticité et les accessoires qui pop ! ✨",
};

export default function AboutPage() {
  return (
    <div className="bg-[#FEF7F0] min-h-screen selection:bg-primary/20">
      <PageContainer>
        <section className="container mx-auto px-4 pt-32 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm mb-6 ring-1 ring-primary/20">
            <Sparkles className="w-4 h-4" />
            <span>Fait avec amour (et beaucoup de café ☕)</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 text-secondary tracking-tight">
            Coucou, c'est <span className="text-primary italic">Joanna</span>{" "}
            de <span className="text-primary italic">Jolananas</span> 👋
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed text-balance">
            Ici, on ne rigole pas avec le style. Des accessoires qui claquent, imaginés pour pimper votre quotidien. Tout ça, fait à la main.
          </p>
        </section>

        <section className="container mx-auto px-4 pb-24">
          <div className="bg-white p-8 md:p-12 lg:p-16 rounded-[2.5rem] shadow-sm border border-border/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 -translate-y-12 translate-x-12 w-64 h-64 bg-[#FCD5CE]/20 rounded-full blur-3xl opacity-60" />
            
            <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center relative z-10">
              
              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden group shadow-md ring-1 ring-border/50">
                <div className="absolute inset-0 bg-secondary/5 group-hover:bg-transparent transition-colors duration-500 z-10 pointer-events-none" />
                <Image
                  src="/images/about-atelier.jpg"
                  alt="L'atelier Jolananas"
                  fill
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute inset-0 bg-[#FEF7F0] flex flex-col items-center justify-center text-secondary/50 -z-10">
                  <Scissors className="w-12 h-12 mb-4 opacity-50" />
                  <span className="font-serif italic text-lg px-4 text-center">En direct de l'atelier<br/>(Ça coud dur ! 🪡)</span>
                </div>
              </div>

              <article className="space-y-8">
                <div>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-secondary mb-6">
                    La petite histoire...
                  </h2>
                  <div className="prose prose-lg text-muted-foreground space-y-4">
                    <p>
                      <strong className="text-primary">Jolananas</strong>, c'est l'histoire d'une machine à coudre, de (vraiment) beaucoup de tissus colorés, et d'une envie folle : vous proposer des accessoires qui donnent le smile. ✨
                    </p>
                    <p>
                      Oubliez la fast-fashion. Chaque création qui sort de notre atelier a été imaginée, coupée et bichonnée avec une attention maniaque aux détails. 
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-border/40">
                   <div className="space-y-3">
                     <div className="w-12 h-12 flex items-center justify-center text-primary">
                       <Heart className="w-12 h-12" />
                     </div>
                     <h3 className="font-bold text-primary text-lg">100% Fait-main</h3>
                     <p className="text-sm text-muted-foreground leading-relaxed">Artisanal, authentique et zéro compromis sur la qualité.</p>
                   </div>
                   <div className="space-y-3">
                     <div className="w-12 h-12 flex items-center justify-center text-secondary">
                       <Scissors className="w-12 h-12" />
                     </div>
                     <h3 className="font-bold text-secondary text-lg">Petites séries</h3>
                     <p className="text-sm text-muted-foreground leading-relaxed">Des éditions limitées, parce que vous êtes unique (et nos tissus aussi).</p>
                   </div>
                </div>

                <div className="pt-8 flex flex-col items-start">
                  <Link href="/collections" className="group">
                    <Button variant="cta" size="lg" className="rounded-full px-8 text-base shadow-sm font-medium">
                      Shopper les pépites 🛍️
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-2 transition-transform duration-300" />
                    </Button>
                  </Link>
                  <p className="text-xs text-muted-foreground mt-4 italic flex items-center gap-1.5 opacity-80">
                    <span className="block w-1.5 h-1.5 rounded-full bg-primary/50" />
                    Risque d'addiction élevé aux jolis motifs. Vous êtes prévenu(e).
                  </p>
                </div>
              </article>

            </div>
          </div>
        </section>
      </PageContainer>
    </div>
  );
}
