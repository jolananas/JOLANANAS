import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { Alert, AlertTitle, AlertDescription } from "./alert";
import { Terminal, AlertCircle, ShoppingBag, Info, ShieldCheck, AlertTriangle } from "lucide-react";

/**
 * 🍍 JOLANANAS - Alert
 * ====================
 * Composant d'alerte pour afficher des messages importants.
 * Supporte plusieurs variantes : default, destructive, promotion, info, warning, success.
 */
const meta: Meta<typeof Alert> = {
  title: "JOLANANAS/UI/Alert",
  component: Alert,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "destructive", "promotion", "info", "warning", "success"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

export const Default: Story = {
  args: {
    variant: "default",
  },
  render: (args) => (
    <div className="w-[450px]">
      <Alert {...args}>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          You can add components to your app using the cli.
        </AlertDescription>
      </Alert>
    </div>
  ),
};

export const Promotion: Story = {
  args: {
    variant: "promotion",
  },
  render: (args) => (
    <div className="w-[450px]">
      <Alert {...args}>
        <ShoppingBag className="h-4 w-4" />
        <AlertTitle>Offre Spéciale !</AlertTitle>
        <AlertDescription>
          Profitez de -10% sur votre première commande avec le code **WELCOME10**.
        </AlertDescription>
      </Alert>
    </div>
  ),
};

export const Information: Story = {
  args: {
    variant: "info",
  },
  render: (args) => (
    <div className="w-[450px]">
      <Alert {...args}>
        <Info className="h-4 w-4" />
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          La livraison est offerte à partir de 50€ d'achat.
        </AlertDescription>
      </Alert>
    </div>
  ),
};

export const Success: Story = {
  args: {
    variant: "success",
  },
  render: (args) => (
    <div className="w-[450px]">
      <Alert {...args}>
        <ShieldCheck className="h-4 w-4" />
        <AlertTitle>Succès</AlertTitle>
        <AlertDescription>
          Votre profil a été mis à jour avec succès.
        </AlertDescription>
      </Alert>
    </div>
  ),
};

export const Warning: Story = {
  args: {
    variant: "warning",
  },
  render: (args) => (
    <div className="w-[450px]">
      <Alert {...args}>
        <AlertTriangle className="h-4 w-4" />
        <AlertTitle>Attention</AlertTitle>
        <AlertDescription>
          L'envoi de votre commande peut prendre un peu plus de temps que prévu.
        </AlertDescription>
      </Alert>
    </div>
  ),
};

export const Destructive: Story = {
  args: {
    variant: "destructive",
  },
  render: (args) => (
    <div className="w-[450px]">
      <Alert {...args}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          Une erreur est survenue lors du paiement. Veuillez réessayer.
        </AlertDescription>
      </Alert>
    </div>
  ),
};
