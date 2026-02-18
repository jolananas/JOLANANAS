import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

/**
 * 🍍 JOLANANAS - Tabs
 * ===================
 * Ensemble de panneaux de contenu superposés (onglets) affichés un à la fois.
 */
const meta: Meta<typeof Tabs> = {
  title: "JOLANANAS/UI/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">Compte</TabsTrigger>
        <TabsTrigger value="password">Mot de passe</TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        <div className="p-4 border rounded-md bg-white">
          <h3 className="text-lg font-medium">Paramètres du compte</h3>
          <p className="text-sm text-muted-foreground">Modifiez vos informations personnelles ici.</p>
        </div>
      </TabsContent>
      <TabsContent value="password">
        <div className="p-4 border rounded-md bg-white">
          <h3 className="text-lg font-medium">Sécurité</h3>
          <p className="text-sm text-muted-foreground">Mettez à jour votre mot de passe pour plus de sécurité.</p>
        </div>
      </TabsContent>
    </Tabs>
  ),
};
