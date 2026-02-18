import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { PreferencesForm } from "./PreferencesForm";

/**
 * 🍍 JOLANANAS - PreferencesForm
 * ==============================
 * Formulaire permettant de gérer les préférences de l'utilisateur (langue, fuseau horaire, notifications).
 */
const meta: Meta<typeof PreferencesForm> = {
  title: "JOLANANAS/Feature/Account/PreferencesForm",
  component: PreferencesForm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PreferencesForm>;

export const Default: Story = {
  render: () => (
    <div className="w-[500px] border p-8 bg-white rounded-xl">
      <PreferencesForm />
    </div>
  ),
};
