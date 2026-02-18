import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { CartSheet } from "./CartSheet";
import { MockCartProvider } from "../../../.storybook/decorators/CartProviderDecorator";

/**
 * 🍍 JOLANANAS - CartSheet
 * =======================
 * Panneau latéral affichant le contenu du panier, permettant de modifier les quantités 
 * et de passer à la caisse.
 */
const CartSheetWrapper = (Story: any) => (
  <MockCartProvider>
    <div className="flex justify-center p-12">
      <Story />
    </div>
  </MockCartProvider>
);

const meta: Meta<typeof CartSheet> = {
  title: "JOLANANAS/Feature/CartSheet",
  component: CartSheet,
  decorators: [CartSheetWrapper],
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CartSheet>;

export const Default: Story = {};
