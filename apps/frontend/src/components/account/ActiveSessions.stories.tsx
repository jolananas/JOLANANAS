import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { ActiveSessions } from "./ActiveSessions";

/**
 * 🍍 JOLANANAS - ActiveSessions
 * =============================
 * Liste des sessions actives de l'utilisateur, permettant de déconnecter des appareils à distance.
 */
const meta: Meta<typeof ActiveSessions> = {
  title: "JOLANANAS/Feature/Account/ActiveSessions",
  component: ActiveSessions,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ActiveSessions>;

export const Default: Story = {
  render: () => (
    <div className="w-[600px] border p-8 bg-white rounded-xl">
      <ActiveSessions />
    </div>
  ),
};
