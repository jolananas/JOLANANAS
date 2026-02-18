import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { JolananasProductCard } from "./JolananasProductCard";
import ShopifyDataDecorator from "../../../.storybook/decorators/ShopifyDataDecorator";

/**
 * 🍍 JOLANANAS - JolananasProductCard
 * ===================================
 * Variante de la carte produit avec une bordure dégradée spécifique à la marque Jolananas.
 */
const meta: Meta<typeof JolananasProductCard> = {
  title: "JOLANANAS/Feature/Product/JolananasProductCard",
  component: JolananasProductCard,
  decorators: [ShopifyDataDecorator],
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof JolananasProductCard>;

const mockProduct = {
  id: "1",
  title: "Bague Ananas Or",
  handle: "bague-ananas-or",
  images: {
    edges: [
      {
        node: {
          url: "https://images.unsplash.com/photo-1588345921523-c2dcd57f7d60?w=400",
          altText: "Bague Ananas",
        },
      },
    ],
  },
  variants: {
    edges: [
      {
        node: {
          price: {
            amount: "150",
            currencyCode: "EUR",
          },
          availableForSale: true,
        },
      },
    ],
  },
};

export const Default: Story = {
  args: {
    product: mockProduct as any,
  },
};
