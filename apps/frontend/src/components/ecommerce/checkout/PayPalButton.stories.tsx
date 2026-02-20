import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { PayPalButton } from "./PayPalButton";

/**
 * 🍍 JOLANANAS - PayPalButton
 * ==============================
 * Auto-generated Storybook file for PayPalButton.
 */
const meta: Meta<typeof PayPalButton> = {
  title: "JOLANANAS/Ecommerce/PayPalButton",
  component: PayPalButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PayPalButton>;

export const Default: Story = {
  args: {},
};
