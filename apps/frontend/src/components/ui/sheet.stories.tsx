import type { Meta, StoryObj } from "@storybook/react/dist/index";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "./sheet";
import { Button } from "./button";

const meta: Meta<typeof Sheet> = {
  title: "JOLANANAS/UI/Sheet",
  component: Sheet,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Sheet>;

export const Default: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Ouvrir le Panier</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Votre Panier 🍍</SheetTitle>
          <SheetDescription>
            Voici les articles que vous avez sélectionnés avec amour.
          </SheetDescription>
        </SheetHeader>
        <div className="py-12 text-center text-muted-foreground">
          Votre panier est vide pour le moment.
        </div>
      </SheetContent>
    </Sheet>
  ),
};

export const Left: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="secondary">Menu Latéral</Button>
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Accédez aux différentes sections du site.</SheetDescription>
        </SheetHeader>
        <div className="flex flex-col gap-4 py-8">
          <p className="cursor-pointer hover:text-jolananas-pink-medium">Accueil</p>
          <p className="cursor-pointer hover:text-jolananas-pink-medium">Collections</p>
          <p className="cursor-pointer hover:text-jolananas-pink-medium">Notre Histoire</p>
        </div>
      </SheetContent>
    </Sheet>
  ),
};

export const Top: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost">Haut de page</Button>
      </SheetTrigger>
      <SheetContent side="top">
        <SheetHeader>
          <SheetTitle>Informations Importantes</SheetTitle>
          <SheetDescription>Annonce de nouvelle collection !</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};

export const Bottom: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">Filtres</Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="h-[40vh]">
        <SheetHeader>
          <SheetTitle>Filtres de recherche</SheetTitle>
          <SheetDescription>Affinez votre sélection.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
};
