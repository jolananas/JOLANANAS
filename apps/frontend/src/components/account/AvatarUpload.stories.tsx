import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { AvatarUpload } from "./AvatarUpload";

/**
 * 🍍 JOLANANAS - AvatarUpload
 * ===========================
 * Composant d'upload d'avatar avec prévisualisation et gestion des erreurs de format/taille.
 */
const meta: Meta<typeof AvatarUpload> = {
  title: "JOLANANAS/Feature/Account/AvatarUpload",
  component: AvatarUpload,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AvatarUpload>;

export const Default: Story = {
  args: {
    initials: "JB",
  },
};

export const WithAvatar: Story = {
  args: {
    initials: "JB",
    currentAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200",
  },
};
