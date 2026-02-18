import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { SearchDialog } from "./SearchDialog";
import ShopifyDataDecorator from "../../../.storybook/decorators/ShopifyDataDecorator";

/**
 * 🍍 JOLANANAS - SearchDialog
 * ===========================
 * Boîte de dialogue de recherche permettant de trouver des produits par titre, description ou tags.
 */
const meta: Meta<typeof SearchDialog> = {
  title: "JOLANANAS/Layout/SearchDialog",
  component: SearchDialog,
  decorators: [ShopifyDataDecorator],
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SearchDialog>;

const mockProducts = [
  {
    id: "1",
    title: "Bague Ananas Or",
    handle: "bague-ananas-or",
    description: "Une magnifique bague artisanale en or 24 carats.",
    price: 150,
    images: [{ url: "https://images.unsplash.com/photo-1588345921523-c2dcd57f7d60?w=400" }],
    tags: ["bague", "or", "ananas"],
    collections: ["Bijoux", "Or"],
  },
  {
    id: "2",
    title: "Bracelet Coco Argent",
    handle: "bracelet-coco-argent",
    description: "Un bracelet minimaliste inspiré de la noix de coco.",
    price: 85,
    images: [{ url: "https://images.unsplash.com/photo-1588345921523-c2dcd57f7d60?w=400" }],
    tags: ["bracelet", "argent", "coco"],
    collections: ["Bijoux", "Argent"],
  },
];

export const Default: Story = {
  args: {
    products: mockProducts as any,
  },
};
