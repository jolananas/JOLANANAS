import React from "react";
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
          <ContactForm />
        </div>
      </div>
    </PageContainer>
  );
}

function ContactForm() {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = React.useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = React.useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    setErrorMessage("");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", subject: "", message: "" });
      } else {
        setStatus("error");
        setErrorMessage(data.error || "Une erreur est survenue.");
      }
    } catch (error) {
      setStatus("error");
      setErrorMessage("Impossible d'envoyer le message. Veuillez réessayer.");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center py-12 space-y-4 animate-in fade-in zoom-in">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-2xl font-bold text-gray-900">Message envoyé !</h3>
        <p className="text-gray-600">
          Merci de nous avoir contactés. Nous reviendrons vers vous très vite.
        </p>
        <Button 
          variant="outline" 
          onClick={() => setStatus("idle")}
          className="mt-6"
        >
          Envoyer un autre message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {status === "error" && (
        <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
          {errorMessage}
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Nom
          </label>
          <Input 
            id="name" 
            placeholder="Votre nom" 
            required 
            value={formData.name}
            onChange={handleChange}
            disabled={status === "loading"}
          />
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
            value={formData.email}
            onChange={handleChange}
            disabled={status === "loading"}
          />
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="subject" className="text-sm font-medium">
          Sujet
        </label>
        <Input 
          id="subject" 
          placeholder="À propos de..." 
          required 
          value={formData.subject}
          onChange={handleChange}
          disabled={status === "loading"}
        />
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
          value={formData.message}
          onChange={handleChange}
          disabled={status === "loading"}
        />
      </div>

      <Button 
        type="submit" 
        className="w-full" 
        variant="cta"
        disabled={status === "loading"}
      >
        {status === "loading" ? "Envoi en cours..." : "Envoyer le message"}
      </Button>
    </form>
