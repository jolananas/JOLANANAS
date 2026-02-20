import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { SignupForm } from "./SignupForm";

/**
 * 🍍 JOLANANAS - SignupForm
 * ==============================
 * Auto-generated Storybook file for SignupForm.
 */
const meta: Meta<typeof SignupForm> = {
  title: "JOLANANAS/Auth/SignupForm",
  component: SignupForm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SignupForm>;

export const Default: Story = {
  args: {},
};
