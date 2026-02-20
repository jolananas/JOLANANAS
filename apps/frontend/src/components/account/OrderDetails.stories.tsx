import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { OrderDetails } from "./OrderDetails";

/**
 * 🍍 JOLANANAS - OrderDetails
 * ==============================
 * Auto-generated Storybook file for OrderDetails.
 */
const meta: Meta<typeof OrderDetails> = {
  title: "JOLANANAS/Account/OrderDetails",
  component: OrderDetails,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof OrderDetails>;

export const Default: Story = {
  args: {},
};
