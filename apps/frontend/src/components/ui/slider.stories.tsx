import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { Slider } from "./slider";

/**
 * 🍍 JOLANANAS - Slider
 * =====================
 * Élément permettant de sélectionner une valeur (ou une plage) dans un intervalle.
 */
const meta: Meta<typeof Slider> = {
  title: "JOLANANAS/UI/Slider",
  component: Slider,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  render: () => (
    <div className="w-[300px]">
      <Slider defaultValue={[50]} max={100} step={1} />
    </div>
  ),
};

export const Range: Story = {
  render: () => (
    <div className="w-[300px]">
      <Slider defaultValue={[20, 80]} max={100} step={1} />
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div className="h-[200px] flex items-center">
      <Slider defaultValue={[50]} orientation="vertical" />
    </div>
  ),
};
