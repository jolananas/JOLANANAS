import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { ContactForm } from "./ContactForm";

/**
 * 🍍 JOLANANAS - ContactForm
 * ==============================
 * Auto-generated Storybook file for ContactForm.
 */
const meta: Meta<typeof ContactForm> = {
  title: "JOLANANAS/Forms/ContactForm",
  component: ContactForm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ContactForm>;

export const Default: Story = {
  args: {},
};
