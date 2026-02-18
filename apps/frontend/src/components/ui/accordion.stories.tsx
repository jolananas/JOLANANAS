import type { Meta, StoryObj } from "@storybook/react/dist/index";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "./accordion";

/**
 * 🍍 JOLANANAS - Accordion
 * =======================
 * Composant d'accordéon basé sur Radix UI.
 * Utilisé pour afficher du contenu de manière pliable.
 */
const meta: Meta<typeof Accordion> = {
  title: "JOLANANAS/UI/Accordion",
  component: Accordion,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Accordion>;

export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-[400px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Est-ce que c'est artisanal ?</AccordionTrigger>
        <AccordionContent>
          Oui, toutes nos pièces JOLANANAS sont créées à la main avec amour dans notre atelier.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Quels sont les délais de livraison ?</AccordionTrigger>
        <AccordionContent>
          Les délais varient entre 3 et 5 jours ouvrés pour la France métropolitaine.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Puis-je retourner ma commande ?</AccordionTrigger>
        <AccordionContent>
          Bien sûr ! Vous avez 14 jours pour nous retourner votre pièce si elle ne vous convient pas.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" className="w-[400px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Point de livraison 1</AccordionTrigger>
        <AccordionContent>
          Disponible du lundi au vendredi.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Point de livraison 2</AccordionTrigger>
        <AccordionContent>
          Disponible le samedi matin.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};
