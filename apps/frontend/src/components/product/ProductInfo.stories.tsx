import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { ProductInfo } from "./ProductInfo";
import { MockCartProvider } from "../../../.storybook/decorators/CartProviderDecorator";
import { Toaster } from "sonner";

/**
 * 🍍 JOLANANAS - ProductInfo
 * ==========================
 * Bloc d'informations détaillé pour la page produit, incluant titre, prix, 
 * description, badges et bouton d'ajout au panier.
 */
const ProductInfoWrapper = (Story: any) => (
  <MockCartProvider>
    <div className="max-w-lg mx-auto p-12 bg-white">
      <Story />
      <Toaster />
    </div>
  </MockCartProvider>
);

const meta: Meta<typeof ProductInfo> = {
  title: "JOLANANAS/Feature/Product/ProductInfo",
  component: ProductInfo,
  decorators: [ProductInfoWrapper],
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ProductInfo>;

const mockProduct = {
  id: "1",
  title: "Bague Ananas Tropicale",
  handle: "bague-ananas-tropicale",
  description: "Cette magnifique bague artisanale capture l'essence même de l'esprit Jolananas. Finition à la main dans notre atelier français.",
  price: 45,
  compareAtPrice: 65,
  availableForSale: true,
  tags: ["Best Seller", "Artisanal", "Or 24k"],
  images: [{ url: "https://images.unsplash.com/photo-1588345921523-c2dcd57f7d60?w=400" }],
  firstVariantId: "v1",
} as any;

export const Default: Story = {
  args: {
    product: mockProduct,
  },
};

export const NoDiscount: Story = {
  args: {
    product: {
      ...mockProduct,
      compareAtPrice: null,
    },
  },
};
