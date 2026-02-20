import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { CartItem } from "./CartItem";

/**
 * 🍍 JOLANANAS - CartItem
 * ==============================
 * Auto-generated Storybook file for CartItem.
 */
const meta: Meta<typeof CartItem> = {
  title: "JOLANANAS/Ecommerce/CartItem",
  component: CartItem,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof CartItem>;

export const Default: Story = {
  args: {},
};
