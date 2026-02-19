import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Espace Presse | JOLANANAS",
  description: "Informations, visuels et contacts pour les journalistes et blogueurs souhaitant parler de JOLANANAS.",
};

export default function PressePage() {
  return (
    <PageContainer className="container mx-auto px-4 py-32 max-w-4xl">
      {/* Hero */}
      <div className="text-center mb-20">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-6">
          Espace Presse
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Vous êtes journaliste, blogueur ou créateur de contenu et souhaitez parler de JOLANANAS ?
          Nous serions ravis d'en discuter avec vous.
        </p>
      </div>

      {/* Brand story */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-20 items-center">
        <div className="space-y-4">
          <h2 className="text-2xl font-serif font-semibold">Notre histoire</h2>
          <p className="text-muted-foreground leading-relaxed">
            JOLANANAS est née d'une passion pour l'artisanat et la singularité. 
            Fondée en France, la marque crée des bijoux et accessoires faits à la 
            main qui mêlent fantaisie, élégance et durabilité.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Chaque pièce est pensée comme une œuvre unique, façonnée avec des 
            matériaux soigneusement sélectionnés et des techniques artisanales 
            transmises avec passion.
          </p>
        </div>

        <div className="bg-primary/5 rounded-3xl p-8 space-y-6">
          <h3 className="font-semibold text-lg">Chiffres clés</h3>
          <div className="grid grid-cols-2 gap-6">
            {[
              { value: "100%", label: "Fait main" },
              { value: "🇫🇷", label: "Créé en France" },
              { value: "0", label: "Déchet de production" },
              { value: "♾️", label: "Pièces personnalisables" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Contact */}
      <div className="bg-card border border-border rounded-3xl p-8 md:p-12 text-center space-y-6">
        <h2 className="text-2xl font-serif font-semibold">Contact Presse</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Pour toute demande de partenariat, interview, kit presse ou visuels haute définition, 
          utilisez notre formulaire de contact.
        </p>
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href="/contact">Nous contacter</Link>
        </Button>
        <p className="text-xs text-muted-foreground pt-2">
          Nous répondons sous 48h ouvrées.
        </p>
      </div>
    </PageContainer>
  );
}
