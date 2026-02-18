import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { Textarea } from "./textarea";

/**
 * 🍍 JOLANANAS - Textarea
 * =======================
 * Zone de saisie de texte multi-lignes.
 */
const meta: Meta<typeof Textarea> = {
  title: "JOLANANAS/UI/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {
  args: {
    placeholder: "Écrivez votre message ici...",
  },
  render: (args) => (
    <div className="w-[400px]">
      <Textarea {...args} />
    </div>
  ),
};

export const Disabled: Story = {
  args: {
    placeholder: "Zone désactivée",
    disabled: true,
  },
  render: (args) => (
    <div className="w-[400px]">
      <Textarea {...args} />
    </div>
  ),
};
