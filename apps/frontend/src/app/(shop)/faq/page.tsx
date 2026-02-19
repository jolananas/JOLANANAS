import type { Metadata } from "next";
import { PageContainer } from "@/components/layout/PageContainer";

export const metadata: Metadata = {
  title: "FAQ – Questions fréquentes | JOLANANAS",
  description: "Retrouvez les réponses à vos questions sur nos créations, la livraison, les retours et le service client.",
};

const faqs = [
  {
    question: "Quels matériaux utilisez-vous pour vos créations ?",
    answer:
      "Nous privilégions des matériaux nobles et durables : résines naturelles, métaux recyclés, fibres végétales. Chaque création est fabriquée à la main dans notre atelier en France.",
  },
  {
    question: "Quels sont les délais de livraison ?",
    answer:
      "Les commandes sont expédiées sous 2 à 5 jours ouvrés. La livraison en France métropolitaine prend généralement 2 à 3 jours supplémentaires. Vous recevrez un email de tracking dès l'expédition.",
  },
  {
    question: "Puis-je retourner un article ?",
    answer:
      "Oui, vous disposez de 14 jours à compter de la réception pour retourner un article non personnalisé dans son état d'origine. Consultez notre page Retours pour les détails.",
  },
  {
    question: "Proposez-vous des créations sur mesure ?",
    answer:
      "Absolument ! Nous adorons les projets sur mesure. Contactez-nous via le formulaire de contact pour nous décrire votre projet et nous vous répondrons sous 48h.",
  },
  {
    question: "Comment entretenir mes bijoux Jolananas ?",
    answer:
      "Évitez le contact prolongé avec l'eau, les parfums et produits cosmétiques. Rangez vos bijoux dans une pochette hermétique. Pour les nettoyer, utilisez un chiffon doux légèrement humide.",
  },
  {
    question: "Proposez-vous des coffrets cadeaux ?",
    answer:
      "Oui ! Toutes nos commandes sont emballées avec soin dans un coffret cadeau réutilisable. Vous pouvez également ajouter un message personnalisé lors de votre commande.",
  },
  {
    question: "Je n'ai pas reçu ma commande, que faire ?",
    answer:
      "Vérifiez d'abord l'email de tracking que vous avez reçu. Si votre commande est en retard de plus de 7 jours, contactez notre service client via la page Contact – nous résoudrons ça rapidement.",
  },
];

export default function FaqPage() {
  return (
    <PageContainer className="container mx-auto px-4 py-32 max-w-3xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
          Questions fréquentes
        </h1>
        <p className="text-lg text-muted-foreground">
          Vous ne trouvez pas votre réponse ?{" "}
          <a href="/contact" className="text-primary underline underline-offset-4">
            Contactez-nous
          </a>
        </p>
      </div>

      <div className="space-y-6">
        {faqs.map((faq, i) => (
          <div
            key={i}
            className="bg-card border border-border rounded-2xl p-6 hover:border-primary/30 transition-colors duration-200"
          >
            <h2 className="font-semibold text-lg mb-3">{faq.question}</h2>
            <p className="text-muted-foreground leading-relaxed">{faq.answer}</p>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
