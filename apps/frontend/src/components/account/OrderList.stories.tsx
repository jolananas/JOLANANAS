import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { OrderList } from "./OrderList";

/**
 * 🍍 JOLANANAS - OrderList
 * ========================
 * Liste paginée et filtrable des commandes de l'utilisateur.
 */
const meta: Meta<typeof OrderList> = {
  title: "JOLANANAS/Feature/Account/OrderList",
  component: OrderList,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof OrderList>;

export const Default: Story = {
  render: () => (
    <div className="w-[800px] border p-8 bg-white rounded-xl">
      <OrderList />
    </div>
  ),
};
