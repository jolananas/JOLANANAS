import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { Toggle } from "./toggle";
import { Bold, Italic, Underline } from "lucide-react";

/**
 * 🍍 JOLANANAS - Toggle
 * =====================
 * Bouton à deux états permettant d'activer ou de désactiver une préférence.
 */
const meta: Meta<typeof Toggle> = {
  title: "JOLANANAS/UI/Toggle",
  component: Toggle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Toggle>;

export const Default: Story = {
  render: () => (
    <Toggle aria-label="Toggle bold">
      <Bold className="h-4 w-4" />
    </Toggle>
  ),
};

export const Outline: Story = {
  render: () => (
    <Toggle variant="outline" aria-label="Toggle italic">
      <Italic className="h-4 w-4" />
    </Toggle>
  ),
};

export const Large: Story = {
  render: () => (
    <Toggle size="lg" aria-label="Toggle underline">
      <Underline className="h-4 w-4" />
    </Toggle>
  ),
};
