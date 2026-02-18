import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { Switch } from "./switch";
import { Label } from "./label";

/**
 * 🍍 JOLANANAS - Switch
 * =====================
 * Bouton à bascule permettant d'activer ou de désactiver une option.
 */
const meta: Meta<typeof Switch> = {
  title: "JOLANANAS/UI/Switch",
  component: Switch,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="airplane-mode" />
      <Label htmlFor="airplane-mode">Mode Avion</Label>
    </div>
  ),
};

export const Checked: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="notifications" defaultChecked />
      <Label htmlFor="notifications">Notifications activées</Label>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div className="flex items-center space-x-2">
      <Switch id="disabled-switch" disabled />
      <Label htmlFor="disabled-switch">Option désactivée</Label>
    </div>
  ),
};
