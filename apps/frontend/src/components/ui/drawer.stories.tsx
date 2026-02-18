import type { Meta, StoryObj } from "@storybook/react/dist/index";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./drawer";
import { Button } from "./button";

/**
 * 🍍 JOLANANAS - Drawer
 * =====================
 * Panneau coulissant (généralement depuis le bas sur mobile) inspiré des patterns natifs.
 */
const meta: Meta<typeof Drawer> = {
  title: "JOLANANAS/UI/Drawer",
  component: Drawer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  render: () => (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">Ouvrir le Tiroir</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Paramètres d'affichage</DrawerTitle>
            <DrawerDescription>Configurez vos préférences visuelles.</DrawerDescription>
          </DrawerHeader>
          <div className="p-4 pb-0">
             <div className="flex items-center justify-center space-x-2">
                <p className="text-sm text-muted-foreground">Contenu vide pour la démo.</p>
             </div>
          </div>
          <DrawerFooter>
            <Button>Soumettre</Button>
            <DrawerClose asChild>
              <Button variant="outline">Annuler</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  ),
};
