import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { Footer } from "./Footer";

/**
 * 🍍 JOLANANAS - Footer
 * ====================
 * Pied de page global contenant la newsletter, les liens de navigation, 
 * les réseaux sociaux et les logos de paiement.
 */
const meta: Meta<typeof Footer> = {
  title: "JOLANANAS/Layout/Footer",
  component: Footer,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Footer>;

export const Default: Story = {};
