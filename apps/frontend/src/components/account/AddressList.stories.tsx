import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { AddressList } from "./AddressList";

/**
 * 🍍 JOLANANAS - AddressList
 * ==========================
 * Gestionnaire d'adresses de livraison et de facturation pour l'utilisateur.
 */
const meta: Meta<typeof AddressList> = {
  title: "JOLANANAS/Feature/Account/AddressList",
  component: AddressList,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AddressList>;

export const Default: Story = {
  render: () => (
    <div className="w-[800px] border p-8 bg-white rounded-xl">
      <AddressList />
    </div>
  ),
};
