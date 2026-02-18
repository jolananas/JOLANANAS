import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { OrderStatusBadge } from "./OrderStatusBadge";

/**
 * 🍍 JOLANANAS - OrderStatusBadge
 * ===============================
 * Badge indiquant le statut d'une commande avec des couleurs et icônes adaptées.
 */
const meta: Meta<typeof OrderStatusBadge> = {
  title: "JOLANANAS/Feature/Account/OrderStatusBadge",
  component: OrderStatusBadge,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof OrderStatusBadge>;

export const Pending: Story = {
  args: {
    status: "PENDING",
  },
};

export const Processing: Story = {
  args: {
    status: "PROCESSING",
    animated: true,
  },
};

export const Shipped: Story = {
  args: {
    status: "SHIPPED",
  },
};

export const Delivered: Story = {
  args: {
    status: "DELIVERED",
  },
};

export const Cancelled: Story = {
  args: {
    status: "CANCELLED",
  },
};

export const Large: Story = {
  args: {
    status: "SUCCESS",
    size: "lg",
  },
};
