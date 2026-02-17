import Image from "next/image";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";

export const metadata = {
  title: "Notre Histoire | JOLANANAS",
};

export default function AboutPage() {
  return (
    <div className="bg-[#FEF7F0]">
      <PageContainer>
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-32 text-center">
          <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 text-primary">
            L'histoire <span className="text-primary">Jolananas</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Plus qu'une marque, une passion pour le fait-main et l'authenticité.
          </p>
        </div>

        {/* Content Section */}
        <div className="container mx-auto px-4 pb-24">
          <div className="grid md:grid-cols-2 gap-12 items-center bg-white p-8 md:p-12 rounded-2xl shadow-sm border border-border">
            <div className="relative aspect-[4/5] rounded-xl overflow-hidden">
              {/* Remplacer par une photo de Joanna ou de l'atelier */}
              <div className="absolute inset-0 bg-secondary/20 flex items-center justify-center text-muted-foreground">
                <span className="italic">Photo Atelier / Créatrice</span>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl font-serif font-bold">
                L'Artisanat au cœur
              </h2>
              <div className="prose text-muted-foreground space-y-4">
                <p>
                  Tout a commencé par une envie simple : créer des objets uniques
                  qui ont une âme. Chez Jolananas, chaque pièce est imaginée,
                  dessinée et conçue avec une attention particulière aux détails.
                </p>
                <p>
                  Nous croyons en une mode plus lente, plus respectueuse et plus
                  personnelle. Nos collections sont produites en petites séries
                  pour garantir une qualité irréprochable et une exclusivité à
                  celles et ceux qui les portent.
                </p>
              </div>

              <div className="pt-4">
                <Link href="/collections">
                  <Button variant="cta" size="lg">
                    Découvrir nos créations
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}
