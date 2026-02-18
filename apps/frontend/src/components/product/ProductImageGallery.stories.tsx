import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { ProductImageGallery } from "./ProductImageGallery";

/**
 * 🍍 JOLANANAS - ProductImageGallery
 * ==================================
 * Galerie d'images interactive pour la page produit, avec zoom (lightbox) et carrousel.
 */
const meta: Meta<typeof ProductImageGallery> = {
  title: "JOLANANAS/Feature/Product/ProductImageGallery",
  component: ProductImageGallery,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ProductImageGallery>;

const mockImages = [
  "https://images.unsplash.com/photo-1588345921523-c2dcd57f7d60?w=800",
  "https://images.unsplash.com/photo-1535633302723-999aa6a7d531?w=800",
  "https://images.unsplash.com/photo-1596944214829-d61c2bc05fed?w=800",
  "https://images.unsplash.com/photo-1576053139778-7e32f2ae3cfd?w=800",
];

export const Default: Story = {
  args: {
    images: mockImages,
    title: "Bague Ananas Or",
  },
  render: (args) => (
    <div className="max-w-md">
      <ProductImageGallery {...args} />
    </div>
  ),
};

export const SingleImage: Story = {
  args: {
    images: [mockImages[0]],
    title: "Bague Ananas Or",
  },
  render: (args) => (
    <div className="max-w-md">
      <ProductImageGallery {...args} />
    </div>
  ),
};
