import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { Progress } from "./progress";

/**
 * 🍍 JOLANANAS - Progress
 * =======================
 * Indicateur de progression visuel pour les tâches en cours.
 */
const meta: Meta<typeof Progress> = {
  title: "JOLANANAS/UI/Progress",
  component: Progress,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  render: () => (
    <div className="w-[400px]">
      <Progress value={33} />
    </div>
  ),
};

export const Complete: Story = {
  render: () => (
    <div className="w-[400px]">
      <Progress value={100} />
    </div>
  ),
};

export const Loading: Story = {
  render: () => {
    const [progress, setProgress] = [0, 66]; // Simulant des valeurs
    return (
      <div className="w-[400px]">
        <Progress value={66} />
      </div>
    );
  },
};
