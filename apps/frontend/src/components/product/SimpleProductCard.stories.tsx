import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { SimpleProductCard } from "./SimpleProductCard";
import ShopifyDataDecorator from "../../../.storybook/decorators/ShopifyDataDecorator";

/**
 * 🍍 JOLANANAS - SimpleProductCard
 * ================================
 * Version alternative et épurée de la carte produit, utilisant EnhancedCard pour des effets visuels premiums.
 */
const meta: Meta<typeof SimpleProductCard> = {
  title: "JOLANANAS/Feature/Product/SimpleProductCard",
  component: SimpleProductCard,
  decorators: [ShopifyDataDecorator],
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SimpleProductCard>;

const mockProduct = {
  id: "1",
  title: "Bague Tropicale",
  description: "Une création exclusive JOLANANAS.",
  price: 45,
  currency: { amount: "45", currencyCode: "EUR" },
  featuredImage: "https://images.unsplash.com/photo-1588345921523-c2dcd57f7d60?w=400",
  images: [{ url: "https://images.unsplash.com/photo-1588345921523-c2dcd57f7d60?w=400" }],
  variants: [{ id: "v1", price: 45, availableForSale: true }],
} as any;

export const Default: Story = {
  args: {
    product: mockProduct,
  },
};

export const OutOfStock: Story = {
  args: {
    product: {
      ...mockProduct,
      variants: [{ id: "v1", price: 45, availableForSale: false }],
    },
  },
};
