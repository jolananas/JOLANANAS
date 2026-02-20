import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { ProductGrid } from "./ProductGrid";

/**
 * 🍍 JOLANANAS - ProductGrid
 * ==============================
 * Auto-generated Storybook file for ProductGrid.
 */
const meta: Meta<typeof ProductGrid> = {
  title: "JOLANANAS/Product/ProductGrid",
  component: ProductGrid,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ProductGrid>;

export const Default: Story = {
  args: {},
};
