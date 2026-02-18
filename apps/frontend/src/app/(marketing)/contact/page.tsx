import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin } from "lucide-react";
import { PageContainer } from "@/components/layout/PageContainer";
import { siInstagram } from "simple-icons";

export const metadata = {
  title: "Contactez-nous | JOLANANAS",
};

export default function ContactPage() {
  return (
    <PageContainer className="container mx-auto px-4 py-32 max-w-5xl">
      <h1 className="text-4xl font-serif font-bold text-center mb-12">
        Contactez-nous
      </h1>

      <div className="grid md:grid-cols-2 gap-12 lg:gap-24">
        {/* Informations */}
        <div className="space-y-8">
          <div>
            <h3 className="text-xl font-bold mb-4">
              Nous sommes à votre écoute
            </h3>
            <p className="text-muted-foreground">
              Une question sur une commande ? Une demande de personnalisation ?
              N'hésitez pas à nous écrire, nous vous répondrons sous 24h.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <p className="font-medium">Email</p>
                <a
                  href="mailto:contact@jolananas.com"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  contact@jolananas.com
                </a>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <svg
                  role="img"
                  viewBox="0 0 24 24"
                  className="w-5 h-5 text-primary fill-current"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <title>{siInstagram.title}</title>
                  <path d={siInstagram.path} />
                </svg>
              </div>
              <div>
                <p className="font-medium">Instagram</p>
                <a
                  href="https://instagram.com/jolananas.officiel"
                  target="_blank"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  @jolananas.officiel
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Formulaire Simplifié */}
        <div className="bg-white p-8 rounded-xl border border-border shadow-sm">
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">
                  Nom
                </label>
                <Input id="name" placeholder="Votre nom" required />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="subject" className="text-sm font-medium">
                Sujet
              </label>
              <Input id="subject" placeholder="À propos de..." required />
            </div>

            <div className="space-y-2">
              <label htmlFor="message" className="text-sm font-medium">
                Message
              </label>
              <Textarea
                id="message"
                placeholder="Votre message..."
                className="min-h-[120px]"
                required
              />
            </div>

            <Button type="submit" className="w-full" variant="cta">
              Envoyer le message
            </Button>
          </form>
        </div>
      </div>
    </PageContainer>
  );
}
