import type { Meta, StoryObj } from "@storybook/react/dist/index";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";

/**
 * 🍍 JOLANANAS - Avatar
 * =====================
 * Élément visuel représentant un utilisateur avec une image ou des initiales en repli.
 */
const meta: Meta<typeof Avatar> = {
  title: "JOLANANAS/UI/Avatar",
  component: Avatar,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const WithImage: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

export const Fallback: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://invalid-url.com/image.png" alt="@jolananas" />
      <AvatarFallback>JN</AvatarFallback>
    </Avatar>
  ),
};

export const Large: Story = {
  render: () => (
    <Avatar className="size-16">
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};
