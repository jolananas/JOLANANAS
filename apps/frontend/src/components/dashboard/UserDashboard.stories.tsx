import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { UserDashboard } from "./UserDashboard";

/**
 * 🍍 JOLANANAS - UserDashboard
 * ==============================
 * Auto-generated Storybook file for UserDashboard.
 */
const meta: Meta<typeof UserDashboard> = {
  title: "JOLANANAS/Dashboard/UserDashboard",
  component: UserDashboard,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof UserDashboard>;

export const Default: Story = {
  args: {},
};
