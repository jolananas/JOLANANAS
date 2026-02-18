import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { RadioGroup, RadioGroupItem } from "./radiogroup";
import { Label } from "./label";

/**
 * 🍍 JOLANANAS - RadioGroup
 * =========================
 * Ensemble de boutons d'option permettant une sélection unique parmi plusieurs choix.
 */
const meta: Meta<typeof RadioGroup> = {
  title: "JOLANANAS/UI/RadioGroup",
  component: RadioGroup,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="option-one">
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-one" id="option-one" />
        <Label htmlFor="option-one">Option Un</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-two" id="option-two" />
        <Label htmlFor="option-two">Option Deux</Label>
      </div>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="option-one" disabled>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-one" id="option-one-disabled" />
        <Label htmlFor="option-one-disabled">Option Un (Désactivée)</Label>
      </div>
      <div className="flex items-center space-x-2">
        <RadioGroupItem value="option-two" id="option-two-disabled" />
        <Label htmlFor="option-two-disabled">Option Deux (Désactivée)</Label>
      </div>
    </RadioGroup>
  ),
};
