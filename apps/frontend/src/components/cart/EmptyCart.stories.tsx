import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { EmptyCart } from "./EmptyCart";

/**
 * 🍍 JOLANANAS - EmptyCart
 * ==============================
 * Auto-generated Storybook file for EmptyCart.
 */
const meta: Meta<typeof EmptyCart> = {
  title: "JOLANANAS/Cart/EmptyCart",
  component: EmptyCart,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof EmptyCart>;

export const Default: Story = {
  args: {},
};
