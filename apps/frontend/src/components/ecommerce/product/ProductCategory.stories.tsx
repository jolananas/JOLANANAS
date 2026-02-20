import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { ProductCategory } from "./ProductCategory";

/**
 * 🍍 JOLANANAS - ProductCategory
 * ==============================
 * Auto-generated Storybook file for ProductCategory.
 */
const meta: Meta<typeof ProductCategory> = {
  title: "JOLANANAS/Ecommerce/ProductCategory",
  component: ProductCategory,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ProductCategory>;

export const Default: Story = {
  args: {},
};
