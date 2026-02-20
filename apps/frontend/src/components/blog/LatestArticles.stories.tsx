import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { LatestArticles } from "./LatestArticles";

/**
 * 🍍 JOLANANAS - LatestArticles
 * ==============================
 * Auto-generated Storybook file for LatestArticles.
 */
const meta: Meta<typeof LatestArticles> = {
  title: "JOLANANAS/Blog/LatestArticles",
  component: LatestArticles,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof LatestArticles>;

export const Default: Story = {
  args: {},
};
