import type { Meta, StoryObj } from "@storybook/react/dist/index";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Label } from "./label";

/**
 * 🍍 JOLANANAS - Dialog
 * =====================
 * Fenêtre modale superposée à la page principale pour capturer l'attention de l'utilisateur.
 */
const meta: Meta<typeof Dialog> = {
  title: "JOLANANAS/UI/Dialog",
  component: Dialog,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Modifier le Profil</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier le Profil</DialogTitle>
          <DialogDescription>
            Apportez des modifications à votre profil ici. Cliquez sur enregistrer lorsque vous avez terminé.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nom
            </Label>
            <Input id="name" value="Aïssa B." className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Pseudo
            </Label>
            <Input id="username" value="@aissa" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Enregistrer les modifications</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};

export const CustomClose: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Voir l'offre</Button>
      </DialogTrigger>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Offre Exclusive</DialogTitle>
          <DialogDescription>
            Cette offre expire dans 2 heures. Ne la manquez pas !
          </DialogDescription>
        </DialogHeader>
        <div className="py-6 text-center text-4xl font-bold text-jolananas-pink-medium">
          -25% FLASH
        </div>
        <DialogFooter>
          <Button className="w-full">En profiter maintenant</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
