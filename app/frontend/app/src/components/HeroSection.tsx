import Link from "next/link";
import { Button } from "./ui/Button";
import { Sparkles } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-secondary/30 via-background to-accent/20 min-h-screen">
      <div className="container py-16 md:py-24 lg:py-32">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
          {/* Text Content */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              <span>Créations artisanales</span>
            </div>
            <h1 className="font-serif text-4xl font-bold tracking-tight text-balance sm:text-5xl md:text-6xl lg:text-7xl">
              Des accessoires <span className="text-primary">girly</span> et <span className="text-accent">utiles</span>
            </h1>
            <p className="text-lg text-muted-foreground text-pretty leading-relaxed max-w-xl">
              Découvrez nos créations uniques faites main avec amour. Chaque pièce est conçue pour sublimer votre style
              au quotidien.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="font-semibold">
                <Link href="/collections/nouveautes">Découvrir la collection</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="font-semibold bg-transparent">
                <Link href="/about">En savoir plus</Link>
              </Button>
            </div>
          </div>

          {/* Hero Image Grid */}
          <div className="relative grid grid-cols-2 gap-4 lg:gap-6">
            <div className="space-y-4 lg:space-y-6">
              <div className="glass-card aspect-square overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <span className="text-4xl">🍍</span>
              </div>
              <div className="glass-card aspect-[4/3] overflow-hidden bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                <span className="text-4xl">✨</span>
              </div>
            </div>
            <div className="space-y-4 lg:space-y-6 pt-8">
              <div className="glass-card aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                <span className="text-4xl">🌸</span>
              </div>
              <div className="glass-card aspect-square overflow-hidden bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
                <span className="text-4xl">⭐</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 -z-10 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
      <div className="absolute bottom-0 left-0 -z-10 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
    </section>
  )
}
