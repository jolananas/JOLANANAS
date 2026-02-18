import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { AddToCartButton } from "./AddToCartButton";
import { MockCartProvider } from "../../../.storybook/decorators/CartProviderDecorator";
import { Toaster } from "sonner";

/**
 * 🍍 JOLANANAS - AddToCartButton
 * ==============================
 * Bouton d'ajout au panier avec état de succès temporaire et retour visuel (Toast).
 */
const AddToCartWrapper = (Story: any) => (
  <MockCartProvider>
    <div className="p-12 max-w-sm mx-auto">
      <Story />
      <Toaster />
    </div>
  </MockCartProvider>
);

const meta: Meta<typeof AddToCartButton> = {
  title: "JOLANANAS/Feature/Product/AddToCartButton",
  component: AddToCartButton,
  decorators: [AddToCartWrapper],
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AddToCartButton>;

export const Default: Story = {
  args: {
    productId: "1",
    productTitle: "Bague Ananas",
    productHandle: "bague-ananas",
    productImage: "https://images.unsplash.com/photo-1588345921523-c2dcd57f7d60?w=400",
    productPrice: 45,
    variantId: "v1",
    availableForSale: true,
  },
};

export const OutOfStock: Story = {
  args: {
    ...Default.args,
    availableForSale: false,
  },
};
